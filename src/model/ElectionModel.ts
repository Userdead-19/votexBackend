import mongoose ,{Schema,Document}from 'mongoose';

export interface Candidates{
    CandidateName:String;
    CandidateVotes:number;
}

export interface CategoryAndCandidates{
    CategoryName:String;
    Candidates:Candidates[];
}

export interface Election extends Document{
    ElectionName:String;
    ElectionUrl:String;
    CategoryAndCandidates:CategoryAndCandidates[];
    ElectionStartDate:Date;
    ElectionEndDate:Date;
    ElectionStatus:String;
    VotersIpAddress?:Array<String>;
    VotersUserAgent?:Array<String>;
}
const candidateSchema: Schema<Candidates> = new Schema({
    CandidateName: { type: String, required: true },
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
    ElectionStartDate: { type: Date, required: true },
    ElectionEndDate: { type: Date, required: true },
    ElectionStatus: { type: String, required: true },
    VotersIpAddress: { type: [String] }, 
    VotersUserAgent: { type: [String] },
});
  
export const ElectionModel =  mongoose.model<Election>('Election', electionSchema);

export const createElection = async (electionData: Election) => {ElectionModel.create(electionData).then((data) => {return true}).catch((err) => {console.log(err); return false});};

export const getElection = async (electionUrl: String) => {ElectionModel.findOne({ ElectionUrl: electionUrl }).then((data) => {return data}).catch((err) => {console.log(err); return false});};

export const getAllElections = async () => {ElectionModel.find().then((data) => {return data}).catch((err) => {console.log(err); return false});};

export const castVote = async (electionURL: String, category: String, candidate: String) => {
    ElectionModel.findOne({ ElectionUrl: electionURL }).then((data) => {
        if(data){
            const categoryIndex = data.CategoryAndCandidates.findIndex((categoryAndCandidates) => categoryAndCandidates.CategoryName === category);
            if(categoryIndex !== -1){
                const candidateIndex = data.CategoryAndCandidates[categoryIndex].Candidates.findIndex((candidateData) => candidateData.CandidateName === candidate);
                if(candidateIndex !== -1){
                    data.CategoryAndCandidates[categoryIndex].Candidates[candidateIndex].CandidateVotes += 1;
                    
                    data.save().then((data) => {return true}).catch((err) => {console.log(err); return false});
                }
            }
        }else{ return false;}
    }).catch((err) => {console.log(err); return false});}

export const updateElectionStatus = async (electionUrl: String, status: String) => {
    ElectionModel.findOne({ ElectionUrl: electionUrl }).then((data) => {
        if(data){
            data.ElectionStatus = status;
            data.save().then((data) => {return true}).catch((err) => {console.log(err); return false});
        }else{ return false;}
    }).catch((err) => {console.log(err); return false});
}

export const addIpandUserAgent = async (ip: string|undefined, userAgent: string | undefined, electionUrl: string ): Promise<boolean> => {
    try {
 
      const data: Election | null = await ElectionModel.findOne({ ElectionUrl: electionUrl });
  
      if (data !== null) {
        if (ip !== undefined) {
          if (data.VotersIpAddress === null || data.VotersIpAddress === undefined) {
            data.VotersIpAddress = [];
          }
          data.VotersIpAddress.push(ip);
        }
  
        if (userAgent !== undefined) {
          if (data.VotersUserAgent === null || data.VotersUserAgent === undefined) {
            data.VotersUserAgent = [];
          }
          data.VotersUserAgent.push(userAgent);
        }
  
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