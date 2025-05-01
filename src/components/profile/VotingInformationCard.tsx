
import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Vote, CheckCircle2, XCircle, FileText, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

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
    timestamp?: string;
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
  const navigate = useNavigate();

  const handleGoToVoting = () => {
    navigate('/vote');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

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
          
          {hasVoted && votingDetails ? (
            <div className="space-y-4">
              {/* Election Information */}
              <div className="flex flex-col gap-2 p-3 bg-green-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Election:</span>
                  <span className="text-green-800">{votingDetails.election?.title || "National Election"}</span>
                </div>
                
                {votingDetails.timestamp && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Date:</span>
                    <span className="text-green-800">
                      {format(new Date(votingDetails.timestamp), 'PPP')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Candidate:</span>
                  <span className="text-green-800">
                    {votingDetails.candidate?.name} 
                    <span className="ml-1 text-sm text-green-600">
                      ({votingDetails.candidate?.party})
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Transaction Information */}
              {votingDetails.transactionHash && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Transaction:</span>
                  </p>
                  <div className="p-2 bg-slate-50 border rounded text-xs font-mono break-all">
                    {votingDetails.transactionHash}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" /> 
                  <p className="font-medium">Vote Successfully Recorded</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your vote has been securely submitted and recorded on the decentralized ledger.
                  Thank you for participating in the democratic process.
                </p>
                <Button
                  onClick={handleViewResults}
                  size="sm" 
                  variant="outline" 
                  className="mt-4"
                >
                  View Election Results
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-md">
                <div className="flex items-center text-red-500 mb-2">
                  <XCircle className="h-5 w-5 mr-2" /> 
                  <p className="font-medium">You have not yet cast your vote</p>
                </div>
                <p className="text-sm text-red-700">
                  Please proceed to the voting page to complete the voting process. 
                  Only registered voters with verified biometrics can participate.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Before voting, you must complete these steps:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">1</Badge>
                    <span className="text-sm">Register your biometrics (face and palm)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">2</Badge>
                    <span className="text-sm">Complete identity verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">3</Badge>
                    <span className="text-sm">Cast your vote in an active election</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleGoToVoting}
                size="sm" 
                variant="default" 
                className="w-full mt-2"
              >
                <Vote className="h-4 w-4 mr-2" />
                Go to Voting Page
              </Button>
            </div>
          )}
        </div>
        
        <Separator />

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
            <div className="text-sm">{format(new Date(), 'PPP')}</div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default VotingInformationCard;
