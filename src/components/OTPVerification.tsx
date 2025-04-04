
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
  onVerified: () => void;
  onError: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerified, onError }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  // Generate a random OTP when the component mounts
  useEffect(() => {
    generateNewOTP();
  }, []);
  
  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Generate a new OTP and reset the timer
  const generateNewOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTimeLeft(60);
    
    // In a real app, this would send the OTP to the user's phone or email
    toast({
      title: "OTP Generated",
      description: `Your OTP is: ${newOtp} (Shown for demo purposes)`,
      duration: 10000,
    });
    
    console.log('Generated OTP:', newOtp);
  };
  
  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input on entry
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  // Handle key press for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  
  // Verify the entered OTP
  const verifyOTP = () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits of the OTP",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      if (enteredOtp === generatedOtp) {
        toast({
          title: "OTP Verified",
          description: "Your identity has been successfully verified",
          variant: "default",
        });
        setIsVerifying(false);
        onVerified();
      } else {
        toast({
          title: "Verification Failed",
          description: "The OTP you entered is incorrect. Please try again.",
          variant: "destructive",
        });
        setIsVerifying(false);
        onError();
      }
    }, 1500);
  };
  
  return (
    <div className="flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <Shield className="h-10 w-10 text-primary mb-2" />
      <h3 className="text-lg font-semibold">One-Time Password Verification</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter the 6-digit code sent to your registered mobile device
      </p>
      
      <div className="flex gap-2 mb-6">
        {otp.map((digit, index) => (
          <Input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-lg font-semibold"
            autoFocus={index === 0}
          />
        ))}
      </div>
      
      <Button 
        onClick={verifyOTP} 
        disabled={isVerifying || otp.join('').length !== 6}
        className="w-full mb-4"
      >
        {isVerifying ? 'Verifying...' : 'Verify OTP'}
      </Button>
      
      <div className="flex flex-col items-center text-sm">
        <div className="text-muted-foreground mb-2">
          {timeLeft > 0 ? (
            <span>OTP expires in {timeLeft} seconds</span>
          ) : (
            <span className="text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              OTP expired
            </span>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateNewOTP}
          disabled={timeLeft > 50} // Prevent spam clicking
          className="flex items-center"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Resend OTP
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
