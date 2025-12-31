# StudyBase - University Course Material Sharing Platform

A modern, scalable platform for university students and lecturers to upload, discover, and share course materials including lecture notes, assignments, past questions, and study guides.

## Features

- **🔐 Secure Authentication** - Supabase Auth with role-based access control (Student, Lecturer, Class Rep)
- **📁 File Management** - Upload, organize, and manage course materials with metadata
- **🔍 Smart Search & Discovery** - Filter files by course, level, department, and college
- **📊 Analytics Dashboard** - Track uploads, downloads, and file statistics
- **🎯 Role-Based Access** - Different interfaces for students, lecturers, and class representatives
- **💾 Cloud Storage** - Secure file storage via Supabase Storage
- **🎨 Modern UI** - Built with React, Next.js, and Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Authentication, Cloud Storage)
- **Components:** shadcn/ui
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd unifiles
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these values from your Supabase project settings.

4. **Set up database and authentication**

   Run the SQL setup script in your Supabase SQL Editor:

   - Copy contents of `supabase_setup.sql`
   - Paste in Supabase SQL Editor
   - Execute

5. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
studybase/
├── app/                      # Next.js app router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (routes based on auth)
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── dashboard/           # Student dashboard
│   ├── upload/              # Upload management
│   ├── resources/           # Course resources browser
│   └── [level]/[college]/   # Dynamic college/level pages
├── components/              # Reusable React components
│   ├── ui/                  # shadcn/ui components
│   ├── AuthGuard.tsx        # Auth protection wrapper
│   ├── LandingPage.tsx      # Student landing page
│   ├── UploadDashboard.tsx  # Upload & manage files
│   ├── SearchPage.tsx       # Search & filter files
│   └── nav.tsx              # Navigation bar
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── utils.ts             # Utility functions
├── utils/
│   └── mockData.ts          # Data structures and constants
├── hooks/
│   └── useUserRole.ts       # Custom auth hook
└── public/                  # Static assets
```

## Usage

### For Students

1. Sign up with your email
2. Browse files by college, department, and level
3. Search for specific courses or materials
4. Download and organize course materials
5. Manage your downloads and preferences

### For Lecturers

1. Sign up and select "Lecturer" role
2. Go to Upload Dashboard
3. Upload course materials with:
   - Title, course code, and description
   - Select college, department, and level
   - Add tags and semester information
   - Organize by week/topic
4. Manage uploaded files - view stats, delete, update status
5. Monitor downloads and engagement

### For Class Reps

1. Sign up and select "Class Rep" role
2. Go to Upload Dashboard (same as Lecturer)
3. Upload class materials with metadata
4. View upload statistics
5. Manage uploaded files
6. Monitor downloads and engagement

## Database Schema

### Files Table

```sql
- id (UUID, Primary Key)
- title (Text)
- course_code (Text)
- description (Text)
- department (Text)
- college (Text)
- level (Text)
- uploaded_by (Text) - Lecturer name
- uploaded_by_email (Text) - For filtering
- uploader_role (Text)
- file_type (Text)
- file_url (Text)
- status (Text: approved, pending, archived)
- tags (Array)
- semester (Text)
- downloads (Integer)
- created_at (Timestamp)
- date (Date)
```

## API & Database

All data operations use Supabase:

- **Authentication:** Supabase Auth with JWT
- **Database:** PostgreSQL via Supabase
- **Storage:** Supabase Storage (course-materials bucket)
- **Real-time:** Enabled for file updates

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Build & Production

```bash
# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Key Features Deep Dive

### Authentication & AuthorizationClass Rep

- **AuthGuard Component:** Protects routes requiring login
- **Role-Based Access:** Different UIs for Student/Lecturer/Admin roles
- **Session Management:** Auto-logout on expiry, persistent sessions

### File Upload & Management

- **Drag-and-drop upload** with progress tracking
- **Automatic storage** in Supabase with public URLs
- **Database indexing** for fast searches
- **Bulk operations** - manage multiple files at once

### Search & Discovery

- **Multi-field search** (title, course code, department)
- **Filters:** Status, level, department, college
- **Sorting:** By date, downloads, title
- **Real-time filtering** on client-side

### Upload Dashboard (Lecturer View)

- **Statistics:** Total files, approved count, downloads
- **Manage Files Tab:** Search, filter, delete, bulk update status
- **Account Settings:** Update profile and preferences
- **Auto-fill form:** From saved account data

## Common Tasks

### Adding a New College

1. Edit `utils/mockData.ts`
2. Add to `colleges` array with departments
3. Departments auto-populate in dropdowns

### Customizing UI

- Components use Tailwind CSS and shadcn/ui
- Modify `app/globals.css` for global styles
- Component colors in individual component files

### Updating Database Schema

1. Make changes in Supabase SQL Editor
2. Update TypeScript interfaces in `utils/mockData.ts`
3. Update components to match new schema

## Troubleshooting

### Files not showing in Manage Files tab

1. Check browser console (F12) for error logs
2. Verify user email matches `uploaded_by_email` in database
3. Check RLS policies allow access
4. Ensure user role is correct in auth metadata

### Upload fails

1. Check file size (max 50MB)
2. Verify file format is supported
3. Check Supabase storage bucket permissions
4. Look for error messages in browser console

### Auth issues

1. Verify Supabase keys in `.env.local`
2. Check auth session in browser DevTools
3. Ensure email verified in Supabase Auth

## Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues and feature requests, contact the development team or open an issue in the repository.

---

**Built with ❤️ for university communities worldwide**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
