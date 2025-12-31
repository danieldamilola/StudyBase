'use client';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Nav } from './nav';
import { FileItem } from '@/utils/mockData';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, FileText, User, Calendar, BookOpen, GraduationCap, Building, Clock, ArrowLeft, Maximize2, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { QuizGenerator } from './QuizGenerator';

export function FileDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedFiles, setRelatedFiles] = useState<FileItem[]>([]);

  const handleDownload = async () => {
    if (!file?.file_url) return;
    
    // Open file in new tab
    window.open(file.file_url, '_blank');
    
    // Increment download count
    try {
      await supabase
        .from('files')
        .update({ downloads: (file.downloads || 0) + 1 })
        .eq('id', id);

      // Optimistically update UI
      setFile(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : null);
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch file and related files in parallel for better performance
        const [fileResult, relatedResult] = await Promise.all([
          supabase
            .from('files')
            .select('id, title, course_code, description, department, college, level, uploaded_by, uploader_role, date, file_type, tags, downloads, status, semester, file_url')
            .eq('id', id)
            .single(),
          // Pre-fetch related files (will use course_code and department from main file)
          supabase
            .from('files')
            .select('id, title, course_code, file_type, date, department, college, level, uploaded_by, uploader_role, tags, downloads, status, semester')
            .neq('id', id)
            .eq('status', 'approved')
            .limit(3)
        ]);

        if (fileResult.error) {
          console.error('Error fetching file:', fileResult.error);
          setFile(null);
          return;
        }

        if (fileResult.data) {
          // Transform Supabase data to match FileItem interface
          const transformedFile: FileItem = {
            id: fileResult.data.id.toString(),
            title: fileResult.data.title,
            courseCode: fileResult.data.course_code,
            description: fileResult.data.description || '',
            department: fileResult.data.department,
            college: fileResult.data.college,
            level: fileResult.data.level,
            uploadedBy: fileResult.data.uploaded_by,
            uploaderRole: fileResult.data.uploader_role,
            date: fileResult.data.date,
            fileType: fileResult.data.file_type,
            tags: fileResult.data.tags || [],
            downloads: fileResult.data.downloads || 0,
            status: fileResult.data.status || 'pending',
            semester: fileResult.data.semester,
            file_url: fileResult.data.file_url
          };

          setFile(transformedFile);

          // Now fetch related files with proper filters
          const { data: relatedData } = await supabase
            .from('files')
            .select('id, title, course_code, file_type, date, department, college, level, uploaded_by, uploader_role, tags, downloads, status, semester')
            .or(`course_code.eq.${fileResult.data.course_code},department.eq.${fileResult.data.department}`)
            .neq('id', id)
            .eq('status', 'approved')
            .limit(3);

          if (relatedData) {
            const transformedRelated: FileItem[] = relatedData.map((f: any) => ({
              id: f.id.toString(),
              title: f.title,
              courseCode: f.course_code,
              description: f.description || '',
              department: f.department,
              college: f.college,
              level: f.level,
              uploadedBy: f.uploaded_by,
              uploaderRole: f.uploader_role,
              date: f.date,
              fileType: f.file_type,
              tags: f.tags || [],
              downloads: f.downloads || 0,
              status: f.status || 'pending',
              semester: f.semester
            }));

            setRelatedFiles(transformedRelated);
          }
        }
      } catch (error) {
        console.error('Error fetching file:', error);
        setFile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-foreground mb-4">File not found</h2>
          <Button onClick={() => router.push('/resources')}>Back to Resources</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/resources')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Preview Card */}
            <Card variant="academic" className="border-slate-200/60 shadow-lg shadow-slate-200/40">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/10">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-foreground mb-2">{file.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-muted text-foreground/80 font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* Preview Modal Trigger */}
                  {file.file_url && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="lg" className="flex-1 border-purple-200 hover:bg-purple-50 text-purple-700 h-12">
                          <Maximize2 className="w-5 h-5 mr-2" />
                          Preview File
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col gap-0 bg-white sm:rounded-xl overflow-hidden border-border shadow-2xl">
                        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-white">
                          <DialogTitle className="text-xl font-bold flex flex-col gap-1 text-left">
                            <span className="truncate pr-8">{file.title}</span>
                            <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                              <span className="uppercase tracking-wider font-semibold text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{file.courseCode}</span>
                              <span>•</span>
                              <span className="uppercase text-xs">{file.fileType}</span>
                            </span>
                          </DialogTitle>
                        </DialogHeader>

                        {/* Document Viewer Area */}
                        <div className="flex-1 w-full bg-slate-100 p-4 md:p-8 overflow-hidden flex items-center justify-center relative">
                          <div className="w-full h-full max-w-4xl bg-white shadow-lg rounded-sm overflow-hidden border border-slate-200">
                            <iframe
                              src={
                                file.fileType === 'PDF'
                                  ? `${file.file_url}#toolbar=0`
                                  : `https://docs.google.com/gview?url=${encodeURIComponent(file.file_url)}&embedded=true`
                              }
                              className="w-full h-full block"
                              title="Document Preview"
                            />
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t bg-white flex items-center justify-between gap-4 flex-shrink-0">
                          <DialogClose asChild>
                            <Button variant="outline" className="text-muted-foreground hover:text-foreground">
                              Close
                            </Button>
                          </DialogClose>
                          <Button
                            className="flex-1 max-w-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium"
                            onClick={handleDownload}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download File
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    variant="vibrant"
                    className="flex-1 h-12"
                    size="lg"
                    onClick={handleDownload}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h3 className="text-foreground mb-2 font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{file.description}</p>
                </div>

                <div className="text-center text-xs font-bold text-muted-foreground bg-muted/30 py-2.5 rounded-xl border border-border/50 uppercase tracking-widest">
                  <span className="text-purple-700 dark:text-purple-400">{file.downloads}</span> Successful Downloads
                </div>
              </CardContent>
            </Card>

            {/* AI Study Tools */}
            <div className="grid gap-4">
              <QuizGenerator fileTitle={file.title} fileDescription={file.description} fileUrl={file.file_url} fileType={file.fileType} />
            </div>

            {/* Related Files */}
            {relatedFiles.length > 0 && (
              <Card variant="academic" className="border-slate-200/60">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Related Academic Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedFiles.map((relatedFile) => (
                      <Card
                        key={relatedFile.id}
                        variant="academic"
                        interactive
                        className="flex items-center gap-4 p-4 cursor-pointer"
                        onClick={() => router.push(`/file/${relatedFile.id}`)}
                      >
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-foreground truncate font-medium">{relatedFile.title}</div>
                          <div className="text-sm text-muted-foreground">{relatedFile.courseCode}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Metadata Sidebar */}
          <Card variant="academic" className="border-slate-200/60 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Material Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Course Code</div>
                  <div className="text-foreground">{file.courseCode}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">College</div>
                  <div className="text-foreground">{file.college}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Department</div>
                  <div className="text-foreground">{file.department}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Level</div>
                  <div className="text-foreground">{file.level}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Uploaded By</div>
                  <div className="text-foreground">{file.uploadedBy}</div>
                  <div className="text-sm text-muted-foreground">{file.uploaderRole}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Semester</div>
                  <div className="text-foreground">{file.semester}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Upload Date</div>
                  <div className="text-foreground">
                    {new Date(file.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">File Type</div>
                  <div className="text-foreground">{file.fileType}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}