
import React, { useRef, useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Camera, CheckCircle2, XCircle, Loader2, RotateCcw, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FaceRecognitionProps {
  onVerified: () => void;
  onError?: () => void;
  className?: string;
}

const FaceRecognition = ({ onVerified, onError, className }: FaceRecognitionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  
  const { 
    isCaptured, 
    isVerifying, 
    verificationStatus, 
    captureImage, 
    retryCapture,
    hasReferenceImage,
    isRegistering,
    isLivenessChecking,
    currentGesture,
    processLivenessGesture
  } = useFaceVerification({ 
    onVerified,
    isRegistrationMode 
  });

  const { startWebcam, stopWebcam, cameraError } = useCamera({
    onError: () => {
      setError('Could not access camera. Please ensure you have granted camera permissions.');
      if (onError) onError();
    }
  });

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
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
        setError('Could not access camera. Please ensure you have granted camera permissions.');
        if (onError) onError();
      }
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  const handleCapture = () => {
    if (isRegistrationMode) {
      captureImage(videoRef, canvasRef);
      return;
    }

    if (!hasReferenceImage) {
      setError('You need to register your face first before attempting to vote.');
      return;
    }
    captureImage(videoRef, canvasRef);
  };

  const handleRegistrationMode = () => {
    setIsRegistrationMode(true);
    setError(null);
    toast({
      title: "Face Registration Mode",
      description: "Position your face in the frame and click 'Register Face'",
    });
  };

  const simulateLivenessSuccess = () => {
    if (isLivenessChecking) {
      processLivenessGesture(true);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4", className)}>
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

        {isLivenessChecking && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
            <p className="text-lg font-semibold mb-2">Liveness Check</p>
            <p className="text-md mb-4">Please {formatGestureInstruction(currentGesture)}</p>
            {/* FOR DEMO PURPOSES ONLY: In a real app, this would be detected automatically */}
            <Button onClick={simulateLivenessSuccess} variant="outline" className="mt-2">
              Simulate {currentGesture?.replace('_', ' ')}
            </Button>
          </div>
        )}
      </div>
            
      {error && (
        <div className="w-full max-w-md p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!hasReferenceImage && !isRegistrationMode && (
          <Button
            onClick={handleRegistrationMode}
            variant="default"
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Register Your Face
          </Button>
        )}
        
        {(hasReferenceImage || isRegistrationMode) && !isCaptured && (
          <Button
            onClick={handleCapture}
            disabled={!isCameraReady || isVerifying || isRegistering}
            className="gap-2"
          >
            {isVerifying || isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isRegistrationMode ? "Registering..." : "Verifying..."}
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                {isRegistrationMode ? "Register Face" : "Capture Face"}
              </>
            )}
          </Button>
        )}
        
        {isCaptured && (
          <Button
            onClick={retryCapture}
            variant="outline"
            disabled={isVerifying || isRegistering}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        {isRegistrationMode && !isCaptured && (
          <Button
            onClick={() => setIsRegistrationMode(false)}
            variant="outline"
            disabled={isVerifying || isRegistering}
          >
            Cancel
          </Button>
        )}
      </div>

      {!hasReferenceImage && !isRegistrationMode && (
        <div className="w-full max-w-md p-3 text-sm text-yellow-600 bg-yellow-50 rounded-md">
          You need to register your face before you can vote. Please click the "Register Your Face" button above.
        </div>
      )}

      {isLivenessChecking && (
        <div className="w-full max-w-md p-3 text-sm text-blue-600 bg-blue-50 rounded-md">
          <p className="font-semibold">Liveness check in progress</p>
          <p className="mt-1">This helps prevent spoofing attacks using photos or videos.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to format gesture instructions
function formatGestureInstruction(gesture: string | null): string {
  if (!gesture) return "follow the instructions";
  
  switch(gesture) {
    case 'blink': return "blink your eyes";
    case 'smile': return "smile at the camera";
    case 'turn_left': return "turn your head slightly to the left";
    case 'turn_right': return "turn your head slightly to the right";
    case 'nod': return "nod your head up and down";
    default: return "follow the instructions";
  }
}

export default FaceRecognition;
