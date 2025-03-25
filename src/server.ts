import { readFileSync } from 'fs';
import { resolve } from 'path';
import { register } from 'tsconfig-paths';
import { loadControllers } from 'awilix-express';

import passport from 'passport';
import express from 'express';
import config from './config/config';

import connectDB from './config/db';
import logger from './config/logger';
import loadContainer from './di-container';
import errorHandler from './middlewares/errorHandler';

const app = express();
app.use(express.json());

loadContainer(app);

app.use(loadControllers('controllers/*.ts', { cwd: __dirname }));

app.use(errorHandler);

const { port, env } = config;

const tsConfigPath =
    env === 'production' ? 'tsconfig.prod.json' : 'tsconfig.dev.json';

logger.info(`Using TypeScript config: ${tsConfigPath}`);

try {
    // Read and parse the tsconfig file
    const { compilerOptions } = JSON.parse(
        readFileSync(resolve(tsConfigPath), 'utf8'),
    );

    // Register paths from tsconfig
    register({
        baseUrl: compilerOptions.baseUrl,
        paths: compilerOptions.paths,
    });
} catch (error) {
    logger.error(`Failed to load ${tsConfigPath}:`, error);
}

app.use(passport.initialize());

// Start server after DB connection
const startServer = async () => {
    await connectDB();

    app.listen(port, () => {
        logger.info(
            `Server running in ${env} mode on http://localhost:${port}`,
        );
    });
};

startServer();
