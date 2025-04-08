import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Shield, Edit, LogOut, Save, Camera, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  voter_id: string;
  registration_date: string;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, voter_id, registration_date, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        return data as UserProfile;
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load profile data. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!user,
  });

  // Fetch user voting status - using the votes table instead of user_votes
  const { data: hasVoted } = useQuery({
    queryKey: ['userVotes', user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user) return false;
      
      try {
        const { count, error } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('voter_id', user.id);
          
        if (error) throw error;
        
        return count !== null && count > 0;
      } catch (error) {
        console.error('Error fetching user votes:', error);
        return false;
      }
    },
    enabled: !!user,
  });

  // Update user profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: { full_name: string; email?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Upload profile photo mutation
  const uploadProfilePhoto = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded image
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      return data.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsChangingPhoto(false);
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been successfully updated.",
      });
    },
    onError: (error) => {
      setIsChangingPhoto(false);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile photo",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (profile) {
      setEditedName(profile.full_name || '');
      setEditedEmail(profile.email || user?.email || '');
    }
  }, [profile, user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsChangingPhoto(true);
    uploadProfilePhoto.mutate(file);
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    updateProfile.mutate({ 
      full_name: editedName 
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (profile) {
      setEditedName(profile.full_name || '');
      setEditedEmail(profile.email || user?.email || '');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleProfilePhotoClick}>
                  {isChangingPhoto || uploadProfilePhoto.isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback>
                        {profile?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                {isEditing && (
                  <div 
                    className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/80"
                    onClick={handleProfilePhotoClick}
                  >
                    <Camera size={16} />
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <CardTitle className="text-center">{profile?.full_name || 'Loading...'}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    variant="default" 
                    className="w-full flex items-center gap-2"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    disabled={updateProfile.isPending}
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline" className="w-full flex items-center gap-2">
                  <Edit size={16} />
                  Edit Profile
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 text-destructive"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Voting Information */}
          <Card className="md:col-span-2">
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
                    <span className="text-muted-foreground">Voter ID</span>
                    <span className="font-medium">{profile?.voter_id || 'Not registered'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Registration Date</span>
                    <span className="font-medium">
                      {profile?.registration_date 
                        ? new Date(profile.registration_date).toLocaleDateString() 
                        : 'Not registered'}
                    </span>
                  </div>
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
