
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

-- Make sure votes table has uuid columns for compatibility
ALTER TABLE IF EXISTS public.votes 
ALTER COLUMN voter_id TYPE uuid USING voter_id::uuid,
ALTER COLUMN election_id TYPE uuid USING election_id::uuid,
ALTER COLUMN candidate_id TYPE uuid USING candidate_id::uuid;

-- Add realtime support for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER TABLE public.votes REPLICA IDENTITY FULL;
