const JWT = require('jsonwebtoken')

module.exports.encrypt = (data, secret, expiresIn) => {
  const option = {
    // algorithm: 'RS256'
  }
  if (expiresIn) { // 2s 2h
    option.expiresIn = expiresIn
  }
  return JWT.sign(data, secret, option)
}

module.exports.decrypt = (token, secret) => {
  try {
    return JWT.verify(token, secret)
  } catch (err) {
    console.error(err)
    return null
  }
}
