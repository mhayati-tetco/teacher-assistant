import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { moeColors, moeTypography } from '../../theme/moeTheme';

/**
 * Main Layout Component - SHARED
 */
const Layout = ({ children }) => {
  const [language, setLanguage] = useState('ar');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const isRTL = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: moeColors.ui.backgroundSecondary,
      fontFamily: moeTypography.fontFamily.arabic,
      direction: isRTL ? 'rtl' : 'ltr',
    },
    main: {
      marginRight: isRTL ? (sidebarCollapsed ? '70px' : '280px') : 0,
      marginLeft: isRTL ? 0 : (sidebarCollapsed ? '70px' : '280px'),
      paddingTop: '64px',
      minHeight: '100vh',
      transition: 'margin 0.3s ease',
    },
    content: {
      padding: '24px',
      minHeight: 'calc(100vh - 64px)',
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar 
        language={language}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <Header 
        language={language}
        onLanguageChange={toggleLanguage}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <main style={styles.main}>
        <div style={styles.content}>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { language });
            }
            return child;
          })}
        </div>
      </main>
    </div>
  );
};

export default Layout;