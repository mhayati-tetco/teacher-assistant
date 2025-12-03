import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

/**
 * ANALYTICS MODULE - Owner: analytics branch
 */

const AnalyticsMain = ({ language = 'ar' }) => {
  const isArabic = language === 'ar';

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: { fontSize: '24px', fontWeight: 700, color: moeColors.ui.textPrimary },
    reportBtn: {
      background: moduleColors.analytics,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    card: {
      background: 'white',
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      border: `1px solid ${moeColors.ui.border}`,
    },
    emptyState: { textAlign: 'center', padding: '48px', color: moeColors.ui.textSecondary },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isArabic ? 'التحليلات والتقارير' : 'Analytics & Reports'}
        </h1>
        <button style={styles.reportBtn}>
          📊 {isArabic ? 'إنشاء تقرير' : 'Generate Report'}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📊</p>
          <h3>{isArabic ? 'قسم التحليلات' : 'Analytics Section'}</h3>
          <p>{isArabic ? 'قم ببناء لوحة التحليلات هنا' : 'Build analytics dashboard here'}</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>Use Chart.js or Recharts</p>
        </div>
      </div>
    </div>
  );
};

const AnalyticsModule = ({ language }) => {
  return (
    <Routes>
      <Route index element={<AnalyticsMain language={language} />} />
      <Route path="reports" element={<AnalyticsMain language={language} />} />
      <Route path="student/:studentId" element={<AnalyticsMain language={language} />} />
    </Routes>
  );
};

export default AnalyticsModule;