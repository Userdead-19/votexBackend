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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateElectionStatusController = exports.castVoteController = exports.getElectionController = exports.createElectionController = void 0;
const ElectionModel_1 = require("../model/ElectionModel");
const crypto_1 = __importDefault(require("crypto"));
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto_1.default.randomInt(0, chars.length);
        randomString += chars.charAt(randomIndex);
    }
    return randomString;
}
const createElectionController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ElectionData = req.body;
    req.body.ElectionStatus = "Pending";
    req.body.ElectionUrl = generateRandomString(6);
    (0, ElectionModel_1.createElection)(req.body).then((data) => {
        res.status(200).json({ "message": "Election created successfully" });
    }).catch((err) => {
        res.status(400).json({ "message": "Error creating election", "error": err });
    });
});
exports.createElectionController = createElectionController;
const getElectionController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const electionUrl = req.params.electionUrl;
    const data = yield (0, ElectionModel_1.getElection)(electionUrl);
    if (data) {
        res.status(200).json(data);
    }
    else {
        res.status(400).json({ "message": "Error getting election" });
    }
});
exports.getElectionController = getElectionController;
const castVoteController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    if (keys.length === 0) {
        res.status(400).json({ "message": "Bad Api call" });
    }
    for (let i = 0; i < keys.length; i++) {
        (0, ElectionModel_1.castVote)(req.params.electionUrl, keys[i].toString(), values[i]).then((data) => {
        }).catch((err) => {
            res.status(400).json({ "message": "Error casting vote", "error": err });
        });
        (0, ElectionModel_1.addIpandUserAgent)(req.ip, req.headers['user-agent'], req.params.electionUrl).then((data) => {
        }).catch((err) => {
            res.status(400).json({ "message": "Error adding ip and user agent", "error": err });
        });
    }
    next();
});
exports.castVoteController = castVoteController;
const updateElectionStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const electionUrl = req.params.electionUrl;
    const electionStatus = req.body.ElectionStatus;
    (0, ElectionModel_1.updateElectionStatus)(electionUrl, electionStatus).then((data) => {
        res.status(200).json({ "message": "Election status updated successfully" });
    }).catch((err) => {
        res.status(400).json({ "message": "Error updating election status", "error": err });
    });
});
exports.updateElectionStatusController = updateElectionStatusController;
