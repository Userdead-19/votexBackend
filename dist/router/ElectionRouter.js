"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Election_1 = require("../controllers/Election");
const cookies_1 = require("../controllers/cookies");
const ElectionRouter = express_1.default.Router();
ElectionRouter.post('/create', Election_1.createElectionController);
ElectionRouter.get('/:electionUrl', cookies_1.createCookieData, Election_1.getElectionController);
ElectionRouter.post('/:electionUrl/vote', cookies_1.checkCookie, Election_1.castVoteController, cookies_1.updateCookie);
ElectionRouter.put('/:electionUrl/update', Election_1.updateElectionStatusController);
exports.default = ElectionRouter;
