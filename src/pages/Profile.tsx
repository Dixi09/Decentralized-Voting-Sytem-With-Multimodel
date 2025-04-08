
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import VotingInformationCard from '@/components/profile/VotingInformationCard';

const Profile = () => {
  const {
    profile,
    isLoadingProfile,
    hasVoted,
    isEditing,
    setIsEditing,
    isChangingPhoto,
    setIsChangingPhoto,
    editedName,
    setEditedName,
    editedEmail,
    votingDetails
  } = useProfileData();

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
            <ProfileSummaryCard
              profile={profile}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editedName={editedName}
              setEditedName={setEditedName}
              isChangingPhoto={isChangingPhoto}
              setIsChangingPhoto={setIsChangingPhoto}
            />
          </Card>

          {/* Voting Information */}
          <Card className="md:col-span-2">
            <VotingInformationCard
              isEditing={isEditing}
              editedName={editedName}
              setEditedName={setEditedName}
              editedEmail={editedEmail}
              hasVoted={hasVoted}
              votingDetails={votingDetails}
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
