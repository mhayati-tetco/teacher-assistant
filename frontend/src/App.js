import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import { Layout } from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import CurriculumModule from './pages/curriculum/CurriculumModule';
import LecturesModule from './pages/lectures/LecturesModule';
import HomeworkModule from './pages/homework/HomeworkModule';
import AnalyticsModule from './pages/analytics/AnalyticsModule';

// Global Styles
import './App.css';

/**
 * MAIN APP - ENTRY POINT
 * ⚠️ SHARED FILE - Coordinate with team before modifying
 */

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Dashboard - Shared Entry Point */}
          <Route path="/" element={<Dashboard />} />
          
          {/* CURRICULUM - Owner: curriculum branch */}
          <Route path="/curriculum/*" element={<CurriculumModule />} />
          
          {/* LECTURES - Owner: lectures branch */}
          <Route path="/lectures/*" element={<LecturesModule />} />
          
          {/* HOMEWORK - Owner: homework branch */}
          <Route path="/homework/*" element={<HomeworkModule />} />
          
          {/* ANALYTICS - Owner: analytics branch */}
          <Route path="/analytics/*" element={<AnalyticsModule />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '48px' }}>
    <h1 style={{ fontSize: '48px' }}>404</h1>
    <p>الصفحة غير موجودة</p>
  </div>
);

export default App;