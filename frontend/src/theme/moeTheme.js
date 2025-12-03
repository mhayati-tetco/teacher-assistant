/**
 * Ministry of Education (MOE) Brand Theme
 * Based on دليل الهوية البصرية وزارة التعليم 2025
 */

export const moeColors = {
  primary: {
    green: '#07a869',
    blue: '#3d7eb9',
    teal: '#0da9a6',
    darkBlue: '#15445a',
    gold: '#c1b489',
    gray: '#c2c1c1',
  },
  secondary: {
    purple: '#351375',
    purpleLight: '#7258a4',
    purpleLighter: '#7a80ff',
    blueAlt: '#3078a6',
    tealAlt: '#218caa',
    cyan: '#69cee3',
  },
  ui: {
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FA',
    border: '#E5E7EB',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    success: '#d4edda',
    error: '#f8d7da',
    errorText: '#c82333',
  },
  gradients: {
    sidebar: 'linear-gradient(180deg, #15445a 0%, #07a869 100%)',
    header: 'linear-gradient(90deg, #07a869 0%, #0da9a6 100%)',
  }
};

export const moeTypography = {
  fontFamily: {
    arabic: "'Tajawal', 'Helvetica Neue', sans-serif",
    english: "'Helvetica Neue', 'Tajawal', sans-serif",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
};

export const moeBorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};

export const moeShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
};

export const moduleColors = {
  curriculum: moeColors.primary.green,
  lectures: moeColors.primary.blue,
  homework: moeColors.secondary.tealAlt,
  analytics: moeColors.secondary.purple,
};

export default {
  colors: moeColors,
  typography: moeTypography,
  borderRadius: moeBorderRadius,
  shadows: moeShadows,
  moduleColors,
};