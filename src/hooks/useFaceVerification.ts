
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseFaceVerificationProps {
  onVerified: () => void;
}

export function useFaceVerification({ onVerified }: UseFaceVerificationProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
    
    // In a real implementation, you would now send this image to the server
    // for facial recognition verification
    verifyFace();
  };
  
  // Simulate facial verification with backend
  const verifyFace = () => {
    setIsVerifying(true);
    
    // Simulate a server request delay (3 seconds)
    setTimeout(() => {
      // Simulate 80% success rate for demo purposes
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
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
          description: "We couldn't verify your face. Please try again.",
          variant: "destructive",
        });
        
        // Reset to try again
        setTimeout(() => {
          setIsCaptured(false);
          setIsVerifying(false);
          setVerificationStatus('idle');
        }, 2000);
      }
    }, 3000);
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
    retryCapture
  };
}
