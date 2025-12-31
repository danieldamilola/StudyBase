/**
 * Core Data Types and Constants for StudyBase
 * Real data structure for Mountain Top University (MTU)
 */

export interface FileItem {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  department: string;
  college: string;
  level: string;
  uploadedBy: string;
  uploaderRole: string;
  date: string;
  fileType: string;
  tags: string[];
  downloads: number;
  status: string;
  semester?: string;
  file_url?: string;
  programme?: string;
}

export interface College {
  code: string;
  name: string;
  departments: Department[];
}

export interface Department {
  code: string;
  name: string;
  programmes: string[];
}

// Mountain Top University (MTU) College Structure
export const colleges: College[] = [
  {
    code: 'CBAS',
    name: 'College of Basic and Applied Sciences',
    departments: [
      {
        code: 'BioSci',
        name: 'Biological Sciences',
        programmes: ['B.Sc. Biology', 'B.Sc. Microbiology', 'B.Sc. Biotechnology']
      },
      {
        code: 'Biochem',
        name: 'Biochemistry',
        programmes: ['B.Sc. Biochemistry']
      },
      {
        code: 'ChemSci',
        name: 'Chemical Sciences',
        programmes: ['B.Sc. Chemistry', 'B.Sc. Industrial Chemistry']
      },
      {
        code: 'CompMath',
        name: 'Computer Science & Mathematics',
        programmes: ['B.Sc. Computer Science', 'B.Sc. Mathematics', 'B.Sc. Software Engineering', 'B.Sc. Cyber Security']
      },
      {
        code: 'FoodSci',
        name: 'Food Science & Technology',
        programmes: ['B.Sc. Food Science and Technology']
      },
      {
        code: 'Geosci',
        name: 'Geosciences',
        programmes: ['B.Sc. Geology', 'B.Sc. Applied Geophysics']
      },
      {
        code: 'Physics',
        name: 'Physics',
        programmes: ['B.Sc. Physics', 'B.Sc. Physics with Electronics']
      }
    ]
  },
  {
    code: 'CHMS',
    name: 'College of Humanities, Management & Social Sciences',
    departments: [
      {
        code: 'AcctFin',
        name: 'Accounting & Finance',
        programmes: ['B.Sc. Accounting', 'B.Sc. Finance', 'B.Sc. Securities and Investment']
      },
      {
        code: 'BusAdmin',
        name: 'Business Administration',
        programmes: ['B.Sc. Business Administration', 'B.Sc. Industrial Relations & Personnel Management', 'B.Sc. Public Administration']
      },
      {
        code: 'Econ',
        name: 'Economics',
        programmes: ['B.Sc. Economics']
      },
      {
        code: 'FineArts',
        name: 'Fine & Applied Arts',
        programmes: ['B.A. Fine and Applied Arts']
      },
      {
        code: 'Lang',
        name: 'Languages',
        programmes: ['B.A. English']
      },
      {
        code: 'MassComm',
        name: 'Mass Communication',
        programmes: ['B.Sc. Mass Communication']
      },
      {
        code: 'Music',
        name: 'Music',
        programmes: ['B.A. Music']
      },
      {
        code: 'PhilRel',
        name: 'Philosophy & Religion',
        programmes: ['B.A. Religious Studies']
      }
    ]
  },
  {
    code: 'CAHS',
    name: 'College of Allied Health Sciences',
    departments: [
      {
        code: 'Nursing',
        name: 'Nursing Science',
        programmes: ['B.N.Sc. Nursing Science']
      },
      {
        code: 'MedLab',
        name: 'Medical Laboratory Science',
        programmes: ['B.MLS Medical Laboratory Science']
      },
      {
        code: 'PubHealth',
        name: 'Public Health',
        programmes: ['B.Sc. Public Health']
      },
      {
        code: 'NutDiet',
        name: 'Nutrition and Dietetics',
        programmes: ['B.Sc. Nutrition and Dietetics']
      },
      {
        code: 'BiomedTech',
        name: 'Biomedical Technology',
        programmes: ['B.Sc. Biomedical Technology']
      }
    ]
  }
];

// Get all departments as flat array for dropdowns
export const departments: string[] = colleges.flatMap(c => c.departments.map(d => d.name));

// Get all college names
export const collegeNames: string[] = colleges.map(c => c.name);

// Get all college codes
export const collegeCodes: string[] = colleges.map(c => c.code);

export const levels: string[] = ['100', '200', '300', '400'];

export const fileTypes: string[] = ['PDF', 'DOCX', 'PPTX', 'XLSX', 'ZIP', 'TXT', 'JPG', 'PNG'];

export const semesters: string[] = ['First Semester', 'Second Semester'];

/**
 * Helper function to get departments for a specific college
 */
export function getDepartmentsForCollege(collegeName: string): string[] {
  const college = colleges.find(c => c.name === collegeName);
  return college ? college.departments.map(d => d.name) : [];
}

/**
 * Helper function to get programmes for a specific department
 */
export function getProgrammesForDepartment(collegeName: string, departmentName: string): string[] {
  const college = colleges.find(c => c.name === collegeName);
  if (!college) return [];
  const dept = college.departments.find(d => d.name === departmentName);
  return dept ? dept.programmes : [];
}

