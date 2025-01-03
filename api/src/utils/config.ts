import dotenv from 'dotenv';

dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: 4000,
  AT_SECRET: process.env.AT_SECRET || '',
  DEV_WEB_URL: 'http://localhost:3000',
  PROD_WEB_URL: 'https://task.yshplsngh.in',
  ATTL: '10s',
  RTTL: '1y',
};
