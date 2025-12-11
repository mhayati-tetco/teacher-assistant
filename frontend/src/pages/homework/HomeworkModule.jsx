import React, { useState } from 'react';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';
import CorrectionTab from './CorrectionTab';
import CreationTab from './CreationTab';

const HomeworkGradingAgent = () => {
  const [activeTab, setActiveTab] = useState('correction');
  const [sessionId] = useState('web-' + Date.now().toString(36));
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Access theme values the same way as CurriculumModule
  const surfaceColor = isDarkMode ? moeColors.ui.surfaceDark : moeColors.ui.surface;
  const textPrimaryColor = isDarkMode ? moeColors.ui.textPrimaryDark : moeColors.ui.textPrimary;
  const textSecondaryColor = isDarkMode ? moeColors.ui.textSecondaryDark : moeColors.ui.textSecondary;
  const borderColor = moeColors.ui.border;

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: isDarkMode ? '#0f172a' : '#fafbfc',
      minHeight: '100vh',
      color: textPrimaryColor,
    },
    header: {
      background: surfaceColor,
      borderBottom: `3px solid ${moduleColors.homework}`,
      padding: '24px 32px',
      marginBottom: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    logo: {
      width: '40px',
      height: '40px',
      background: moduleColors.homework,
      borderRadius: moeBorderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      color: 'white',
    },
    title: {
      margin: '0 0 4px 0',
      fontSize: '1.25rem',
      fontWeight: 700,
      color: textPrimaryColor,
    },
    subtitle: {
      fontSize: '0.875rem',
      color: textSecondaryColor,
    },
    tabs: {
      background: surfaceColor,
      borderBottom: `1px solid ${borderColor}`,
      padding: '0 32px',
      display: 'flex',
      gap: '16px',
    },
    tab: {
      padding: '16px 24px',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      fontWeight: 600,
      fontSize: '0.875rem',
      color: textSecondaryColor,
      transition: 'all 0.2s',
    },
    tabActive: {
      color: moduleColors.homework,
      borderBottomColor: moduleColors.homework,
    },
    content: {
      maxWidth: '1200px',
      margin: '24px auto 0',
    },
    darkModeBtn: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: surfaceColor,
      border: `1px solid ${borderColor}`,
      width: '48px',
      height: '48px',
      borderRadius: moeBorderRadius.full,
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      color: textPrimaryColor,
    },
  };

  const tabStyle = (isActive) => ({
    ...styles.tab,
    ...(isActive ? styles.tabActive : {}),
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>📚</div>
          <div>
            <h1 style={styles.title}>وكيل تصحيح الواجبات</h1>
            <div style={styles.subtitle}>وزارة التعليم | المملكة العربية السعودية</div>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        <div 
          style={tabStyle(activeTab === 'correction')}
          onClick={() => setActiveTab('correction')}
        >
          📊 تصحيح الواجب
        </div>
        <div 
          style={tabStyle(activeTab === 'creation')}
          onClick={() => setActiveTab('creation')}
        >
          ➕ إنشاء الواجب
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'correction' && <CorrectionTab sessionId={sessionId} isDarkMode={isDarkMode} />}
        {activeTab === 'creation' && <CreationTab isDarkMode={isDarkMode} />}
      </div>

      <button 
        style={styles.darkModeBtn}
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default HomeworkGradingAgent;