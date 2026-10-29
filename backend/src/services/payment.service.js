import { checkoutError } from '@errors/checkout.errors'

// Subscription payments must use verified checkout activation.
export default {
  process: async () => {
    throw checkoutError(
      'Use package checkout to process payments.',
      'PAYMENT_CHECKOUT_REQUIRED',
      409
    )
  },
}
