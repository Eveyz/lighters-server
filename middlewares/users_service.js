const User = require('../models/user')

const createUser = User => {

}

module.exports = User => () => {
  return {
    createUser: createUser(User)
  }
}