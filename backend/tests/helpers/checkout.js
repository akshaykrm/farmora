import { createHmac, randomUUID } from 'node:crypto'
import request from 'supertest'
import { expect, vi } from 'vitest'
import app from '../../app.js'
import razorpay from '@services/razorpay.service'
import settings from '@services/payment-settings.service'

const secret = 'isolated_test_gateway_secret'

export const installMockGateway = () => {
  vi.spyOn(settings, 'credentials').mockResolvedValue({
    version: null,
    key_id: 'rzp_test_Isolated',
    key_secret: secret,
    webhook_secret: 'isolated_test_webhook_secret',
  })
  vi.spyOn(razorpay, 'createOrder').mockImplementation(async (order) => ({
    id: `order_${randomUUID()}`,
    amount: order.amount,
    currency: order.currency,
  }))
}

export const payOrder = async (order, token) => {
  const payment = {
    id: `pay_${randomUUID()}`,
    order_id: order.razorpay_order_id,
    amount: order.amount,
    currency: order.currency,
    status: 'captured',
    method: 'upi',
  }
  const fetch = vi
    .spyOn(razorpay, 'fetchPayment')
    .mockResolvedValueOnce(payment)
  try {
    const signature = createHmac('sha256', secret)
      .update(`${payment.order_id}|${payment.id}`)
      .digest('hex')
    const response = await request(app)
      .post(`/api/checkout/orders/${order.id}/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        razorpay_order_id: payment.order_id,
        razorpay_payment_id: payment.id,
        razorpay_signature: signature,
      })
    expect(response.status, JSON.stringify(response.body.error)).toBe(200)
    return response.body.data
  } finally {
    fetch.mockRestore()
  }
}

export const paySignup = async (token, packageId) => {
  const response = await request(app)
    .post('/api/checkout/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ package_id: packageId, kind: 'initial', request_id: randomUUID() })
  expect(response.status, JSON.stringify(response.body.error)).toBe(200)
  return payOrder(response.body.data, token)
}
