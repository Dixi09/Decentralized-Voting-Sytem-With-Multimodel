
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Loader2, AlertCircle, ThumbsUp } from 'lucide-react';
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
  
  // Start the webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to continue with facial verification.",
        variant: "destructive",
      });
    }
  };
  
  // Stop the webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };
  
  // Capture image from webcam
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame on the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        setIsCaptured(true);
        
        // In a real implementation, you would now send this image to the server
        // for facial recognition verification
        verifyFace();
      }
    }
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
      stopWebcam();
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm mb-4 overflow-hidden rounded-lg border bg-background">
        {!isCapturing ? (
          <div className="flex h-64 items-center justify-center bg-muted">
            <User className="h-16 w-16 text-muted-foreground/60" />
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
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
        {!isCapturing && (
          <Button onClick={startWebcam} className="w-full">
            Start Camera
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
