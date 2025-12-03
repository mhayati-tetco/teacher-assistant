import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

/**
 * CURRICULUM MODULE - Owner: curriculum branch
 * 
 * You can freely modify this file and add components in this folder.
 */

const CurriculumMain = ({ language = 'ar' }) => {
  const isArabic = language === 'ar';
  const [activeTab, setActiveTab] = useState('browse');

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: { fontSize: '24px', fontWeight: 700, color: moeColors.ui.textPrimary },
    uploadBtn: {
      background: moduleColors.curriculum,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: `1px solid ${moeColors.ui.border}`,
      paddingBottom: '8px',
    },
    tab: {
      padding: '8px 16px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      color: moeColors.ui.textSecondary,
      borderRadius: moeBorderRadius.md,
    },
    tabActive: {
      background: `${moduleColors.curriculum}15`,
      color: moduleColors.curriculum,
    },
    card: {
      background: 'white',
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      border: `1px solid ${moeColors.ui.border}`,
      marginBottom: '16px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      background: 'white',
      borderRadius: moeBorderRadius.md,
      padding: '20px',
      border: `1px solid ${moeColors.ui.border}`,
      textAlign: 'center',
    },
    statValue: { fontSize: '32px', fontWeight: 700, color: moduleColors.curriculum },
    statLabel: { fontSize: '14px', color: moeColors.ui.textSecondary, marginTop: '4px' },
    emptyState: { textAlign: 'center', padding: '48px', color: moeColors.ui.textSecondary },
  };

  const tabs = [
    { id: 'browse', labelAr: 'تصفح المناهج', labelEn: 'Browse Curriculum' },
    { id: 'upload', labelAr: 'رفع كتاب', labelEn: 'Upload Book' },
    { id: 'processing', labelAr: 'قيد المعالجة', labelEn: 'Processing' },
  ];

  const stats = [
    { value: '12', labelAr: 'كتاب مرفوع', labelEn: 'Books Uploaded' },
    { value: '156', labelAr: 'فصل', labelEn: 'Chapters' },
    { value: '3', labelAr: 'قيد المعالجة', labelEn: 'Processing' },
    { value: '89%', labelAr: 'نسبة الإكمال', labelEn: 'Completion' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isArabic ? 'إدارة المناهج الدراسية' : 'Curriculum Management'}
        </h1>
        <button style={styles.uploadBtn} onClick={() => setActiveTab('upload')}>
          <span>➕</span>
          {isArabic ? 'رفع كتاب جديد' : 'Upload New Book'}
        </button>
      </div>

      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{isArabic ? stat.labelAr : stat.labelEn}</div>
          </div>
        ))}
      </div>

      <div style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {isArabic ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {activeTab === 'browse' && (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
            <h3>{isArabic ? 'تصفح المناهج' : 'Browse Curriculum'}</h3>
            <p>{isArabic ? 'قم ببناء واجهة التصفح الهرمية هنا' : 'Build the hierarchical browser here'}</p>
            <p style={{ fontSize: '12px', marginTop: '16px' }}>Grade → Subject → Chapter → Topic</p>
          </div>
        )}
        
        {activeTab === 'upload' && (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📤</p>
            <h3>{isArabic ? 'رفع كتاب جديد' : 'Upload New Book'}</h3>
            <p>{isArabic ? 'قم ببناء واجهة رفع الملفات هنا' : 'Build file upload interface here'}</p>
          </div>
        )}
        
        {activeTab === 'processing' && (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
            <h3>{isArabic ? 'قيد المعالجة' : 'Processing Queue'}</h3>
            <p>{isArabic ? 'عرض حالة معالجة OCR هنا' : 'Show OCR processing status here'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CurriculumModule = ({ language }) => {
  return (
    <Routes>
      <Route index element={<CurriculumMain language={language} />} />
      <Route path="upload" element={<CurriculumMain language={language} />} />
      <Route path="book/:bookId" element={<CurriculumMain language={language} />} />
    </Routes>
  );
};

export default CurriculumModule;