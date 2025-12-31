'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Nav } from './nav';
import { Breadcrumb } from './Breadcrumb';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colleges } from '@/utils/mockData';

export function DepartmentSelectionPage() {
  const params = useParams();
  const level = params?.level as string;
  const collegeCode = params?.college as string;
  const router = useRouter();
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const selectedCollege = colleges.find((c) => c.code === collegeCode);

  const breadcrumbItems = [
    { label: `Level ${level}`, href: `/select-college/${level}` },
    { label: selectedCollege?.name || collegeCode },
  ];

  // Fetch file counts from Supabase
  useEffect(() => {
    const fetchFileCounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('files')
          .select('department')
          .eq('level', level);

        if (error) {
          console.error('Error fetching file counts:', error);
          return;
        }

        // Count files by department
        const counts: Record<string, number> = {};
        (data || []).forEach((file: { department: string }) => {
          counts[file.department] = (counts[file.department] || 0) + 1;
        });

        setFileCounts(counts);
      } catch (error) {
        console.error('Error fetching file counts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (level) {
      fetchFileCounts();
    }
  }, [level]);

  if (!selectedCollege) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">College not found</h2>
          <Button
            variant="link"
            onClick={() => router.push('/dashboard')}
            className="text-purple-600 hover:text-purple-700"
          >
            Go back to Home
          </Button>
        </div>
      </div>
    );
  }

  const getFileCount = (departmentName: string) => {
    return fileCounts[departmentName] || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <span className="text-purple-700 dark:text-purple-300 font-medium">Level {level}</span>
              <span className="text-purple-400">•</span>
              <span className="text-purple-700 dark:text-purple-300 font-medium">{selectedCollege.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Select Your Department</h1>
            <p className="text-lg text-muted-foreground">
              Choose your department to access course materials
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-border animate-pulse bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-muted rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedCollege.departments.map((department) => {
                const fileCount = getFileCount(department.name);
                return (
                  <Card
                    key={department.code}
                    variant="academic"
                    interactive
                    className={`cursor-pointer ${fileCount === 0 ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    onClick={() => {
                      if (fileCount > 0) {
                        router.push(`/select-programme/${level}/${collegeCode}/${encodeURIComponent(department.name)}`);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/10">
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-foreground mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-bold">
                              {department.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {fileCount} {fileCount === 1 ? 'resource' : 'resources'} available
                            </p>
                          </div>
                        </div>
                        {fileCount > 0 && (
                          <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
