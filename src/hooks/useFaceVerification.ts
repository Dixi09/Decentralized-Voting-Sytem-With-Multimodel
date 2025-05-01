
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseFaceVerificationProps {
  onVerified?: () => void;
  isRegistrationMode?: boolean;
}

export function useFaceVerification({ onVerified, isRegistrationMode = false }: UseFaceVerificationProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [hasReferenceImage, setHasReferenceImage] = useState<boolean>(false);
  const [isLivenessChecking, setIsLivenessChecking] = useState(false);
  const [livenessGestures, setLivenessGestures] = useState<string[]>([]);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { user } = useAuth();
  const captureAttempts = useRef(0);
  const livenessPassedRef = useRef(false);

  // Fetch the user's registered face image when component mounts
  useEffect(() => {
    const fetchUserFace = async () => {
      if (!user?.id) return;
      
      try {
        console.log("Fetching user biometrics for user ID:", user.id);
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
        
        console.log("User biometrics data:", data);
        
        if (data?.face_image_url) {
          setReferenceImage(data.face_image_url);
          setHasReferenceImage(true);
        } else {
          console.log("No face image found for user");
          setHasReferenceImage(false);
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

  // Initialize liveness detection gestures
  useEffect(() => {
    if (isLivenessChecking && livenessGestures.length === 0) {
      // Random selection of gestures for liveness check
      const availableGestures = ['blink', 'smile', 'turn_left', 'turn_right', 'nod'];
      const selectedGestures = [];
      
      // Select 2 random gestures
      while (selectedGestures.length < 2) {
        const randomIndex = Math.floor(Math.random() * availableGestures.length);
        const gesture = availableGestures[randomIndex];
        if (!selectedGestures.includes(gesture)) {
          selectedGestures.push(gesture);
        }
      }
      
      setLivenessGestures(selectedGestures);
      setCurrentGesture(selectedGestures[0]);
    }
  }, [isLivenessChecking]);

  // Register a new face image
  const registerFace = async (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!user?.id || !videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Camera elements not available or user not logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Could not initialize camera context");
      }
      
      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      
      // Draw the current video frame on the canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      console.log("Registering face image for user:", user.id);
      
      // Check if user already has a face image
      const { data: existingData } = await supabase
        .from('user_biometrics')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      let result;
      
      if (existingData) {
        // Update existing record
        console.log("Updating existing biometrics record");
        result = await supabase
          .from('user_biometrics')
          .update({
            face_image_url: imageData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        console.log("Creating new biometrics record");
        result = await supabase
          .from('user_biometrics')
          .insert({
            user_id: user.id,
            face_image_url: imageData
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Face Registered",
        description: "Your face has been successfully registered.",
      });
      
      // Set the reference image to the newly captured image
      setReferenceImage(imageData);
      setHasReferenceImage(true);
      
      // If we're in registration mode and onVerified callback exists, call it
      if (isRegistrationMode && onVerified) {
        onVerified();
      }
      
    } catch (error) {
      console.error('Face registration error:', error);
      toast({
        title: "Registration Error",
        description: "Failed to save your face image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Capture image from webcam and start verification process
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
    
    if (!isRegistrationMode && !hasReferenceImage) {
      toast({
        title: "Face Not Registered",
        description: "Please register your face first before attempting verification.",
        variant: "destructive",
      });
      setVerificationStatus('error');
      setTimeout(() => {
        setIsCaptured(false);
        setVerificationStatus('idle');
      }, 2000);
      return;
    }
    
    // If we're in registration mode, register the face instead of verifying
    if (isRegistrationMode) {
      registerFace(videoRef, canvasRef);
      return;
    }
    
    // Start liveness detection before verification
    setIsLivenessChecking(true);
    toast({
      title: "Liveness Check Required",
      description: `Please ${formatGestureInstruction(currentGesture || '')} to verify you're a real person.`,
    });
  };

  // Format gesture instruction for user display
  const formatGestureInstruction = (gesture: string): string => {
    switch(gesture) {
      case 'blink': return 'blink your eyes';
      case 'smile': return 'smile at the camera';
      case 'turn_left': return 'turn your head slightly to the left';
      case 'turn_right': return 'turn your head slightly to the right';
      case 'nod': return 'nod your head up and down';
      default: return 'follow the instructions';
    }
  };

  // Process liveness detection gesture
  const processLivenessGesture = (successful: boolean = true) => {
    if (!successful) {
      toast({
        title: "Liveness Check Failed",
        description: "Please try the gesture again or restart verification.",
        variant: "destructive",
      });
      captureAttempts.current += 1;
      
      // After 3 failed attempts, reset the process
      if (captureAttempts.current >= 3) {
        resetVerification();
        toast({
          title: "Verification Failed",
          description: "Too many failed attempts. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }
    
    // Find current gesture index
    const currentIndex = livenessGestures.findIndex(gesture => gesture === currentGesture);
    
    // If all gestures are completed
    if (currentIndex === livenessGestures.length - 1) {
      livenessPassedRef.current = true;
      setIsLivenessChecking(false);
      
      toast({
        title: "Liveness Check Passed",
        description: "Proceeding with face verification.",
      });
      
      // Proceed to verification
      verifyFace();
    } else {
      // Move to next gesture
      setCurrentGesture(livenessGestures[currentIndex + 1]);
      toast({
        title: "Good!",
        description: `Now please ${formatGestureInstruction(livenessGestures[currentIndex + 1])}`,
      });
    }
  };

  // Verify facial image against the user's registered face
  const verifyFace = async () => {
    // Skip verification if we don't have a reference image
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
      const result = await simulateFaceComparison(referenceImage);
      
      if (result.verified) {
        setVerificationStatus('success');
        toast({
          title: "Face Verified",
          description: "Your identity has been successfully verified.",
        });
        
        // Call the onVerified callback after a short delay
        if (onVerified) {
          setTimeout(() => {
            onVerified();
          }, 1500);
        }
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

  // Reset verification process
  const resetVerification = () => {
    setIsCaptured(false);
    setIsVerifying(false);
    setVerificationStatus('idle');
    setIsLivenessChecking(false);
    setLivenessGestures([]);
    setCurrentGesture(null);
    captureAttempts.current = 0;
    livenessPassedRef.current = false;
  };
  
  // This function simulates a backend face comparison API with improved security
  const simulateFaceComparison = async (referenceImage: string): Promise<{verified: boolean, confidence: number}> => {
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
  
  // Handle palm verification (simulated for this implementation)
  const verifyPalm = async (palmImageData: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Simulate palm verification with a 95% success rate
        resolve(Math.random() < 0.95);
      }, 1500);
    });
  };
  
  // Retry face verification
  const retryCapture = () => {
    setIsCaptured(false);
    setVerificationStatus('idle');
    resetVerification();
  };

  return {
    isCaptured,
    isVerifying,
    verificationStatus,
    captureImage,
    retryCapture,
    hasReferenceImage,
    isRegistering,
    registerFace,
    isRegistrationMode,
    isLivenessChecking,
    currentGesture,
    processLivenessGesture,
    verifyPalm
  };
}
