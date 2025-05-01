
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import FaceRecognition from '@/components/FaceRecognition';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isBiometricsVerified, setIsBiometricsVerified] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");

  // Check if user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        // Check if email ends with admin.com or is in the admin list
        const isUserAdmin = user.email?.endsWith('@dixith123.com') || false;
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleFaceVerificationSuccess = () => {
    setIsBiometricsVerified(true);
  };

  const handleAdminPasswordLogin = () => {
    // In a real application, this would be a more secure comparison
    // For demo purposes, we're using a simple password check
    if (adminPassword === "dixith123") {
      setIsAdmin(true);
      toast({
        title: "Admin Access Granted",
        description: "You have successfully logged in as an administrator.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive",
      });
    }
  };

  if (isAdmin === null) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Admin Authentication</CardTitle>
              </div>
              <CardDescription>
                Please enter the admin password to access the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Enter admin password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAdminPasswordLogin} className="flex-1">
                  Login as Admin
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                  Return to Home
                </Button>
              </div>
             
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {!isBiometricsVerified ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Admin Authentication Required</CardTitle>
              </div>
              <CardDescription>
                Please complete biometric verification to access the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FaceRecognition onVerified={handleFaceVerificationSuccess} />
            </CardContent>
          </Card>
        ) : (
          <AdminDashboard />
        )}
      </div>
    </Layout>
  );
};

export default Admin;
