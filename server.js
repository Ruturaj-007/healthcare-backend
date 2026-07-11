const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

const server = app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
});

// * GRACEFUL SHUTDOWN - important for docker deployements 
// Helps to finish current requests before shutting down 
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. shutting down gracefully...');
  server.close(async () => {
    const prisma = require('./src/config/prisma');
    await prisma.$disconnect();
    logger.info('Server closed.');
    process.exit(0);
  });
});