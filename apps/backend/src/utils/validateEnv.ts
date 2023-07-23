import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DB_HOST: str(),
    DB_PORT: port(),
    DB_DATABASE: str(),
    SECRET_KEY: str(),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    ORIGIN: str(),
    FILEBASE_S3_KEY_ID: str(),
    FILEBASE_S3_KEY: str(),
    FILEBASE_BUCKET: str(),
  });
};

export default validateEnv;
