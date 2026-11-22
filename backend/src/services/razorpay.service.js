import { createHmac, timingSafeEqual } from 'node:crypto'
import { checkoutError } from '@errors/checkout.errors'
import paymentSettings from './payment-settings.service.js'

export const verifySignature = (body, signature, secret) => {
  if (
    !secret ||
    typeof signature !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(signature)
  )
    return false
  const expected = createHmac('sha256', secret).update(body).digest()
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}

const request = async (path, payload, credentials) => {
  const { key_id: key, key_secret: secret } = credentials
  if (!key || !secret) {
    throw checkoutError(
      'Payment checkout is not configured. Please try again later.',
      'PAYMENT_NOT_CONFIGURED',
      503
    )
  }
  let response
  try {
    response = await fetch(`https://api.razorpay.com/v1/${path}`, {
      method: payload ? 'POST' : 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw checkoutError(
      'Payment provider is unavailable. Please retry.',
      'PAYMENT_PROVIDER_UNAVAILABLE',
      502
    )
  }
  if (!response.ok) {
    if (response.status === 401) {
      throw checkoutError(
        'Razorpay rejected the saved key ID or key secret. Ask Super Admin to check Settings.',
        'RAZORPAY_AUTHENTICATION_FAILED',
        502
      )
    }
    throw checkoutError(
      'Payment provider could not complete this request. Please retry.',
      'PAYMENT_PROVIDER_ERROR',
      502
    )
  }
  return response.json()
}

const razorpayService = {
  testConnection: async () => {
    const credentials = await paymentSettings.credentials()
    await request('orders?count=1', null, credentials)
    return {
      connected: true,
      mode: credentials.key_id.startsWith('rzp_test_') ? 'test' : 'live',
    }
  },
  createOrder: (order, credentials) =>
    request(
      'orders',
      {
        amount: order.amount,
        currency: order.currency,
        receipt: order.id,
        partial_payment: false,
        notes: { checkout_id: order.id },
      },
      credentials
    ),
  fetchPayment: async (id, order) =>
    request(
      `payments/${encodeURIComponent(id)}`,
      null,
      await paymentSettings.credentials(order.gateway_settings_id)
    ),
  fetchOrderPayments: async (order) =>
    request(
      `orders/${encodeURIComponent(order.razorpay_order_id)}/payments`,
      null,
      await paymentSettings.credentials(order.gateway_settings_id)
    ),
}

export default razorpayService
