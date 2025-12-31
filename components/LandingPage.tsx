'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from './nav';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, BookOpen, FileText, GraduationCap, Users, Clock, ArrowRight, Zap, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { supabase } from '@/lib/supabase';
import { Badge } from './ui/badge';
import Link from 'next/link';

export function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState([
    { label: 'Resources', value: '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Courses', value: '0', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Departments', value: '0', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ]);

  const handleSearch = () => {
    router.push(`/resources?q=${encodeURIComponent(searchQuery)}`);
  };

  const levels = [
    { label: 'Level 100', value: '100', color: 'from-purple-500 to-indigo-500', icon: BookOpen },
    { label: 'Level 200', value: '200', color: 'from-indigo-500 to-blue-500', icon: BookOpen },
    { label: 'Level 300', value: '300', color: 'from-blue-500 to-cyan-500', icon: FileText },
    { label: 'Level 400', value: '400', color: 'from-cyan-500 to-teal-500', icon: GraduationCap },
    { label: 'Level 500', value: '500', color: 'from-teal-500 to-emerald-500', icon: GraduationCap },
  ];

  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  // Fetch stats and recent files using Promise.all for efficiency
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching
        const [
          { count: totalFiles },
          { data: courseData },
          { data: deptData },
          { data: recentData }
        ] = await Promise.all([
          // 1. Total Files Count
          supabase.from('files').select('*', { count: 'exact', head: true }),

          // 2. Courses Count
          supabase.from('files').select('course_code'),

          // 3. Departments Data
          supabase.from('files').select('department'),

          // 4. Recent Files (Fetch top 3 most recent)
          supabase
            .from('files')
            .select('id, title, course_code, department')
            .order('date', { ascending: false })
            .limit(3)
        ]);

        // Process Unique Courses
        const uniqueCourses = new Set((courseData || []).map((f: { course_code: string }) => f.course_code).filter(Boolean));

        // Process Unique Departments
        const uniqueDepts = new Set((deptData || []).map((f: { department: string }) => f.department).filter(Boolean));

        // Update Stats State
        setStats([
          { label: 'Resources', value: totalFiles ? `${totalFiles.toLocaleString()}` : '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Courses', value: `${uniqueCourses.size}`, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Departments', value: `${uniqueDepts.size}`, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ]);

        // Update Recent Files State
        if (recentData) {
          setRecentFiles(recentData);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero / Dashboard Header */}
      <section className="bg-background py-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply opacity-50"></div>
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply opacity-50"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Study Materials</span>
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto shadow-lg shadow-purple-900/5 rounded-xl">
              <div className="relative flex items-center bg-card rounded-xl border border-border overflow-hidden p-1.5">
                <Search className="absolute left-6 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search course code, title, or topic..."
                  className="pl-12 pr-32 py-4 text-base border-0 focus-visible:ring-0 shadow-none h-14 bg-transparent placeholder:text-muted-foreground text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  variant="vibrant"
                  className="absolute right-2 top-2 bottom-2 rounded-lg px-6"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} variant="glass" className="border-border/50 bg-card/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Access Levels
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {levels.map((level) => (
              <Link key={level.value} href={`/select-college/${level.value}`} className="block group">
                <Card interactive className="h-full border-border bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-2 bg-gradient-to-r ${level.color}`}></div>
                    <div className="p-5 text-center">
                      <div className={`w-10 h-10 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors`}>
                        <level.icon className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="font-bold text-foreground mb-1">{level.label}</div>
                      <div className="text-xs text-muted-foreground">View materials</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Link href="/exams-prep" className="block group">
              <Card interactive className="h-full border-border bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                  <div className="p-5 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="font-bold text-foreground mb-1">Exam Prep</div>
                    <div className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">Past Questions</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Featured/Recent Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Resources</CardTitle>
                <CardDescription>Latest materials uploaded across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFiles.length > 0 ? (
                    recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group border border-transparent hover:border-border/50"
                        onClick={() => router.push(`/file/${file.id}`)}
                      >
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-sm text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors truncate">
                              {file.title}
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-1.5 py-0.5 rounded-sm">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                            <span className="font-medium text-foreground/70">{file.course_code}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{file.department}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No recent resources found.
                    </div>
                  )}
                  <Button variant="ghost" className="w-full text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => router.push('/resources')}>
                    View All Resources <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-0 shadow-lg rounded-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-300" />
                  Academic Network
                </CardTitle>
                <CardDescription className="text-indigo-200">Connect with your faculty</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Users className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">University-wide student access</div>
                        <div className="text-xs text-indigo-200">Across all 5 levels</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <GraduationCap className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Multi-department academic community</div>
                        <div className="text-xs text-indigo-200">Resource sharing network</div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white border-0 rounded-lg">
                    Browse Departments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
