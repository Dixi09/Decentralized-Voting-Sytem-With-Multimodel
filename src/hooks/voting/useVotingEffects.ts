
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
    setVoteCounts,
    setSelectedElection
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
          .eq('user_id', String(user.id))
          .maybeSingle();

        if (error) throw error;

        // User has registered biometrics if face_image_url exists
        const registered = !!data?.face_image_url;
        console.log('Biometrics registered:', registered);
        setIsBiometricsRegistered(registered);
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
        
        // First try to fetch from Supabase
        try {
          const { data: dbElections, error } = await supabase
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
              )
            `);
            
          if (!error && dbElections && dbElections.length > 0) {
            console.log('Fetched elections from database:', dbElections);
            
            // Transform to match Election interface
            const formattedElections = dbElections.map(election => ({
              id: election.id,
              title: election.title,
              description: election.description || '',
              startDate: new Date(election.start_date),
              endDate: new Date(election.end_date),
              isActive: election.is_active || false,
              candidates: election.candidates.map(candidate => ({
                id: candidate.id,
                name: candidate.name,
                party: candidate.party || '',
                voteCount: 0 // Will be updated with real data later
              }))
            }));
            
            setElections(formattedElections);
            return;
          }
        } catch (dbError) {
          console.error('Error fetching elections from database:', dbError);
        }
        
        // Fall back to mock data
        console.log('Falling back to mock election data');
        const votingContract = VotingContract.getInstance();
        const electionList = await votingContract.getElections();
        
        console.log('Fetched elections from mock data:', electionList);
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

    const electionId = String(selectedElection.id);
    console.log('Setting up real-time subscription for election:', electionId);
    
    // Subscribe to vote changes for the selected election
    const channel = supabase.channel(`election-votes-${electionId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes',
          filter: `election_id=eq.${electionId}`
        }, 
        (payload) => {
          console.log('Vote change detected:', payload);
          // When votes change, refresh the candidate data
          refreshCandidateVoteCounts(electionId);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Initial load of vote counts
    refreshCandidateVoteCounts(electionId);

    return () => {
      console.log('Cleaning up vote subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedElection]);

  // Helper function to refresh candidate vote counts
  const refreshCandidateVoteCounts = async (electionId: string) => {
    console.log('Refreshing vote counts for election:', electionId);
    try {
      // Get vote counts for each candidate in this election
      const { data, error } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', electionId);

      if (error) {
        console.error('Error fetching votes:', error);
        throw error;
      }

      console.log('Votes data:', data);

      // Count votes per candidate
      const counts: Record<string, number> = {};
      data.forEach(vote => {
        const candidateId = vote.candidate_id;
        if (candidateId) {
          counts[candidateId] = (counts[candidateId] || 0) + 1;
        }
      });

      console.log('Vote counts:', counts);
      setVoteCounts(counts);

      // Update the election candidates with new vote counts if we have the selected election
      if (selectedElection) {
        const updatedCandidates = selectedElection.candidates.map(candidate => ({
          ...candidate,
          voteCount: counts[String(candidate.id)] || 0
        }));

        setSelectedElection({
          ...selectedElection,
          candidates: updatedCandidates
        });
      }
    } catch (err) {
      console.error('Error refreshing vote counts:', err);
    }
  };
};
