
import VotingContract from '@/utils/VotingContract';
import { Election, Candidate } from '@/utils/VotingContract';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { voteServiceDB } from '@/utils/vote/VoteServiceDB';

/**
 * Hook that provides voting-related action handlers
 */
export const useVotingHandlers = (state: ReturnType<typeof import('./useVotingState').useVotingState>) => {
  const {
    user,
    setStep,
    setIsLoading,
    selectedElection,
    selectedCandidate,
    setSelectedElection,
    setSelectedCandidate,
    setTransactionHash,
    isBiometricsRegistered
  } = state;
  
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
    setStep(6); // Move to candidate selection
  };
  
  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };
  
  const handleCastVote = async () => {
    if (!selectedElection || !selectedCandidate || !user) {
      toast({
        title: "Error",
        description: "Missing required information. Please select an election and candidate.",
        variant: "destructive",
      });
      return;
    }
    
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
      
      // First check if user has already voted in this election - with improved error handling
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_id', user.id)
        .eq('election_id', String(selectedElection.id))
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking vote status:', checkError);
        throw new Error('Failed to verify your voting status. Please try again.');
      }
      
      if (existingVote) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote in this election.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Optimistic UI update
      toast({
        title: "Processing Vote",
        description: "Your vote is being recorded securely...",
      });
      
      // Use a Promise.all to parallelize the blockchain and database operations
      const votingContract = VotingContract.getInstance();
      const [transaction, dbResult] = await Promise.all([
        // Cast vote on blockchain
        votingContract.castVote(
          user.id, 
          selectedElection.id, 
          selectedCandidate.id
        ),
        // Also use the VoteServiceDB for database persistence and real-time updates
        voteServiceDB.castVote(
          user.id, 
          selectedElection.id, 
          selectedCandidate.id
        )
      ]);
      
      if (!transaction || !dbResult) {
        throw new Error('Failed to complete the voting process. Please try again.');
      }
      
      setTransactionHash(transaction.transactionHash);
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been securely recorded on the blockchain.",
      });
      setStep(7); // Move to confirmation step
      
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
