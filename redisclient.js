const redis = require("redis");

const getRedisClient = async () => {
  const redisClient = await redis
    .createClient()
    .on("error", (error) => console.log(error))
    .connect();
  return redisClient;
};
module.exports = getRedisClient;

