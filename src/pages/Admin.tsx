import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, User, Users, Vote, Calendar, Plus, Trash2, Edit, Eye, CheckCircle, XCircle, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import VotingContract, { Election, Candidate, VoteTransaction } from '@/utils/VotingContract';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("elections");
  const [elections, setElections] = useState<Election[]>([]);
  const [transactions, setTransactions] = useState<VoteTransaction[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewElectionForm, setShowNewElectionForm] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<VoteTransaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', party: '' }]
  });

  const [editElection, setEditElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ id: 0, name: '', party: '', voteCount: 0 }],
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const votingContract = VotingContract.getInstance();
        const electionList = await votingContract.getElections();
        setElections(electionList);
        
        const transactionList = await votingContract.getVoteTransactions();
        setTransactions(transactionList);
        
        setUsers([
          { id: 'user-123', name: 'John Doe', email: 'john@example.com', voterId: 'VID202504001', hasVoted: true, registrationDate: 'April 1, 2025' },
          { id: 'user-456', name: 'Jane Smith', email: 'jane@example.com', voterId: 'VID202504002', hasVoted: false, registrationDate: 'April 2, 2025' },
          { id: 'user-789', name: 'Bob Johnson', email: 'bob@example.com', voterId: 'VID202504003', hasVoted: true, registrationDate: 'April 3, 2025' },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddCandidate = () => {
    setNewElection({
      ...newElection,
      candidates: [...newElection.candidates, { name: '', party: '' }]
    });
  };

  const handleRemoveCandidate = (index: number) => {
    const updatedCandidates = newElection.candidates.filter((_, i) => i !== index);
    setNewElection({
      ...newElection,
      candidates: updatedCandidates
    });
  };

  const handleCandidateChange = (index: number, field: 'name' | 'party', value: string) => {
    const updatedCandidates = [...newElection.candidates];
    updatedCandidates[index][field] = value;
    setNewElection({
      ...newElection,
      candidates: updatedCandidates
    });
  };

  const handleEditCandidateChange = (index: number, field: 'name' | 'party', value: string) => {
    const updatedCandidates = [...editElection.candidates];
    updatedCandidates[index][field] = value;
    setEditElection({
      ...editElection,
      candidates: updatedCandidates
    });
  };

  const handleAddEditCandidate = () => {
    const highestId = Math.max(...editElection.candidates.map(c => c.id), 0);
    setEditElection({
      ...editElection,
      candidates: [...editElection.candidates, { id: highestId + 1, name: '', party: '', voteCount: 0 }]
    });
  };

  const handleRemoveEditCandidate = (index: number) => {
    const updatedCandidates = editElection.candidates.filter((_, i) => i !== index);
    setEditElection({
      ...editElection,
      candidates: updatedCandidates
    });
  };

  const handleCreateElection = () => {
    if (!newElection.title || !newElection.description || !newElection.startDate || !newElection.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newElection.candidates.some(c => !c.name || !c.party)) {
      toast({
        title: "Invalid Candidates",
        description: "Please fill all candidate information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const newElectionData: Election = {
        id: elections.length + 1,
        title: newElection.title,
        description: newElection.description,
        startDate: new Date(newElection.startDate),
        endDate: new Date(newElection.endDate),
        candidates: newElection.candidates.map((c, index) => ({
          id: index + 1,
          name: c.name,
          party: c.party,
          voteCount: 0
        })),
        isActive: true
      };

      setElections([...elections, newElectionData]);
      
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '', party: '' }]
      });
      
      setShowNewElectionForm(false);
      setIsProcessing(false);
      
      toast({
        title: "Election Created",
        description: "The new election has been successfully created.",
      });
    }, 1000);
  };

  const handleOpenEditDialog = (election: Election) => {
    setEditingElection(election);
    
    const formatDateForInput = (date: Date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };
    
    setEditElection({
      title: election.title,
      description: election.description,
      startDate: formatDateForInput(election.startDate),
      endDate: formatDateForInput(election.endDate),
      candidates: [...election.candidates],
      isActive: election.isActive
    });
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateElection = () => {
    if (!editElection.title || !editElection.description || !editElection.startDate || !editElection.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editElection.candidates.some(c => !c.name || !c.party)) {
      toast({
        title: "Invalid Candidates",
        description: "Please fill all candidate information",
        variant: "destructive",
      });
      return;
    }
    
    if (!editingElection) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const updatedElections = elections.map(e => 
        e.id === editingElection.id 
          ? {
              ...e,
              title: editElection.title,
              description: editElection.description,
              startDate: new Date(editElection.startDate),
              endDate: new Date(editElection.endDate),
              candidates: editElection.candidates,
              isActive: editElection.isActive
            } 
          : e
      );
      
      setElections(updatedElections);
      setIsEditDialogOpen(false);
      setEditingElection(null);
      setIsProcessing(false);
      
      toast({
        title: "Election Updated",
        description: "The election has been successfully updated.",
      });
    }, 1000);
  };

  const handleToggleElectionStatus = (election: Election) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const updatedElections = elections.map(e => 
        e.id === election.id 
          ? { ...e, isActive: !e.isActive } 
          : e
      );
      
      setElections(updatedElections);
      setIsProcessing(false);
      
      toast({
        title: election.isActive ? "Election Deactivated" : "Election Activated",
        description: `The election has been ${election.isActive ? "deactivated" : "activated"} successfully.`,
      });
    }, 1000);
  };

  const handleViewTransaction = (transaction: VoteTransaction) => {
    setTransactionDetails(transaction);
    setShowTransactionDetails(true);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElectionAndCandidateNames = (transaction: VoteTransaction) => {
    const election = elections.find(e => e.id === transaction.electionId);
    const candidate = election?.candidates.find(c => c.id === transaction.candidateId);
    return {
      electionName: election?.title || 'Unknown Election',
      candidateName: candidate?.name || 'Unknown Candidate'
    };
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="elections" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Elections
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Voters
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Blockchain Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="elections">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Elections</h2>
              <Button 
                onClick={() => setShowNewElectionForm(!showNewElectionForm)}
                disabled={isProcessing}
              >
                {showNewElectionForm ? "Cancel" : "Create New Election"}
              </Button>
            </div>
            
            {showNewElectionForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Election</CardTitle>
                  <CardDescription>Fill in the details to create a new election</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title">Election Title</Label>
                        <Input 
                          id="title" 
                          value={newElection.title}
                          onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                          placeholder="Enter election title"
                          disabled={isProcessing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input 
                          id="description" 
                          value={newElection.description}
                          onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                          placeholder="Enter election description"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input 
                          id="startDate" 
                          type="date"
                          value={newElection.startDate}
                          onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                          disabled={isProcessing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input 
                          id="endDate" 
                          type="date"
                          value={newElection.endDate}
                          onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Candidates</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddCandidate}
                          disabled={isProcessing}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Candidate
                        </Button>
                      </div>
                      
                      {newElection.candidates.map((candidate, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded border">
                          <div className="col-span-5">
                            <Input 
                              placeholder="Candidate Name"
                              value={candidate.name}
                              onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                              disabled={isProcessing}
                            />
                          </div>
                          <div className="col-span-5">
                            <Input 
                              placeholder="Party Affiliation"
                              value={candidate.party}
                              onChange={(e) => handleCandidateChange(index, 'party', e.target.value)}
                              disabled={isProcessing}
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveCandidate(index)}
                              disabled={newElection.candidates.length === 1 || isProcessing}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleCreateElection} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Election"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading elections...</p>
              </div>
            ) : elections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Vote className="h-16 w-16 text-muted-foreground/60 mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No Elections Found</p>
                  <p className="text-muted-foreground text-sm mb-4">Create your first election to get started</p>
                  <Button onClick={() => setShowNewElectionForm(true)}>
                    Create New Election
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {elections.map((election) => (
                  <Card key={election.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{election.title}</CardTitle>
                          <CardDescription>{election.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleOpenEditDialog(election)}
                            disabled={isProcessing}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant={election.isActive ? "destructive" : "default"}
                            onClick={() => handleToggleElectionStatus(election)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              election.isActive ? "Deactivate" : "Activate"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Start Date</span>
                          <span className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            {formatDate(election.startDate)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">End Date</span>
                          <span className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            {formatDate(election.endDate)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <span className="font-medium flex items-center">
                            {election.isActive ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1 text-destructive" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-semibold mb-2">Candidates & Results</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead className="text-right">Votes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {election.candidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                              <TableCell className="font-medium">{candidate.name}</TableCell>
                              <TableCell>{candidate.party}</TableCell>
                              <TableCell className="text-right">{candidate.voteCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Voters</CardTitle>
                <CardDescription>Manage voter accounts and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading voter data...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Voter ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Voting Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.voterId}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.registrationDate}</TableCell>
                          <TableCell>
                            <span className="flex items-center">
                              {user.hasVoted ? (
                                <>
                                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                  Voted
                                </>
                              ) : (
                                <>
                                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                  Not Voted
                                </>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Transactions</CardTitle>
                <CardDescription>View and verify all voting transactions on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading blockchain data...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10">
                    <Shield className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
                    <p className="text-muted-foreground">No blockchain transactions recorded yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction Hash</TableHead>
                        <TableHead>Block</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Election</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => {
                        const { electionName, candidateName } = getElectionAndCandidateNames(tx);
                        return (
                          <TableRow key={tx.transactionHash}>
                            <TableCell className="font-mono text-xs">
                              {tx.transactionHash.substring(0, 10)}...
                            </TableCell>
                            <TableCell>{tx.blockNumber}</TableCell>
                            <TableCell>{formatDate(tx.timestamp)}</TableCell>
                            <TableCell>{electionName}</TableCell>
                            <TableCell>{candidateName}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleViewTransaction(tx)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Election</DialogTitle>
              <DialogDescription>
                Make changes to the election details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Election Title</Label>
                  <Input 
                    id="edit-title" 
                    value={editElection.title}
                    onChange={(e) => setEditElection({...editElection, title: e.target.value})}
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input 
                    id="edit-description" 
                    value={editElection.description}
                    onChange={(e) => setEditElection({...editElection, description: e.target.value})}
                    disabled={isProcessing}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input 
                    id="edit-startDate" 
                    type="date"
                    value={editElection.startDate}
                    onChange={(e) => setEditElection({...editElection, startDate: e.target.value})}
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input 
                    id="edit-endDate" 
                    type="date"
                    value={editElection.endDate}
                    onChange={(e) => setEditElection({...editElection, endDate: e.target.value})}
                    disabled={isProcessing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Candidates</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddEditCandidate}
                    disabled={isProcessing}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Candidate
                  </Button>
                </div>
                
                {editElection.candidates.map((candidate, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded border">
                    <div className="col-span-5">
                      <Input 
                        placeholder="Candidate Name"
                        value={candidate.name}
                        onChange={(e) => handleEditCandidateChange(index, 'name', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input 
                        placeholder="Party Affiliation"
                        value={candidate.party}
                        onChange={(e) => handleEditCandidateChange(index, 'party', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveEditCandidate(index)}
                        disabled={editElection.candidates.length === 1 || isProcessing}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Election Status</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant={editElection.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditElection({...editElection, isActive: true})}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </Button>
                  <Button 
                    type="button" 
                    variant={!editElection.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditElection({...editElection, isActive: false})}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Inactive
                  </Button>
                </div>
                {!editElection.isActive && (
                  <div className="mt-2 flex items-start p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      Deactivating an election will prevent voters from casting new votes, but existing votes will be preserved.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateElection}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Blockchain transaction information and verification data
              </DialogDescription>
            </DialogHeader>
            
            {transactionDetails && (
              <div className="space-y-4 py-4">
                <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Transaction Hash</h3>
                    <p className="text-xs font-mono break-all">{transactionDetails.transactionHash}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Block Number</h3>
                      <p>{transactionDetails.blockNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Timestamp</h3>
                      <p>{formatDate(transactionDetails.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Election ID</h3>
                      <p>{transactionDetails.electionId}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Candidate ID</h3>
                      <p>{transactionDetails.candidateId}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Voter ID (Anonymized)</h3>
                    <p className="text-xs font-mono">{transactionDetails.voterId}</p>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-1">Verification Status</h3>
                    <div className="flex items-center gap-1">
                      <div className="bg-green-100 text-green-800 rounded-full p-1">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-green-800">Verified on Blockchain</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    This transaction is permanently recorded on the blockchain
                  </span>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>View on Explorer</span>
                  </Button>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransactionDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Admin;
