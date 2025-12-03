import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

/**
 * HOMEWORK MODULE - Owner: homework branch
 */

const HomeworkMain = ({ language = 'ar' }) => {
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
      background: moduleColors.homework,
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
          {isArabic ? 'الواجبات والتقييم' : 'Homework & Assessment'}
        </h1>
        <button style={styles.createBtn}>
          ➕ {isArabic ? 'إنشاء واجب جديد' : 'Create Assignment'}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
          <h3>{isArabic ? 'قسم الواجبات' : 'Homework Section'}</h3>
          <p>{isArabic ? 'قم ببناء واجهة إدارة الواجبات هنا' : 'Build homework management interface here'}</p>
        </div>
      </div>
    </div>
  );
};

const HomeworkModule = ({ language }) => {
  return (
    <Routes>
      <Route index element={<HomeworkMain language={language} />} />
      <Route path="create" element={<HomeworkMain language={language} />} />
      <Route path="grade/:assignmentId" element={<HomeworkMain language={language} />} />
    </Routes>
  );
};

export default HomeworkModule;