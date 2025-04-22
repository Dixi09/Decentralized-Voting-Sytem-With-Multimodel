import React, { useRef, useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import CameraFeedback from '@/components/face-verification/CameraFeedback';
import VerificationStatus from '@/components/face-verification/VerificationStatus';
import ActionButtons from '@/components/face-verification/ActionButtons';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FaceRecognitionProps {
  onVerified: () => void;
  className?: string;
}

const FaceRecognition = ({ onVerified, className }: FaceRecognitionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isCaptured, 
    isVerifying, 
    verificationStatus, 
    captureImage, 
    retryCapture,
    hasReferenceImage
  } = useFaceVerification({ onVerified });

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
      }
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!hasReferenceImage) {
      setError('You need to register your face first before attempting to vote.');
      return;
    }
    captureImage(videoRef, canvasRef);
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
            </div>
            
      {error && (
        <div className="w-full max-w-md p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!isCaptured ? (
          <Button
            onClick={handleCapture}
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
                Capture Face
              </>
            )}
          </Button>
        ) : (
            <Button
            onClick={retryCapture}
            variant="outline"
            disabled={isVerifying}
            >
            Try Again
            </Button>
        )}
      </div>

      {!hasReferenceImage && (
        <div className="w-full max-w-md p-3 text-sm text-yellow-600 bg-yellow-50 rounded-md">
          You need to register your face before you can vote. Please complete the registration process first.
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
