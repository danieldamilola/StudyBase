'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap, Mail, Lock, User, ArrowLeft, Building, Loader2 } from 'lucide-react';
import { departments } from '@/utils/mockData';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords match error",
        description: "Passwords do not match!",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            department: department
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      // Students go to dashboard (with level selection), others go to upload
      if (role === 'Student') {
        router.push('/dashboard');
      } else {
        router.push('/upload');
      }
      router.refresh(); // Refresh to update auth state
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || 'Unknown error',
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
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 py-10">
        <div className="w-full max-w-lg">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 hover:bg-white/50" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg shadow-purple-200">
                <Image src="/logo.jpg" alt="StudyBase Logo" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-base mt-2">
                Join our academic community today
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500 transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium ml-1">Role</Label>
                    <Select onValueChange={setRole} required>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Class Rep">Class Rep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium ml-1">Department</Label>
                    <Select onValueChange={setDepartment} required>
                      <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500">
                        <SelectValue placeholder="Select dept" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••"
                        className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium ml-1">Confirm</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••"
                        className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-purple-500 transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-500">Already have an account? </span>
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                    Sign in instead
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
