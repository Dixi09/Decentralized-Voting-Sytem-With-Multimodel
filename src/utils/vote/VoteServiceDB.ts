
import { supabase } from "@/integrations/supabase/client";
import { storeVotingHistory } from "../storage/supabaseStorageService";

export class VoteServiceDB {
  /**
   * Cast a vote and update counts
   */
  public async castVote(userId: string, electionId: string, candidateId: string): Promise<boolean> {
    try {
      // Check if user has already voted in this election
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_id', userId)
        .eq('election_id', electionId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing vote:', checkError);
        throw checkError;
      }
      
      if (existingVote) {
        console.error('User has already voted in this election');
        return false;
      }

      // If no existing vote, proceed with casting the vote
      const { data, error } = await supabase
        .from('votes')
        .insert({
          voter_id: userId,
          election_id: electionId,
          candidate_id: candidateId
        });

      if (error) {
        console.error('Error inserting vote:', error);
        throw error;
      }

      // Subscribe to real-time updates
      this.subscribeToVoteUpdates(electionId);
      
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      return false;
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
        .single();
      
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
