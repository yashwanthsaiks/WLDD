import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis.config';



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  connectRedis().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  });
});