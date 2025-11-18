import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRouter from './routes/events.js';
import './workers/processEventWorker.js';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/events', eventsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});