import express from 'express';
const router = express.Router();
import { redisClient } from './redis/redisClient.js'
import { scanKeysForType, fetchAllHashes, sortById, generateRandomString} from './utils.js'

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

router.post('/process-search', async (req, res) => {
  const keywords = req.body.keywords
  const tempKey = `DIRINDEX:TEMP:${generateRandomString()}`
  let keys = []

  keywords.forEach(keyword => {
    if (keyword !== "") 
      keys.push(`DIRINDEX:INDEX:${keyword}`)
  })

 const result = await redisClient.call('ZINTERSTORE', tempKey, keys.length, ...keys, 'AGGREGATE', 'MIN')

 if (result > 0) {
  await redisClient.expire(tempKey, 15)
  const values = await redisClient.zrange(tempKey, 99, 1, 'BYSCORE','REV')
    res.render('detail', { values });
 } else {
    res.render('detail', { values: []  });
 }
});

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

export default router;
