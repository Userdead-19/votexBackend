import { NextFunction, Request } from "express";
import { Response } from "express";
import { updateResultVote } from "..";
import { ElectionModel, Election } from "../model/ElectionModel";
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

export const createCookieData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const electionUrl: string = req.params.electionUrl;

    // Find the election based on the provided URL
    const election: Election | null = await ElectionModel.findOne({ ElectionUrl: electionUrl });

    if (!election) {
      return res.status(400).json({ message: 'Election not found' });
    }

    const clientIp: any = req.headers['x-forwarded-for'];

    // Extract the first three octets of the IP address
    const parsedClientIP: any = clientIp.split(',')[0];
    const dhcpClientIP: string = parsedClientIP.split('.').slice(0, 3).join('.');

    // Check if the number of votes exceeds the maximum allowed
    if (election.NoOfVotes + 1 > election.MaxVotes) {
      return res.status(400).json({ message: 'Max number of votes reached' });
    }

    // Check if the client IP is already in the VotersIpAddress array
    if (election.VotersIpAddress?.includes(dhcpClientIP)) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Check if the 'VotingSite' cookie exists and if the user has already voted
    if (req.cookies['VotingSite']) {
      try {
        const decoded = jsonwebtoken.verify(req.cookies['VotingSite'], process.env.COOKIE_SECRET);
        if (decoded.voted) {
          return res.status(400).json({ message: 'You have already voted' });
        }
      } catch (error) {
        // Handle invalid or expired cookies gracefully
        console.error('Error decoding cookie:', error);
      }
    }

    // Create cookie data
    const cookieData = {
      IPaddress: dhcpClientIP,
      UserAgent: req.headers['user-agent'],
      voted: false
    };

    // Hash the cookie data
    const hashedCookieData = await jsonwebtoken.sign(cookieData, process.env.COOKIE_SECRET);

    // Set the 'VotingSite' cookie
    res.cookie('VotingSite', hashedCookieData, {
      maxAge: 60 * 60 * 24 * 1000, // 1 day
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      path: '/'
    });

    // Proceed to the next middleware
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
