"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.exportVotings = exports.addIpandUserAgent = exports.updateElectionStatus = exports.castVote = exports.getAllElections = exports.getElection = exports.createElection = exports.ElectionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const candidateSchema = new mongoose_1.Schema({
    CandidateName: { type: String, required: true },
    CandidateIdno: { type: String, required: true },
    CandidateVotes: { type: Number, default: 0 },
});
const categoryAndCandidatesSchema = new mongoose_1.Schema({
    CategoryName: { type: String, required: true },
    Candidates: [candidateSchema],
});
const electionSchema = new mongoose_1.Schema({
    ElectionName: { type: String, required: true },
    ElectionUrl: { type: String, required: true },
    CategoryAndCandidates: [categoryAndCandidatesSchema],
    MaxVotes: { type: Number, required: true },
    NoOfVotes: { type: Number, default: 0 },
    ElectionStartDate: { type: String, required: true },
    ElectionEndDate: { type: String, required: true },
    ElectionStatus: { type: String, default: 'pending' },
    VotersIpAddress: { type: [String] },
    VotersUserAgent: { type: [String] },
}, {
    timestamps: true
});
exports.ElectionModel = mongoose_1.default.model('Election', electionSchema);
const createElection = (electionData) => __awaiter(void 0, void 0, void 0, function* () { exports.ElectionModel.create(electionData).then((data) => { return true; }).catch((err) => { console.log(err); return false; }); });
exports.createElection = createElection;
const getElection = (electionUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield exports.ElectionModel.findOne({ ElectionUrl: electionUrl });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getElection = getElection;
const getAllElections = () => __awaiter(void 0, void 0, void 0, function* () { exports.ElectionModel.find().then((data) => { return data; }).catch((err) => { console.log(err); return false; }); });
exports.getAllElections = getAllElections;
const castVote = (electionURL, category, candidate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield exports.ElectionModel.findOne({ ElectionUrl: electionURL });
        if (data) {
            const categoryIndex = data.CategoryAndCandidates.findIndex(categoryAndCandidates => categoryAndCandidates.CategoryName === category);
            if (categoryIndex !== -1) {
                const candidateIndex = data.CategoryAndCandidates[categoryIndex].Candidates.findIndex(candidateData => candidateData.CandidateName === candidate);
                if (candidateIndex !== -1) {
                    data.CategoryAndCandidates[categoryIndex].Candidates[candidateIndex].CandidateVotes += 1;
                    yield data.save();
                    return true;
                }
            }
        }
        return false;
    }
    catch (err) {
        console.error('Error casting vote:', err);
        return false;
    }
});
exports.castVote = castVote;
const updateElectionStatus = (electionUrl, status) => __awaiter(void 0, void 0, void 0, function* () {
    exports.ElectionModel.findOne({ ElectionUrl: electionUrl }).then((data) => {
        if (data) {
            data.ElectionStatus = status;
            data.save().then((data) => { return true; }).catch((err) => { console.log(err); return false; });
        }
        else {
            return false;
        }
    }).catch((err) => { console.log(err); return false; });
});
exports.updateElectionStatus = updateElectionStatus;
const addIpandUserAgent = (ip, userAgent, electionUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield exports.ElectionModel.findOne({ ElectionUrl: electionUrl });
        if (data) {
            if (ip !== undefined) {
                if (!data.VotersIpAddress) {
                    data.VotersIpAddress = [];
                }
                data.VotersIpAddress.push(ip);
            }
            if (userAgent !== undefined) {
                if (!data.VotersUserAgent) {
                    data.VotersUserAgent = [];
                }
                data.VotersUserAgent.push(userAgent);
            }
            data.NoOfVotes += 1;
            yield data.save();
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error('Error adding IP and User Agent:', error);
        return false;
    }
});
exports.addIpandUserAgent = addIpandUserAgent;
const exportVotings = (electionUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield exports.ElectionModel.findOne({ ElectionUrl: electionUrl }).select('CategoryAndCandidates').lean().exec();
        return data !== null ? data : undefined;
    }
    catch (error) {
        console.error('Error exporting votings:', error);
    }
});
exports.exportVotings = exportVotings;
