import React from 'react';
import { useLocation } from 'react-router-dom';
import { moeColors } from '../../theme/moeTheme';

const pageTitles = {
  '/': { ar: 'الرئيسية', en: 'Dashboard' },
  '/curriculum': { ar: 'المناهج الدراسية', en: 'Curriculum Management' },
  '/lectures': { ar: 'خطط الدروس', en: 'Lecture Plans' },
  '/homework': { ar: 'الواجبات والتقييم', en: 'Homework & Assessment' },
  '/analytics': { ar: 'التحليلات والتقارير', en: 'Analytics & Reports' },
};

const Header = ({ language, onLanguageChange, sidebarCollapsed }) => {
  const location = useLocation();
  const isRTL = language === 'ar';
  
  const currentPath = Object.keys(pageTitles).find(
    path => location.pathname === path || 
    (path !== '/' && location.pathname.startsWith(path))
  ) || '/';
  
  const pageTitle = pageTitles[currentPath] || pageTitles['/'];

  const styles = {
    header: {
      height: '64px',
      background: moeColors.ui.background,
      borderBottom: `1px solid ${moeColors.ui.border}`,
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      right: isRTL ? (sidebarCollapsed ? '70px' : '280px') : 0,
      left: isRTL ? 0 : (sidebarCollapsed ? '70px' : '280px'),
      zIndex: 90,
      transition: 'left 0.3s, right 0.3s',
    },
    titleSection: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: '20px',
      fontWeight: 700,
      color: moeColors.ui.textPrimary,
      margin: 0,
    },
    subtitle: {
      fontSize: '13px',
      color: moeColors.ui.textSecondary,
      margin: 0,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    langToggle: {
      background: moeColors.ui.backgroundSecondary,
      border: `1px solid ${moeColors.ui.border}`,
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '14px',
      fontWeight: 500,
      color: moeColors.ui.textPrimary,
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: moeColors.primary.green,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.titleSection}>
        <h1 style={styles.title}>
          {language === 'ar' ? pageTitle.ar : pageTitle.en}
        </h1>
        <p style={styles.subtitle}>
          {language === 'ar' 
            ? 'وزارة التعليم - المملكة العربية السعودية' 
            : 'Ministry of Education - Saudi Arabia'}
        </p>
      </div>
      
      <div style={styles.actions}>
        <button style={styles.langToggle} onClick={onLanguageChange}>
          {language === 'ar' ? 'English' : 'العربية'}
        </button>
        <div style={styles.userAvatar}>م</div>
      </div>
    </header>
  );
};

export default Header;