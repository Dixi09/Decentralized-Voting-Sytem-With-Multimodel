
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Loader2, CheckCircle2, XCircle, RotateCcw, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLivenessChecking, setIsLivenessChecking] = useState(false);
  const [isPalmDetected, setIsPalmDetected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [palmFeatures, setPalmFeatures] = useState<string[]>([]);
  
  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        setVerificationStatus('idle');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          }
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
    
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [onError]);
  
  // Simulate palm detection
  useEffect(() => {
    if (!isCameraReady || isCaptured) return;
    
    const detectPalm = () => {
      const detectedPalm = Math.random() > 0.2; // 80% chance of detecting a palm
      
      if (detectedPalm) {
        setIsPalmDetected(true);
        setPalmFeatures(['main lines', 'heart line', 'head line', 'life line', 'fingerprint patterns']);
        drawPalmOverlay();
      } else {
        setIsPalmDetected(false);
        setPalmFeatures([]);
      }
    };
    
    const interval = setInterval(detectPalm, 2000);
    return () => clearInterval(interval);
  }, [isCameraReady, isCaptured]);
  
  // Draw palm detection overlay
  const drawPalmOverlay = () => {
    if (!overlayCanvasRef.current || !videoRef.current) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw palm outline
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw palm boundary
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 100, 160, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw main lines
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.lineWidth = 2;
    
    // Heart line
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY - 40);
    ctx.bezierCurveTo(centerX - 30, centerY - 60, centerX + 30, centerY - 60, centerX + 80, centerY - 30);
    ctx.stroke();
    
    // Head line
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY);
    ctx.bezierCurveTo(centerX - 30, centerY - 10, centerX + 30, centerY - 10, centerX + 60, centerY);
    ctx.stroke();
    
    // Life line
    ctx.beginPath();
    ctx.moveTo(centerX - 60, centerY - 80);
    ctx.bezierCurveTo(centerX - 70, centerY - 20, centerX - 80, centerY + 40, centerX - 60, centerY + 100);
    ctx.stroke();
    
    // Fate line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 100);
    ctx.bezierCurveTo(centerX, centerY + 50, centerX, centerY - 50, centerX, centerY - 100);
    ctx.stroke();
    
    // Reference points
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    const pointRadius = 3;
    
    // Draw detection points
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 100;
      const y = centerY + Math.sin(angle) * 160;
      
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
      ctx.fill();
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
    
    setIsScanning(true);
    
    toast({
      title: "Palm Detection",
      description: "Scanning palm features...",
    });
    
    // Simulate detailed scan
    setTimeout(() => {
      // Draw the current video frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setIsCaptured(true);
      setIsScanning(false);
      
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
    }, 2500);
  };
  
  const verifyPalm = async () => {
    setIsVerifying(true);
    
    try {
      // Simulate enhanced palm verification process
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Factor in attempt count to make verification more strict after failures
      const successThreshold = 0.9 - (Math.min(attemptCount, 2) * 0.05);
      
      // Only succeed if palm was actually detected
      const isSuccess = isPalmDetected && (Math.random() < successThreshold);
      
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
        
        {/* Overlay for palm detection visualization */}
        <canvas
          ref={overlayCanvasRef}
          className={cn(
            "absolute inset-0 w-full h-full",
            (isCaptured || !isPalmDetected) && "hidden"
          )}
        />
        
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 border-4 border-blue-400 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className="w-12 h-12 text-blue-400" />
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-[scanning_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
        
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
            disabled={!isCameraReady || isVerifying || !isPalmDetected || isScanning}
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
      
      {isPalmDetected && !isCaptured && (
        <Alert className="w-full max-w-md bg-green-50 text-green-600 border-green-200">
          <AlertTitle>Palm Detected</AlertTitle>
          <AlertDescription>
            <p>Found palm features: {palmFeatures.join(', ')}</p>
            <p className="text-xs mt-1">Position your palm in the center and click "Scan Palm" button</p>
          </AlertDescription>
        </Alert>
      )}
      
      {!isPalmDetected && !isCaptured && (
        <Alert className="w-full max-w-md bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertDescription>
            No palm detected. Please position your palm flat and parallel to the camera.
          </AlertDescription>
        </Alert>
      )}
      
      {attemptCount > 0 && (
        <Alert className={cn(
          "w-full max-w-md",
          attemptCount > 1 ? "bg-red-50 text-red-800 border-red-200" : "bg-amber-50 text-amber-800 border-amber-200"
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
