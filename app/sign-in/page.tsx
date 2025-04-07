"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Loader2, Mail } from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
  const {
    requestEmailOtp,
    verifyEmailOtp,
    signInAnonymously,
    loading: authLoading,
    isRedirecting,
  } = useAuth();
  const [isAnonLoading, setIsAnonLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    try {
      setIsAnonLoading(true);
      await signInAnonymously();
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      setError("Failed to sign in anonymously. Please try again.");
    } finally {
      setIsAnonLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsEmailLoading(true);
      setError(null);

      const { success, error } = await requestEmailOtp(email);

      if (success) {
        setOtpSent(true);
      } else if (error) {
        setError(error.message || "Failed to send OTP. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setIsEmailLoading(true);
      setError(null);

      const { success, error } = await verifyEmailOtp(email, otp);

      if (!success && error) {
        setError(
          error.message || "Invalid verification code. Please try again."
        );
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Show loading state during authentication or redirection
  if (authLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/sign-in" />
        <main className="flex-1 flex items-center justify-center py-12 relative overflow-hidden">
          {/* Blurry blob decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Primary colored blob - top right */}
            <div 
              className="absolute top-[-15%] right-[-5%] w-[60%] h-[60%] rounded-full bg-primary/30 blur-[80px] opacity-70 animate-blob"
              style={{ animationDelay: "0s" }}
            />
            {/* Secondary colored blob - bottom left */}
            <div 
              className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px] opacity-60 animate-blob"
              style={{ animationDelay: "2s" }}
            />
            {/* Tertiary colored blob - center right */}
            <div 
              className="absolute bottom-[15%] right-[0%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[80px] opacity-50 animate-blob"
              style={{ animationDelay: "4s" }}
            />
          </div>
          
          <div className="flex flex-col items-center gap-4 p-8 rounded-xl backdrop-blur-md bg-background/30 z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">
              {isRedirecting ? "Redirecting to dashboard..." : "Loading..."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/sign-in" />

      <main className="flex-1 flex items-center justify-center py-12 relative overflow-hidden">
        {/* Blurry blob decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary colored blob - top right */}
          <div 
            className="absolute top-[-15%] right-[-5%] w-[60%] h-[60%] rounded-full bg-primary/30 blur-[80px] opacity-70 animate-blob"
            style={{ animationDelay: "0s" }}
          />
          {/* Secondary colored blob - bottom left */}
          <div 
            className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px] opacity-60 animate-blob"
            style={{ animationDelay: "2s" }}
          />
          {/* Tertiary colored blob - center right */}
          <div 
            className="absolute bottom-[15%] right-[0%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[80px] opacity-50 animate-blob"
            style={{ animationDelay: "4s" }}
          />
        </div>
        
        <Card className="w-full max-w-md mx-auto shadow-lg backdrop-blur-md z-10 bg-background/95">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo.png"
                alt="Izzy Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              Welcome to Izzy
            </CardTitle>
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
                          setOtp("");
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
                  Izzy works without creating an account. Your data is securely
                  stored and you can start practicing immediately. Anonymous
                  user information will be removed after 24 hours.
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

          <CardFooter className="flex flex-col gap-2 justify-center text-sm text-muted-foreground">
            <p>
              By logging in you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
            </p>
            <p className="text-center text-xs">
              Izzy is an academic project. While fully functional, continued
              support is not guaranteed. All data is kept secure.
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
