
import React, { useRef, useState } from 'react';
import { Camera, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PalmRecognitionProps {
  onVerified: () => void;
  onError?: () => void;
  className?: string;
}

const PalmRecognition = ({ onVerified, onError, className }: PalmRecognitionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLivenessChecking, setIsLivenessChecking] = useState(false);
  
  const startCamera = async () => {
    try {
      setVerificationStatus('idle');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please ensure you have granted camera permissions.",
        variant: "destructive",
      });
      if (onError) onError();
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraReady(false);
    }
  };
  
  const capturePalm = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setIsCaptured(true);
    
    // Start with liveness check before palm verification
    setIsLivenessChecking(true);
    toast({
      title: "Liveness Check",
      description: "Please move your palm slightly to verify it's a real palm.",
    });
    
    // Simulate liveness check completion after 2 seconds
    setTimeout(() => {
      setIsLivenessChecking(false);
      toast({
        title: "Liveness Check Complete",
        description: "Now verifying your palm scan...",
      });
      verifyPalm();
    }, 2000);
  };
  
  const verifyPalm = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate enhanced palm verification process
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Factor in attempt count to make verification more strict after failures
      const successThreshold = 0.9 - (Math.min(attemptCount, 2) * 0.05);
      const isSuccess = Math.random() < successThreshold;
      
      if (isSuccess) {
        setVerificationStatus('success');
        toast({
          title: "Palm Verified",
          description: "Your palm has been successfully verified.",
        });
        
        // Call the onVerified callback after a short delay
        setTimeout(() => {
          if (onVerified) onVerified();
        }, 1500);
      } else {
        setVerificationStatus('error');
        setAttemptCount(prevCount => prevCount + 1);
        
        // Different messaging based on attempt count
        if (attemptCount >= 2) {
          toast({
            title: "Verification Failed",
            description: "Multiple failed attempts detected. Please try again with better lighting or contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: "Palm verification failed. Please ensure your entire palm is visible and well-lit.",
            variant: "destructive",
          });
        }
        
        // Reset to try again after a delay
        setTimeout(() => {
          retryCapture();
        }, 2000);
      }
    } catch (error) {
      setVerificationStatus('error');
      toast({
        title: "Verification Error",
        description: "An error occurred during palm verification.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const retryCapture = () => {
    setIsCaptured(false);
    setVerificationStatus('idle');
  };
  
  React.useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Enhanced Palm Verification</h3>
        <p className="text-sm text-gray-500">Place your palm facing the camera</p>
      </div>
      
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden">
        {!isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            isCaptured && "hidden"
          )}
        />
        
        <canvas 
          ref={canvasRef} 
          className={cn(
            "w-full h-full object-cover",
            !isCaptured && "hidden"
          )}
        />
        
        {isLivenessChecking && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
              <p className="text-blue-500 font-medium mt-2">Performing liveness check...</p>
            </div>
          </div>
        )}
        
        {verificationStatus === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        )}
        
        {verificationStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {!isCaptured ? (
          <Button
            onClick={capturePalm}
            disabled={!isCameraReady || isVerifying}
            className="gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Scan Palm
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={retryCapture}
            variant="outline"
            disabled={isVerifying || isLivenessChecking}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
      
      {attemptCount > 0 && (
        <Alert className={cn(
          "w-full max-w-md text-amber-800 bg-amber-50",
          attemptCount > 1 && "text-red-800 bg-red-50"
        )}>
          <AlertDescription className="text-sm">
            {attemptCount === 1 ? (
              "Verification failed. Make sure your palm is well-lit and centered in the frame."
            ) : (
              "Multiple verification failures detected. This may be logged as a security event."
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="w-full max-w-md p-3 text-sm text-blue-600 bg-blue-50 rounded-md">
        <p>For best results:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Hold your palm flat and parallel to the camera</li>
          <li>Ensure good lighting conditions</li>
          <li>Make sure all your palm lines are clearly visible</li>
          <li>Keep your hand steady during scanning</li>
          <li>Remove any jewelry or watches from your palm</li>
        </ul>
      </div>
    </div>
  );
};

export default PalmRecognition;
