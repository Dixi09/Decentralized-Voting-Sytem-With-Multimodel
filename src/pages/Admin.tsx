
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Users, Settings, Shield, RefreshCw, Download } from 'lucide-react';

const Admin = () => {
  // Mock data - in a real app, this would come from your backend
  const stats = {
    totalVoters: 12584,
    registeredVoters: 9856,
    votesSubmitted: 7634,
    participationRate: 77.5,
    lastUpdated: 'April 4, 2025 - 14:32'
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download size={14} /> Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalVoters.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Users size={12} /> Total Eligible Voters
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.registeredVoters.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Shield size={12} /> Registered Users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.votesSubmitted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <BarChart size={12} /> Votes Submitted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.participationRate}%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Settings size={12} /> Participation Rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="voters">
          <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
            <TabsTrigger value="voters">Voters</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voters" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Voter Management</CardTitle>
                <CardDescription>View and manage registered voters</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This section would contain a data table with voter information, 
                  including registration status, verification status, and voting status.
                </p>
                <p className="text-muted-foreground text-sm mt-4">
                  Last updated: {stats.lastUpdated}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure the voting system parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This section would contain configuration options for the voting system,
                  including election start/end dates, verification requirements, and ballot settings.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>View system activity and blockchain transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This section would display system logs, including registration events, 
                  voting transactions, and any security-related events.
                </p>
                <p className="text-muted-foreground text-sm mt-4">
                  The blockchain transaction history would also be accessible here for verification.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
