import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { moeColors, moduleColors } from '../../theme/moeTheme';

const navItems = [
  { id: 'dashboard', path: '/', icon: '🏠', labelAr: 'الرئيسية', labelEn: 'Dashboard' },
  { id: 'curriculum', path: '/curriculum', icon: '📚', labelAr: 'المناهج الدراسية', labelEn: 'Curriculum', color: moduleColors.curriculum },
  { id: 'lectures', path: '/lectures', icon: '📋', labelAr: 'خطط الدروس', labelEn: 'Lecture Plans', color: moduleColors.lectures },
  { id: 'homework', path: '/homework', icon: '📝', labelAr: 'الواجبات', labelEn: 'Homework', color: moduleColors.homework },
  { id: 'analytics', path: '/analytics', icon: '📊', labelAr: 'التحليلات', labelEn: 'Analytics', color: moduleColors.analytics },
];

const Sidebar = ({ language = 'ar', collapsed, onToggle }) => {
  const location = useLocation();
  const isRTL = language === 'ar';

  const styles = {
    sidebar: {
      width: collapsed ? '70px' : '280px',
      background: moeColors.gradients.sidebar,
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      top: 0,
      right: isRTL ? 0 : 'auto',
      left: isRTL ? 'auto' : 0,
      height: '100vh',
      zIndex: 100,
      overflow: 'hidden',
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logo: {
      width: '48px',
      height: '48px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '14px',
      flexShrink: 0,
    },
    title: {
      fontSize: '16px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      display: collapsed ? 'none' : 'block',
    },
    nav: {
      flex: 1,
      padding: '16px 0',
      overflowY: 'auto',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 24px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderRight: isRTL ? '3px solid transparent' : 'none',
      borderLeft: isRTL ? 'none' : '3px solid transparent',
      color: 'rgba(255,255,255,0.8)',
      textDecoration: 'none',
    },
    navItemActive: {
      background: 'rgba(255,255,255,0.15)',
      borderRightColor: isRTL ? 'white' : 'transparent',
      borderLeftColor: isRTL ? 'transparent' : 'white',
      color: 'white',
    },
    navIcon: {
      fontSize: '24px',
      flexShrink: 0,
      width: '24px',
      textAlign: 'center',
    },
    navText: {
      fontSize: '15px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      display: collapsed ? 'none' : 'block',
    },
    footer: {
      padding: '16px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    },
    toggleBtn: {
      width: '100%',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '14px',
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}><span>وت</span></div>
        <div style={styles.title}>
          {language === 'ar' ? 'مساعد المعلم' : 'Teacher Assistant'}
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navText}>
                {language === 'ar' ? item.labelAr : item.labelEn}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <button style={styles.toggleBtn} onClick={onToggle}>
          {collapsed ? (isRTL ? '◀' : '▶') : (isRTL ? '▶' : '◀')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;