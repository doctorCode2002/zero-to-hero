
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AIHub } from './pages/AIHub';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { Mentors } from './pages/Mentors';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { Workspace } from './pages/Workspace';
import { Subscriptions } from './pages/Subscriptions';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-hub" element={<AIHub />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:studentId" element={<StudentDetail />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
