
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import FaceRecognition from '@/components/FaceRecognition';
import OTPVerification from '@/components/OTPVerification';
import VotingContract, { Election, Candidate } from '@/utils/VotingContract';
import Layout from '@/components/Layout';

const Vote = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // User ID would normally come from authentication
  const userId = "user-123";
  
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
  
  const handleFaceVerificationSuccess = () => {
    toast({
      title: "Face Verification Successful",
      description: "Your identity has been verified.",
    });
    setStep(3); // Move to OTP step
  };
  
  const handleFaceVerificationError = () => {
    toast({
      title: "Face Verification Failed",
      description: "We couldn't verify your identity. Please try again.",
      variant: "destructive",
    });
    setStep(1); // Reset to step 1
  };
  
  const handleOTPVerificationSuccess = () => {
    toast({
      title: "OTP Verification Successful",
      description: "You can now access the voting system.",
    });
    setStep(4); // Move to election selection
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
    setStep(5); // Move to candidate selection
  };
  
  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };
  
  const handleCastVote = async () => {
    if (!selectedElection || !selectedCandidate) return;
    
    try {
      setIsLoading(true);
      const votingContract = VotingContract.getInstance();
      
      // Check if user has already voted
      const hasVoted = await votingContract.hasUserVoted(userId, selectedElection.id);
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
        userId, 
        selectedElection.id, 
        selectedCandidate.id
      );
      
      setTransactionHash(transaction.transactionHash);
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded on the blockchain.",
      });
      setStep(6); // Move to confirmation step
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
  
  // Render steps
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'complete' : ''}`}>
            <div className={`step ${i === step ? 'active' : ''} ${i < step ? 'complete' : ''}`}>
              {i < step ? (
                <Check className="w-5 h-5" />
              ) : (
                i
              )}
            </div>
            <p className="text-xs mt-1">
              {i === 1 && "Start"}
              {i === 2 && "Face Scan"}
              {i === 3 && "OTP"}
              {i === 4 && "Election"}
              {i === 5 && "Vote"}
              {i === 6 && "Confirm"}
            </p>
          </div>
        ))}
      </div>
    );
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Secure Voting</CardTitle>
              <CardDescription>
                To ensure the integrity of the voting process, we need to verify your identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ShieldCheck className="w-16 h-16 text-primary mb-4" />
              <p className="text-center mb-4">
                Our system uses multi-factor authentication including facial recognition
                and one-time password verification.
              </p>
              <div className="flex flex-col gap-2 text-sm w-full max-w-md">
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Secure blockchain-based voting system</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Your vote is anonymous and tamper-proof</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Results are cryptographically verifiable</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setStep(2)} className="w-full">
                Begin Identity Verification
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Facial Recognition</CardTitle>
              <CardDescription>
                Please position your face in front of the camera for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FaceRecognition 
                onVerified={handleFaceVerificationSuccess} 
                onError={handleFaceVerificationError} 
              />
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>
                Enter the one-time password sent to your registered mobile device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OTPVerification
                onVerified={handleOTPVerificationSuccess}
                onError={handleOTPVerificationError}
              />
            </CardContent>
          </Card>
        );
      
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select an Election</CardTitle>
              <CardDescription>
                Choose an election to cast your vote.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
                    <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
                    <div className="h-3 w-32 bg-primary/10 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {elections.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                      <p className="text-lg font-medium">No Active Elections</p>
                      <p className="text-sm text-muted-foreground">
                        There are no active elections available at this time.
                      </p>
                    </div>
                  ) : (
                    elections.map((election) => (
                      <Card key={election.id} className="hover:border-primary/50 cursor-pointer transition-colors" onClick={() => handleSelectElection(election)}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{election.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(election.endDate).toLocaleDateString()} - {election.candidates.length} candidates
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <p className="text-sm">{election.description}</p>
                        </CardContent>
                        <CardFooter className="pt-0 border-t flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            {election.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                            Select <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 5:
        return selectedElection ? (
          <Card>
            <CardHeader>
              <CardTitle>{selectedElection.title}</CardTitle>
              <CardDescription>
                Select a candidate to cast your vote.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {selectedElection.candidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCandidate?.id === candidate.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/30'
                    }`}
                    onClick={() => handleSelectCandidate(candidate)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.party}</p>
                      </div>
                      {selectedCandidate?.id === candidate.id && (
                        <div className="bg-primary text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button 
                onClick={handleCastVote} 
                disabled={!selectedCandidate || isLoading}
              >
                {isLoading ? 'Processing...' : 'Cast Vote'}
              </Button>
            </CardFooter>
          </Card>
        ) : null;
      
      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">Vote Successfully Cast</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-6 mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Thank You for Voting</h3>
              <p className="text-center text-muted-foreground mb-4">
                Your vote has been securely recorded on the blockchain.
              </p>
              
              <div className="w-full p-4 bg-slate-50 rounded-lg border mb-4">
                <div className="mb-2">
                  <p className="text-sm font-medium">Election</p>
                  <p className="text-sm">{selectedElection?.title}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-medium">Candidate</p>
                  <p className="text-sm">{selectedCandidate?.name} ({selectedCandidate?.party})</p>
                </div>
                <Separator className="my-2" />
                <div>
                  <p className="text-sm font-medium">Transaction Hash</p>
                  <p className="text-xs font-mono truncate text-muted-foreground">
                    {transactionHash}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/results')}>
                View Election Results
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {renderStepIndicator()}
        {renderStep()}
      </div>
    </Layout>
  );
};

export default Vote;
