
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Election, Candidate } from '@/utils/VotingContract';
import { supabase } from '@/integrations/supabase/client';

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
  const [voteCount, setVoteCount] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchVoteCount = async () => {
      if (!candidate) return;
      
      try {
        const candidateId = String(candidate.id);
        console.log('Fetching vote count for candidate:', candidateId);
        
        const { data, error } = await supabase
          .from('votes')
          .select('id')
          .eq('candidate_id', candidateId);
          
        if (error) {
          console.error('Error fetching vote count:', error);
          return;
        }
        
        console.log('Vote count data:', data);
        setVoteCount(data?.length || 0);
      } catch (err) {
        console.error('Error fetching vote count:', err);
      }
    };
    
    fetchVoteCount();
  }, [candidate]);
  
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
          Your vote has been securely recorded.
        </p>
        
        <div className="w-full p-4 bg-slate-50 rounded-lg border mb-4">
          <div className="mb-2">
            <p className="text-sm font-medium">Election</p>
            <p className="text-sm">{election?.title || 'N/A'}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm font-medium">Candidate</p>
            <p className="text-sm">{candidate?.name || 'N/A'} ({candidate?.party || 'N/A'})</p>
            {voteCount !== null && (
              <p className="text-xs text-green-600 mt-1">
                Current vote count: {voteCount}
              </p>
            )}
          </div>
          <Separator className="my-2" />
          <div>
            <p className="text-sm font-medium">Transaction Hash</p>
            <p className="text-xs font-mono truncate text-muted-foreground">
              {transactionHash || 'Transaction processing...'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-3">
        <Button onClick={() => navigate('/results')} variant="default">
          View Election Results
        </Button>
        <Button onClick={() => navigate('/')} variant="outline">
          Return to Home
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoteConfirmation;
