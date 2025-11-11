import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();
const server = createServer(app);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server ready on port ${env.port}`);
});

export default server;
