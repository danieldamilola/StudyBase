'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { GraduationCap, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Success - redirect based on role
      const userRole = data.user?.user_metadata?.role;

      // Students go to dashboard (with level selection), others go to upload
      if (userRole === 'Student') {
        router.push('/dashboard');
      } else {
        router.push('/upload');
      }
      router.refresh(); // Refresh to update auth state
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || 'Invalid email or password',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-purple-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-indigo-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-8 hover:bg-white/50" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card variant="academic" className="border-0 shadow-2xl shadow-slate-200/80 dark:shadow-black/40">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg shadow-purple-500/10 hover:scale-105 transition-transform duration-300">
                <Image src="/logo.jpg" alt="StudyBase Logo" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to access your course materials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium ml-1">University Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@mtu.edu.ng"
                      className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium ml-1">Password</Label>
                    <Link href="#" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="vibrant"
                  className="w-full h-12"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-500">Don&apos;t have an account? </span>
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                    Create Account
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-xs text-gray-400">
            © 2025 StudyBase. Mountain Top University.
          </div>
        </div>
      </div>
    </div>
  );
}
