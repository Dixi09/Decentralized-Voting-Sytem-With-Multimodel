
import { useState, useEffect } from 'react';
import VotingContract, { Election, Candidate } from '@/utils/VotingContract';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { voteServiceDB } from '@/utils/vote/VoteServiceDB';

export const useVoting = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isBiometricsRegistered, setIsBiometricsRegistered] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check if user has registered biometrics
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
  }, [user]);
  
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
  }, []);

  // Set up real-time subscription for vote counting
  useEffect(() => {
    if (!selectedElection) return;

    // Subscribe to vote changes for the selected election
    const channel = supabase.channel(`public:votes:election_id=eq.${selectedElection.id}` as any)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes',
          filter: `election_id=eq.${selectedElection.id}`
        }, 
        () => {
          // When votes change, refresh the candidate data
          refreshCandidateVoteCounts(selectedElection.id);
        }
      )
      .subscribe();

    // Initial load of vote counts
    refreshCandidateVoteCounts(selectedElection.id);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedElection]);

  const refreshCandidateVoteCounts = async (electionId: number | string) => {
    try {
      // Get vote counts for each candidate in this election
      const { data, error } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', String(electionId));

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

        setSelectedElection({
          ...selectedElection,
          candidates: updatedCandidates
        });
      }
    } catch (err) {
      console.error('Error refreshing vote counts:', err);
    }
  };
  
  const handleFaceVerificationSuccess = () => {
    toast({
      title: "Face Verification Successful",
      description: "Your identity has been verified.",
    });
    setStep(3); // Move to palm verification step
  };
  
  const handleFaceVerificationError = () => {
    toast({
      title: "Face Verification Failed",
      description: "We couldn't verify your identity. Please try again.",
      variant: "destructive",
    });
    setStep(1); // Reset to step 1
  };
  
  const handlePalmVerificationSuccess = () => {
    toast({
      title: "Palm Verification Successful",
      description: "Your identity has been verified.",
    });
    setStep(4); // Move to OTP verification step
  };
  
  const handlePalmVerificationError = () => {
    toast({
      title: "Palm Verification Failed", 
      description: "We couldn't verify your palm. Please try again.",
      variant: "destructive",
    });
    setStep(2); // Reset to face verification
  };
  
  const handleOTPVerificationSuccess = () => {
    toast({
      title: "OTP Verification Successful",
      description: "You can now access the voting system.",
    });
    setStep(5); // Move to election selection
  };
  
  const handleOTPVerificationError = () => {
    toast({
      title: "OTP Verification Failed",
      description: "The OTP you entered is incorrect. Please try again.",
      variant: "destructive",
    });
  };
  
  const handleSelectElection = (election: Election) => {
    setSelectedElection(election);
    refreshCandidateVoteCounts(election.id);
    setStep(6); // Move to candidate selection
  };
  
  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };
  
  const handleCastVote = async () => {
    if (!selectedElection || !selectedCandidate || !user) return;
    
    // Check if biometrics are registered
    if (!isBiometricsRegistered) {
      toast({
        title: "Registration Required",
        description: "You must register your biometrics before voting. Please complete the registration process.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const votingContract = VotingContract.getInstance();
      
      // Check if user has already voted
      const hasVoted = await votingContract.hasUserVoted(user.id, selectedElection.id);
      if (hasVoted) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote in this election.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Cast the vote
      const transaction = await votingContract.castVote(
        user.id, 
        selectedElection.id, 
        selectedCandidate.id
      );
      
      // Also use the VoteServiceDB to ensure real-time updates work
      await voteServiceDB.castVote(
        user.id, 
        selectedElection.id, 
        selectedCandidate.id
      );
      
      setTransactionHash(transaction.transactionHash);
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded on the blockchain.",
      });
      setStep(7); // Move to confirmation step
      
      // Refresh vote counts after successful vote
      refreshCandidateVoteCounts(selectedElection.id);
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    isLoading,
    elections,
    selectedElection,
    selectedCandidate,
    transactionHash,
    isBiometricsRegistered,
    isCheckingEligibility,
    voteCounts,
    handleFaceVerificationSuccess,
    handleFaceVerificationError,
    handlePalmVerificationSuccess,
    handlePalmVerificationError,
    handleOTPVerificationSuccess,
    handleOTPVerificationError,
    handleSelectElection,
    handleSelectCandidate,
    handleCastVote
  };
};
