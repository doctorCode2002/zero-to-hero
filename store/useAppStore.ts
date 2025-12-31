
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  User, Mentor, Student, Course, Enrollment, 
  WorkspaceSession, Subscription, Settings, Lang, Expense, EnrollmentStatus
} from '../types';
import { id, nowISO, dateKey, round2 } from '../lib/utils';

interface State {
  currentUserId?: string;
  users: User[];
  mentors: Mentor[];
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  workspace: WorkspaceSession[];
  subscriptions: Subscription[];
  expenses: Expense[];
  settings: Settings;

  // Actions
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  
  // Mentors
  addMentor: (m: Omit<Mentor, "id">) => void;
  updateMentor: (id: string, patch: Partial<Mentor>) => void;
  deleteMentor: (id: string) => void;

  // Students
  addStudent: (s: Omit<Student, "id">) => void;
  addStudentsBatch: (students: Omit<Student, "id">[]) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Courses
  addCourse: (c: { title: string; mentorId?: string; priceTotal: number }) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Enrollment
  enrollStudent: (studentId: string, courseIds: string[]) => void;
  unenroll: (enrollmentId: string) => void;
  addCoursePayment: (enrollmentId: string, amount: number) => void;
  toggleAttendance: (enrollmentId: string, date: string) => void;
  updateEnrollment: (id: string, patch: Partial<Enrollment>) => void;

  // Workspace
  checkIn: (personName: string, date?: string) => void;
  checkOut: (sessionId: string) => void;
  deleteWorkspaceSession: (sessionId: string) => void;
  
  // Subscriptions
  addSubscription: (s: Omit<Subscription, "id" | "createdAt">) => void;
  addSubscriptionPayment: (subId: string, amount: number) => void;
  deleteSubscription: (subId: string) => void;

  // Expenses
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  deleteExpense: (id: string) => void;

  // Settings
  setSettings: (patch: Partial<Settings>) => void;
  importJSON: (json: string) => { ok: boolean; error?: string };
}

const defaultUsers: User[] = [
  { id: "u_admin", username: "admin", role: "admin", name: "Administrator" },
];

// --- DUMMY DATA GENERATION ---
const dummyMentors: Mentor[] = [
  { id: "m1", name: "Dr. Ahmed Salem", phone: "0599123456", email: "ahmed@edu.com", notes: "Senior Web Developer" },
  { id: "m2", name: "Sarah Johnson", phone: "0598765432", email: "sarah.j@design.com", notes: "UI/UX Specialist" },
  { id: "m3", name: "Mohammed Ali", phone: "0597112233", email: "mali@english.com", notes: "IELTS Certified Trainer" },
];

const dummyStudents: Student[] = [
  { id: "s1", name: "Omar Khalid", phone: "0592233445", email: "omar@mail.com" },
  { id: "s2", name: "Laila Mahmoud", phone: "0595566778", email: "laila@mail.com" },
  { id: "s3", name: "Yousef Hassan", phone: "0593344556", email: "yousef@mail.com" },
  { id: "s4", name: "Mariam Isaac", phone: "0591122334", email: "mariam@mail.com" },
  { id: "s5", name: "Zaid Amari", phone: "0596677889", email: "zaid@mail.com" },
];

const dummyCourses: Course[] = [
  { id: "c1", title: "Full-Stack React Bootcamp", mentorId: "m1", priceTotal: 1200, createdAt: nowISO() },
  { id: "c2", title: "Graphic Design Masterclass", mentorId: "m2", priceTotal: 800, createdAt: nowISO() },
  { id: "c3", title: "Business English Level 1", mentorId: "m3", priceTotal: 500, createdAt: nowISO() },
];

const dummyEnrollments: Enrollment[] = [
  { id: "e1", courseId: "c1", studentId: "s1", paidAmount: 1200, status: 'active', attendance: { [dateKey()]: true }, createdAt: nowISO() },
  { id: "e2", courseId: "c1", studentId: "s2", paidAmount: 600, status: 'active', attendance: {}, createdAt: nowISO() },
  { id: "e3", courseId: "c2", studentId: "s3", paidAmount: 800, status: 'completed', attendance: {}, createdAt: nowISO() },
  { id: "e4", courseId: "c3", studentId: "s4", paidAmount: 200, status: 'active', attendance: { [dateKey()]: true }, createdAt: nowISO() },
];

const dummyExpenses: Expense[] = [
  { id: "ex1", title: "Office Rent - March", amount: 1500, category: 'rent', date: dateKey(), createdAt: nowISO() },
  { id: "ex2", title: "Electricity Bill", amount: 240, category: 'utilities', date: dateKey(), createdAt: nowISO() },
  { id: "ex3", title: "Facebook Ads Campaign", amount: 350, category: 'marketing', date: dateKey(), createdAt: nowISO() },
];

const dummySubscriptions: Subscription[] = [
  { id: "sub1", personName: "Zaid Amari", studentId: "s5", plan: "monthly", totalPrice: 350, paidAmount: 350, method: "cash", createdAt: nowISO() },
  { id: "sub2", personName: "Guest User 1", plan: "daily", totalPrice: 20, paidAmount: 0, method: "cash", createdAt: nowISO() },
];

const dummyWorkspace: WorkspaceSession[] = [
  { id: "w1", personName: "Omar Khalid", date: dateKey(), checkInAt: nowISO() },
  { id: "w2", personName: "Laila Mahmoud", date: dateKey(), checkInAt: nowISO() },
];

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      currentUserId: "u_admin",
      users: defaultUsers,
      mentors: dummyMentors,
      students: dummyStudents,
      courses: dummyCourses,
      enrollments: dummyEnrollments,
      workspace: dummyWorkspace,
      subscriptions: dummySubscriptions,
      expenses: dummyExpenses,
      settings: { 
        lang: "ar", 
        hourlyRate: 5, 
        theme: 'dark',
        currency: 'ILS',
        subPrices: {
          daily: 20,
          weekly: 120,
          monthly: 350
        }
      },

      login: (username, password) => {
        const user = get().users.find((u) => u.username === username);
        if (!user || password !== "admin") return { ok: false, error: "Invalid credentials (use 'admin')" };
        set({ currentUserId: user.id });
        return { ok: true };
      },
      logout: () => set({ currentUserId: undefined }),

      addMentor: (m) => set((s) => ({ mentors: [...s.mentors, { ...m, id: id() }] })),
      updateMentor: (id, patch) => set((s) => ({ 
        mentors: s.mentors.map(m => m.id === id ? { ...m, ...patch } : m) 
      })),
      deleteMentor: (id) => set((s) => ({
        mentors: s.mentors.filter(m => m.id !== id),
        courses: s.courses.map(c => c.mentorId === id ? { ...c, mentorId: undefined } : c)
      })),

      addStudent: (st) => set((s) => ({ students: [...s.students, { ...st, id: id() }] })),
      addStudentsBatch: (newStudents) => set((s) => ({
        students: [...s.students, ...newStudents.map(st => ({ ...st, id: id() }))]
      })),
      updateStudent: (id, patch) => set((s) => ({
        students: s.students.map(st => st.id === id ? { ...st, ...patch } : st)
      })),
      deleteStudent: (sid) => set((s) => ({
        students: s.students.filter(st => st.id !== sid),
        enrollments: s.enrollments.filter(e => e.studentId !== sid),
        subscriptions: s.subscriptions.filter(sub => sub.studentId !== sid)
      })),

      addCourse: (c) => set((s) => ({
        courses: [...s.courses, { ...c, id: id(), createdAt: nowISO() }]
      })),
      updateCourse: (id, patch) => set((s) => ({
        courses: s.courses.map(c => c.id === id ? { ...c, ...patch } : c)
      })),
      deleteCourse: (id) => set((s) => ({
        courses: s.courses.filter(c => c.id !== id),
        enrollments: s.enrollments.filter(e => e.courseId !== id)
      })),

      enrollStudent: (studentId, courseIds) => set((s) => {
        const existing = new Set(s.enrollments.filter(e => e.studentId === studentId).map(e => e.courseId));
        const newEnrollments = courseIds
          .filter(cid => !existing.has(cid))
          .map(courseId => ({
            id: id(),
            courseId,
            studentId,
            paidAmount: 0,
            attendance: {},
            status: 'active' as EnrollmentStatus,
            createdAt: nowISO()
          }));
        return { enrollments: [...s.enrollments, ...newEnrollments] };
      }),
      unenroll: (enrollmentId) => set((s) => ({ 
        enrollments: s.enrollments.filter(e => e.id !== enrollmentId) 
      })),
      addCoursePayment: (enrollmentId, amount) => set((s) => ({
        enrollments: s.enrollments.map(e => e.id === enrollmentId ? { ...e, paidAmount: round2(e.paidAmount + amount) } : e)
      })),
      toggleAttendance: (enrollmentId, date) => set((s) => ({
        enrollments: s.enrollments.map(e => {
          if (e.id !== enrollmentId) return e;
          const current = !!e.attendance[date];
          return { ...e, attendance: { ...e.attendance, [date]: !current } };
        })
      })),
      updateEnrollment: (id, patch) => set((s) => ({
        enrollments: s.enrollments.map(e => e.id === id ? { ...e, ...patch } : e)
      })),

      checkIn: (personName, date) => set((s) => ({
        workspace: [...s.workspace, { 
          id: id(), 
          personName, 
          date: date || dateKey(), 
          checkInAt: nowISO() 
        }]
      })),
      checkOut: (sessionId) => set((s) => ({
        workspace: s.workspace.map(w => w.id === sessionId ? { ...w, checkOutAt: nowISO() } : w)
      })),
      deleteWorkspaceSession: (sessionId) => set((s) => ({
        workspace: s.workspace.filter(w => w.id !== sessionId)
      })),

      addSubscription: (sub) => set((s) => ({
        subscriptions: [...s.subscriptions, { ...sub, id: id(), createdAt: nowISO() }]
      })),
      addSubscriptionPayment: (subId, amount) => set((s) => ({
        subscriptions: s.subscriptions.map(sub => sub.id === subId ? { ...sub, paidAmount: round2(sub.paidAmount + amount) } : sub)
      })),
      deleteSubscription: (subId) => set((s) => ({
        subscriptions: s.subscriptions.filter(sub => sub.id !== subId)
      })),

      addExpense: (e) => set((s) => ({
        expenses: [...s.expenses, { ...e, id: id(), createdAt: nowISO() }]
      })),
      deleteExpense: (id) => set((s) => ({
        expenses: s.expenses.filter(e => e.id !== id)
      })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      importJSON: (json) => {
        try {
          const parsed = JSON.parse(json);
          set({ ...parsed, currentUserId: "u_admin" });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: "Parse Error" };
        }
      }
    }),
    {
      name: 'z2h-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
