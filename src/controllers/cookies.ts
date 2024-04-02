import { NextFunction, Request } from "express";
import { Response } from "express";
import { updateResultVote } from "..";
import { ElectionModel } from "../model/ElectionModel";
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

export const createCookieData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const electionUrl = req.params.electionUrl;

    const election = await ElectionModel.findOne({ ElectionUrl: electionUrl });

    if (!election) {
      return res.status(400).json({ message: 'Election not found' });
    }
    const clientIp: string | undefined = req.ip;

    if (election?.VotersIpAddress?.includes(clientIp)) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    const cookieData = {
      IPaddress: req.ip,
      UserAgent: req.headers['user-agent'],
      voted: false
    };
    const hashedCookieData = await jsonwebtoken.sign(cookieData, process.env.COOKIE_SECRET);

    res.cookie('VotingSite', hashedCookieData, { maxAge: 60 * 60 * 24 * 1000, secure: true, httpOnly: true, sameSite: 'none', path: '/' });
    next();
  } catch (error) {
    console.error('Error creating cookie data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const checkCookie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies['VotingSite'];
    console.log(req.cookies);
    if (!token) {
      return res.status(400).json({ message: 'Cookie not found' });
    }
    const decoded = jsonwebtoken.verify(token, process.env.COOKIE_SECRET);
    if (decoded.voted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ "message": "Internal Server Error" });
  }
}

export const updateCookie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = await jsonwebtoken.verify(req.cookies.VotingSite, process.env.COOKIE_SECRET);
    decoded.voted = true;
    const updatedCookie = await jsonwebtoken.sign(decoded, process.env.COOKIE_SECRET);
    updateResultVote(req.params.electionUrl);
    (res as any).status(200).cookie('VotingSite', updatedCookie, { maxAge: 60 * 60 * 24 * 1000, secure: true, httpOnly: true }).json({ "message": "Vote casted successfully" });
  } catch (err) {
    res.status(500).json({ "message": "Internal Server Error" });
  }
}