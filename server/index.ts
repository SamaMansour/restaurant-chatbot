import express from 'express';
import 'dotenv/config';
import chatRoutes from './routes/chatRoutes';
import reservationRoutes from './routes/reservationRoutes';



const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api/chat', chatRoutes);
app.use('/api/reservations', reservationRoutes);



app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant Reservation Bot API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
