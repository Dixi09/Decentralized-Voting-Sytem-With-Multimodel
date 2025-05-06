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
      
      // Optimistic UI update
      toast({
        title: "Processing Vote",
        description: "Your vote is being recorded securely...",
      });
      
      // Convert all IDs to strings to ensure consistency
      const userId = String(user.id);
      const electionId = String(selectedElection.id);
      const candidateId = String(selectedCandidate.id);
      
      console.log('Casting vote with IDs:', { userId, electionId, candidateId });
      
      // Use a Promise.all to parallelize the blockchain and database operations
      const votingContract = VotingContract.getInstance();
      const [transaction, dbResult] = await Promise.all([
        // Cast vote on blockchain
        votingContract.castVote(
          userId, 
          selectedElection.id, 
          selectedCandidate.id
        ),
        // Also use the VoteServiceDB for database persistence and real-time updates
        voteServiceDB.castVote(
          userId, 
          electionId, 
          candidateId
        )
      ]);
      
      console.log('Vote results:', { transaction, dbResult });
      
      if (!transaction) {
        throw new Error('Failed to record vote on blockchain. Please try again.');
      }
      
      if (!dbResult) {
        // Check if user has already voted
        const { data: existingVote } = await supabase
          .from('votes')
          .select('id, transaction_hash')
          .eq('voter_id', userId)
          .eq('election_id', electionId)
          .maybeSingle();
        
        if (existingVote) {
          setTransactionHash(existingVote.transaction_hash || transaction.transactionHash);
          toast({
            title: "Already Voted",
            description: "You have already cast a vote in this election.",
          });
          setStep(7); // Move to confirmation step anyway
          return;
        } else {
          throw new Error('Failed to record vote in database. Please try again.');
        }
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
