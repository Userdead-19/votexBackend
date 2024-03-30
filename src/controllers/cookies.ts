import { NextFunction, Request } from "express";

import { Response } from "express"; 
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

export const createCookieData = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const cookieData = {
            IPaddress:req.ip,
            UserAgent:req.headers['user-agent'],
            voted:false
        };
        const hashedCookieData = await jsonwebtoken.sign(cookieData,process.env.COOKIE_SECRET);
        (res as any).cookie('VotingSite',hashedCookieData,{maxAge:60*60*24*1000,secure:true,httpOnly:true}); 
        next()
    } catch (error) {

        console.log(error)
        res.status(500).json({"message":"Internal Server Error"});
    }
}

export const checkCookie = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        jsonwebtoken.verify(req.cookies.VotingSite,process.env.COOKIE_SECRET).then((data:any)=>{
            next();
        }).catch((err:Error)=>{
            res.status(400).json({"message":"Invalid Cookie"});
        })
    }catch(err){
        res.send(500).json({"message":"Internal Server Error"});
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