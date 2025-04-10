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
        const { data, error } = await supabase
          .from('user_biometrics')
          .select('face_image_url')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user face image:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your registered face image. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        if (data?.face_image_url) {
          setReferenceImage(data.face_image_url);
        } else {
          toast({
            title: "Face Registration Required",
            description: "You need to register your face before you can vote.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Error in fetchUserFace:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchUserFace();
  }, [user]);

  // Capture image from webcam
  const captureImage = (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Camera elements not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      toast({
        title: "Error",
        description: "Could not initialize camera context. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
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
    if (!referenceImage) {
      toast({
        title: "Face Not Registered",
        description: "Please register your face first before attempting to vote.",
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

    setIsVerifying(true);
    
    try {
      // In a real implementation, this would call a backend API for face comparison
      const result = await simulateFaceComparison(capturedImageData, referenceImage);
      
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
    } catch (error) {
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
    }
  };
  
  // This function simulates a backend face comparison API
  const simulateFaceComparison = async (capturedImage: string, referenceImage: string): Promise<{verified: boolean, confidence: number}> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Simulate face comparison with a 90% success rate
        const isSuccess = Math.random() < 0.9;
        resolve({ 
          verified: isSuccess,
          confidence: isSuccess ? 0.85 + Math.random() * 0.1 : 0.3 + Math.random() * 0.2
        });
      }, 2000);
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
