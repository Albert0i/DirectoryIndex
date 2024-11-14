import 'dotenv/config'
import { Redis } from 'ioredis'

/**
 * Create a Redis instance. 
 * @returns {redisClient} The Redis Client instance 
 */
const redisClient = new Redis({
    host: process.env.REDIS_HOST,         // Redis host
    port: process.env.REDIS_PORT,         // Redis port
    password: process.env.REDIS_PASSWORD, // Redis password 

    showFriendlyErrorStack: true,         // Optimize the error stack displayed
    db: 0,                                // Logical database (0~15), defaults to 0
  });

/**
 * Close Redis connection
 * @returns {null} 
 */
const disconnect = () => {
  redisClient.disconnect()
}

// For debugging
// console.log('REDIS_HOST=', process.env.REDIS_HOST)
// console.log('REDIS_PORT=', process.env.REDIS_PORT)
// console.log('REDIS_PASSWORD=', process.env.REDIS_PASSWORD)
// console.log('redisClient=', redisClient)
// For debugging

export { redisClient, disconnect }

/*
   ioredis
   https://github.com/redis/ioredis?tab=readme-ov-file
*/