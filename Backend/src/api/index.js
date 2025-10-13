import serverlessExpress from '@vendia/serverless-express';
import app from '../index.js';

const server = serverlessExpress({ app });

export async function handler(event, context) {
  return server(event, context);
}
