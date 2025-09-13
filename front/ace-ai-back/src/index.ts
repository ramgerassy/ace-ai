import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import quizRoutes from './routes/quiz.routes';
import { globalApiLimiter } from './middleware/rateLimit';
import { detailedNotFoundHandler } from './middleware/noteFound';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);


app.use(helmet());
app.use(cors({
    origin: '*',
    credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('dev'));

app.use(globalApiLimiter);


app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});


app.use('/api', quizRoutes);

/*app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'API_ENDPOINT_NOT_FOUND',
            message: `API endpoint ${req.originalUrl} not found`,
            details: {
                method: req.method,
                path: req.originalUrl,
                baseUrl: '/api',
                hint: 'Check the API documentation for available endpoints'
            }
        }
    });
});*/


app.use(detailedNotFoundHandler);




process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API root: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;