
import { supabase } from "@/integrations/supabase/client";
import { storeVotingHistory } from "../storage/supabaseStorageService";

export class VoteServiceDB {
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
   * Subscribe to real-time updates
   */
  private subscribeToVoteUpdates(electionId: string | number) {
    // Create a properly typed channel name
    const channelName = `election-${electionId}`;
    
    // Use a more specific type assertion to avoid 'never' type issues
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

  // Helper method to get election by ID (stub for the subscribe callback)
  private async getElection(electionId: string | number) {
    // This is just a placeholder method to satisfy the subscribeToVoteUpdates callback
    // The actual implementation would use the ElectionServiceDB
    console.log(`Election ${electionId} data should be refreshed`);
  }
}

export const voteServiceDB = new VoteServiceDB();
