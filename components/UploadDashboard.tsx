'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Upload,
  FileText,
  LayoutDashboard,
  SlidersHorizontal,
  FileStack,
  X,
  Check,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Users,
  FileCheck,
  LogOut,
  Search,
  Trash2,
  ChevronRight,
  CloudUpload,
  User,
  Settings
} from 'lucide-react';
import { levels, fileTypes, colleges, FileItem, getProgrammesForDepartment } from '@/utils/mockData';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Nav } from './nav';

export function UploadDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'manage' | 'preferences'>('dashboard');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderRole, setUploaderRole] = useState('');
  const [semester, setSemester] = useState('');
  const [tags, setTags] = useState('');
  const [college, setCollege] = useState('');
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [availableProgrammes, setAvailableProgrammes] = useState<string[]>([]);
  const [weekOrMaterial, setWeekOrMaterial] = useState('');
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalUploads: 0,
    totalDownloads: 0,
    activeUsers: 0,
    storageUsed: '0 GB',
    recentUploads: [] as FileItem[],
  });

  // Manage Files state
  const [manageFiles, setManageFiles] = useState<FileItem[]>([]);
  const [manageLoading, setManageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Get current user and auto-fill form
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error);
          router.push('/login');
          return;
        }

        if (user) {
          // Get user metadata from signup
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
          const role = user.user_metadata?.role || 'Lecturer';
          const dept = user.user_metadata?.department || '';

          // Auto-fill upload form
          setUploaderName(fullName);
          setUploaderRole(role);
          setDepartment(dept);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [router]);

  // Fetch stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Count user's uploads
        const { count: totalUploads, error: countError } = await supabase
          .from('files')
          .select('*', { count: 'exact', head: true })
          .eq('uploaded_by_email', user.email);

        if (countError) console.error(countError);

        // Fetch all user files to calculate total downloads and storage
        const { data: allUserFiles, error: allFilesError } = await supabase
          .from('files')
          .select('downloads')
          .eq('uploaded_by_email', user.email);

        if (allFilesError) console.error(allFilesError);

        // Calculate total downloads
        const totalDownloadsCount = allUserFiles?.reduce((sum, file) => sum + (file.downloads || 0), 0) || 0;

        // Get recent uploads
        const { data: recentData, error: recentError } = await supabase
          .from('files')
          .select('*')
          .eq('uploaded_by_email', user.email)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) console.error(recentError);

        // Transform recent uploads
        const recentUploads: FileItem[] = (recentData || []).map((file: any) => ({
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
          status: file.status || 'approved',
          semester: file.semester,
          file_url: file.file_url,
          programme: file.programme
        }));

        setStats({
          totalFiles: totalUploads || 0,
          totalUploads: totalUploads || 0,
          totalDownloads: totalDownloadsCount,
          activeUsers: 1, // At least the current user
          storageUsed: totalUploads ? `${(totalUploads * 1.5).toFixed(1)} MB` : '0 MB', // Estimate based on file count
          recentUploads,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [uploadComplete]);

  // Fetch user's files for 'My Files' tab
  useEffect(() => {
    if (activeTab === 'manage') {
      const fetchUserFiles = async () => {
        setManageLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('uploaded_by_email', user.email)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const files: FileItem[] = (data || []).map((file: any) => ({
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
            status: file.status || 'approved',
            semester: file.semester,
            file_url: file.file_url,
            programme: file.programme
          }));

          setManageFiles(files);
        } catch (error) {
          console.error('Error fetching user files:', error);
          toast({ title: "Error", description: "Failed to load your files.", variant: "destructive" });
        } finally {
          setManageLoading(false);
        }
      };

      fetchUserFiles();
    }
  }, [activeTab, uploadComplete]);

  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.title}"? This action cannot be undone.`)) return;

    try {
      // 1. Delete from Storage
      const fileName = file.file_url?.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('course-materials')
          .remove([fileName]);

        if (storageError) console.error('Storage delete error:', storageError);
      }

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // 3. Update State
      setManageFiles(prev => prev.filter(f => f.id !== file.id));
      setStats(prev => ({
        ...prev,
        totalFiles: prev.totalFiles - 1,
        totalUploads: prev.totalUploads - 1
      }));

      toast({ title: "Deleted", description: "File removed successfully." });

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({ title: "Error", description: "Failed to delete file.", variant: "destructive" });
    }
  };
  useEffect(() => {
    if (college && department) {
      const progs = getProgrammesForDepartment(college, department);
      setAvailableProgrammes(progs);
      setProgrammes([]); // Reset selection
    } else {
      setAvailableProgrammes([]);
    }
  }, [college, department]);

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleError = (error: any) => {
    console.error('Upload Error:', error);
    toast({
      title: "Upload Failed",
      description: error.message || "Failed to upload file. Please check your connection.",
      variant: "destructive"
    });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please drag and drop or select a file to upload.", variant: "destructive" });
      return;
    }

    if (programmes.length === 0) {
      toast({ title: "Programme Required", description: "Please select at least one programme.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get current user email for uploaded_by field
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      if (!userEmail) throw new Error('You must be logged in to upload.');

      // Step 1: Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate progress for better UX (since client doesn't give granular events easily in v2 without XHR)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Step 2: Get public URL
      const { data: urlData } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Step 3: Insert record into files table
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

      // Build title with week/material if provided
      const finalTitle = weekOrMaterial
        ? `${title} - ${weekOrMaterial}`
        : title;

      // Get college code
      const collegeData = colleges.find(c => c.name === college);
      const collegeCode = collegeData?.code;

      // Get department code
      const departmentData = collegeData?.departments.find(d => d.name === department);
      const departmentCode = departmentData?.code;

      const { error: insertError } = await supabase
        .from('files')
        .insert({
          title: finalTitle,
          course_code: courseCode,
          description,
          department,
          department_code: departmentCode,
          college,
          college_code: collegeCode,
          programme: programmes.length > 0 ? programmes.join(', ') : null,
          level,
          uploaded_by: uploaderName,
          uploaded_by_email: userEmail,
          uploader_role: uploaderRole,
          semester,
          tags: tagsArray,
          file_url: publicUrl,
          file_type: fileExt?.toUpperCase() || 'PDF',
          status: 'approved',
          downloads: 0,
          date: new Date().toISOString().split('T')[0]
        });

      if (insertError) throw insertError;

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploading(false);
      setUploadComplete(true);

      toast({
        title: "Upload Successful!",
        description: "Your file has been published.",
        className: "bg-green-50 text-green-900 border-green-200"
      });

    } catch (error: unknown) {
      clearInterval(undefined); // Clear any interval
      handleError(error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCourseCode('');
    setDescription('');
    setSelectedFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Nav */}
          <Card variant="academic" className="shadow-lg border-slate-200/60 sticky top-24 overflow-hidden">
            <div className="p-5 bg-muted/30 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/10">
                  {uploaderName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-foreground truncate">{uploaderName}</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{uploaderRole}</p>
                </div>
              </div>
            </div>
            <nav className="p-2 space-y-1">
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'upload', label: 'Upload Materials', icon: CloudUpload },
                { id: 'manage', label: 'My Files', icon: FileStack },
                { id: 'preferences', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === item.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-purple-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </Card>

          {/* Main Area */}
          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
                  <p className="text-muted-foreground">Track your contributions and impact.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Files', value: stats.totalFiles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Storage Used', value: stats.storageUsed, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Active Course', value: 'CSC 201', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-100' },
                  ].map((stat, i) => (
                    <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recentUploads.length > 0 ? (
                        stats.recentUploads.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center shadow-sm">
                                <FileText className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{file.title}</h4>
                                <p className="text-xs text-muted-foreground">{file.courseCode} • {new Date(file.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                              {file.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No uploads yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="max-w-3xl mx-auto animate-slide-up">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Upload Materials</h2>
                  <p className="text-muted-foreground">Share resources with your students.</p>
                </div>

                {!uploadComplete ? (
                  <Card className="border-border shadow-lg bg-card">
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Drag & Drop Area */}
                        <div
                          className={`border-3 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${dragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : selectedFile ? 'border-green-500 bg-green-50/30 dark:bg-green-900/20' : 'border-border hover:border-purple-400 hover:bg-muted'
                            }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer block">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${selectedFile ? 'bg-green-100 scale-110' : 'bg-purple-100 hover:scale-110'}`}>
                              {selectedFile ? <Check className="w-10 h-10 text-green-600" /> : <CloudUpload className="w-10 h-10 text-purple-600" />}
                            </div>
                            {selectedFile ? (
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">{selectedFile.name}</h3>
                                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                <Button variant="ghost" size="sm" className="mt-4 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}>
                                  Remove File
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-2">Drag & Drop or Click to Upload</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                  Support for PDF, DOCX, PPTX, and more. Max size 50MB.
                                </p>
                              </div>
                            )}
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Resource Title</Label>
                              <Input placeholder="e.g. Introduction to Algorithms" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Course Code</Label>
                              <Input placeholder="e.g. CSC 201" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea placeholder="Briefly describe the contents..." className="h-32" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>College</Label>
                              <Select value={college} onValueChange={setCollege} required>
                                <SelectTrigger><SelectValue placeholder="Select College" /></SelectTrigger>
                                <SelectContent>
                                  {colleges.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Department</Label>
                              <Select value={department} onValueChange={setDepartment} disabled={!college} required>
                                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent>
                                  {college && colleges.find(c => c.name === college)?.departments.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>

                            {availableProgrammes.length > 0 && (
                              <div className="space-y-3">
                                <Label>Programmes (Select all that apply)</Label>
                                <Select
                                  value=""
                                  onValueChange={(val) => {
                                    if (val && !programmes.includes(val)) {
                                      setProgrammes([...programmes, val]);
                                    }
                                  }}
                                  disabled={!department}
                                >
                                  <SelectTrigger className="text-muted-foreground">
                                    <SelectValue placeholder="Select programmes..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableProgrammes.filter(p => !programmes.includes(p)).map(p => (
                                      <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {programmes.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {programmes.map(p => (
                                      <Badge key={p} variant="secondary" className="px-3 py-1 flex items-center gap-2 bg-purple-50 text-purple-700 border-purple-200">
                                        {p}
                                        <button
                                          type="button"
                                          onClick={() => setProgrammes(programmes.filter(prog => prog !== p))}
                                          className="hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Level</Label>
                                <Select value={level} onValueChange={setLevel} required>
                                  <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                                  <SelectContent>
                                    {['100', '200', '300', '400', '500'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                  <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="First Semester">First Semester</SelectItem>
                                    <SelectItem value="Second Semester">Second Semester</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {uploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        )}

                        <div className="pt-4 flex justify-end">
                          <Button type="submit" size="lg" disabled={uploading} className="bg-purple-600 hover:bg-purple-700 min-w-[150px]">
                            {uploading ? 'Processing...' : 'Publish Resource'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="academic" className="bg-muted/10">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                        <Check className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Upload Successful!</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Your resource <span className="font-semibold">{title}</span> has been successfully published to the {department} department.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={resetForm}>Upload Another</Button>
                        <Button onClick={() => setActiveTab('manage')}>View My Files</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">My Uploads</h2>
                  <p className="text-muted-foreground">Manage and update your shared resources.</p>
                </div>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    {manageLoading ? (
                      <div className="p-8 text-center text-muted-foreground">Loading your files...</div>
                    ) : manageFiles.length > 0 ? (
                      <div className="divide-y divide-border">
                        {manageFiles.map((file) => (
                          <div key={file.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{file.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Badge variant="outline" className="bg-card">{file.courseCode}</Badge>
                                  <span>•</span>
                                  <span>{new Date(file.date).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {file.downloads} downloads</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                              <Button variant="ghost" size="sm" onClick={() => window.open(file.file_url, '_blank')}>
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteFile(file)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileStack className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-foreground font-medium mb-1">No uploads yet</h3>
                        <p className="text-muted-foreground text-sm mb-4">Start sharing resources with your students.</p>
                        <Button onClick={() => setActiveTab('upload')}>Upload First File</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === 'preferences' && (
              <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
                  <p className="text-muted-foreground">Manage your profile information.</p>
                </div>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update how you appear to students.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {colleges.flatMap(c => c.departments).map(d => (
                            <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={async () => {
                        try {
                          const { error } = await supabase.auth.updateUser({
                            data: { full_name: uploaderName, department: department }
                          });
                          if (error) throw error;
                          toast({ title: "Updated", description: "Profile updated successfully." });
                        } catch (e: unknown) {
                          const error = e as Error;
                          toast({ title: "Error", description: error.message, variant: "destructive" });
                        }
                      }}>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div >
    </div >
  );
}