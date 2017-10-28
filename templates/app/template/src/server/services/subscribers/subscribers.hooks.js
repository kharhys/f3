const verifyHooks = require('feathers-authentication-management').hooks
const { setCreatedAt, setUpdatedAt } = require('feathers-hooks-common')
const sendVerificationEmail = require('~/hooks/send-verification-email')

export default {
  before: {
    all: [],
    find: [
    ],
    get: [
    ],
    create: [
      setCreatedAt(),
      verifyHooks.addVerification()
    ],
    update: [
//      ...ownerOrPermission({ service: 'message', permission: 'manageMessages' }),
      setUpdatedAt()
    ],
    patch: [
//      ...ownerOrPermission({ service: 'message', permission: 'manageMessages' }),
      setUpdatedAt()
    ],
    remove: [
//      ...ownerOrPermission({ service: 'message', permission: 'manageMessages' })
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      sendVerificationEmail(),
//      verifyHooks.removeVerification(),
      setUpdatedAt()
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
