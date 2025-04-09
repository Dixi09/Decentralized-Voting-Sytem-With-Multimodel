
import React, { useRef, useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import CameraFeedback from '@/components/face-verification/CameraFeedback';
import VerificationStatus from '@/components/face-verification/VerificationStatus';
import ActionButtons from '@/components/face-verification/ActionButtons';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Camera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FaceRecognitionProps {
  onVerified: () => void;
  onError: () => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onVerified, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  
  // Use custom hooks to manage camera and face verification state
  const { videoRef, isCapturing, cameraError, startWebcam, stopWebcam } = useCamera({ onError });
  const { 
    isCaptured, 
    isVerifying, 
    verificationStatus, 
    captureImage, 
    retryCapture,
    hasReferenceImage
  } = useFaceVerification({ onVerified: () => {
    stopWebcam();
    onVerified();
  }});
  
  // Handler for capture button
  const handleCaptureImage = () => {
    captureImage(videoRef, canvasRef);
  };

  // Better handling of camera initialization
  useEffect(() => {
    // Start webcam when component mounts with a delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      startWebcam().catch(err => {
        console.error('Failed to start webcam:', err);
        toast({
          title: "Camera Error",
          description: "Failed to initialize camera. Please check your permissions and try again.",
          variant: "destructive",
        });
        onError();
      });
    }, 1500); // Increased delay for better reliability
    
    return () => {
      clearTimeout(timeoutId);
      stopWebcam(); // Ensure camera is stopped when component unmounts
    };
  }, []);

  // Ensure video is properly appended to the DOM
  useEffect(() => {
    // Only attempt to append the video if we have both references and the video isn't already there
    if (videoRef.current && videoContainerRef.current) {
      // Check if the video is not already a child of the container
      if (!videoContainerRef.current.contains(videoRef.current)) {
        videoContainerRef.current.innerHTML = ''; // Clear container first
        videoContainerRef.current.appendChild(videoRef.current);
        setCameraInitialized(true);
      }
    }
  }, [videoRef.current, videoContainerRef.current, isCapturing]);
  
  // Show information if user doesn't have a reference image
  if (!hasReferenceImage) {
    return (
      <div className="space-y-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Face Registration Required</AlertTitle>
          <AlertDescription>
            You need to register your face for verification. Please take a clear photo of your face looking directly at the camera.
          </AlertDescription>
        </Alert>
        
        <div className="relative w-full max-w-sm mb-4 overflow-hidden rounded-lg border bg-background">
          {!isCapturing ? (
            <CameraFeedback cameraError={cameraError} />
          ) : (
            <div 
              ref={videoContainerRef} 
              className={`w-full h-64 ${isCaptured ? 'hidden' : 'block'}`}
            >
              {/* Video element will be appended here by the useEffect */}
            </div>
          )}
          
          <canvas 
            ref={canvasRef} 
            className={`w-full h-64 object-cover ${isCaptured ? 'block' : 'hidden'}`}
          />
          
          <VerificationStatus 
            isVerifying={isVerifying} 
            status={verificationStatus} 
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleCaptureImage}
            disabled={!isCapturing || isCaptured || isVerifying}
            className="flex items-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Register My Face</span>
          </Button>
        </div>
        
        <ActionButtons 
          isCapturing={isCapturing}
          isCaptured={isCaptured}
          cameraError={cameraError}
          isVerifying={isVerifying}
          verificationStatus={verificationStatus}
          onStartCamera={startWebcam}
          onCaptureImage={handleCaptureImage}
          onRetryCapture={retryCapture}
          onStopCamera={stopWebcam}
        />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm mb-4 overflow-hidden rounded-lg border bg-background">
        {!isCapturing ? (
          <CameraFeedback cameraError={cameraError} />
        ) : (
          <div 
            ref={videoContainerRef} 
            className={`w-full h-64 ${isCaptured ? 'hidden' : 'block'}`}
          >
            {/* Video element will be appended here by the useEffect */}
          </div>
        )}
        
        <canvas 
          ref={canvasRef} 
          className={`w-full h-64 object-cover ${isCaptured ? 'block' : 'hidden'}`}
        />
        
        <VerificationStatus 
          isVerifying={isVerifying} 
          status={verificationStatus} 
        />
      </div>
      
      <ActionButtons 
        isCapturing={isCapturing}
        isCaptured={isCaptured}
        cameraError={cameraError}
        isVerifying={isVerifying}
        verificationStatus={verificationStatus}
        onStartCamera={startWebcam}
        onCaptureImage={handleCaptureImage}
        onRetryCapture={retryCapture}
        onStopCamera={stopWebcam}
      />
    </div>
  );
};

export default FaceRecognition;
