
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VotingInformationCardProps {
  isEditing: boolean;
  editedName: string;
  setEditedName: (value: string) => void;
  editedEmail: string;
  hasVoted?: boolean;
}

const VotingInformationCard = ({
  isEditing,
  editedName,
  setEditedName,
  editedEmail,
  hasVoted
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
          </div>
        )}
      </CardContent>
    </>
  );
};

export default VotingInformationCard;
