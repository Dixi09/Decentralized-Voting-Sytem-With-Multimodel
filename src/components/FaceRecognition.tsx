
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Loader2, AlertCircle, ThumbsUp, Camera, CameraOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FaceRecognitionProps {
  onVerified: () => void;
  onError: () => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onVerified, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cameraError, setCameraError] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Start the webcam with improved error handling and video setup
  const startWebcam = async () => {
    try {
      setCameraError(false);
      
      // Stop any existing streams first
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      // Request camera with specific constraints for better compatibility
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        // Set stream to video element
        videoRef.current.srcObject = stream;
        
        // Play the video immediately
        try {
          await videoRef.current.play();
          setIsCapturing(true);
        } catch (playError) {
          console.error('Error playing video:', playError);
          setCameraError(true);
          throw new Error('Failed to play video stream');
        }
      } else {
        console.error("Video element reference is null");
        setCameraError(true);
        toast({
          title: "Camera Error",
          description: "Could not initialize video element. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setCameraError(true);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to continue with facial verification.",
        variant: "destructive",
      });
      onError(); // Notify parent component about the error
    }
  };
  
  // Stop the webcam with improved cleanup
  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };
  
  // Capture image from webcam
  const captureImage = () => {
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
          stopWebcam();
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
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Automatically start webcam when component mounts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startWebcam();
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm mb-4 overflow-hidden rounded-lg border bg-background">
        {!isCapturing ? (
          <div className="flex h-64 items-center justify-center bg-muted">
            {cameraError ? (
              <div className="text-center p-4">
                <CameraOff className="h-16 w-16 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">Camera access denied</p>
                <p className="text-xs mt-2">Please check your browser permissions and try again</p>
              </div>
            ) : (
              <div className="text-center">
                <User className="h-16 w-16 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/60">Initializing camera...</p>
              </div>
            )}
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ width: '100%', height: '264px', objectFit: 'cover' }}
            className={`w-full h-64 object-cover ${isCaptured ? 'hidden' : 'block'}`}
          />
        )}
        
        <canvas 
          ref={canvasRef} 
          className={`w-full h-64 object-cover ${isCaptured ? 'block' : 'hidden'}`}
        />
        
        {isVerifying && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            {verificationStatus === 'idle' && (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            )}
            {verificationStatus === 'success' && (
              <ThumbsUp className="h-10 w-10 text-green-500" />
            )}
            {verificationStatus === 'error' && (
              <AlertCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {!isCapturing && !cameraError && (
          <Button onClick={startWebcam} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        )}
        
        {cameraError && (
          <Button onClick={startWebcam} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Retry Camera Access
          </Button>
        )}
        
        {isCapturing && !isCaptured && (
          <Button onClick={captureImage} className="w-full">
            Capture
          </Button>
        )}
        
        {isCaptured && verificationStatus === 'idle' && (
          <Button variant="outline" onClick={retryCapture} disabled={isVerifying}>
            Retake
          </Button>
        )}
        
        {isCapturing && (
          <Button variant="destructive" onClick={stopWebcam} disabled={isVerifying}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default FaceRecognition;
