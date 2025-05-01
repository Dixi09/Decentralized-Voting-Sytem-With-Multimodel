
import React, { useRef, useState } from 'react';
import { Camera, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  
  const startCamera = async () => {
    try {
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
    verifyPalm();
  };
  
  const verifyPalm = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate palm verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 90% success rate for demo purposes
      const isSuccess = Math.random() < 0.9;
      
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
        toast({
          title: "Verification Failed",
          description: "Palm verification failed. Please try again.",
          variant: "destructive",
        });
        
        // Reset to try again
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
        <h3 className="text-lg font-medium">Palm Verification</h3>
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
            disabled={isVerifying}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
      
      <div className="w-full max-w-md p-3 text-sm text-blue-600 bg-blue-50 rounded-md">
        <p>For best results:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Hold your palm flat and parallel to the camera</li>
          <li>Ensure good lighting conditions</li>
          <li>Keep your hand steady during scanning</li>
        </ul>
      </div>
    </div>
  );
};

export default PalmRecognition;
