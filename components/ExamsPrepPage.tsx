'use client';

import { useState, useMemo, useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from './nav';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Search, Download, FileText, Calendar, User, Filter, X, BookOpen } from 'lucide-react';
import { FileItem, departments, fileTypes, collegeNames } from '@/utils/mockData';
import { supabase } from '@/lib/supabase';

export function ExamsPrepPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDownload = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file.file_url) return;
    
    // Open file in new tab
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
  };

  // Fetch files from Supabase - optimized with database filtering
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        
        // Build query with database-level filtering for exam files
        let query = supabase
          .from('files')
          .select('id, title, course_code, description, department, college, level, uploaded_by, uploader_role, date, file_type, tags, downloads, status, semester, file_url', { count: 'exact' })
          .eq('status', 'approved')
          .or('tags.cs.{exam,past question,past questions},title.ilike.%past question%,title.ilike.%exam%');

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

        // Apply search query at database level
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,course_code.ilike.%${searchQuery}%`);
        }

        // Order and paginate
        const { data, error } = await query
          .order('date', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) {
          console.error('Error fetching files:', error);
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
          file_url: file.file_url
        }));

        setFiles(transformedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchFiles();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [selectedDepartment, selectedLevel, selectedFileType, searchQuery, currentPage]);

  const totalPages = Math.ceil(files.length / itemsPerPage);
  const paginatedFiles = files;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, selectedLevel, selectedFileType]);

  const clearFilters = () => {
    setSelectedDepartment('all');
    setSelectedLevel('all');
    setSelectedFileType('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full mb-4 shadow-md has-shadow">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-700 dark:text-purple-300 font-semibold">Exams Preparation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 dark:from-purple-400 dark:via-purple-500 dark:to-indigo-400 bg-clip-text text-transparent mb-2">Past Questions & Exam Materials</h1>
          <p className="text-lg text-muted-foreground">
            Access past examination questions and exam preparation materials
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search past questions, exam materials…"
              className="pl-12 pr-4 py-6 rounded-xl border-border shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-card text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card className="sticky top-24 overflow-visible bg-card border-border">
              <CardContent className="p-6 overflow-visible">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-foreground font-medium">Filters</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Separator className="mb-4 bg-border" />

                <div className="space-y-5 overflow-visible">
                  <div className="relative z-10">
                    <Label className="text-sm text-muted-foreground mb-2 block">Department</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-[200px] z-[10000] bg-popover text-popover-foreground border-border">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative z-10">
                    <Label className="text-sm text-muted-foreground mb-2 block">Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-[200px] z-[10000] bg-popover text-popover-foreground border-border">
                        <SelectItem value="all">All Levels</SelectItem>
                        {['100', '200', '300', '400', '500'].map((level) => (
                          <SelectItem key={level} value={level}>Level {level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative z-10">
                    <Label className="text-sm text-muted-foreground mb-2 block">File Type</Label>
                    <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-[200px] z-[10000] bg-popover text-popover-foreground border-border">
                        <SelectItem value="all">All Types</SelectItem>
                        {fileTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-foreground mb-2 text-xl font-semibold">
                {files.length} {files.length === 1 ? 'Exam Material' : 'Exam Materials'}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Showing results for "${searchQuery}"`
                  : 'Showing all exam preparation materials'}
              </p>
            </div>

            {loading ? (
              <Card className="border-border bg-card">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading exam materials...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {paginatedFiles.map((file) => (
                  <Card
                    key={file.id}
                    className="hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer border-border group bg-card"
                    onClick={() => router.push(`/file/${file.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                                {file.title}
                              </h3>
                              <div className="text-sm text-muted-foreground">{file.courseCode}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {file.uploadedBy} ({file.uploaderRole})
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(file.date).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(file.tags || []).map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-300 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 hover:text-purple-700 dark:hover:text-purple-300 transition-all"
                          onClick={(e) => handleDownload(file, e)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {paginatedFiles.length === 0 && !loading && (
                  <Card className="border-border bg-card">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-foreground mb-2">No exam materials found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                      <Button variant="outline" onClick={clearFilters} className="border-border text-foreground hover:bg-muted">
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer text-foreground hover:bg-muted'}
                      />
                    </PaginationItem>
                    {(() => {
                      const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
                      const showEllipsis = totalPages > 7;

                      if (!showEllipsis) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        pages.push(1);

                        if (currentPage <= 4) {
                          for (let i = 2; i <= 5; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis-right');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 3) {
                          pages.push('ellipsis-left');
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          pages.push('ellipsis-left');
                          pages.push(currentPage - 1);
                          pages.push(currentPage);
                          pages.push(currentPage + 1);
                          pages.push('ellipsis-right');
                          pages.push(totalPages);
                        }
                      }

                      return pages.map((page, index) => {
                        if (page === 'ellipsis-left') {
                          return (
                            <PaginationItem key={`ellipsis-left-${index}`}>
                              <PaginationEllipsis className="text-foreground" />
                            </PaginationItem>
                          );
                        } else if (page === 'ellipsis-right') {
                          return (
                            <PaginationItem key={`ellipsis-right-${index}`}>
                              <PaginationEllipsis className="text-foreground" />
                            </PaginationItem>
                          );
                        } else {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page as number)}
                                isActive={currentPage === page}
                                className={`cursor-pointer ${currentPage === page ? 'bg-purple-600 text-white hover:bg-purple-700' : 'text-foreground hover:bg-muted'}`}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      });
                    })()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer text-foreground hover:bg-muted'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

