
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Users, Vote, Calendar, Plus, Trash2, Edit, Eye, CheckCircle, XCircle } from 'lucide-react';
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
  
  // New election form state
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', party: '' }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch elections
        const votingContract = VotingContract.getInstance();
        const electionList = await votingContract.getElections();
        setElections(electionList);
        
        // Fetch transactions
        const transactionList = await votingContract.getVoteTransactions();
        setTransactions(transactionList);
        
        // Mock users data - in a real app, this would come from your auth system
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

  const handleCreateElection = () => {
    // Validate form
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

    // Create a new election object
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

    // Add to elections list
    setElections([...elections, newElectionData]);
    
    // Reset form
    setNewElection({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      candidates: [{ name: '', party: '' }]
    });
    
    setShowNewElectionForm(false);
    
    toast({
      title: "Election Created",
      description: "The new election has been successfully created.",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <Button onClick={() => setShowNewElectionForm(!showNewElectionForm)}>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input 
                          id="description" 
                          value={newElection.description}
                          onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                          placeholder="Enter election description"
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input 
                          id="endDate" 
                          type="date"
                          value={newElection.endDate}
                          onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
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
                            />
                          </div>
                          <div className="col-span-5">
                            <Input 
                              placeholder="Party Affiliation"
                              value={candidate.party}
                              onChange={(e) => handleCandidateChange(index, 'party', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveCandidate(index)}
                              disabled={newElection.candidates.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full" onClick={handleCreateElection}>
                      Create Election
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
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant={election.isActive ? "destructive" : "default"}>
                            {election.isActive ? "Deactivate" : "Activate"}
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
                        <TableHead>Election ID</TableHead>
                        <TableHead>Candidate ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.transactionHash}>
                          <TableCell className="font-mono text-xs">
                            {tx.transactionHash.substring(0, 10)}...
                          </TableCell>
                          <TableCell>{tx.blockNumber}</TableCell>
                          <TableCell>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell>{tx.electionId}</TableCell>
                          <TableCell>{tx.candidateId}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
