
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';

interface OTPVerificationProps {
  onVerified: () => void;
  onError: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerified, onError }) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<number | null>(null);
  
  // Generate a random 4-digit OTP on component mount
  useEffect(() => {
    generateOTP();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const generateOTP = () => {
    // Generate 4-digit OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    console.log("Generated OTP:", newOtp); // This helps for testing
    
    // Show the OTP in a toast notification (in a real app, this would be sent via SMS/email)
    toast({
      title: "OTP Generated",
      description: `Your verification code is: ${newOtp}`,
    });
    
    // Start the resend countdown
    setResendDisabled(true);
    setCountdown(30);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Use window.setInterval to ensure it works in browser context
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleVerify = () => {
    if (otp.length < 4) {
      toast({
        title: "Incomplete OTP",
        description: "Please enter the complete 4-digit code",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate API verification delay
    setTimeout(() => {
      if (otp === generatedOtp) {
        toast({
          title: "OTP Verified",
          description: "Your identity has been verified successfully",
        });
        onVerified();
      } else {
        toast({
          title: "Invalid OTP",
          description: "The code you entered doesn't match. Please try again.",
          variant: "destructive",
        });
        setOtp('');
        onError();
      }
      setIsVerifying(false);
    }, 1500);
  };
  
  const handleResend = () => {
    generateOTP();
    setOtp('');
  };
  
  // Function to handle OTP change
  const handleOTPChange = (value: string) => {
    setOtp(value);
    console.log("OTP changed:", value); // Log the OTP input for debugging
    
    // Auto-verify when 4 digits are entered
    if (value.length === 4) {
      setTimeout(() => {
        if (value === generatedOtp) {
          toast({
            title: "OTP Verified",
            description: "Your identity has been verified successfully",
          });
          onVerified();
        } else {
          toast({
            title: "Invalid OTP",
            description: "The code you entered doesn't match. Please try again.",
            variant: "destructive",
          });
          setOtp('');
          onError();
        }
      }, 500);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Enter the 4-digit code sent to your registered device
        </p>
        <p className="text-xs text-muted-foreground">
          (For demo purposes, the OTP is shown in a notification)
        </p>
      </div>
      
      <InputOTP
        maxLength={4}
        value={otp}
        onChange={handleOTPChange}
        render={({ slots }) => (
          <InputOTPGroup className="gap-3">
            {slots.map((slot, index) => (
              <InputOTPSlot 
                key={index} 
                index={index}
                className="w-14 h-14 text-xl font-bold border-2 cursor-text"
              />
            ))}
          </InputOTPGroup>
        )}
      />
      
      <div className="flex flex-col w-full gap-2">
        <Button 
          onClick={handleVerify} 
          disabled={otp.length < 4 || isVerifying}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resendDisabled}
          className="w-full"
        >
          {resendDisabled 
            ? `Resend code in ${countdown}s` 
            : "Resend code"}
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
