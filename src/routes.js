import express from 'express';
const router = express.Router();
import { redisClient } from './redis/redisClient.js'

router.get('/', async (req, res) => {
    await redisClient.ping()
    res.render('welcome');
});

router.get('/content', async (req, res) => {
  const keyword = req.query.keyword

  try { 
    const keys = await scanKeysForType(redisClient, keyword, 'zset'); 
    res.render('content', { keys });
  } catch (error) { 
    console.error('Error fetching keys:', error); 
    res.status(500).send('Internal Server Error'); 
  }
});

// router.get('/advanced-search', (req, res) => {
//   res.render('advanced-search');
// });

// router.post('/advanced-search/search', async (req, res) => {
//   const keywords = "req.body.keywords.split(',')";
//   const keys = "await redis.keys(`*${keywords.join('*')}*`)";
//   res.render('content', { keys });
// });

router.get('/directory', async (req, res) => {
  try { 
    const keys = await scanKeysForType(redisClient, '', 'hash'); 
    res.render('directory', { keys });
  } catch (error) { 
    console.error('Error fetching keys:', error); 
    res.status(500).send('Internal Server Error'); 
  }
});

// zset, hash
async function scanKeysForType(redis, pattern, redisTType) { 
  let cursor = '0'; 
  let returnKeys = []; 

  do { 
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `*${pattern}*`, 'COUNT', 100); 
    cursor = nextCursor; 
    for (const key of keys) { 
      const type = await redis.type(key); 
      if (type === redisTType) { 
        returnKeys.push(key); 
      }
    } 
  } while (cursor !== '0'); 
  return returnKeys; 
}

export default router;
