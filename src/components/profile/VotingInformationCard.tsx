
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface VotingInformationCardProps {
  isEditing: boolean;
  editedName: string;
  setEditedName: (value: string) => void;
  editedEmail: string;
  hasVoted?: boolean;
  votingDetails?: {
    electionName?: string;
    candidateName?: string;
    timestamp?: string;
    transactionHash?: string;
  } | null;
}

const VotingInformationCard = ({
  isEditing,
  editedName,
  setEditedName,
  editedEmail,
  hasVoted,
  votingDetails
}: VotingInformationCardProps) => {
  const navigate = useNavigate();
  
  const handleVoteNow = () => {
    navigate('/vote');
  };

  return (
    <>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Profile" : "Voting Information"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={editedName} 
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (non-editable)</Label>
              <Input 
                id="email" 
                type="email" 
                value={editedEmail} 
                disabled 
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground">
                To change your email address, please contact support.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Voting Status</span>
              <span className="font-medium flex items-center gap-2">
                {hasVoted ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    Voted
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                    Not Voted
                  </>
                )}
              </span>
            </div>
            
            {hasVoted && votingDetails ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-green-500" /> 
                  Vote Details
                </h3>
                
                <div className="text-sm space-y-2">
                  {votingDetails.electionName && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-muted-foreground">Election:</span>
                      <span className="col-span-2 font-medium">{votingDetails.electionName}</span>
                    </div>
                  )}
                  
                  {votingDetails.candidateName && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-muted-foreground">Candidate:</span>
                      <span className="col-span-2 font-medium">{votingDetails.candidateName}</span>
                    </div>
                  )}
                  
                  {votingDetails.timestamp && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-muted-foreground">When:</span>
                      <span className="col-span-2">
                        {formatDistanceToNow(new Date(votingDetails.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  
                  {votingDetails.transactionHash && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-muted-foreground">Transaction:</span>
                      <span className="col-span-2 text-xs font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded truncate">
                        {votingDetails.transactionHash}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-4">
                <div className="flex items-center gap-2 text-primary">
                  <Shield size={16} />
                  <span className="text-sm font-medium">Your vote is secured by blockchain technology</span>
                </div>
                
                {!hasVoted && (
                  <Button 
                    className="mt-4 w-full" 
                    onClick={handleVoteNow}
                  >
                    Cast Your Vote Now
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </>
  );
};

export default VotingInformationCard;
