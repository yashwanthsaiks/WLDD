import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import brandRoutes from './routes/brand.routes';
import creatorRoutes from './routes/creator.routes';
import submissionRoutes from './routes/submission.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/brand', submissionRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/submissions', submissionRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Meme’d Backend API is running successfully' });
});

export default app;