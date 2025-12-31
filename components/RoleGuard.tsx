'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from './ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ['Lecturer', 'Class Rep', 'Admin']
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        const role = user.user_metadata?.role;
        setUserRole(role);
        
        if (!role || !allowedRoles.includes(role)) {
          setHasAccess(false);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Role check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            {userRole && (
              <p className="text-sm text-gray-500 mb-6">
                Your current role: <span className="font-semibold">{userRole}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mb-6">
              This page is only accessible to: {allowedRoles.join(', ')}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Go Home
              </Button>
              <Button onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

