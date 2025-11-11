import serverlessHttp from 'serverless-http';
import { createApp } from './app.js';

const app = createApp();

const handler = serverlessHttp(app);

export default handler;
