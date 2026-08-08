class UserError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UserError'
  }
}

export class InvalidUsernameError extends UserError {
  constructor(username) {
    super(`username ${username} is invalid`)
    this.code = 'INVALID_USERNAME'
    this.statusCode = 400
  }
}

export class UserNotFoundError extends UserError {
  constructor(username) {
    super(`user ${username} not found`)
    this.code = 'USER_NOT_FOUND'
    this.statusCode = 404
  }
}

export class InvalidCredentialError extends UserError {
  constructor(username) {
    super(`invalid password for user ${username}`)
    this.code = 'UNAUTHORIZED'
    this.statusCode = 401
  }
}

export class UserNameConflictError extends UserError {
  constructor(message) {
    super(message)
    this.code = 'INVALID_USERNAME'
    this.statusCode = 400
  }
}

export class InvalidCurrentPasswordError extends UserError {
  constructor() {
    super('current password is incorrect')
    this.code = 'INVALID_CURRENT_PASSWORD'
    this.statusCode = 400
  }
}
