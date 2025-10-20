const Joi = require('joi')

const schemas = {
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  }),

  repository: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
    branch: Joi.string().default('main')
  }),

  pipeline: Joi.object({
    name: Joi.string().required(),
    repository: Joi.string().required(),
    environment: Joi.string().valid('development', 'staging', 'production').required(),
    jenkinsJob: Joi.string().required()
  }),

  environment: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string().valid('postgresql', 'mysql', 'oracle', 'sqlserver').required(),
    host: Joi.string().required(),
    port: Joi.number().integer().min(1).max(65535).required(),
    database: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  jenkins: Joi.object({
    url: Joi.string().uri().required(),
    username: Joi.string().required(),
    token: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }),

  bitbucket: Joi.object({
    url: Joi.string().uri().default('https://api.bitbucket.org/2.0'),
    username: Joi.string().required(),
    appPassword: Joi.string().required(),
    workspace: Joi.string().required(),
    enabled: Joi.boolean().default(true)
  }),

  migration: Joi.object({
    environment: Joi.string().required(),
    changelogFile: Joi.string().required(),
    contexts: Joi.string().allow('')
  }),

  rollback: Joi.object({
    environment: Joi.string().required(),
    changelogFile: Joi.string().required(),
    tag: Joi.string().required()
  })
}

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      })
    }
    next()
  }
}

module.exports = { validate, schemas }
