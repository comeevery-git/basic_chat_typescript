import path from 'path';
import dotenv from 'dotenv';
import { getLogger } from './Logger';

const logger = getLogger();

const loadEnv = () => {
    const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);
    logger.info(`# Loading environment: ${envPath}`);

    const result = dotenv.config({
        path: envPath
    });

    if (result.error) {
        throw result.error;
    }
};

loadEnv();

export default {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    AUTH_API_URL: process.env.AUTH_API_URL,
    APP_API_URL: process.env.APP_API_URL,
    APP_API_TOKEN: process.env.APP_API_TOKEN,
    MONGODB_URI: process.env.MONGODB_URI,
    AWS_REGION: "ap-northeast-2",
    AWS_ACCESS_KEY_ID: "",
    AWS_SECRET_ACCESS_KEY: ""
};
