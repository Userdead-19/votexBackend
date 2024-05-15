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
import helmet from 'helmet';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.set('trust proxy', 1);

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', process.env.FRONTEND_URL as string];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  //methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods'],
}));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(helmet());


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

app.get("/clientIP", (req: Request, res: Response) => {
  res.json(`Your IP address is ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
})

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
