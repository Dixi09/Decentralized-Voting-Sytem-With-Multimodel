
import React from 'react';
import Layout from '@/components/Layout';
import FaceRecognition from '@/components/FaceRecognition';
import PalmRecognition from '@/components/PalmRecognition';
import OTPVerification from '@/components/OTPVerification';
import StepIndicator from '@/components/vote/StepIndicator';
import VoteWelcome from '@/components/vote/VoteWelcome';
import ElectionSelector from '@/components/vote/ElectionSelector';
import CandidateSelector from '@/components/vote/CandidateSelector';
import VoteConfirmation from '@/components/vote/VoteConfirmation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useVoting } from '@/hooks/useVoting';

const Vote = () => {
  const {
    step,
    setStep,
    isLoading,
    elections,
    selectedElection,
    selectedCandidate,
    transactionHash,
    handleFaceVerificationSuccess,
    handleFaceVerificationError,
    handleOTPVerificationSuccess,
    handleOTPVerificationError,
    handleSelectElection,
    handleSelectCandidate,
    handleCastVote
  } = useVoting();
  
  const steps = [
    { id: 1, label: "Start" },
    { id: 2, label: "Face Scan" },
    { id: 3, label: "Palm Scan" },
    { id: 4, label: "OTP" },
    { id: 5, label: "Election" },
    { id: 6, label: "Vote" },
    { id: 7, label: "Confirm" }
  ];

  const handlePalmVerificationSuccess = () => {
    setStep(4); // Move to OTP step after palm verification
  };

  const handlePalmVerificationError = () => {
    setStep(2); // Go back to face verification if palm verification fails
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <VoteWelcome onNext={() => setStep(2)} />;
      
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
              <CardTitle>Palm Recognition</CardTitle>
              <CardDescription>
                Please position your palm in front of the camera for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PalmRecognition
                onVerified={handlePalmVerificationSuccess}
                onError={handlePalmVerificationError}
              />
            </CardContent>
          </Card>
        );
      
      case 4:
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
      
      case 5:
        return (
          <ElectionSelector 
            elections={elections}
            isLoading={isLoading}
            onSelectElection={handleSelectElection}
          />
        );
      
      case 6:
        return selectedElection ? (
          <CandidateSelector
            election={selectedElection}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={handleSelectCandidate}
            onVote={handleCastVote}
            onBack={() => setStep(5)}
            isLoading={isLoading}
          />
        ) : null;
      
      case 7:
        return (
          <VoteConfirmation
            election={selectedElection}
            candidate={selectedCandidate}
            transactionHash={transactionHash}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={step} steps={steps} />
        {renderStep()}
      </div>
    </Layout>
  );
};

export default Vote;
