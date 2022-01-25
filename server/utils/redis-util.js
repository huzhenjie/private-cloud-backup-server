const IoRedis = require("ioredis")
const Config = require('../../config')
const { redis } = Config

const Redis = new IoRedis({
  port: redis.PORT,
  host: redis.HOST,
  password: redis.PASSWORD,
  db: 0
})

function getRedisKey(key) {
  return `${redis.PREFIX}:${key}`
}

module.exports.lock = async (key, expire_second) => {
  const redisKey = getRedisKey('L:' + key)
  expire_second = expire_second || 3600
  const result = await Redis.set(redisKey, Date.now(), 'NX', 'EX', expire_second)
  console.log(result)
  return result === 'OK'
}

module.exports.unlock = async key => {
  const redisKey = getRedisKey('L:' + key)
  return Redis.del(redisKey)
}

module.exports.set = async (key, value, expire_second) => {
  const redis_key = getRedisKey(key)
  expire_second = expire_second || 3600
  await Redis.set(redis_key, value, 'EX', expire_second)
}

module.exports.get = async key => {
  const redis_key = getRedisKey(key)
  return await Redis.get(redis_key)
}

module.exports.del = async key => {
  const redis_key = getRedisKey(key)
  await Redis.del(redis_key)
}
