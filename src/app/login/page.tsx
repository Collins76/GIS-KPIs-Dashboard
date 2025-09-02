
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseAuth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, Auth, FirebaseError } from "firebase/auth";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="1em"
        height="1em"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025A20.02 20.02 0 0 0 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303c-.792 2.443-2.212 4.482-4.123 5.962l6.19 5.238C42.012 36.425 44 30.8 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const handleGoogleSignIn = async () => {
        const { auth } = getFirebaseAuth();
        if (!auth) {
            toast({
                title: "Authentication Not Ready",
                description: "Firebase is not configured correctly. Please check the console.",
                variant: "destructive"
            });
            return;
        }

        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userProfile = {
                name: user.displayName || "Anonymous",
                email: user.email || "no-email@example.com",
                role: "GIS Analyst", // Default role, can be changed in profile
                location: "CHQ", // Default location
                avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`,
            };

            localStorage.setItem('gis-user-profile', JSON.stringify(userProfile));
            toast({
                title: 'Login Successful',
                description: `Welcome, ${userProfile.name}!`,
            });
            router.push('/');
        } catch (error) {
            console.error("Authentication error:", error);
            let errorMessage = "Could not sign in with Google. Please try again.";
            if (error instanceof FirebaseError) {
                errorMessage = error.message;
            }
            toast({
                title: "Authentication Failed",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

  return (
    <div className="min-h-screen font-space bg-black text-white">
      <div className="scrolling-text-container overflow-hidden relative">
        <div className="animate-scroll whitespace-nowrap">
          <span className="inline-block px-6 py-3 scrolling-text-content">
            This GIS KPI Dashboard was designed by Collins Anyanwu - A Guru in GIS, Data Engineering/Analytics and Data Science 🚀 Expert in Geospatial Technologies, Advanced Analytics, and Business Intelligence Solutions.
          </span>
          <span className="inline-block px-6 py-3 scrolling-text-content">
            This GIS KPI Dashboard was designed by Collins Anyanwu - A Guru in GIS, Data Engineering/Analytics and Data Science 🚀 Expert in Geospatial Technologies, Advanced Analytics, and Business Intelligence Solutions.
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="glow-container p-8 w-full max-w-md mx-4 relative z-10">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden animate-pulse-glow">
                  <Zap className="text-white text-4xl animate-float" />
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-sweep"></div>
                </div>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse-glow">
                  <Check className="text-white text-sm" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 font-orbitron animate-neon-glow">Ikeja Electric Plc</h1>
            <p className="text-yellow-400 text-sm font-rajdhani tracking-wide">⚡ GIS KPI Dashboard ⚡</p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              className="glow-button w-full text-lg !bg-blue-600 hover:!bg-blue-700"
            >
              <GoogleIcon className="mr-3" />
              Sign in with Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Ikeja Electric Plc. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              <Shield className="inline-block mr-1 text-green-500" />
              Secure Login System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
