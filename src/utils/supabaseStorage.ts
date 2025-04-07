
import { supabase } from "@/integrations/supabase/client";

// Function to store voting history for a candidate
export async function storeVotingHistory(candidateId: number, electionId: number, votingData: any) {
  try {
    const fileName = `candidate_${candidateId}_election_${electionId}.json`;
    const filePath = `candidates/${candidateId}/${fileName}`;
    
    // Convert data to JSON string
    const fileData = JSON.stringify(votingData, null, 2);
    
    // Convert string to Blob
    const blob = new Blob([fileData], { type: 'application/json' });
    
    // Upload to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .upload(filePath, blob, {
        contentType: 'application/json',
        upsert: true
      });
    
    if (error) {
      console.error('Error storing voting history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to store voting history:', error);
    throw error;
  }
}

// Function to retrieve voting history for a candidate
export async function getVotingHistory(candidateId: number, electionId: number) {
  try {
    const filePath = `candidates/${candidateId}/candidate_${candidateId}_election_${electionId}.json`;
    
    // Get file from storage
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .download(filePath);
    
    if (error) {
      console.error('Error retrieving voting history:', error);
      throw error;
    }
    
    // Parse the JSON data
    const text = await data.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to retrieve voting history:', error);
    return null;
  }
}

// Function to list all voting history files for a candidate
export async function listCandidateVotingHistory(candidateId: number) {
  try {
    const { data, error } = await supabase
      .storage
      .from('voting_history')
      .list(`candidates/${candidateId}`);
    
    if (error) {
      console.error('Error listing voting history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to list voting history:', error);
    return [];
  }
}
