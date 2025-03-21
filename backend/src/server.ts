import passport from 'passport';
import express, { Request, Response } from 'express';
import mongoose, { MongooseOptions } from 'mongoose';
import config from './config/config';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(express.json());
const { port } = config;

const options: MongooseOptions = {
    debug: config.env === 'development',
};

app.use(passport.initialize());

mongoose
    .connect(config.mongoose.url, options)
    .then(() => console.log('Database connected successfully'))
    .catch((error) =>
        console.error('Failed to connect to database, error: ', error),
    );

app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(
        `Server running in ${config.env} mode on http://localhost:${port}`,
    );
});
