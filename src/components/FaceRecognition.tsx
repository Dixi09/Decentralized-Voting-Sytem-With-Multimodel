
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface FaceRecognitionProps {
  onVerified: () => void;
  onError: () => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onVerified, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationState, setVerificationState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  
  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setVerificationState('scanning');
        simulateFaceDetection();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: "Unable to access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  // Simulate face detection and verification process
  const simulateFaceDetection = () => {
    // Reset progress
    setScanProgress(0);
    
    // Progress animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 2;
        
        // Simulate face detection at 40%
        if (newProgress > 40 && !faceDetected) {
          setFaceDetected(true);
          toast({
            title: "Face Detected",
            description: "Please hold still while we verify your identity."
          });
        }
        
        // Complete the verification process
        if (newProgress >= 100) {
          clearInterval(interval);
          completeVerification();
          return 100;
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  };
  
  // In a real implementation, this would call an API to verify the face
  const completeVerification = () => {
    // Randomly succeed or fail for demonstration purposes
    // In a real app, this would be the result of an actual face verification
    const isSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (isSuccess) {
      setVerificationState('success');
      setTimeout(() => {
        stopCamera();
        onVerified();
      }, 1500);
    } else {
      setVerificationState('error');
      setTimeout(() => {
        stopCamera();
        onError();
      }, 1500);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Facial Recognition Verification</h3>
      
      <div className="face-scanner relative rounded-lg overflow-hidden bg-black">
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
            <Camera className="w-12 h-12 text-slate-400 mb-2" />
            <p className="text-white text-sm">Click Start to begin face verification</p>
          </div>
        )}
        
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        ></video>
        
        {isScanning && (
          <div className="face-scanner-overlay flex items-center justify-center">
            {verificationState === 'scanning' && faceDetected && (
              <div className="pulse-ring border-primary"></div>
            )}
            {verificationState === 'success' && (
              <div className="bg-green-500/20 absolute inset-0 flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-3">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            {verificationState === 'error' && (
              <div className="bg-red-500/20 absolute inset-0 flex items-center justify-center">
                <div className="bg-red-500 rounded-full p-3">
                  <X className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
      
      {isScanning && (
        <div className="w-full mt-4">
          <Progress value={scanProgress} className="h-2" />
          <p className="text-sm text-center mt-2">
            {faceDetected 
              ? "Face detected. Verifying identity..." 
              : "Scanning for face..."}
          </p>
        </div>
      )}
      
      <div className="flex justify-center mt-4">
        {!isScanning ? (
          <Button onClick={startCamera} className="flex items-center">
            <Camera className="mr-2 h-4 w-4" />
            Start Face Verification
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopCamera}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default FaceRecognition;
