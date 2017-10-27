'use strict'

const service = require('feathers-mongoose')

const hooks = require('./hooks')
const subscribers = require('./subscribers-model')

module.exports = function () {
  const app = this

  const options = {
    Model: subscribers,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/subscribers', service(options))

  // Get our initialize service to that we can bind hooks
  const subscribersService = app.service('/subscribers')

  // Set up our before hooks
  subscribersService.before(hooks.before)

  // Set up our after hooks
  subscribersService.after(hooks.after)
}
