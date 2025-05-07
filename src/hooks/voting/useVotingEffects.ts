import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that sets up side effects for the voting process
 */
export const useVotingEffects = (state: ReturnType<typeof import('./useVotingState').useVotingState>) => {
  const { 
    user, 
    setIsBiometricsRegistered,
    setIsCheckingEligibility
  } = state;
  
  // Check if the user has registered biometrics
  useEffect(() => {
    const checkBiometrics = async () => {
      if (!user) return;
      
      setIsCheckingEligibility(true);
      
      try {
        const { data, error } = await supabase
          .from('user_biometrics')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking biometrics:', error);
          toast({
            title: "Error",
            description: "Could not verify your biometric registration status.",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          console.log('Biometrics found for user:', user.id);
          setIsBiometricsRegistered(true);
        } else {
          console.log('No biometrics found for user:', user.id);
          setIsBiometricsRegistered(false);
          toast({
            title: "Biometrics Required",
            description: "You need to register your biometrics before you can vote.",
          });
        }
      } catch (err) {
        console.error('Error in checkBiometrics:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingEligibility(false);
      }
    };
    
    checkBiometrics();
  }, [user, toast, setIsBiometricsRegistered, setIsCheckingEligibility]);
  
  // Add any other global side effects here
};
