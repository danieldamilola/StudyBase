'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Nav } from './nav';
import { Breadcrumb } from './Breadcrumb';
import { Card, CardContent } from './ui/card';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colleges, getProgrammesForDepartment } from '@/utils/mockData';

export function ProgrammeSelectionPage() {
  const params = useParams();
  const level = params?.level as string;
  const collegeCode = params?.college as string;
  const departmentName = decodeURIComponent(params?.department as string);
  const router = useRouter();
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Get the college object
  const selectedCollege = colleges.find((c) => c.code === collegeCode);
  const programmes = selectedCollege ? getProgrammesForDepartment(selectedCollege.name, departmentName) : [];

  const breadcrumbItems = [
    { label: `Level ${level}`, href: `/select-college/${level}` },
    { label: selectedCollege?.name || collegeCode, href: `/select-department/${level}/${collegeCode}` },
    { label: departmentName },
  ];

  // Fetch file counts from Supabase
  useEffect(() => {
    const fetchFileCounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('files')
          .select('programme');

        if (error) {
          console.error('Error fetching file counts:', error);
          return;
        }

        // Count files by programme
        const counts: Record<string, number> = {};
        (data || []).forEach((file: { programme: string | null }) => {
          if (file.programme) {
            // Handle comma-separated programmes
            const progs = file.programme.split(',').map((p: string) => p.trim());
            progs.forEach((prog: string) => {
              counts[prog] = (counts[prog] || 0) + 1;
            });
          }
        });

        setFileCounts(counts);
      } catch (error) {
        console.error('Error fetching file counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFileCounts();
  }, []);

  if (!selectedCollege) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">College not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-600 hover:text-purple-700"
          >
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  if (programmes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="text-center py-16">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No programmes found</h2>
            <button
              onClick={() => router.back()}
              className="text-purple-600 hover:text-purple-700"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4 flex-wrap justify-center">
              <span className="text-purple-700 dark:text-purple-300 font-medium">Level {level}</span>
              <span className="text-purple-400">•</span>
              <span className="text-purple-700 dark:text-purple-300 font-medium">{departmentName}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Select Your Programme</h1>
            <p className="text-lg text-muted-foreground">
              Choose your programme to view relevant course materials
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border animate-pulse bg-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-muted rounded-lg mb-4" />
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programmes.map((programme) => (
                <Card
                  key={programme}
                  variant="academic"
                  interactive
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(`/resources?level=${level}&college=${encodeURIComponent(selectedCollege.name)}&department=${encodeURIComponent(departmentName)}&programme=${encodeURIComponent(programme)}`);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/10">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-bold text-sm">
                        {programme}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {fileCounts[programme] || 0} resources
                      </p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
