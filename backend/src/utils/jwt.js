import CONFIG from '../../config.js'
import jwt from 'jsonwebtoken'

const { sign } = jwt

export const generateToken = (user) => {
  return sign({ id: user.id, email: user.email }, CONFIG.jwt_secret, {
    expiresIn: '24h',
  })
}

export const generateCheckoutToken = (user) =>
  sign({ id: user.id, purpose: 'checkout' }, CONFIG.jwt_secret, { expiresIn: '1h' })
