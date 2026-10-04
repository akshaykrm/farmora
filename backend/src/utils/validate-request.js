import ValidationError from '@errors/validation.errors'

const validate = (schema) => (req, res, next) => {
  console.assert(schema, 'schema requred')
  const { error, value } = schema
    .prefs({
      errors: {
        wrap: {
          label: false,
        },
      },
    })
    .validate(req.body, {
      abortEarly: false,
    })
  if (error) {
    throw new ValidationError(error)
  }
  req.body = value
  next()
}

export const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema
    .prefs({ errors: { wrap: { label: false } } })
    .validate(req.query, { abortEarly: false })
  if (error) {
    throw new ValidationError(error)
  }
  next()
}

export default validate
