'use client';

import { useState, useMemo, useEffect } from 'react';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Nav } from './nav';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Search, Download, FileText, Calendar, User, Filter, X, Maximize2, BookOpen, GraduationCap, LayoutGrid, List } from 'lucide-react';
import { FileItem, departments, fileTypes, collegeNames, colleges, getProgrammesForDepartment } from '@/utils/mockData';
import { supabase } from '@/lib/supabase';
import { FilePreviewModal } from './FilePreviewModal';
import { toast } from '@/hooks/use-toast';

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || 'all');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedUploader, setSelectedUploader] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState(searchParams.get('college') || 'all');
  const [selectedProgramme, setSelectedProgramme] = useState(searchParams.get('programme') || 'all');
  const [courseCode, setCourseCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch files from Supabase with optimized query
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);

        // Build query with database-level filtering for better performance
        let query = supabase
          .from('files')
          .select('id, title, course_code, description, department, college, level, uploaded_by, uploader_role, date, file_type, tags, downloads, status, semester, file_url, programme', { count: 'exact' })
          .eq('status', 'approved'); // Only fetch approved files

        // Apply filters at database level
        if (selectedDepartment !== 'all') {
          query = query.eq('department', selectedDepartment);
        }
        if (selectedLevel !== 'all') {
          query = query.eq('level', selectedLevel);
        }
        if (selectedFileType !== 'all') {
          query = query.eq('file_type', selectedFileType);
        }
        if (selectedUploader !== 'all') {
          query = query.eq('uploader_role', selectedUploader);
        }
        if (selectedCollege !== 'all') {
          query = query.eq('college', selectedCollege);
        }
        if (courseCode) {
          query = query.ilike('course_code', `%${courseCode}%`);
        }
        if (selectedProgramme !== 'all') {
          query = query.ilike('programme', `%${selectedProgramme}%`);
        }

        // Order and limit for pagination
        const { data, error, count } = await query
          .order('date', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) {
          console.error('Error fetching files:', error);
          toast({
            title: "Error fetching resources",
            description: "Please check your internet connection and try again.",
            variant: "destructive"
          });
          return;
        }

        // Transform Supabase data to match FileItem interface
        const transformedFiles: FileItem[] = (data || []).map((file: any) => ({
          id: file.id.toString(),
          title: file.title,
          courseCode: file.course_code,
          description: file.description || '',
          department: file.department,
          college: file.college,
          level: file.level,
          uploadedBy: file.uploaded_by,
          uploaderRole: file.uploader_role,
          date: file.date,
          fileType: file.file_type,
          tags: file.tags || [],
          downloads: file.downloads || 0,
          status: file.status || 'pending',
          semester: file.semester,
          file_url: file.file_url,
          programme: file.programme
        }));

        setFiles(transformedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [selectedDepartment, selectedLevel, selectedFileType, selectedUploader, selectedCollege, selectedProgramme, courseCode, currentPage]);

  // Define colleges with their departments - use real data
  // Get departments based on selected college
  const availableDepartments = selectedCollege === 'all'
    ? departments
    : colleges.find(c => c.name === selectedCollege)?.departments.map(d => d.name) || [];

  // Get programmes based on selected department
  const availableProgrammes = selectedDepartment === 'all' || selectedCollege === 'all'
    ? []
    : getProgrammesForDepartment(selectedCollege, selectedDepartment);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedFiles = files;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, selectedLevel, selectedFileType, selectedUploader, selectedCollege, selectedProgramme, courseCode]);

  const clearFilters = () => {
    setSelectedCollege('all');
    setSelectedDepartment('all');
    setSelectedLevel('all');
    setSelectedFileType('all');
    setSelectedUploader('all');
    setSelectedProgramme('all');
    setCourseCode('');
    setSearchQuery('');
    toast({
      title: "Filters cleared",
      description: "Showing all available resources resources.",
    });
  };

  const handlePreviewClick = (file: FileItem) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (file: FileItem) => {
    if (file.file_url) {
      window.open(file.file_url, '_blank');
      // Increment download count
      try {
        await supabase
          .from('files')
          .update({ downloads: (file.downloads || 0) + 1 })
          .eq('id', parseInt(file.id));

        // Optimistically update UI
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, downloads: (f.downloads || 0) + 1 } : f
        ));
      } catch (error) {
        console.error('Error updating download count:', error);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    // Add more specific icons if needed
    return <FileText className="w-5 h-5 text-purple-600" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* Hero Header */}
      <div className="bg-card/50 backdrop-blur-md border-b sticky top-[65px] z-40 transition-all duration-300 shadow-sm shadow-slate-200/50 dark:shadow-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">
              Academic Resources
            </h1>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4 group-focus-within:text-purple-600 transition-colors" />
              <Input
                type="text"
                placeholder="Search materials, courses, tags..."
                className="pl-10 h-10 border-slate-200/60 bg-background/50 focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-purple-600' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                <span className="text-xs font-semibold">Grid</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-purple-600' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-1.5" />
                <span className="text-xs font-semibold">List</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Modern Glassmorphism */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-40 max-h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-card backdrop-blur-md rounded-2xl border border-border shadow-xl shadow-purple-900/5 p-6 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-600" /> Filter Discovery
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[10px] h-6 px-2 text-muted-foreground hover:text-red-600 uppercase tracking-wider font-bold">
                    Reset
                  </Button>
                </div>

                {/* Collapsible Filter Sections could go here, staying expanded for now for ease of use */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">College</label>
                    <Select value={selectedCollege} onValueChange={(val) => {
                      setSelectedCollege(val); setSelectedDepartment('all'); setSelectedProgramme('all');
                    }}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select College" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">All Colleges</SelectItem>
                        {colleges.map((c) => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</label>
                    <Select value={selectedDepartment} onValueChange={(val) => {
                      setSelectedDepartment(val); setSelectedProgramme('all');
                    }} disabled={selectedCollege === 'all'}>
                      <SelectTrigger className="bg-gray-50/50 border-gray-200">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">All Departments</SelectItem>
                        {availableDepartments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {availableProgrammes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</label>
                      <Select value={selectedProgramme} onValueChange={setSelectedProgramme} disabled={selectedDepartment === 'all'}>
                        <SelectTrigger className="bg-gray-50/50 border-gray-200">
                          <SelectValue placeholder="All Programmes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Programmes</SelectItem>
                          {availableProgrammes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Level & Course</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="bg-gray-50/50 border-gray-200">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {['100', '200', '300', '400', '500'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Code"
                        className="bg-gray-50/50 border-gray-200"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-h-[500px]">
            <div className="mb-4 text-sm text-gray-500 flex items-center justify-between">
              <span>Showing {paginatedFiles.length} of {totalCount} resources</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : paginatedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No resources found</h3>
                <p className="text-muted-foreground text-sm max-w-sm text-center mt-2">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {paginatedFiles.map((file) => (
                  <Card
                    key={file.id}
                    variant="academic"
                    interactive
                    className={`group border-slate-200/60 dark:border-zinc-800/60 overflow-hidden cursor-pointer ${viewMode === 'list' ? 'flex items-center p-2' : ''}`}
                    onClick={() => router.push(`/file/${file.id}`)}
                  >
                    <div className={viewMode === 'list' ? 'hidden' : 'h-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity'}></div>
                    <CardContent className={viewMode === 'list' ? 'p-4 flex items-center gap-6 w-full' : 'p-6'}>
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        {getFileIcon(file.fileType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground truncate group-hover:text-purple-600 transition-colors pr-2">
                              {file.title}
                            </h3>
                            <p className="text-sm font-medium text-purple-600/80 mb-1">{file.courseCode}</p>
                          </div>
                        </div>

                        <div className={`flex flex-wrap gap-y-1 gap-x-3 text-xs text-muted-foreground mt-2 ${viewMode === 'list' ? 'items-center' : ''}`}>
                          <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                            <User className="w-3 h-3" /> {file.uploadedBy}
                          </span>
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                            <Calendar className="w-3 h-3" /> {new Date(file.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                            <Download className="w-3 h-3" /> {file.downloads}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewClick(file);
                          }}
                        >
                          <Maximize2 className="w-4 h-4 mr-1" /> Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100 rounded-full'}
                      />
                    </PaginationItem>

                    {/* Simplified Pagination logic for better UI */}
                    <div className="hidden sm:flex items-center">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show window around current page
                        let p = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          p = currentPage - 2 + i;
                          if (p > totalPages) p = totalPages - (4 - i);
                        }
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={currentPage === p}
                              onClick={() => setCurrentPage(p)}
                              className={`cursor-pointer rounded-full w-8 h-8 ${currentPage === p ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-gray-100'}`}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                    </div>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100 rounded-full'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>

      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  );
}