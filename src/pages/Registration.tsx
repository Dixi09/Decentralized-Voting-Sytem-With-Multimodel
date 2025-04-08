
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { User, Camera, Mail, Phone, Home, Calendar, FileCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import StepIndicator from '@/components/vote/StepIndicator';

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    dateOfBirth: '',
    idNumber: '',
    selfieUploaded: false,
    idUploaded: false
  });
  
  const steps = [
    { id: 1, label: "Personal" },
    { id: 2, label: "Address" },
    { id: 3, label: "Identity" },
    { id: 4, label: "Confirm" }
  ];
  
  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'selfieUploaded' | 'idUploaded') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, you would upload this file to a server
      updateFormData(fieldName, true);
      toast({
        title: fieldName === 'selfieUploaded' ? "Photo Uploaded" : "ID Document Uploaded",
        description: fieldName === 'selfieUploaded' ? 
          "Your photo has been successfully uploaded." : 
          "Your ID document has been successfully uploaded.",
      });
    }
  };
  
  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Incomplete Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return false;
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return false;
      }
      
      // Simple phone validation
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.address || !formData.city || !formData.state || !formData.postalCode) {
        toast({
          title: "Incomplete Address",
          description: "Please fill in all address fields.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (step === 3) {
      if (!formData.dateOfBirth || !formData.idNumber) {
        toast({
          title: "Incomplete Information",
          description: "Please provide your date of birth and ID number.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!formData.selfieUploaded) {
        toast({
          title: "Photo Required",
          description: "Please upload a photo for facial recognition.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!formData.idUploaded) {
        toast({
          title: "ID Document Required",
          description: "Please upload your government ID document.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsLoading(true);
    
    // Simulate API call to register user
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Registration Successful",
        description: "Your voter registration has been completed. You can now access the voting system.",
      });
      navigate('/vote');
    }, 2000);
  };
  
  const renderPersonalInfoStep = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              placeholder="John"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              placeholder="Doe"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="john.doe@example.com"
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="(123) 456-7890"
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>
    );
  };
  
  const renderAddressStep = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <div className="relative">
            <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              placeholder="123 Main St"
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="Anytown"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData('state', e.target.value)}
              placeholder="CA"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateFormData('postalCode', e.target.value)}
              placeholder="12345"
              required
            />
          </div>
        </div>
      </div>
    );
  };
  
  const renderIdentityStep = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="idNumber">Government ID Number</Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => updateFormData('idNumber', e.target.value)}
            placeholder="ID-1234567890"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter your national ID, driver's license, or passport number.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="selfie">Upload Photo for Facial Recognition</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm mb-2">
              Upload a clear photo of your face for identity verification
            </p>
            <Input
              id="selfie"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'selfieUploaded')}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('selfie')?.click()}
            >
              Choose File
            </Button>
            <p className="text-xs mt-2 text-muted-foreground">
              {formData.selfieUploaded ? "Photo uploaded" : "No file chosen"}
            </p>
          </div>
        </div>
        
        {/* Added ID document upload section */}
        <div className="space-y-2">
          <Label htmlFor="idDocument">Upload Government ID Document</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <FileCheck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm mb-2">
              Upload a scan/photo of your government ID document
            </p>
            <Input
              id="idDocument"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'idUploaded')}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('idDocument')?.click()}
            >
              Choose File
            </Button>
            <p className="text-xs mt-2 text-muted-foreground">
              {formData.idUploaded ? "Document uploaded" : "No file chosen"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </p>
        </div>
      </div>
    );
  };
  
  const renderConfirmationStep = () => {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4 bg-slate-50">
          <h4 className="font-medium mb-2">Personal Information</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Name:</div>
            <div>{formData.firstName} {formData.lastName}</div>
            <div className="text-muted-foreground">Email:</div>
            <div>{formData.email}</div>
            <div className="text-muted-foreground">Phone:</div>
            <div>{formData.phone}</div>
          </div>
        </div>
        
        <div className="rounded-lg border p-4 bg-slate-50">
          <h4 className="font-medium mb-2">Address</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Street:</div>
            <div>{formData.address}</div>
            <div className="text-muted-foreground">City:</div>
            <div>{formData.city}</div>
            <div className="text-muted-foreground">State/Postal:</div>
            <div>{formData.state}, {formData.postalCode}</div>
          </div>
        </div>
        
        <div className="rounded-lg border p-4 bg-slate-50">
          <h4 className="font-medium mb-2">Identity Information</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Date of Birth:</div>
            <div>{formData.dateOfBirth}</div>
            <div className="text-muted-foreground">ID Number:</div>
            <div>{formData.idNumber}</div>
            <div className="text-muted-foreground">Photo:</div>
            <div>{formData.selfieUploaded ? "Uploaded" : "Not uploaded"}</div>
            <div className="text-muted-foreground">ID Document:</div>
            <div>{formData.idUploaded ? "Uploaded" : "Not uploaded"}</div>
          </div>
        </div>
        
        <div className="rounded-lg border p-4 bg-slate-100">
          <div className="flex items-start space-x-2">
            <div className="bg-primary/10 rounded-full p-1 mt-0.5">
              <User className="h-3 w-3 text-primary" />
            </div>
            <p className="text-sm">
              By clicking "Complete Registration", you agree to our Terms of Service
              and Privacy Policy. Your information will be securely stored and 
              used only for voting authentication purposes.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderAddressStep();
      case 3:
        return renderIdentityStep();
      case 4:
        return renderConfirmationStep();
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Voter Registration</h1>
        <p className="text-center mb-6 text-muted-foreground">
          Complete this registration to verify your identity and access the secure voting system
        </p>
        
        <div className="max-w-lg mx-auto">
          <StepIndicator currentStep={step} steps={steps} />
          
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Personal Information"}
                {step === 2 && "Residential Address"}
                {step === 3 && "Identity Verification"}
                {step === 4 && "Review and Submit"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Enter your personal information"}
                {step === 2 && "Provide your residential address"}
                {step === 3 && "Verify your identity with government ID and a photo"}
                {step === 4 && "Review and confirm your information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1}
              >
                Back
              </Button>
              
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Registration;
