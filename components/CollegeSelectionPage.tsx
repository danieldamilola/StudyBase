'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Nav } from './nav'
import { Breadcrumb } from './Breadcrumb';
import { Card, CardContent } from './ui/card';
import { Building2, ChevronRight } from 'lucide-react';
import { colleges } from '@/utils/mockData';

export function CollegeSelectionPage() {
  const params = useParams();
  const level = params?.level as string;
  const router = useRouter();

  const breadcrumbItems = [
    { label: `Level ${level}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <span className="text-purple-700 dark:text-purple-300 font-medium">Level {level}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Select Your College</h1>
            <p className="text-lg text-muted-foreground">
              Choose your college to view relevant course materials
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {colleges.map((college) => (
              <Card
                key={college.code}
                variant="academic"
                interactive
                className="cursor-pointer"
                onClick={() => router.push(`/select-department/${level}/${college.code}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/20">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-bold text-sm">
                      {college.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {college.departments.length} departments
                    </p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
