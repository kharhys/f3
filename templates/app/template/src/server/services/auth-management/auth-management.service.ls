authManagement = require 'feathers-authentication-management'

hooks = require './auth-management.hooks'
notifier = require './notifier'

module.exports = ->
  app = this
  app.configure authManagement notifier app
  service = app.service 'authManagement'
  service.hooks hooks
  return 