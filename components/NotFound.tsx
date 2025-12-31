'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { FileQuestion } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export function NotFound() {
  const { role } = useUserRole();
  const homeLink = role === 'Student' ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <FileQuestion className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href={homeLink}>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
