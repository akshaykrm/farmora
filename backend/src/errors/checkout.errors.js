export const checkoutError = (
  message,
  code = 'CHECKOUT_ERROR',
  statusCode = 400
) => Object.assign(new Error(message), { code, statusCode })
