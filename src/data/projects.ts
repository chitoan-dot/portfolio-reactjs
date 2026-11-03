/** Project cards. Replace empty URLs with your OWN repositories or live demos only. */
export type ProjectCategory = 'Backend' | 'Database' | 'Frontend' | 'Software' | 'AI'
export type Project = {
  id: number
  title: string
  subtitle: string
  category: ProjectCategory
  role: string
  status: string
  statusColor: string
  label: string
  accent: string
  colSpan: string
  tags: string[]
  description: string
  highlights: string[]
  githubUrl: string
  demoUrl: string
  /** Put your real video inside public/videos/, e.g. /videos/uplower.mp4 */
  demoVideo?: string
  image: string
}

export const projects: Project[] = [
  {
    id: 1, title: 'UPLOWER', subtitle: 'Desktop file-transfer system',
    category: 'Software', role: 'Full Application Development', status: 'Academic project', statusColor: '#22d3ee',
    label: 'CLIENT–SERVER', accent: '#22d3ee', colSpan: 'col-span-12 lg:col-span-7',
    tags: ['Python','PyQt5','TCP Socket','SQLite','SHA-256'],
    description: 'Ứng dụng truyền tệp theo mô hình Client–Server, tích hợp giao diện đồ họa, các chức năng điều khiển truyền tệp và kiểm tra tính toàn vẹn dữ liệu.',
    highlights: ['Desktop GUI with PyQt5', 'Client/server file-transfer workflow', 'Transfer management and file integrity'],
    githubUrl: '', demoUrl: '', demoVideo: `${import.meta.env.BASE_URL}videos/uplower.mp4`, image: '',
  },
  {
    id: 2, title: 'FEPA', subtitle: 'Personal finance management frontend',
    category: 'Frontend', role: 'Frontend Developer', status: 'Academic project', statusColor: '#22d3ee',
    label: 'FRONTEND', accent: '#a78bfa', colSpan: 'col-span-12 lg:col-span-5',
    tags: ['Frontend','UI Development','Personal Finance'],
    description: 'Ứng dụng quản lý tài chính cá nhân. Trong dự án này, tôi phụ trách phát triển giao diện người dùng Frontend.',
    highlights: ['Frontend interface development for FEPA', 'User-facing personal finance management screens', 'Working with the team on frontend integration'],
    githubUrl: '', demoUrl: '', demoVideo: `${import.meta.env.BASE_URL}videos/fepa.mp4`, image: '',
  },
  {
    id: 3, title: 'Course Registration', subtitle: 'Academic data management',
    category: 'Database', role: 'Database Developer', status: 'Academic project', statusColor: '#22d3ee',
    label: 'DATABASE', accent: '#10b981', colSpan: 'col-span-12',
    tags: ['MySQL','SQL','ERD','Relational Database'],
    description: 'Hệ thống quản lý đăng ký học phần dành cho sinh viên. Trong dự án này, tôi phụ trách thiết kế và xây dựng cơ sở dữ liệu.',
    highlights: ['Relational database design for academic data', 'SQL structures supporting course registration', 'Collaboration with the full-stack team'],
    githubUrl: '', demoUrl: '', demoVideo: `${import.meta.env.BASE_URL}videos/student-course.mp4`, image: '',
  }
]
