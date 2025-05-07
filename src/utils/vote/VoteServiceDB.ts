
import { supabase } from "@/integrations/supabase/client";
import { storeVotingHistory } from "../storage/supabaseStorageService";

export class VoteServiceDB {
  /**
   * Cast a vote and update counts
   */
  public async castVote(userId: string, electionId: string | number, candidateId: string | number): Promise<boolean> {
    try {
      // Ensure IDs are converted to strings for database consistency
      const strElectionId = String(electionId);
      const strCandidateId = String(candidateId);
      
      console.log('VoteServiceDB: Attempting to cast vote with:', { userId, electionId: strElectionId, candidateId: strCandidateId });
      
      // Check if user has already voted in this election
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_id', userId)
        .eq('election_id', strElectionId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing vote:', checkError);
        throw checkError;
      }
      
      if (existingVote) {
        console.error('User has already voted in this election');
        return false;
      }

      // Create a transaction hash
      const transactionHash = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      // Insert the vote directly without checking candidate existence
      // (the database constraints will handle this)
      const { data, error } = await supabase
        .from('votes')
        .insert({
          voter_id: userId,
          election_id: strElectionId,
          candidate_id: strCandidateId,
          transaction_hash: transactionHash
        });

      if (error) {
        console.error('Error inserting vote:', error);
        
        // If there was a foreign key error, it might be because the candidate or election doesn't exist
        // Let's try to provide more helpful diagnostics
        if (error.code === '23503') { // Foreign key violation
          console.log('Checking if candidate exists...');
          const { data: candidateExists } = await supabase
            .from('candidates')
            .select('id')
            .eq('id', strCandidateId)
            .maybeSingle();
            
          console.log('Candidate check result:', candidateExists);
          
          console.log('Checking if election exists...');
          const { data: electionExists } = await supabase
            .from('elections')
            .select('id')
            .eq('id', strElectionId)
            .maybeSingle();
            
          console.log('Election check result:', electionExists);
          
          if (!candidateExists) {
            console.error('Candidate does not exist in the database:', strCandidateId);
          }
          
          if (!electionExists) {
            console.error('Election does not exist in the database:', strElectionId);
          }
        }
        
        throw error;
      }

      console.log('Vote successfully cast:', { userId, electionId: strElectionId, candidateId: strCandidateId });
      
      // Try to store voting history too
      try {
        // Fetch candidate details for the history
        const { data: candidate } = await supabase
          .from('candidates')
          .select('name, party')
          .eq('id', strCandidateId)
          .maybeSingle();
          
        // Fetch election details for the history
        const { data: election } = await supabase
          .from('elections')
          .select('title')
          .eq('id', strElectionId)
          .maybeSingle();
          
        const votingHistoryData = {
          election: {
            id: electionId,
            title: election?.title || "Election"
          },
          candidate: {
            id: candidateId,
            name: candidate?.name || "Unknown Candidate",
            party: candidate?.party || "Unknown Party",
            currentVoteCount: 1 // Increment
          },
          timestamp: new Date().toISOString(),
          transaction: {
            hash: transactionHash,
            blockNumber: Math.floor(Math.random() * 1000000)
          },
          voter: {
            id: userId
          }
        };
        
        // Store voting history asynchronously
        storeVotingHistory(Number(candidateId), Number(electionId), votingHistoryData)
          .then(() => console.log('Voting history stored successfully'))
          .catch(err => console.error('Failed to store voting history:', err));
      } catch (err) {
        console.error('Error storing voting history, but vote was cast:', err);
        // Don't fail the vote just because history storage failed
      }
      
      // Subscribe to real-time updates
      this.subscribeToVoteUpdates(strElectionId);
      
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error; // Propagate the error for better error handling in UI
    }
  }

  /**
   * Subscribe to real-time updates
   */
  private subscribeToVoteUpdates(electionId: string) {
    try {
      // Create channel name
      const channelName = `election-${electionId}`;
      
      // Create channel with proper typing
      const channel = supabase.channel(channelName);
      
      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `election_id=eq.${electionId}`
        }, (payload) => {
          console.log('Vote update received:', payload);
          // Trigger a refresh of the election data
          this.getElection(electionId);
        })
        .subscribe((status) => {
          console.log(`Subscription status for ${channelName}:`, status);
        });
    } catch (error) {
      console.error('Error setting up vote subscription:', error);
    }
  }

  // Helper method to get election by ID (improved with logging)
  private async getElection(electionId: string) {
    console.log(`Refreshing election data for ID: ${electionId}`);
    try {
      const { data, error } = await supabase
        .from('elections')
        .select(`
          id,
          title,
          description,
          candidates (
            id,
            name,
            party
          ),
          votes (
            candidate_id
          )
        `)
        .eq('id', electionId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching election data:', error);
        return;
      }
      
      console.log('Election data refreshed:', data);
      return data;
    } catch (error) {
      console.error('Error in getElection:', error);
    }
  }
}

export const voteServiceDB = new VoteServiceDB();
