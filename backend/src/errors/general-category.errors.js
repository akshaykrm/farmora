class GeneralCategoryError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GeneralCategoryError'
  }
}

export class GeneralCategoryNotFoundError extends GeneralCategoryError {
  constructor() {
    super('Category not found')
    this.code = 'GENERAL_CATEGORY_NOT_FOUND'
    this.statusCode = 404
  }
}

export class GeneralCategoryDuplicateError extends GeneralCategoryError {
  constructor() {
    super('A category with this name already exists')
    this.code = 'GENERAL_CATEGORY_DUPLICATE'
    this.statusCode = 409
  }
}

export class GeneralCategoryInUseError extends GeneralCategoryError {
  constructor() {
    super('Category is used by existing records. Mark it inactive instead.')
    this.code = 'GENERAL_CATEGORY_IN_USE'
    this.statusCode = 409
  }
}
