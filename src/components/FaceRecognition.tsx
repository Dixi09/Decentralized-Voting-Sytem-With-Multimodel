
import React, { useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useFaceVerification } from '@/hooks/useFaceVerification';
import CameraFeedback from '@/components/face-verification/CameraFeedback';
import VerificationStatus from '@/components/face-verification/VerificationStatus';
import ActionButtons from '@/components/face-verification/ActionButtons';

interface FaceRecognitionProps {
  onVerified: () => void;
  onError: () => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onVerified, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use custom hooks to manage camera and face verification state
  const { videoRef, isCapturing, cameraError, startWebcam, stopWebcam } = useCamera({ onError });
  const { 
    isCaptured, 
    isVerifying, 
    verificationStatus, 
    captureImage, 
    retryCapture 
  } = useFaceVerification({ onVerified: () => {
    stopWebcam();
    onVerified();
  }});
  
  // Handler for capture button
  const handleCaptureImage = () => {
    captureImage(videoRef, canvasRef);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm mb-4 overflow-hidden rounded-lg border bg-background">
        {!isCapturing ? (
          <CameraFeedback cameraError={cameraError} />
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
