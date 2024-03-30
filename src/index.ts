import express,{Request,Response,NextFunction} from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import ElectionRouter from './router/ElectionRouter';

const app = express();
dotenv.config();

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan('dev'));

// MongoDB connection
const mongoURI = process.env.MONGO_URL || '';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Error connecting to the database:', err));

// Routes
app.use('/api', ElectionRouter);


// Default route
app.get('/', (req, res) => {
  res.json('Hello World');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
