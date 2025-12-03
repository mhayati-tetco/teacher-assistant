import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

/**
 * LECTURES MODULE - Owner: lectures branch
 */

const LecturesMain = ({ language = 'ar' }) => {
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
    createBtn: {
      background: moduleColors.lectures,
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
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginTop: '24px',
    },
    featureCard: {
      background: moeColors.ui.backgroundSecondary,
      borderRadius: moeBorderRadius.md,
      padding: '20px',
      textAlign: 'center',
      cursor: 'pointer',
      border: `1px solid ${moeColors.ui.border}`,
    },
  };

  const features = [
    { icon: '📋', titleAr: 'إنشاء خطة درس', titleEn: 'Create Lecture Plan' },
    { icon: '📊', titleAr: 'عرض تقديمي', titleEn: 'Generate Presentation' },
    { icon: '📅', titleAr: 'الجدول الزمني', titleEn: 'Timeline View' },
    { icon: '🎥', titleAr: 'فيديوهات مقترحة', titleEn: 'Video Recommendations' },
    { icon: '👥', titleAr: 'مهام تعاونية', titleEn: 'Collaborative Tasks' },
    { icon: '📖', titleAr: 'مكتبة المواد', titleEn: 'Material Library' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{isArabic ? 'خطط الدروس' : 'Lecture Plans'}</h1>
        <button style={styles.createBtn}>
          ➕ {isArabic ? 'إنشاء خطة جديدة' : 'Create New Plan'}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
          <h3>{isArabic ? 'مرحباً بك في قسم خطط الدروس' : 'Welcome to Lecture Plans'}</h3>
          <p>{isArabic ? 'ابدأ بإنشاء خطة درس جديدة' : 'Start by creating a new lecture plan'}</p>
        </div>

        <div style={styles.featureGrid}>
          {features.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <span style={{ fontSize: '32px' }}>{feature.icon}</span>
              <p style={{ marginTop: '8px', fontWeight: 500 }}>
                {isArabic ? feature.titleAr : feature.titleEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LecturesModule = ({ language }) => {
  return (
    <Routes>
      <Route index element={<LecturesMain language={language} />} />
      <Route path="create" element={<LecturesMain language={language} />} />
      <Route path="plan/:planId" element={<LecturesMain language={language} />} />
    </Routes>
  );
};

export default LecturesModule;