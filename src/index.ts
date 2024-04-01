import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import ElectionRouter from './router/ElectionRouter';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { exportVotings } from './model/ElectionModel';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors({
  origin: "https://votexyouvote.netlify.app/" || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(morgan('dev'));


io.on('connect', (socket: Socket) => {
  console.log('A user connected');

  socket.on('user', (data: any) => {
    console.log('Received user data:', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const mongoURI = process.env.MONGO_URL || '';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Error connecting to the database:', err));

app.use('/api', ElectionRouter);

app.get('/socket', (req: Request, res: Response) => {
  res.json('Hello World');
  io.emit('message', 'hello world');
});

app.get('/', (req: Request, res: Response) => {
  res.json('Hello World');
});

export const updateResultVote = async (ElectionURl: string) => {
  try {
    const data = await exportVotings(ElectionURl);
    io.emit(`result/${ElectionURl}`, data);
  } catch (error) {
    console.log(error);
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
