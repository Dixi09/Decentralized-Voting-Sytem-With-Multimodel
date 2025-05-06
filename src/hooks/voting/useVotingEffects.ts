
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VotingContract from '@/utils/VotingContract';
import { toast } from '@/hooks/use-toast';

/**
 * Hook that manages voting side effects
 */
export const useVotingEffects = (state: ReturnType<typeof import('./useVotingState').useVotingState>) => {
  const {
    user,
    setIsLoading,
    setElections,
    selectedElection,
    setIsBiometricsRegistered,
    isCheckingEligibility,
    setIsCheckingEligibility,
    setVoteCounts
  } = state;

  // Check biometrics registration status
  useEffect(() => {
    const checkBiometricsRegistration = async () => {
      if (!user?.id) return;

      try {
        setIsCheckingEligibility(true);

        const { data, error } = await supabase
          .from('user_biometrics')
          .select('face_image_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // User has registered biometrics if face_image_url exists
        setIsBiometricsRegistered(!!data?.face_image_url);
      } catch (error) {
        console.error('Error checking biometrics:', error);
        toast({
          title: "Error",
          description: "Failed to verify your registration status.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingEligibility(false);
      }
    };

    checkBiometricsRegistration();
  }, [user, setIsBiometricsRegistered, setIsCheckingEligibility]);
  
  // Fetch elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setIsLoading(true);
        const votingContract = VotingContract.getInstance();
        const electionList = await votingContract.getElections();
        setElections(electionList);
      } catch (error) {
        console.error('Error fetching elections:', error);
        toast({
          title: "Error",
          description: "Failed to load elections. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchElections();
  }, [setElections, setIsLoading]);

  // Set up real-time subscription for vote counting
  useEffect(() => {
    if (!selectedElection) return;

    // Subscribe to vote changes for the selected election
    const electionId = String(selectedElection.id);
    const channel = supabase.channel(`public:votes:election_id=eq.${electionId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes',
          filter: `election_id=eq.${electionId}`
        }, 
        () => {
          // When votes change, refresh the candidate data
          refreshCandidateVoteCounts(electionId);
        }
      )
      .subscribe();

    // Initial load of vote counts
    refreshCandidateVoteCounts(electionId);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedElection]);

  // Helper function to refresh candidate vote counts
  const refreshCandidateVoteCounts = async (electionId: string) => {
    try {
      // Get vote counts for each candidate in this election
      const { data, error } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', electionId);

      if (error) throw error;

      // Count votes per candidate
      const counts: Record<string, number> = {};
      data.forEach(vote => {
        const candidateId = vote.candidate_id;
        if (candidateId) {
          counts[candidateId] = (counts[candidateId] || 0) + 1;
        }
      });

      setVoteCounts(counts);

      // Update the election candidates with new vote counts if we have the selected election
      if (selectedElection) {
        const updatedCandidates = selectedElection.candidates.map(candidate => ({
          ...candidate,
          voteCount: counts[String(candidate.id)] || 0
        }));

        state.setSelectedElection({
          ...selectedElection,
          candidates: updatedCandidates
        });
      }
    } catch (err) {
      console.error('Error refreshing vote counts:', err);
    }
  };
};
