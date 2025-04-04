
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Vote, BarChart, ArrowRight, LockKeyhole, BookOpen, FaceIcon } from 'lucide-react';
import Layout from '@/components/Layout';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-6 sm:text-5xl">
              Secure Blockchain Voting System with Facial Recognition
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A transparent, secure, and tamper-proof electoral system using cutting-edge technology
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/registration')}>
                Register to Vote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/vote')}>
                Access Voting System
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tamper-Proof Security</h3>
                <p className="text-muted-foreground">
                  All votes are stored on a decentralized blockchain, making them immutable and resistant to tampering.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <FaceIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Facial Verification</h3>
                <p className="text-muted-foreground">
                  Advanced facial recognition ensures only eligible registered voters can access the system.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Results</h3>
                <p className="text-muted-foreground">
                  View election results in real-time with detailed analytics and blockchain verification.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg overflow-hidden">
              <img 
                src="/lovable-uploads/3b40358e-fcb4-4f00-a793-d500b39c474d.png" 
                alt="Secure Voting Process Flow" 
                className="w-full"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium mb-2">Complete Voting Process Flow</h3>
              <p className="text-sm text-muted-foreground">
                Our secure voting system follows a comprehensive multi-step verification process
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Our system combines facial recognition, two-factor authentication, and blockchain technology
              to create a secure and transparent voting experience.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-medium mb-2">Registration</h3>
              <p className="text-sm text-muted-foreground">
                Voters register with personal information and facial biometrics for identity verification.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-medium mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Multi-factor authentication with facial recognition and OTP verification.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-medium mb-2">Secure Voting</h3>
              <p className="text-sm text-muted-foreground">
                Voters cast encrypted votes that are processed and verified by the blockchain network.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="font-medium mb-2">Verification</h3>
              <p className="text-sm text-muted-foreground">
                All votes are recorded on a public blockchain ledger that can be independently verified.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Security Features</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Immutable blockchain record of all votes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Advanced biometric identity verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Encrypted end-to-end communication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Two-factor authentication with OTP</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Technical Specifications</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Ethereum-based smart contracts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">Zero-knowledge proofs for vote privacy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">TensorFlow-based facial recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-0.5 bg-green-100 text-green-600 mt-1">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">IPFS decentralized storage</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <Button size="lg" onClick={() => navigate('/registration')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
