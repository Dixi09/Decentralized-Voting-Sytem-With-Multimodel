export interface Election {
  id: string | number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  candidates: Candidate[];
}

export interface Candidate {
  id: string | number;
  name: string;
  party: string;
  voteCount: number;
}

export interface Vote {
  id: string | number;
  voterId: string | number;
  electionId: string | number;
  candidateId: string | number;
  transactionHash: string;
  createdAt: Date;
}

export interface VoteStatistics {
  totalVotes: number;
  voterTurnout: number;
  candidateStats: {
    name: string;
    party: string;
    votes: number;
  };
} 