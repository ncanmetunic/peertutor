// Comprehensive skills database for PeerTutor
export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: string[];
}

export const SKILLS_DATABASE: SkillCategory[] = [
  {
    id: 'programming',
    name: 'Programming & Software',
    icon: '💻',
    skills: [
      'JavaScript',
      'Python',
      'Java',
      'C++',
      'C#',
      'React',
      'React Native',
      'Node.js',
      'HTML/CSS',
      'PHP',
      'SQL',
      'MongoDB',
      'Git',
      'Docker',
      'AWS',
      'Machine Learning',
      'Data Science',
      'Web Development',
      'Mobile Development',
      'Game Development',
      'DevOps',
      'Cybersecurity',
      'UI/UX Design',
      'System Design',
      'Algorithms',
      'Data Structures'
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '📊',
    skills: [
      'Calculus',
      'Linear Algebra',
      'Statistics',
      'Probability',
      'Discrete Mathematics',
      'Differential Equations',
      'Mathematical Analysis',
      'Algebra',
      'Geometry',
      'Trigonometry',
      'Number Theory',
      'Mathematical Modeling',
      'Optimization',
      'Operations Research',
      'Numerical Methods',
      'Graph Theory',
      'Logic',
      'Set Theory'
    ]
  },
  {
    id: 'sciences',
    name: 'Sciences',
    icon: '🔬',
    skills: [
      'Physics',
      'Chemistry',
      'Biology',
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Biochemistry',
      'Molecular Biology',
      'Genetics',
      'Ecology',
      'Anatomy',
      'Physiology',
      'Microbiology',
      'Thermodynamics',
      'Quantum Physics',
      'Classical Mechanics',
      'Electromagnetism',
      'Optics',
      'Laboratory Techniques'
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '⚙️',
    skills: [
      'Circuit Analysis',
      'Digital Logic',
      'Control Systems',
      'Signal Processing',
      'Power Systems',
      'Electronics',
      'Mechanical Design',
      'Thermodynamics',
      'Fluid Mechanics',
      'Materials Science',
      'Structural Analysis',
      'AutoCAD',
      'SolidWorks',
      'MATLAB',
      'Simulink',
      'PLC Programming',
      'Project Management',
      'Quality Control',
      'Manufacturing Processes'
    ]
  },
  {
    id: 'business',
    name: 'Business & Economics',
    icon: '💼',
    skills: [
      'Accounting',
      'Finance',
      'Marketing',
      'Management',
      'Economics',
      'Business Analysis',
      'Financial Modeling',
      'Investment Analysis',
      'Strategic Planning',
      'Operations Management',
      'Human Resources',
      'International Business',
      'Entrepreneurship',
      'Supply Chain',
      'E-commerce',
      'Digital Marketing',
      'Brand Management',
      'Market Research',
      'Excel',
      'PowerPoint'
    ]
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: '🌍',
    skills: [
      'English',
      'Turkish',
      'German',
      'French',
      'Spanish',
      'Arabic',
      'Chinese',
      'Japanese',
      'Korean',
      'Russian',
      'Italian',
      'Portuguese',
      'Dutch',
      'Swedish',
      'IELTS Preparation',
      'TOEFL Preparation',
      'Business English',
      'Academic Writing',
      'Translation',
      'Interpretation'
    ]
  },
  {
    id: 'social',
    name: 'Social Sciences',
    icon: '🏛️',
    skills: [
      'Psychology',
      'Sociology',
      'Political Science',
      'International Relations',
      'History',
      'Philosophy',
      'Anthropology',
      'Geography',
      'Law',
      'Public Administration',
      'Research Methods',
      'Data Analysis',
      'SPSS',
      'Academic Writing',
      'Critical Thinking',
      'Public Speaking',
      'Debate',
      'Social Work'
    ]
  },
  {
    id: 'arts',
    name: 'Arts & Design',
    icon: '🎨',
    skills: [
      'Graphic Design',
      'Photography',
      'Video Editing',
      'Animation',
      '3D Modeling',
      'Drawing',
      'Painting',
      'Music Theory',
      'Piano',
      'Guitar',
      'Violin',
      'Singing',
      'Music Production',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe After Effects',
      'Figma',
      'Sketch',
      'Architecture',
      'Interior Design'
    ]
  },
  {
    id: 'test_prep',
    name: 'Test Preparation',
    icon: '📝',
    skills: [
      'YKS Preparation',
      'ALES Preparation',
      'KPSS Preparation',
      'YDS Preparation',
      'GRE Preparation',
      'GMAT Preparation',
      'SAT Preparation',
      'IELTS Preparation',
      'TOEFL Preparation',
      'University Entrance',
      'Graduate School Prep',
      'Medical School Prep',
      'Law School Prep',
      'MBA Preparation',
      'Study Strategies',
      'Time Management',
      'Note Taking',
      'Memory Techniques'
    ]
  },
  {
    id: 'others',
    name: 'Other Skills',
    icon: '🎯',
    skills: [
      'Research Methods',
      'Presentation Skills',
      'Writing',
      'Critical Thinking',
      'Problem Solving',
      'Communication',
      'Leadership',
      'Teamwork',
      'Time Management',
      'Organization',
      'Study Techniques',
      'Exam Strategies',
      'Stress Management',
      'Goal Setting',
      'Motivation',
      'Productivity',
      'Learning Strategies'
    ]
  }
];

// Helper function to get all skills as flat array
export const getAllSkills = (): string[] => {
  return SKILLS_DATABASE.flatMap(category => category.skills);
};

// Helper function to search skills
export const searchSkills = (query: string): string[] => {
  const allSkills = getAllSkills();
  return allSkills.filter(skill => 
    skill.toLowerCase().includes(query.toLowerCase())
  );
};

// Helper function to get skills by category
export const getSkillsByCategory = (categoryId: string): string[] => {
  const category = SKILLS_DATABASE.find(cat => cat.id === categoryId);
  return category ? category.skills : [];
};