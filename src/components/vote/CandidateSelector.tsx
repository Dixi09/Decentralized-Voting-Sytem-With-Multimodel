
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Candidate, Election } from '@/utils/VotingContract';

interface CandidateSelectorProps {
  election: Election;
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onVote: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const CandidateSelector = ({
  election,
  selectedCandidate,
  onSelectCandidate,
  onVote,
  onBack,
  isLoading
}: CandidateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{election.title}</CardTitle>
        <CardDescription>
          Select a candidate to cast your vote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {election.candidates.map((candidate) => (
            <div 
              key={candidate.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCandidate?.id === candidate.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/30'
              }`}
              onClick={() => onSelectCandidate(candidate)}
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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onVote} 
          disabled={!selectedCandidate || isLoading}
        >
          {isLoading ? 'Processing...' : 'Cast Vote'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CandidateSelector;
