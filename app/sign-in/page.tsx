'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, User, Loader2 } from 'lucide-react';

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

export default function SignInPage() {
  const { signInAnonymously } = useAuth();
  const [isAnonLoading, setIsAnonLoading] = useState(false);

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
          <CardContent className="grid gap-4">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Izzy works without creating an account. Your data is securely stored and you can start practicing immediately.
            </p>
            <Button 
              className="h-12" 
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