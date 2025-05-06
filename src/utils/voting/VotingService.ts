
import { supabase } from "@/integrations/supabase/client";
import { VoteTransaction } from "../VotingContract";
import { storeVotingHistory } from "../storage/supabaseStorageService";

class VotingService {
  private transactions: VoteTransaction[] = [];
  private hasVoted: Record<string, Set<number>> = {}; // userId -> set of electionIds
  
  /**
   * Cast a vote in a specific election
   */
  public async castVote(userId: string, electionId: number, candidateId: number): Promise<VoteTransaction> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Find the election and candidate
          const election = await this.getElection(electionId);
          if (!election) {
            reject(new Error("Election not found"));
            return;
          }
          
          if (!election.isActive) {
            reject(new Error("Election is not active"));
            return;
          }
          
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
          const transactionHash = `tx-${Math.random().toString(16).substring(2, 42)}`;
          const transaction: VoteTransaction = {
            transactionHash,
            blockNumber: Math.floor(Math.random() * 1000000),
            timestamp: new Date(),
            voter: userId,
            electionId,
            candidateId
          };
          
          this.transactions.push(transaction);
          
          // Store voting history in Supabase
          try {
            // Store vote in database - always convert IDs to strings for consistency with UUID format
            await supabase.from('votes').insert({
              voter_id: userId,
              election_id: String(electionId),
              candidate_id: String(candidateId),
              transaction_hash: transaction.transactionHash
            });

            // Store voting history in Supabase storage
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
              },
              voter: {
                id: userId
              }
            };
            
            // Store the voting history asynchronously (don't await)
            storeVotingHistory(String(candidate.id), String(electionId), votingHistoryData)
              .then(() => console.log('Voting history stored successfully'))
              .catch(err => console.error('Failed to store voting history:', err));
          } catch (error) {
            console.error('Error storing vote or voting history:', error);
            // Don't reject the promise, just log the error as this is a non-critical operation
          }
          
          resolve(transaction);
        } catch (error) {
          reject(error);
        }
      }, 1000); // Shorter delay to simulate faster blockchain confirmation
    });
  }
  
  /**
   * Get all vote transactions
   */
  public async getVoteTransactions(): Promise<VoteTransaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.transactions), 300);
    });
  }

  // Helper method to get election by ID
  private async getElection(id: number) {
    return {
      id,
      title: id === 1 ? "Student Body President Election" : "Department Representative Election",
      isActive: true,
      candidates: [
        { id: 1, name: "Test Candidate 1", party: "Test Party A", voteCount: 0 },
        { id: 2, name: "Test Candidate 2", party: "Test Party B", voteCount: 0 },
        { id: 3, name: "Test Candidate 3", party: "Test Party C", voteCount: 0 }
      ]
    };
  }
}

export default VotingService;
