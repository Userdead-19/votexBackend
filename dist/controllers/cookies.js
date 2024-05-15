"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCookie = exports.checkCookie = exports.createCookieData = void 0;
const __1 = require("..");
const ElectionModel_1 = require("../model/ElectionModel");
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const createCookieData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const electionUrl = req.params.electionUrl;
        // Find the election based on the provided URL
        const election = yield ElectionModel_1.ElectionModel.findOne({ ElectionUrl: electionUrl });
        if (!election) {
            return res.status(400).json({ message: 'Election not found' });
        }
        const clientIp = req.headers['x-forwarded-for'];
        // Extract the first three octets of the IP address
        const parsedClientIP = clientIp.split(',')[0];
        // Check if the number of votes exceeds the maximum allowed
        if (election.NoOfVotes + 1 > election.MaxVotes) {
            return res.status(400).json({ message: 'Max number of votes reached' });
        }
        // Check if the client IP is already in the VotersIpAddress array
        if ((_a = election.VotersIpAddress) === null || _a === void 0 ? void 0 : _a.includes(parsedClientIP)) {
            return res.status(400).json({ message: 'You have already voted' });
        }
        // Check if the 'VotingSite' cookie exists and if the user has already voted
        if (req.cookies['VotingSite']) {
            try {
                const decoded = jsonwebtoken.verify(req.cookies['VotingSite'], process.env.COOKIE_SECRET);
                if (decoded.voted) {
                    return res.status(400).json({ message: 'You have already voted' });
                }
            }
            catch (error) {
                // Handle invalid or expired cookies gracefully
                console.error('Error decoding cookie:', error);
            }
        }
        // Create cookie data
        const cookieData = {
            IPaddress: parsedClientIP,
            UserAgent: req.headers['user-agent'],
            voted: false
        };
        // Hash the cookie data
        const hashedCookieData = yield jsonwebtoken.sign(cookieData, process.env.COOKIE_SECRET);
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
    }
    catch (error) {
        console.error('Error creating cookie data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.createCookieData = createCookieData;
const checkCookie = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});
exports.checkCookie = checkCookie;
const updateCookie = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = yield jsonwebtoken.verify(req.cookies.VotingSite, process.env.COOKIE_SECRET);
        decoded.voted = true;
        const updatedCookie = yield jsonwebtoken.sign(decoded, process.env.COOKIE_SECRET);
        (0, __1.updateResultVote)(req.params.electionUrl);
        res.status(200).cookie('VotingSite', updatedCookie, { maxAge: 60 * 60 * 24 * 1000, secure: true, httpOnly: true }).json({ "message": "Vote casted successfully" });
    }
    catch (err) {
        res.status(500).json({ "message": "Internal Server Error" });
    }
});
exports.updateCookie = updateCookie;
