'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { GraduationCap, Mail, Lock, User, Shield, BookOpen, ArrowRight, Sparkles, FileText, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function UniversityLandingPage() {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
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
        description: "You've successfully signed in.",
        variant: "default",
      });

      // Redirect based on role
      const userRole = data.user?.user_metadata?.role;
      if (userRole === 'Student') {
        router.push('/dashboard');
      } else {
        router.push('/upload');
      }
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-black dark:via-zinc-950 dark:to-zinc-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 dark:bg-purple-800/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300">
              <Image src="/logo.jpg" alt="StudyBase Logo" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-foreground text-lg">StudyBase</div>
              <div className="text-xs text-muted-foreground font-medium">University Resource Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowSignup(false)}
              className={`transition-all ${!showSignup ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'hover:bg-muted text-foreground'}`}
            >
              Sign In
            </Button>
            <Button
              variant="vibrant"
              onClick={() => setShowSignup(true)}
              className={showSignup ? '' : 'bg-primary text-primary-foreground'}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Message */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">Mountain Top University</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Access Your <br />
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 dark:from-purple-400 dark:via-purple-500 dark:to-indigo-400 bg-clip-text text-transparent">
                  Academic Resources
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Your centralized platform for course materials, lecture notes, past questions, and academic resources.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <Card variant="glass" interactive className="p-4 gap-3 bg-white/70">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Lecture Notes</h3>
                    <p className="text-xs text-muted-foreground mt-1">All departments</p>
                  </div>
                </Card>
                <Card variant="glass" interactive className="p-4 gap-3 bg-indigo-50/70 dark:bg-indigo-900/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Past Questions</h3>
                    <p className="text-xs text-muted-foreground mt-1">Exam prep ready</p>
                  </div>
                </Card>
                <Card variant="glass" interactive className="p-4 gap-3 bg-white/70">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Community</h3>
                    <p className="text-xs text-muted-foreground mt-1">15,000+ students</p>
                  </div>
                </Card>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Secure Access</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm">Role-Based</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto order-1 lg:order-2">
              <Card variant="glass" className="border-0 shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg">
                    <Image src="/logo.jpg" alt="StudyBase Logo" width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {showSignup ? 'Create Account' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {showSignup
                      ? 'Register with your university email'
                      : 'Sign in to access your resources'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {showSignup ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        New to StudyBase? Create your account to start accessing academic resources.
                      </p>
                      <Link href="/signup">
                        <Button variant="vibrant" className="w-full gap-2 text-base" size="lg">
                          Create Your Account
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </Link>
                      <div className="text-center text-sm text-muted-foreground pt-4">
                        Already have an account?{' '}
                        <Button
                          variant="link"
                          onClick={() => setShowSignup(false)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold p-0 h-auto"
                        >
                          Sign in instead
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@mtu.edu.ng"
                            className="pl-11 h-12 bg-background border-input focus:bg-background text-foreground"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-11 h-12 bg-background border-input focus:bg-background text-foreground"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        variant="vibrant"
                        className="w-full text-base"
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                      <div className="text-center text-sm text-muted-foreground pt-2">
                        Don&apos;t have an account?{' '}
                        <Button
                          variant="link"
                          type="button"
                          onClick={() => setShowSignup(true)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold p-0 h-auto"
                        >
                          Sign up here
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Info Badge */}
              <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">University Access Only</span> — Use your official @mtu.edu.ng email if avaliable
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-white/50 dark:bg-black/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p>© 2025 StudyBase - Mountain Top University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
