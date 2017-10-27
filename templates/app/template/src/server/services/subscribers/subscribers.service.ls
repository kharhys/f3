createService = require 'feathers-mongoose'

createModel = require '~/models/subscribers.model'
hooks = require '~/services/subscribers/subscribers.hooks'
filters = require '~/services/subscribers/subscribers.filters'

module.exports = ->
  app = this
  Model = createModel app
  paginate = app.get 'paginate'
  options =
    name: 'Subscriber'
    Model: Model
    paginate: paginate
  app.use '/subscribers', createService options
  service = app.service 'subscribers'
  service.hooks hooks
  service.filter filters if service.filter
  return 