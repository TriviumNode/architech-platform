import { getAddresses } from '@/../../../packages/architech-lib/dist';
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  FILEBASE_S3_KEY_ID,
  FILEBASE_S3_KEY,
  FILEBASE_BUCKET,
  CHAIN_ID,
  RPC_URL,
} = process.env;

export const { MARKETPLACE_ADDRESS, CREDIT_ADDRESS, CW721_CODE_ID, ARCHID_ADDRESS } = getAddresses(CHAIN_ID);
console.log('Backend Addresses', { MARKETPLACE_ADDRESS, CREDIT_ADDRESS, CW721_CODE_ID });
