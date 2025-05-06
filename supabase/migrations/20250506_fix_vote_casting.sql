
-- Enable Row Level Security on votes table if not already enabled
ALTER TABLE IF EXISTS public.votes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own votes
CREATE POLICY IF NOT EXISTS "Users can insert their own votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (auth.uid()::text = voter_id);

-- Create policy to allow users to view their own votes
CREATE POLICY IF NOT EXISTS "Users can view their own votes" 
ON public.votes 
FOR SELECT 
USING (auth.uid()::text = voter_id);

-- Create policy to allow users to view all votes (for results display)
CREATE POLICY IF NOT EXISTS "Users can view all votes for results" 
ON public.votes 
FOR SELECT 
USING (true);

-- Enable realtime support for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER TABLE public.votes REPLICA IDENTITY FULL;

-- Create a function to check if a user has voted in an election
CREATE OR REPLACE FUNCTION public.has_user_voted(p_user_id TEXT, p_election_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.votes 
    WHERE voter_id = p_user_id 
    AND election_id = p_election_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get vote counts for a candidate
CREATE OR REPLACE FUNCTION public.get_candidate_votes(p_candidate_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM public.votes 
    WHERE candidate_id = p_candidate_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
