import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moeColors, moduleColors, moeBorderRadius, moeShadows } from '../theme/moeTheme';

/**
 * Dashboard - Main Entry Point - SHARED
 */

const modules = [
  {
    id: 'curriculum',
    path: '/curriculum',
    icon: '📚',
    titleAr: 'المناهج الدراسية',
    titleEn: 'Curriculum',
    descAr: 'إدارة وتخزين المناهج، استخراج المحتوى، تنظيم الكتب والفصول',
    descEn: 'Manage curriculum storage, content extraction, organize books and chapters',
    color: moduleColors.curriculum,
  },
  {
    id: 'lectures',
    path: '/lectures',
    icon: '📋',
    titleAr: 'خطط الدروس',
    titleEn: 'Lecture Plans',
    descAr: 'إنشاء خطط الدروس، العروض التقديمية، الأنشطة الصفية',
    descEn: 'Generate lecture plans, presentations, in-class activities',
    color: moduleColors.lectures,
  },
  {
    id: 'homework',
    path: '/homework',
    icon: '📝',
    titleAr: 'الواجبات والتقييم',
    titleEn: 'Homework & Assessment',
    descAr: 'إنشاء الواجبات، تصحيح الإجابات، متابعة التسليم',
    descEn: 'Create assignments, grade submissions, track homework',
    color: moduleColors.homework,
  },
  {
    id: 'analytics',
    path: '/analytics',
    icon: '📊',
    titleAr: 'التحليلات والتقارير',
    titleEn: 'Analytics & Reports',
    descAr: 'تحليل أداء الطلاب، التقارير، الإحصائيات',
    descEn: 'Student performance analysis, reports, statistics',
    color: moduleColors.analytics,
  },
];

const Dashboard = ({ language = 'ar' }) => {
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  const [hoveredCard, setHoveredCard] = useState(null);

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto' },
    welcome: { textAlign: 'center', marginBottom: '48px' },
    logo: {
      width: '80px',
      height: '80px',
      background: moeColors.primary.green,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      color: 'white',
      fontSize: '28px',
      margin: '0 auto 24px',
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: 700,
      color: moeColors.ui.textPrimary,
      marginBottom: '8px',
    },
    welcomeSubtitle: {
      fontSize: '16px',
      color: moeColors.ui.textSecondary,
      maxWidth: '500px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: moeColors.ui.textPrimary,
      marginBottom: '16px',
    },
    modulesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '48px',
    },
    moduleCard: {
      background: 'white',
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `1px solid ${moeColors.ui.border}`,
      boxShadow: moeShadows.sm,
    },
    moduleIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginBottom: '16px',
    },
    moduleTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: moeColors.ui.textPrimary,
      marginBottom: '8px',
    },
    moduleDesc: {
      fontSize: '14px',
      color: moeColors.ui.textSecondary,
      lineHeight: 1.5,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.welcome}>
        <div style={styles.logo}>وت</div>
        <h1 style={styles.welcomeTitle}>
          {isArabic ? 'مرحباً بك في مساعد المعلم' : 'Welcome to Teacher Assistant'}
        </h1>
        <p style={styles.welcomeSubtitle}>
          {isArabic 
            ? 'منصة متكاملة لدعم المعلمين في إدارة المناهج والدروس والواجبات'
            : 'An integrated platform to support teachers in managing curriculum, lessons, and assignments'}
        </p>
      </div>

      <h2 style={styles.sectionTitle}>
        {isArabic ? 'الأقسام الرئيسية' : 'Main Modules'}
      </h2>
      
      <div style={styles.modulesGrid}>
        {modules.map((module) => (
          <div
            key={module.id}
            style={{
              ...styles.moduleCard,
              borderTop: `4px solid ${module.color}`,
              transform: hoveredCard === module.id ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === module.id ? moeShadows.lg : moeShadows.sm,
            }}
            onClick={() => navigate(module.path)}
            onMouseEnter={() => setHoveredCard(module.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ ...styles.moduleIcon, background: `${module.color}15` }}>
              {module.icon}
            </div>
            <h3 style={styles.moduleTitle}>
              {isArabic ? module.titleAr : module.titleEn}
            </h3>
            <p style={styles.moduleDesc}>
              {isArabic ? module.descAr : module.descEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;