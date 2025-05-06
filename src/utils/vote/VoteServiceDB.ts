
import { supabase } from "@/integrations/supabase/client";
import { storeVotingHistory } from "../storage/supabaseStorageService";

export class VoteServiceDB {
  /**
   * Cast a vote and update counts
   */
  public async castVote(userId: string | number, electionId: string | number, candidateId: string | number): Promise<boolean> {
    try {
      // Convert all IDs to strings to ensure consistency with database types
      const voterIdStr = String(userId);
      const electionIdStr = String(electionId);
      const candidateIdStr = String(candidateId);
      
      // Check if user has already voted in this election
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_id', voterIdStr)
        .eq('election_id', electionIdStr)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingVote) {
        console.error('User has already voted in this election');
        return false;
      }

      // If no existing vote, proceed with casting the vote
      const { data, error } = await supabase.rpc('cast_vote', {
        p_voter_id: voterIdStr,
        p_election_id: electionIdStr,
        p_candidate_id: candidateIdStr
      });

      if (error) throw error;

      // Subscribe to real-time updates - Fixed type issue
      this.subscribeToVoteUpdates(electionIdStr);
      
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
      }, () => {
        // Trigger a refresh of the election data
        this.getElection(electionId);
      })
      .subscribe();
  }

  // Helper method to get election by ID (stub for the subscribe callback)
  private async getElection(electionId: string) {
    // This is just a placeholder method to satisfy the subscribeToVoteUpdates callback
    // The actual implementation would use the ElectionServiceDB
    console.log(`Election ${electionId} data should be refreshed`);
  }
}

export const voteServiceDB = new VoteServiceDB();
