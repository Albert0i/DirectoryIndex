import express from 'express';
const router = express.Router();
import { redisClient } from './redis/redisClient.js'

router.get('/', async (req, res) => {
    await redisClient.ping()
    res.render('welcome');
});

router.get('/content', async (req, res) => {
  const keyword = req.query.keyword?.toUpperCase()

  try { 
    const keys = await scanKeysForType(redisClient, `DIRINDEX:INDEX:*${keyword}*`, 'zset'); 
    res.render('content', { keys });
  } catch (error) { 
    console.error('Error fetching keys:', error); 
    res.status(500).send('Internal Server Error'); 
  }
});

router.get('/detail/:key', async (req, res) => {
  const key = req.params.key

  if (key) {
    const values = await redisClient.zrange(key, 99, 1, 'BYSCORE','REV')
    res.render('detail', { values });
  } else {
    console.error('Error fetching keys:', error); 
    res.status(500).send('Internal Server Error'); 
  }
});

router.get('/advanced-search', (req, res) => {
  res.render('advanced-search');
});

// router.post('/advanced-search/search', async (req, res) => {
//   const keywords = "req.body.keywords.split(',')";
//   const keys = "await redis.keys(`*${keywords.join('*')}*`)";
//   res.render('content', { keys });
// });

router.get('/directory', async (req, res) => {
  try { 
    const keys = await scanKeysForType(redisClient, 'DIRINDEX:DIR:*', 'hash'); 
    const hashes = await fetchAllHashes(redisClient, keys)
    res.render('directory', { hashes: sortById(hashes) });
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
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${pattern}`, 'COUNT', 100); 
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

async function fetchAllHashes(redis, hashKeys) { 
  const pipeline = redis.pipeline(); 
  let hash = null; 
  
  hashKeys.forEach(key => { 
    pipeline.hgetall(key); 
  }); 

  const results = await pipeline.exec(); 
  let hashes = []; 

  hashKeys.forEach((key, index) => { 
    hash = results[index][1]; 
    hash.id = hashKeys[index].split(":")[2];
    hashes.push(hash)
  }); 
  
  return hashes;
}

/**
 * Sorts an array of objects based on the id field.
 * @param {Array<Object>} arr - The array of objects to sort.
 * @returns {Array<Object>} - The array of objects sorted by id.
 */
function sortById(arr) {
  return arr.sort((a, b) => {
    return a.id - b.id;
  });
}

export default router;
