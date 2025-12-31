-- Supabase Setup SQL Script (Idempotent - Safe to run multiple times)
-- This script creates the files table, storage bucket, and policies needed for the app

-- 0. Ensure pgcrypto (for gen_random_uuid) is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create the files table (idempotent) - Mountain Top University (MTU)
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  course_code TEXT NOT NULL,
  college TEXT NOT NULL,
  college_code TEXT,
  department TEXT NOT NULL,
  department_code TEXT,
  programme TEXT,
  level TEXT NOT NULL,
  semester TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_by_email TEXT,
  uploader_role TEXT NOT NULL,
  downloads INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'approved' NOT NULL,
  date DATE DEFAULT (current_date) NOT NULL
);

-- 1.b Add missing columns if table already existed without them
DO $body$
BEGIN
  -- Add college_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'college_code'
  ) THEN
    ALTER TABLE public.files ADD COLUMN college_code TEXT;
  END IF;

  -- Add department_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'department_code'
  ) THEN
    ALTER TABLE public.files ADD COLUMN department_code TEXT;
  END IF;

  -- Add programme column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'programme'
  ) THEN
    ALTER TABLE public.files ADD COLUMN programme TEXT;
  END IF;

  -- Add status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.files ADD COLUMN status TEXT DEFAULT 'approved' NOT NULL;
  END IF;

  -- Add date column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'date'
  ) THEN
    ALTER TABLE public.files ADD COLUMN date DATE DEFAULT (current_date) NOT NULL;
  END IF;

  -- Add uploaded_by_email column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'uploaded_by_email'
  ) THEN
    ALTER TABLE public.files ADD COLUMN uploaded_by_email TEXT;
  END IF;
END $body$;

-- 1.c Populate uploaded_by_email for existing files that have email-like uploaded_by values
DO $body$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'uploaded_by_email'
  ) THEN
    UPDATE public.files
    SET uploaded_by_email = uploaded_by
    WHERE uploaded_by_email IS NULL 
      AND uploaded_by LIKE '%@%';
  END IF;
END $body$;

-- 1.c2 Populate uploaded_by_email from auth.users for files with non-email uploaded_by (handles old uploads)
DO $body$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'uploaded_by_email'
  ) THEN
    -- For files where uploaded_by looks like a name (not email) and uploaded_by_email is null,
    -- try to find matching user from auth.users by full_name metadata
    UPDATE public.files f
    SET uploaded_by_email = u.email
    FROM auth.users u
    WHERE f.uploaded_by_email IS NULL
      AND f.uploaded_by NOT LIKE '%@%'
      AND u.raw_user_meta_data->>'full_name' = f.uploaded_by;
  END IF;
END $body$;

-- 1.c Enable Row Level Security on the files table
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 1.d Create RLS policies for public access
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'files' AND p.polname = 'allow_public_read'
  ) THEN
    CREATE POLICY "allow_public_read"
      ON public.files
      FOR SELECT
      USING (true);
  END IF;
END $body$;

DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'files' AND p.polname = 'allow_public_insert'
  ) THEN
    CREATE POLICY "allow_public_insert"
      ON public.files
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $body$;

DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'files' AND p.polname = 'allow_public_update'
  ) THEN
    CREATE POLICY "allow_public_update"
      ON public.files
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $body$;

DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'files' AND p.polname = 'allow_public_delete'
  ) THEN
    CREATE POLICY "allow_public_delete"
      ON public.files
      FOR DELETE
      USING (true);
  END IF;
END $body$;

-- 1.e Create indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_files_course_code ON public.files(course_code);
CREATE INDEX IF NOT EXISTS idx_files_department ON public.files(department);

-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_files_college ON public.files(college);
CREATE INDEX IF NOT EXISTS idx_files_college_code ON public.files(college_code);
CREATE INDEX IF NOT EXISTS idx_files_level ON public.files(level);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by_email ON public.files(uploaded_by_email);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_files_college_dept_level ON public.files(college, department, level);
CREATE INDEX IF NOT EXISTS idx_files_status_date ON public.files(status, date DESC);

DO $body$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'status'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_files_status ON public.files(status)';
  END IF;
END $body$;

DO $body$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'files' 
      AND column_name = 'date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_files_date ON public.files(date DESC)';
  END IF;
END $body$;

-- 2. Create the Storage Bucket row idempotently
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- 3. Create RLS policies on storage.objects for the bucket
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND p.polname = 'public_access_course_materials'
  ) THEN
    CREATE POLICY "public_access_course_materials"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'course-materials');
  END IF;
END $body$;

DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'storage' AND c.relname = 'objects' AND p.polname = 'anyone_can_upload_course_materials'
  ) THEN
    CREATE POLICY "anyone_can_upload_course_materials"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'course-materials');
  END IF;
END $body$;

-- 4. Add public.files to supabase_realtime publication
DO $body$
DECLARE
  pub_exists BOOLEAN;
  table_in_pub BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') INTO pub_exists;
  
  IF pub_exists THEN
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid 
               WHERE n.nspname = 'public' AND c.relname = 'files') THEN
      
      SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'files'
      ) INTO table_in_pub;
      
      IF NOT table_in_pub THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.files;';
        RAISE NOTICE 'Added public.files to supabase_realtime publication';
      ELSE
        RAISE NOTICE 'Table public.files already in supabase_realtime publication';
      END IF;
    ELSE
      RAISE NOTICE 'Table public.files does not exist yet; skipping add to publication.';
    END IF;
  ELSE
    RAISE NOTICE 'Publication supabase_realtime does not exist; skipping publication alter.';
  END IF;
END $body$;

-- 5. Insert sample test data for MTU structure
INSERT INTO public.files (title, description, course_code, college, college_code, department, department_code, programme, level, semester, file_type, file_url, uploaded_by, uploaded_by_email, uploader_role, downloads, tags, status, date)
VALUES 
  ('Computer Science Fundamentals - Lecture 1', 'Introduction to Computer Science', 'CSC 101', 'College of Basic and Applied Sciences', 'CBAS', 'Computer Science & Mathematics', 'CompMath', 'B.Sc. Computer Science', '100', 'First', 'PDF', 'https://example.com/csc101-lec1.pdf', 'Dr. John Smith', 'john@mtu.edu.ng', 'Lecturer', 0, ARRAY['lecture', 'fundamentals'], 'approved', CURRENT_DATE),
  ('Software Engineering Design Patterns', 'Chapter 1: Introduction to Design Patterns', 'SE 201', 'College of Basic and Applied Sciences', 'CBAS', 'Computer Science & Mathematics', 'CompMath', 'B.Sc. Software Engineering', '200', 'Second', 'PDF', 'https://example.com/se201-ch1.pdf', 'Prof. Jane Doe', 'jane@mtu.edu.ng', 'Lecturer', 0, ARRAY['design-patterns', 'software-engineering'], 'approved', CURRENT_DATE),
  ('Mathematics for CS - Calculus', 'Calculus Module', 'MTH 101', 'College of Basic and Applied Sciences', 'CBAS', 'Computer Science & Mathematics', 'CompMath', 'B.Sc. Mathematics, B.Sc. Computer Science', '100', 'First', 'PDF', 'https://example.com/mth101.pdf', 'Dr. Ahmed Hassan', 'ahmed@mtu.edu.ng', 'Lecturer', 0, ARRAY['mathematics', 'calculus'], 'approved', CURRENT_DATE),
  ('Biology Laboratory Guide', 'Lab procedures and protocols', 'BIO 102', 'College of Basic and Applied Sciences', 'CBAS', 'Biological Sciences', 'BioSci', 'B.Sc. Biology, B.Sc. Microbiology', '100', 'First', 'PDF', 'https://example.com/bio102-lab.pdf', 'Dr. Amina Okafor', 'amina@mtu.edu.ng', 'Lecturer', 0, ARRAY['biology', 'laboratory'], 'approved', CURRENT_DATE),
  ('Business Administration Fundamentals', 'Introduction to Business Management', 'BUS 101', 'College of Humanities, Management & Social Sciences', 'CHMS', 'Business Administration', 'BusAdmin', 'B.Sc. Business Administration', '100', 'First', 'PDF', 'https://example.com/bus101.pdf', 'Mr. Chisom Nwosu', 'chisom@mtu.edu.ng', 'Lecturer', 0, ARRAY['business', 'management'], 'approved', CURRENT_DATE)
ON CONFLICT DO NOTHING;