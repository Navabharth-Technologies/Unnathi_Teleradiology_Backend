import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import hospitalRoutes from './routes/hospitals';
import userRoutes from './routes/users';
import patientRoutes from './routes/patients';
import studyRoutes from './routes/studies';
import siteRoutes from './routes/sites';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/studies', studyRoutes);
app.use('/api/sites', siteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
