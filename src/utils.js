
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
  
function sortById(arr) {
    return arr.sort((a, b) => {
      return a.id - b.id;
    });
  }
  
function generateRandomString(length=24) {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }
  
    return randomString;
  }

  export { scanKeysForType, fetchAllHashes, sortById, generateRandomString}