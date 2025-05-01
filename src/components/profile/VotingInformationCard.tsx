import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Vote, CheckCircle2, XCircle } from 'lucide-react';

interface VotingInformationCardProps {
  isEditing: boolean;
  editedName: string;
  setEditedName: (value: string) => void;
  editedEmail: string;
  hasVoted: boolean;
  votingDetails: {
    election?: {
      title: string;
      date: string;
    };
    candidate?: {
      name: string;
      party: string;
    };
    transactionHash?: string;
  };
}

const VotingInformationCard = ({
  isEditing,
  editedName,
  setEditedName,
  editedEmail,
  hasVoted,
  votingDetails
}: VotingInformationCardProps) => {
  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Vote className="h-6 w-6 text-primary" />
          <CardTitle>Voting Information</CardTitle>
        </div>
        <CardDescription>
          Check your voting status and history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voting Status */}
        <div className="p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Voting Status</h3>
            {hasVoted ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 px-3">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Vote Cast
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-500 px-3">
                <XCircle className="h-3 w-3 mr-1" /> Not Voted
              </Badge>
            )}
          </div>
          
          {hasVoted ? (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Election:</span> {votingDetails.election?.title}</p>
              <p><span className="font-medium">Date:</span> {votingDetails.election?.date}</p>
              <p><span className="font-medium">Candidate:</span> {votingDetails.candidate?.name} ({votingDetails.candidate?.party})</p>
              {votingDetails.transactionHash && (
                <p className="text-xs text-muted-foreground break-all">
                  <span className="font-medium">Transaction:</span> {votingDetails.transactionHash}
                </p>
              )}
              <div className="mt-4">
                <p className="text-green-600 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> 
                  Your vote has been successfully submitted and recorded on the decentralized ledger.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Thank you for participating in the democratic process.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-500 flex items-center">
                <XCircle className="h-4 w-4 mr-1" /> 
                You have not yet cast your vote.
              </p>
              <p className="text-sm">
                Please proceed to the voting page to complete the process. 
                Voting is only allowed once per registered voter.
              </p>
              <div className="pt-4">
                <Button size="sm" variant="default" className="mt-2">
                  <Vote className="h-4 w-4 mr-2" />
                  Go to Voting Page
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="font-medium mb-2">Personal Information</h3>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={editedEmail} disabled />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-sm text-muted-foreground">Full Name</div>
              <div className="text-sm">{editedName}</div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-sm">{editedEmail}</div>
            </div>
          )}
        </div>

        {/* Biometric Information */}
        <div>
          <h3 className="font-medium mb-2">Biometric Information</h3>
          <div className="grid grid-cols-2 gap-y-2">
            <div className="text-sm text-muted-foreground">Face Recognition</div>
            <div className="text-sm">
              <Badge variant="outline" className="border-green-500 text-green-500">Registered</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Palm Recognition</div>
            <div className="text-sm">
              <Badge variant="outline" className="border-green-500 text-green-500">Registered</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Last Verification</div>
            <div className="text-sm">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default VotingInformationCard;
