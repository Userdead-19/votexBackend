import { NextFunction, Request } from "express";
import { ElectionModel } from "../model/ElectionModel";
import { Response } from "express"; 
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

export const createCookieData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const electionUrl = req.params.electionUrl;
  
      // Check if the user has already voted based on IP address
      const electionData = await ElectionModel.findOne({ ElectionUrl: electionUrl });
      if (electionData && electionData?.VotersIpAddress?.includes(req.ip || '')) {
        return res.status(403).json({ message: 'You have already voted' });
      }
  
      // Create and sign the cookie data
      const cookieData = {
        IPaddress: req.ip,
        UserAgent: req.headers['user-agent'],
        voted: false
      };
      const hashedCookieData = await jsonwebtoken.sign(cookieData, process.env.COOKIE_SECRET);
  
      // Set the cookie and proceed to the next middleware or route handler
      (res as any).cookie('VotingSite', hashedCookieData, { maxAge: 60 * 60 * 24 * 1000, secure: true, httpOnly: true });
      next();
    } catch (error) {
      console.error('Error creating cookie data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

export const checkCookie = async(req:Request,res:Response,next:NextFunction)=>{
    try{

        const token = req.cookies['VotingSite'];
        console.log(req.cookies);
        const decoded = jsonwebtoken.verify(token,process.env.COOKIE_SECRET)
        if(decoded.voted){
            res.status(400).json({"message":"You have already voted"});
        }
        next();
    }catch(err){
        console.log(err);
        res.status(500).json({"message":"Internal Server Error"});
    }
}

export const updateCookie = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const decoded = await jsonwebtoken.verify(req.cookies.VotingSite,process.env.COOKIE_SECRET);
        decoded.voted = true;
        const updatedCookie = await jsonwebtoken.sign(decoded,process.env.COOKIE_SECRET);
        (res as any).status(200).cookie('VotingSite',updatedCookie,{maxAge:60*60*24*1000,secure:true,httpOnly:true}).json({"message":"Vote casted successfully"});
    }catch(err){
        res.status(500).json({"message":"Internal Server Error"});
    }   
}