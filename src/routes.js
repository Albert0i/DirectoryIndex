import express from 'express';
import { redisClient } from './redis/redisClient.js'
const router = express.Router();

router.get('/', async (req, res) => {
  await redisClient.ping()
  res.render('welcome');
});

router.post('/search', async (req, res) => {
  const keyword = req.body.keyword;
  console.log('keyword=', keyword)
  const keys = await redisClient.keys(`*${keyword}*`);
  res.render('content', { keys });
});

router.get('/content/:key', async (req, res) => {
  const key = req.params.key;
  const members = "await redis.zrevrange(key, 0, -1, 'WITHSCORES')";
  res.render('detail', { key, members });
});

router.get('/advanced-search', (req, res) => {
  res.render('advanced-search');
});

router.post('/advanced-search/search', async (req, res) => {
  const keywords = "req.body.keywords.split(',')";
  const keys = "await redis.keys(`*${keywords.join('*')}*`)";
  res.render('content', { keys });
});

router.get('/directory', async (req, res) => {
  const keys = "await redis.keys('*')";
  res.render('directory', { keys });
});

export default router;
