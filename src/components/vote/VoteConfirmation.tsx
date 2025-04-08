
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Election, Candidate } from '@/utils/VotingContract';

interface VoteConfirmationProps {
  election: Election | null;
  candidate: Candidate | null;
  transactionHash: string | null;
}

const VoteConfirmation = ({ 
  election, 
  candidate,
  transactionHash 
}: VoteConfirmationProps) => {
  const navigate = useNavigate();
  
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
            <p className="text-sm">{election?.title}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm font-medium">Candidate</p>
            <p className="text-sm">{candidate?.name} ({candidate?.party})</p>
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
};

export default VoteConfirmation;
