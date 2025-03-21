import { readFileSync } from 'fs';
import { resolve } from 'path';
import { register } from 'tsconfig-paths';
import passport from 'passport';
import express from 'express';
import config from './config/config';
import authRoutes from './routes/auth.routes';
import connectDB from './config/db';
import logger from './config/logger';

const app = express();
app.use(express.json());
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

app.use('/auth', authRoutes);

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
