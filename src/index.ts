import express,{Request,Response} from 'express';  
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
import cors from 'cors';
import {checkCookie,createCookieData, updateCookie} from './controllers/cookies';

const app = express();
dotenv.config();

app.use(cookieParser())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}));



app.get('/',(req:Request,res:Response)=>{
    res.json('Hello World');
});


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});
