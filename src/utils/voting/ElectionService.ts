
import { supabase } from "@/integrations/supabase/client";
import { Election, Candidate } from "../VotingContract";

class ElectionService {
  /**
   * Get all elections
   */
  public async getElections(): Promise<Election[]> {
    return new Promise((resolve) => {
      // Simulate network delay - would be a real API call
      setTimeout(() => resolve(this.elections), 500);
    });
  }
  
  /**
   * Get a specific election by ID
   */
  public async getElection(id: number): Promise<Election | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const election = this.elections.find(e => e.id === id);
        resolve(election);
      }, 300);
    });
  }
  
  /**
   * Check if a user has voted in a specific election
   */
  public async hasUserVoted(userId: string, electionId: number): Promise<boolean> {
    try {
      // Check in Supabase if the user has voted
      const { count, error } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('voter_id', userId)
        .eq('election_id', electionId.toString());
      
      if (error) {
        console.error('Error checking vote status:', error);
        // Fall back to local check if database query fails
        return this.hasVoted[userId]?.has(electionId) || false;
      }
      
      return count !== null && count > 0;
    } catch (error) {
      console.error('Error checking user vote status:', error);
      // Fall back to local check
      return this.hasVoted[userId]?.has(electionId) || false;
    }
  }

  // Mock data storage - would be replaced by real API calls
  private elections: Election[] = [
    {
      id: 1,
      title: "Student Body President Election",
      description: "Vote for your student body president for the 2025-2026 academic year",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      candidates: [
        { id: 1, name: "Candidate 1", party: "Party 1", voteCount: 10},
        { id: 2, name: "Candidate 2", party: "Party 2", voteCount: 20},
        { id: 3, name: "Candidate 3", party: "Party 3", voteCount: 30}
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
        { id: 1, name: "Candidate 1", party: "Party 1", voteCount: 30 },
        { id: 2, name: "Candidate 2", party: "Party 2", voteCount: 40}
      ],
      isActive: true
    }
  ];
  
  private hasVoted: Record<string, Set<number>> = {}; // userId -> set of electionIds
}

export default ElectionService;
