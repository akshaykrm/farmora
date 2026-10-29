import request from 'supertest'
import { expect } from 'vitest'
import app from '../../app.js'

// Exercise approval before existing payment/quota scenarios.
export const approveSignup = async (data, username, password, token) => {
  if (!data.approval_required) return data
  if (!token) {
    const admin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'superadmin', password: 'admin123' })
    expect(admin.status).toBe(200)
    token = admin.body.data.token
  }
  const approval = await request(app)
    .post(`/api/users/${data.id}/approve`)
    .set('Authorization', `Bearer ${token}`)
  expect(approval.status, JSON.stringify(approval.body.error)).toBe(200)
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
  expect(login.status, JSON.stringify(login.body.error)).toBe(200)
  return {
    ...data,
    ...login.body.data,
    approval_required: false,
    checkout_required: !!login.body.data.checkout_required,
  }
}
