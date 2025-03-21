import express, { Request, Response } from 'express';
import mongoose, { MongooseOptions } from 'mongoose';
import config from './config/config';

const app = express();
const { port } = config;

const options: MongooseOptions = {
    debug: config.env === 'development',
};

mongoose
    .connect(config.mongoose.url, options)
    .then(() => console.log('Database connected successfully'))
    .catch((error) =>
        console.error('Failed to connect to database, error: ', error),
    );

app.listen(config.port, () => {
    console.log(
        `Server running in ${config.env} mode on http://localhost:${config.port}`,
    );
});
