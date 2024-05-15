import mongoose, { Schema, Document } from 'mongoose';

export interface Candidates {
  CandidateName: String;
  CandidateIdno: String;
  CandidateVotes: number;
}

export interface CategoryAndCandidates {
  CategoryName: String;
  Candidates: Candidates[];
}

export interface Election extends Document {
  ElectionName: String;
  ElectionUrl: String;
  CategoryAndCandidates: CategoryAndCandidates[];
  MaxVotes: number;
  NoOfVotes: number;
  ElectionStartDate: String;
  ElectionEndDate: String;
  ElectionStatus: String;
  VotersIpAddress?: Array<String | undefined>;
  VotersUserAgent?: Array<String | undefined>;
}
const candidateSchema: Schema<Candidates> = new Schema({
  CandidateName: { type: String, required: true },
  CandidateIdno: { type: String, required: true },
  CandidateVotes: { type: Number, default: 0 },
});

const categoryAndCandidatesSchema: Schema<CategoryAndCandidates> = new Schema({
  CategoryName: { type: String, required: true },
  Candidates: [candidateSchema],
});

const electionSchema: Schema<Election> = new Schema({
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

export const ElectionModel = mongoose.model<Election>('Election', electionSchema);

export const createElection = async (electionData: Election) => { ElectionModel.create(electionData).then((data) => { return true }).catch((err) => { console.log(err); return false }); };

export const getElection = async (electionUrl: String) => {
  try {
    const data = await ElectionModel.findOne({ ElectionUrl: electionUrl })
    return data;
  } catch (error) {
    console.log(error)
  }

}

export const getAllElections = async () => { ElectionModel.find().then((data) => { return data }).catch((err) => { console.log(err); return false }); };

export const castVote = async (electionURL: string, category: string, candidate: string) => {
  try {
    const data = await ElectionModel.findOne({ ElectionUrl: electionURL });

    if (data) {
      const categoryIndex = data.CategoryAndCandidates.findIndex(categoryAndCandidates => categoryAndCandidates.CategoryName === category);
      if (categoryIndex !== -1) {
        const candidateIndex = data.CategoryAndCandidates[categoryIndex].Candidates.findIndex(candidateData => candidateData.CandidateName === candidate);
        if (candidateIndex !== -1) {
          data.CategoryAndCandidates[categoryIndex].Candidates[candidateIndex].CandidateVotes += 1;
          await data.save();
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.error('Error casting vote:', err);
    return false;
  }
};

export const updateElectionStatus = async (electionUrl: String, status: String) => {
  ElectionModel.findOne({ ElectionUrl: electionUrl }).then((data) => {
    if (data) {
      data.ElectionStatus = status;
      data.save().then((data) => { return true }).catch((err) => { console.log(err); return false });
    } else { return false; }
  }).catch((err) => { console.log(err); return false });
}

export const addIpandUserAgent = async (ip: string | undefined, userAgent: string | undefined, electionUrl: string): Promise<boolean> => {
  try {
    const data = await ElectionModel.findOne({ ElectionUrl: electionUrl });

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
      await data.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error adding IP and User Agent:', error);
    return false;
  }
};


export const exportVotings = async (electionUrl: string): Promise<CategoryAndCandidates | undefined> => {
  try {

    const data: CategoryAndCandidates | null = await ElectionModel.findOne({ ElectionUrl: electionUrl }).select('CategoryAndCandidates').lean().exec() as CategoryAndCandidates | null;

    return data !== null ? data : undefined;
  } catch (error) {
    console.error('Error exporting votings:', error);
  }
}