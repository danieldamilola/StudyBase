'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "@/components/ThemeContext";
import { GraduationCap, Upload, BookOpen, LogIn, LogOut, Menu, Home, FileText, Search, User, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function Nav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading, canUpload } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    {
      href: role ? '/dashboard' : '/',
      label: 'Home',
      icon: Home,
      active: role === 'Student' ? isActive('/dashboard') : isActive('/'),
      show: true,
    },
    {
      href: '/resources',
      label: 'Resources',
      icon: Search,
      active: isActive('/resources'),
      show: true,
    },
    {
      href: '/exams-prep',
      label: 'Exam Prep',
      icon: FileText,
      active: isActive('/exams-prep'),
      show: true,
    },
    {
      href: '/upload',
      label: 'Upload',
      icon: Upload,
      active: isActive('/upload'),
      show: canUpload,
    },
  ];

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={role ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Image src="/logo.jpg" alt="StudyBase Logo" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-foreground text-lg leading-none">StudyBase</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Resource Portal</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.filter(link => link.show).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${link.active
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-muted'
                }`}
            >
              <link.icon className={`w-4 h-4 ${link.active ? 'text-purple-600' : 'text-gray-400'}`} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop Auth Buttons */}
          {!loading && (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                suppressHydrationWarning
              >
                {theme === 'light' ? (
                  <Sun className="h-[1.2rem] w-[1.2rem] text-orange-500 fill-orange-500 transition-all" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem] text-blue-500 fill-blue-500 transition-all" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              {role ? (
                <div className="flex items-center gap-3">
                  <div className="hidden lg:block text-right">
                    <div className="text-xs text-muted-foreground">Logged in as</div>
                    <div className="text-sm font-semibold text-foreground">{role}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="gap-2 font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="vibrant" size="sm" className="gap-2">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-l border-border bg-background">
              <SheetHeader className="p-6 border-b border-border bg-muted/50">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md" suppressHydrationWarning>
                    <Image src="/logo.jpg" alt="StudyBase Logo" width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-foreground">StudyBase</div>
                    <div className="text-xs text-muted-foreground font-medium">Mobile Menu</div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-full overflow-y-auto">
                <nav className="flex-1 p-6 space-y-2">
                  {navLinks.filter(link => link.show).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${link.active
                        ? 'bg-purple-100/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium shadow-sm border border-purple-100 dark:border-purple-800'
                        : 'text-muted-foreground hover:bg-muted hover:text-purple-600 dark:hover:text-purple-400'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.active ? 'bg-purple-200 dark:bg-purple-900/50' : 'bg-muted'}`}>
                        <link.icon className={`w-4 h-4 ${link.active ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground'}`} />
                      </div>
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Section */}
                <div className="p-6 border-t border-border bg-muted/30">
                  {!loading && (
                    <>
                      {role ? (
                        <div className="space-y-4">
                          <div className="px-4 py-3 bg-card rounded-xl border border-border shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold">
                              {role.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Logged in as</p>
                              <p className="font-semibold text-foreground">{role}</p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Link href="/login" onClick={closeMobileMenu}>
                            <Button variant="vibrant" className="w-full gap-2">
                              <LogIn className="w-4 h-4" />
                              Sign In
                            </Button>
                          </Link>
                          <Link href="/signup" onClick={closeMobileMenu}>
                            <Button variant="outline" className="w-full bg-white">
                              Create Account
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
