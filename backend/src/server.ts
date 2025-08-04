import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zenhaven')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import verifyPaymentRoutes from './routes/verify-payment';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', verifyPaymentRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'ZenHaven API is running' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 