
import { supabase } from "@/integrations/supabase/client";
import { Election, Candidate, Vote, VoteStatistics } from "@/VotingContract";

// Function to store voting history for a candidate
export async function storeVotingHistory(candidateId: number, electionId: number, votingData: any) {
  try {
    const fileName = `candidate_${candidateId}_election_${electionId}.json`;
    const filePath = `candidates/${candidateId}/${fileName}`;
    
    // Convert data to JSON string
    const fileData = JSON.stringify(votingData, null, 2);
    
    // Convert string to Blob
    const blob = new Blob([fileData], { type: 'application/json' });
    
    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .upload(filePath, blob, {
        contentType: 'application/json',
        upsert: true
      });
    
    if (error) {
      console.error('Error storing voting history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to store voting history:', error);
    throw error;
  }
}

// Function to retrieve voting history for a candidate
export async function getVotingHistory(candidateId: number, electionId: number) {
  try {
    const filePath = `candidates/${candidateId}/candidate_${candidateId}_election_${electionId}.json`;
    
    // Get file from storage
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .download(filePath);
    
    if (error) {
      console.error('Error retrieving voting history:', error);
      throw error;
    }
    
    // Parse the JSON data
    const text = await data.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to retrieve voting history:', error);
    return null;
  }
}

// Function to list all voting history files for a candidate
export async function listCandidateVotingHistory(candidateId: number) {
  try {
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .list(`candidates/${candidateId}`);
    
    if (error) {
      console.error('Error listing voting history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to list voting history:', error);
    return [];
  }
}

// Function to list all voting history files across all candidates
export async function listAllVotingHistory() {
  try {
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .list('candidates', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Error listing all voting history:', error);
      throw error;
    }
    
    // Get all subdirectories (candidate folders)
    const candidateFolders = data.filter(item => item.id.includes('/'));
    const allHistories = [];
    
    // For each candidate folder, list the files
    for (const folder of candidateFolders) {
      const candidateId = folder.name;
      const { data: candidateFiles, error: candidateError } = await supabase
        .storage
        .from('voting_history')
        .list(`candidates/${candidateId}`);
        
      if (!candidateError && candidateFiles) {
        allHistories.push(...candidateFiles.map(file => ({
          ...file,
          candidateId: parseInt(candidateId, 10)
        })));
      }
    }
    
    return allHistories;
  } catch (error) {
    console.error('Failed to list all voting history:', error);
    return [];
  }
}

// Function to get voting history by user
export async function getUserVotingHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        election_id,
        candidate_id,
        transaction_hash,
        created_at
      `)
      .eq('voter_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get user voting history:', error);
    return [];
  }
}

// Function to get all votes for analysis (admin only)
export async function getAllVotes() {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        voter_id,
        election_id,
        candidate_id,
        created_at,
        transaction_hash
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get all votes:', error);
    return [];
  }
}

class ElectionService {
  private getVoteCount(votes: any[], candidateId: string | number): number {
    return votes.filter(vote => vote.candidate_id === String(candidateId)).length;
  }

  private async getElection(electionId: string | number): Promise<Election | null> {
    try {
      const { data, error } = await supabase
        .from('elections')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          is_active,
          candidates (
            id,
            name,
            party
          ),
          votes (
            candidate_id
          )
        `)
        .eq('id', String(electionId))
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        isActive: data.is_active,
        candidates: data.candidates.map((candidate: any) => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          voteCount: this.getVoteCount(data.votes, candidate.id)
        }))
      };
    } catch (error) {
      console.error('Error fetching election:', error);
      return null;
    }
  }

  /**
   * Get all elections with real-time vote counts
   */
  public async getElections(): Promise<Election[]> {
    try {
      // Fetch elections from Supabase
      const { data: elections, error } = await supabase
        .from('elections')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          is_active,
          candidates (
            id,
            name,
            party
          ),
          votes (
            candidate_id
          )
        `);

      if (error) throw error;

      return elections.map((election: any) => ({
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: new Date(election.start_date),
        endDate: new Date(election.end_date),
        isActive: election.is_active,
        candidates: election.candidates.map((candidate: any) => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          voteCount: this.getVoteCount(election.votes, candidate.id)
        }))
      }));
    } catch (error) {
      console.error('Error fetching elections:', error);
      return [];
    }
  }

  /**
   * Cast a vote and update counts
   */
  public async castVote(userId: string | number, electionId: string | number, candidateId: string | number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('cast_vote', {
        p_voter_id: String(userId),
        p_election_id: String(electionId),
        p_candidate_id: String(candidateId)
      });

      if (error) throw error;

      // Subscribe to real-time updates
      this.subscribeToVoteUpdates(electionId);
      
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time vote updates
   */
  private subscribeToVoteUpdates(electionId: string | number) {
    const channelName = `election-${electionId}`;
    
    // Fix the TypeScript error by explicitly typing the channel as RealtimeChannel
    const channel = supabase.channel(channelName);
    
    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `election_id=eq.${String(electionId)}`
      }, () => {
        // Trigger a refresh of the election data
        this.getElection(electionId);
      })
      .subscribe();
  }

  /**
   * Get vote statistics
   */
  public async getVoteStatistics(electionId: string | number): Promise<VoteStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('vote_results')
        .select('*')
        .eq('election_id', String(electionId))
        .single();

      if (error) throw error;

      return {
        totalVotes: data.vote_count,
        voterTurnout: data.vote_count, // You might want to calculate this based on total registered voters
        candidateStats: {
          name: data.candidate_name,
          party: data.party,
          votes: data.vote_count
        }
      };
    } catch (error) {
      console.error('Error fetching vote statistics:', error);
      return null;
    }
  }
}

export const electionService = new ElectionService();
