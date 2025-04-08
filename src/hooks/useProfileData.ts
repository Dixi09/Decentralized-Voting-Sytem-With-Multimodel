
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  
  // Fetch user profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
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

  // Fetch user voting status - using the votes table
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

  useEffect(() => {
    if (profile) {
      setEditedName(profile.full_name || '');
      setEditedEmail(user?.email || '');
    }
  }, [profile, user]);

  return {
    profile,
    isLoadingProfile,
    hasVoted,
    isEditing,
    setIsEditing,
    isChangingPhoto, 
    setIsChangingPhoto,
    editedName,
    setEditedName,
    editedEmail
  };
};
