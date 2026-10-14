const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../.mongo-data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'naasmind',
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
    },
  });

  console.log(`✅ MongoDB running at: ${mongod.getUri()} (persistent at ${dbPath})`);

  process.on('SIGINT', async () => {
    await mongod.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await mongod.stop();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('Failed to start MongoDB:', err);
  process.exit(1);
});
