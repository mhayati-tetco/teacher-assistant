import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/*
 * TEACHER UPLOAD ANALYTICS MODULE - Owner: analytics branch
 */

// Import theme (or use inline theme matching moeTheme.js)
const moeColors = {
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
const moduleColors = {
  curriculum: moeColors.primary.green,
  lectures: moeColors.primary.blue,
  homework: moeColors.secondary.tealAlt,
  analytics: moeColors.secondary.purple,
};
const moeBorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};
const moeShadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
};

const TeacherUploadModule = ({ language = 'ar' }) => {
  const isArabic = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  // n8n webhook URL - COPY THIS EXACT URL FROM YOUR n8n WEBHOOK NODE
  // It should look like: http://localhost:5678/webhook/teacher-analytics
  const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 
    'http://localhost:5678/webhook-test/teacher-analytics';

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'csv') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError(isArabic ? 'يرجى اختيار ملف Excel أو CSV' : 'Please select an Excel or CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError(isArabic ? 'يرجى اختيار ملف أولاً' : 'Please select a file first');
      return;
    }

    setUploading(true);
    setLoading(true);
    setError(null);

    try {
      // Read file as binary
    const fileReader = new FileReader();

    const fileContent = await new Promise((resolve, reject) => {
        fileReader.onload = (e) => resolve(e.target.result);
        fileReader.onerror = (e) => reject(e);
        fileReader.readAsArrayBuffer(selectedFile); // <-- binary
    });

      console.log('Sending to n8n:', N8N_WEBHOOK_URL);
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);

      // Send as JSON to n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData, // <-- send as binary
    });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Upload failed: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Received data:', result);
      
      setAnalyticsData(result);
      alert(isArabic ? 'تم التحليل بنجاح!' : 'Analysis completed successfully!');
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(isArabic 
        ? `فشل الرفع: ${err.message}` 
        : `Upload failed: ${err.message}`
      );
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (!analyticsData?.charts) return null;

    const { lineData, barData, pieData } = analyticsData.charts;

    return (
      <div style={styles.chartsContainer}>
        {lineData && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              {isArabic ? 'الأداء عبر الزمن' : 'Performance Over Time'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={moduleColors.analytics} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {barData && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              {isArabic ? 'مقارنة الأداء' : 'Performance Comparison'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={moduleColors.analytics} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              {isArabic ? 'التوزيع' : 'Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderInsights = () => {
    if (!analyticsData) return null;

    const { strengths, weaknesses, recommendations } = analyticsData;

    return (
      <div style={styles.insightsContainer}>
        {strengths && strengths.length > 0 && (
          <div style={styles.insightCard}>
            <h3 style={{ ...styles.insightTitle, color: moeColors.primary.green }}>
              ✅ {isArabic ? 'نقاط القوة' : 'Strengths'}
            </h3>
            <ul style={styles.insightList}>
              {strengths.map((strength, index) => (
                <li key={index} style={styles.insightItem}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses && weaknesses.length > 0 && (
          <div style={styles.insightCard}>
            <h3 style={{ ...styles.insightTitle, color: moeColors.ui.errorText }}>
              ⚠️ {isArabic ? 'نقاط الضعف' : 'Weaknesses'}
            </h3>
            <ul style={styles.insightList}>
              {weaknesses.map((weakness, index) => (
                <li key={index} style={styles.insightItem}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div style={styles.insightCard}>
            <h3 style={{ ...styles.insightTitle, color: moduleColors.analytics }}>
              💡 {isArabic ? 'توصيات للمعلم' : 'Teacher Recommendations'}
            </h3>
            <ul style={styles.insightList}>
              {recommendations.map((recommendation, index) => (
                <li key={index} style={styles.insightItem}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const styles = {
    container: { 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: "'Tajawal', 'Helvetica Neue', sans-serif"
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: { 
      fontSize: '24px', 
      fontWeight: 700, 
      color: moeColors.ui.textPrimary 
    },
    uploadSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    fileInput: {
      display: 'none',
    },
    fileLabel: {
      background: moeColors.ui.backgroundSecondary,
      color: moeColors.ui.textPrimary,
      border: `1px solid ${moeColors.ui.border}`,
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-block',
      transition: 'all 0.2s ease',
      boxShadow: moeShadows.sm,
    },
    uploadBtn: {
      background: moduleColors.analytics,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
      opacity: uploading || !selectedFile ? 0.6 : 1,
      transition: 'all 0.2s ease',
      boxShadow: moeShadows.md,
    },
    fileName: {
      fontSize: '14px',
      color: moeColors.ui.textSecondary,
      fontWeight: 500,
    },
    card: {
      background: moeColors.ui.background,
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      border: `1px solid ${moeColors.ui.border}`,
      marginBottom: '24px',
      boxShadow: moeShadows.sm,
    },
    emptyState: { 
      textAlign: 'center', 
      padding: '48px', 
      color: moeColors.ui.textSecondary,
    },
    errorState: {
      textAlign: 'center',
      padding: '24px',
      color: moeColors.ui.errorText,
      background: moeColors.ui.error,
      borderRadius: moeBorderRadius.md,
      marginBottom: '24px',
      border: `1px solid ${moeColors.ui.errorText}`,
    },
    chartsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '24px',
    },
    chartCard: {
      background: moeColors.ui.background,
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      border: `1px solid ${moeColors.ui.border}`,
      boxShadow: moeShadows.md,
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: moeColors.ui.textPrimary,
      marginBottom: '16px',
    },
    insightsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
    },
    insightCard: {
      background: moeColors.ui.background,
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      border: `1px solid ${moeColors.ui.border}`,
      boxShadow: moeShadows.md,
    },
    insightTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '16px',
    },
    insightList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    insightItem: {
      padding: '12px 0',
      borderBottom: `1px solid ${moeColors.ui.border}`,
      fontSize: '14px',
      color: moeColors.ui.textPrimary,
      lineHeight: '1.6',
    },
  };

  const COLORS = [
    moeColors.secondary.purple,      // #351375
    moeColors.primary.blue,          // #3d7eb9
    moeColors.primary.green,         // #07a869
    moeColors.secondary.tealAlt,     // #218caa
    moeColors.secondary.purpleLight, // #7258a4
    moeColors.primary.teal,          // #0da9a6
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isArabic ? 'تحليل بيانات' : 'Data Analytics'}
        </h1>
        <div style={styles.uploadSection}>
          <input
            type="file"
            id="file-upload"
            accept=".xlsx,.csv"
            onChange={handleFileSelect}
            style={styles.fileInput}
          />
          <label htmlFor="file-upload" style={styles.fileLabel}>
            📎 {isArabic ? 'اختر ملف' : 'Choose File'}
          </label>
          {selectedFile && (
            <span style={styles.fileName}>
              {selectedFile.name}
            </span>
          )}
          <button
            style={styles.uploadBtn}
            onClick={handleUploadAndAnalyze}
            disabled={uploading || !selectedFile}
          >
            🚀 {uploading
              ? (isArabic ? 'جاري التحليل...' : 'Analyzing...')
              : (isArabic ? 'رفع وتحليل' : 'Upload & Analyze')
            }
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.errorState}>
          <p style={{ margin: 0, fontWeight: 600 }}>❌ {error}</p>
        </div>
      )}

      {!analyticsData && !loading && (
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📊</p>
            <h3>{isArabic ? 'ابدأ التحليل' : 'Start Analysis'}</h3>
            <p>{isArabic ? 'قم برفع ملف Excel أو CSV لتحليل بيانات الطلاب' : 'Upload an Excel or CSV file to analyze student data'}</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              {isArabic ? 'الذكاء الاصطناعي سيقوم بتحليل البيانات وتقديم توصيات' : 'AI will analyze data and provide recommendations'}
            </p>
          </div>
        </div>
      )}

      {loading && !analyticsData && (
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
            <h3>{isArabic ? 'جاري التحليل...' : 'Analyzing...'}</h3>
            <p>{isArabic ? 'يرجى الانتظار بينما نقوم بتحليل البيانات' : 'Please wait while we analyze the data'}</p>
          </div>
        </div>
      )}

      {analyticsData && (
        <>
          {renderCharts()}
          {renderInsights()}
        </>
      )}
    </div>
  );
};

export default TeacherUploadModule;