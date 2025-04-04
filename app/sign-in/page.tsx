'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, User, Loader2, Mail } from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

export default function SignInPage() {
  const { requestEmailOtp, verifyEmailOtp, signInAnonymously } = useAuth();
  const [isAnonLoading, setIsAnonLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    try {
      setIsAnonLoading(true);
      await signInAnonymously();
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    } finally {
      setIsAnonLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsEmailLoading(true);
      setError(null);
      
      const { success, error } = await requestEmailOtp(email);
      
      if (success) {
        setOtpSent(true);
      } else if (error) {
        setError(error.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsEmailLoading(true);
      setError(null);
      
      const { success, error } = await verifyEmailOtp(email, otp);
      
      if (!success && error) {
        setError(error.message || 'Invalid verification code. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/sign-in" />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Izzy</CardTitle>
            <CardDescription>
              Sign in to prepare for your next interview
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid grid-cols-2 mx-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="anonymous">Anonymous</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <CardContent className="grid gap-4 pt-4">
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isEmailLoading}
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="text-sm font-medium text-destructive">
                        {error}
                      </div>
                    )}
                    
                    <Button 
                      type="submit"
                      className="w-full h-10"
                      disabled={isEmailLoading || !email}
                    >
                      {isEmailLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Send Verification Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={isEmailLoading}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We sent a verification code to {email}
                      </p>
                    </div>
                    
                    {error && (
                      <div className="text-sm font-medium text-destructive">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        type="submit"
                        className="w-full h-10"
                        disabled={isEmailLoading || !otp}
                      >
                        {isEmailLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        Verify Code
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setError(null);
                        }}
                      >
                        Use a different email
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </TabsContent>
            
            <TabsContent value="anonymous">
              <CardContent className="grid gap-4 pt-4">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Izzy works without creating an account. Your data is securely stored and you can start practicing immediately.
                </p>
                <Button 
                  className="h-10" 
                  disabled={isAnonLoading}
                  onClick={handleAnonymousSignIn}
                >
                  {isAnonLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <User className="mr-2 h-4 w-4" />
                  )}
                  Continue Anonymously
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>
              Your data will be saved locally {" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}