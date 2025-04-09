
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseFaceVerificationProps {
  onVerified: () => void;
}

export function useFaceVerification({ onVerified }: UseFaceVerificationProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch the user's registered face image when component mounts
  useEffect(() => {
    const fetchUserFace = async () => {
      if (!user?.id) return;
      
      try {
        console.log("Fetching user face image for user ID:", user.id);
        
        // Try to fetch the user's face from the user_biometrics table
        const { data, error } = await supabase
          .from('user_biometrics' as any)
          .select('face_image_url')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user face image:', error);
          return;
        }
        
        // Check if data exists and has the face_image_url property
        const faceImageUrl = data ? (data as any).face_image_url : null;
        if (faceImageUrl) {
          setReferenceImage(faceImageUrl);
          console.log('Loaded reference face image for comparison');
        } else {
          console.warn('No reference face image found for this user');
        }
      } catch (err) {
        console.error('Error in fetchUserFace:', err);
      }
    };
    
    fetchUserFace();
  }, [user]);

  // Capture image from webcam
  const captureImage = (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas elements not available');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Could not get canvas context');
      return;
    }
    
    console.log('Capturing image from video:', video.videoWidth, 'x', video.videoHeight);
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setIsCaptured(true);
    
    // Verify the captured face against the reference image
    verifyFace(canvas.toDataURL('image/jpeg'));
  };
  
  // Verify facial image against the user's registered face
  const verifyFace = async (capturedImageData: string) => {
    setIsVerifying(true);
    
    // For demonstration purposes, if we don't have a reference image,
    // let's save this captured image as the reference and allow verification
    if (!referenceImage && user) {
      try {
        console.log("Saving face image for user:", user.id);
        
        // First check if a record already exists
        const { data: existingRecord, error: checkError } = await supabase
          .from('user_biometrics' as any)
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking existing record:', checkError);
          throw checkError;
        }
        
        let saveError = null;
        
        if (existingRecord) {
          console.log("Updating existing face image record");
          // Update existing record
          const { error } = await supabase
            .from('user_biometrics' as any)
            .update({
              face_image_url: capturedImageData,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
            
          saveError = error;
        } else {
          console.log("Creating new face image record");
          // Insert new record
          const { error } = await supabase
            .from('user_biometrics' as any)
            .insert({
              user_id: user.id,
              face_image_url: capturedImageData,
              updated_at: new Date().toISOString()
            });
            
          saveError = error;
        }
            
        if (saveError) {
          console.error('Error storing face image:', saveError);
          toast({
            title: "Registration Error",
            description: "Failed to save your face image. Please try again.",
            variant: "destructive",
          });
          
          setVerificationStatus('error');
          setTimeout(() => {
            setIsCaptured(false);
            setIsVerifying(false);
            setVerificationStatus('idle');
          }, 2000);
          return;
        }
        
        // Set the reference image locally too
        setReferenceImage(capturedImageData);
        
        toast({
          title: "Face Registered",
          description: "Your face has been registered successfully. Proceeding with verification.",
        });
        
        // Then proceed with verification (which will now succeed since we just registered the face)
      } catch (err) {
        console.error('Error registering face image:', err);
        setVerificationStatus('error');
        setTimeout(() => {
          setIsCaptured(false);
          setIsVerifying(false);
          setVerificationStatus('idle');
        }, 2000);
        return;
      }
    }
    
    // Call the simulated API endpoint for verification
    simulateFaceComparison(capturedImageData, referenceImage)
      .then(result => {
        if (result.verified) {
          setVerificationStatus('success');
          toast({
            title: "Face Verified",
            description: "Your identity has been successfully verified.",
          });
          
          // Call the onVerified callback after a short delay
          setTimeout(() => {
            onVerified();
          }, 1500);
        } else {
          setVerificationStatus('error');
          toast({
            title: "Verification Failed",
            description: "Face doesn't match our records. Please try again.",
            variant: "destructive",
          });
          
          // Reset to try again
          setTimeout(() => {
            setIsCaptured(false);
            setIsVerifying(false);
            setVerificationStatus('idle');
          }, 2000);
        }
      })
      .catch(error => {
        console.error('Face verification error:', error);
        setVerificationStatus('error');
        toast({
          title: "Verification Error",
          description: "An error occurred during face verification. Please try again.",
          variant: "destructive",
        });
        
        // Reset to try again
        setTimeout(() => {
          setIsCaptured(false);
          setIsVerifying(false);
          setVerificationStatus('idle');
        }, 2000);
      });
  };
  
  // This function simulates a backend face comparison API
  // In a real implementation, this would be an API call to a backend service
  const simulateFaceComparison = async (capturedImage: string, referenceImage: string | null): Promise<{verified: boolean, confidence: number}> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // For demo purposes:
        // If user has a reference image, use higher verification threshold (more secure)
        // If no reference image, use the original 80% success rate for demo
        if (referenceImage) {
          // In a real implementation, this would use actual face comparison algorithms
          // Here we're just checking if the user has completed registration (has a reference image)
          // For demo, we'll use a 70% success rate to show some failed attempts
          const isSuccess = Math.random() < 0.7;
          resolve({ 
            verified: isSuccess,
            confidence: isSuccess ? 0.8 + Math.random() * 0.15 : 0.5 + Math.random() * 0.2
          });
        } else {
          // Original demo behavior (80% success)
          const isSuccess = Math.random() < 0.8;
          resolve({ 
            verified: isSuccess,
            confidence: isSuccess ? 0.7 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3
          });
        }
      }, 3000);
    });
  };
  
  // Retry face verification
  const retryCapture = () => {
    setIsCaptured(false);
    setVerificationStatus('idle');
  };

  return {
    isCaptured,
    isVerifying,
    verificationStatus,
    captureImage,
    retryCapture,
    hasReferenceImage: !!referenceImage
  };
}
