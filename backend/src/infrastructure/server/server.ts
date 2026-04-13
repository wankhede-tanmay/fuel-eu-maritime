// backend/src/infrastructure/server/server.ts
import {app} from './app';
import { testDbConnection } from '../db/postgres';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await testDbConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();