
// Interface to interact with the Ethereum Smart Contract for voting
// This would connect to a real smart contract in production

import { storeVotingHistory } from "./supabaseStorage";

export interface Candidate {
  id: number;
  name: string;
  party: string;
  voteCount: number;
}

export interface Election {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  candidates: Candidate[];
  isActive: boolean;
}

export interface VoteTransaction {
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  voter: string;
  electionId: number;
  candidateId: number;
}

// Mock implementation for demo purposes
// In production, this would use Web3.js or ethers.js to interact with an actual smart contract
class VotingContract {
  private static instance: VotingContract;
  private elections: Election[] = [];
  private transactions: VoteTransaction[] = [];
  private hasVoted: Record<string, Set<number>> = {}; // userId -> set of electionIds
  
  private constructor() {
    // Initialize with some mock data
    this.elections = [
      {
        id: 1,
        title: "Student Body President Election",
        description: "Vote for your student body president for the 2025-2026 academic year",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        candidates: [
          { id: 1, name: "Alice Johnson", party: "Progress Party", voteCount: 45 },
          { id: 2, name: "Bob Smith", party: "Future Alliance", voteCount: 30 },
          { id: 3, name: "Carol Williams", party: "Student Voice", voteCount: 25 }
        ],
        isActive: true
      },
      {
        id: 2,
        title: "Department Representative Election",
        description: "Select your department representative for the academic council",
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        candidates: [
          { id: 1, name: "David Chen", party: "Tech Innovators", voteCount: 20 },
          { id: 2, name: "Emma Davis", party: "Academic Excellence", voteCount: 35 }
        ],
        isActive: true
      }
    ];
  }
  
  public static getInstance(): VotingContract {
    if (!VotingContract.instance) {
      VotingContract.instance = new VotingContract();
    }
    return VotingContract.instance;
  }
  
  public async getElections(): Promise<Election[]> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => resolve(this.elections), 500);
    });
  }
  
  public async getElection(id: number): Promise<Election | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const election = this.elections.find(e => e.id === id);
        resolve(election);
      }, 300);
    });
  }
  
  public async castVote(userId: string, electionId: number, candidateId: number): Promise<VoteTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Check if election exists and is active
        const election = this.elections.find(e => e.id === electionId);
        if (!election) {
          reject(new Error("Election not found"));
          return;
        }
        
        if (!election.isActive) {
          reject(new Error("Election is not active"));
          return;
        }
        
        // Check if candidate exists
        const candidate = election.candidates.find(c => c.id === candidateId);
        if (!candidate) {
          reject(new Error("Candidate not found"));
          return;
        }
        
        // Check if user has already voted in this election
        if (!this.hasVoted[userId]) {
          this.hasVoted[userId] = new Set();
        }
        
        if (this.hasVoted[userId].has(electionId)) {
          reject(new Error("You have already cast your vote in this election"));
          return;
        }
        
        // Record the vote
        candidate.voteCount++;
        this.hasVoted[userId].add(electionId);
        
        // Create transaction record
        const transaction: VoteTransaction = {
          transactionHash: `0x${Math.random().toString(16).substring(2, 42)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: new Date(),
          voter: userId,
          electionId,
          candidateId
        };
        
        this.transactions.push(transaction);
        
        // Store voting history in Supabase storage
        try {
          const votingHistoryData = {
            election: {
              id: electionId,
              title: election.title
            },
            candidate: {
              id: candidate.id,
              name: candidate.name,
              party: candidate.party,
              currentVoteCount: candidate.voteCount
            },
            timestamp: new Date().toISOString(),
            transaction: {
              hash: transaction.transactionHash,
              blockNumber: transaction.blockNumber
            }
          };
          
          // Store the voting history asynchronously (don't await)
          storeVotingHistory(candidate.id, electionId, votingHistoryData)
            .then(() => console.log('Voting history stored successfully'))
            .catch(err => console.error('Failed to store voting history:', err));
        } catch (error) {
          console.error('Error storing voting history:', error);
          // Don't reject the promise, just log the error as this is a non-critical operation
        }
        
        resolve(transaction);
      }, 1500); // Longer delay to simulate blockchain confirmation
    });
  }
  
  public async getVoteTransactions(): Promise<VoteTransaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.transactions), 500);
    });
  }
  
  public async hasUserVoted(userId: string, electionId: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.hasVoted[userId]?.has(electionId) || false);
      }, 200);
    });
  }
}

export default VotingContract;
