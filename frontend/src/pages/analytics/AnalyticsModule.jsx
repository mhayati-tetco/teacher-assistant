import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

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
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const tabs = [
    { id: 'analysis', labelAr: 'تحليل', labelEn: 'Analysis' },
    { id: 'student-analysis', labelAr: 'تحليل لكل طالب', labelEn: 'Analysis for each student' }];
  const [activeTab, setActiveTab] = useState('analysis');
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAnalysis, setStudentAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingStudentList, setLoadingStudentList] = useState(false);

  // n8n webhook URL - COPY THIS EXACT URL FROM YOUR n8n WEBHOOK NODE
  const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 
    'http://localhost:5678/webhook/teacher-analytics';

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
    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    // ADD: Store the file for later use
    setUploadedFileData(selectedFile);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
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

useEffect(() => {
  if (activeTab === 'student-analysis') {

    // Enforce: TAB 1 must run before TAB 2
    if (!analyticsData) {
      alert(isArabic ? "قم بإجراء التحليل العام أولاً" : "Please run the main analysis first.");
      setActiveTab('analysis');
      return;
    }

    fetchStudentList();
  }
}, [activeTab]);




  const fetchStudentList = async () => {
  try {
    setLoadingStudentList(true);
    console.log("Fetching student list from n8n...");
    
    // Check if file is uploaded
    if (!uploadedFileData) {
      setError(isArabic ? 'يرجى رفع الملف أولاً' : 'Please upload a file first');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', uploadedFileData, uploadedFileData.name);
    formData.append('action', 'getStudentList'); // Tell n8n what you want
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    const data = await response.json();
    console.log("Received students:", data);
    
    setStudentList(data.students || []); 
  } catch (err) {
    console.error("Failed to load students", err);
    setError(isArabic ? 'فشل تحميل قائمة الطلاب' : 'Failed to load student list');
  } finally {
    setLoadingStudentList(false);
  }
};



  // Analysis for each students
  const loadStudentAnalysis = async (studentName) => {
  try {
    setLoadingAnalysis(true);
    setStudentAnalysis(null);

    // Check if file is uploaded
    if (!uploadedFileData) {
      setError(isArabic ? 'يرجى رفع الملف أولاً' : 'Please upload a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadedFileData, uploadedFileData.name);
    formData.append('student', studentName);
    formData.append('action', 'analyzeStudent');

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: formData, // Send as FormData instead of JSON
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    setStudentAnalysis(data);
  } catch (error) {
    console.error("Error loading analysis", error);
    setError(isArabic ? 'فشل تحليل الطالب' : 'Failed to analyze student');
  } finally {
    setLoadingAnalysis(false);
  }
};



  const renderCharts = () => {
  if (!analyticsData?.charts) return null;

  const {
    lineData,
    barData,
    pieData,
    areaData,
    scatterData,
    radarData,
    stackedBarData,
    heatmapData
  } = analyticsData.charts;

  return (
    <div style={styles.chartsContainer}>
      
      {/* LINE CHART */}
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
          {analyticsData.charts.lineDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.lineDataComment}</p>
        )}
        </div>
        

      )}

      {/* BAR CHART */}
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
          {analyticsData.charts.barDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.barDataComment}</p>
        )}
        </div>
      )}

      {/* PIE / DONUT CHART */}
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
          {analyticsData.charts.pieDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.pieDataComment}</p>
        )}
        </div>
      )}

      {/* AREA CHART */}
      {areaData && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {isArabic ? 'التقدم الكلي' : 'Cumulative Progress'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={moduleColors.analytics} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={moduleColors.analytics} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={moduleColors.analytics} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
          {analyticsData.charts.areaDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.areaDataComment}</p>
        )}
        </div>
      )}

      {/* SCATTER CHART */}
      {scatterData && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {isArabic ? 'العلاقة بين المتغيرات' : 'Correlation Between Variables'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="X" />
              <YAxis dataKey="y" name="Y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill={moduleColors.analytics} />
            </ScatterChart>
          </ResponsiveContainer>
          {analyticsData.charts.scatterDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.scatterDataComment}</p>
        )}
        </div>
      )}

      {/* RADAR CHART */}
      {radarData && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {isArabic ? 'نقاط القوة والضعف' : 'Strengths & Weaknesses'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar dataKey="score" stroke={moduleColors.analytics} fill={moduleColors.analytics} fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          {analyticsData.charts.radarDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.radarDataComment}</p>
        )}
        </div>
      )}

      {/* STACKED BAR CHART */}
      {stackedBarData && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {isArabic ? 'مقارنة متعددة' : 'Multi-Category Comparison'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="A" stackId="group" fill={COLORS[0]} />
              <Bar dataKey="B" stackId="group" fill={COLORS[1]} />
              <Bar dataKey="C" stackId="group" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
          {analyticsData.charts.stackedBarDataComment && (
          <p style={styles.chartComment}>{analyticsData.charts.stackedBarDataComment}</p>
        )}
        </div>
      )}

      {/* HEATMAP (SIMULATED) */}
      {heatmapData && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            {isArabic ? 'خريطة الأداء' : 'Performance Heatmap'}
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={styles.heatHeader}></th>
                  {heatmapData.subjects.map((s, i) => (
                    <th key={i} style={styles.heatHeader}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.students.map((row, rIndex) => (
                  <tr key={rIndex}>
                    <td style={styles.heatName}>{row.name}</td>
                    {row.values.map((value, cIndex) => (
                      <td
                        key={cIndex}
                        style={{
                          ...styles.heatCell,
                          backgroundColor: `rgba(0, 128, 0, ${value / 100})`,
                          color: value > 50 ? "white" : "black"
                        }}
                      >
                        {value}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      background: moduleColors.curriculum,
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

    chartComment: {
  marginTop: '12px',
  fontSize: '14px',
  color: moeColors.ui.textSecondary,
  lineHeight: '1.6',
  background: moeColors.ui.backgroundSecondary,
  padding: '12px',
  borderRadius: moeBorderRadius.md,
  border: `1px solid ${moeColors.ui.border}`,
},

// Add these to your existing styles object
quizContainer: {
  marginTop: '24px',
},
loadingScreen: {
  textAlign: 'center',
  padding: '48px',
},
loadingIcon: {
  fontSize: '64px',
  marginBottom: '16px',
},
spinner: {
  width: '40px',
  height: '40px',
  margin: '0 auto 16px',
  border: `4px solid ${moeColors.ui.border}`,
  borderTop: `4px solid ${moduleColors.analytics}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
},
loadingTitle: {
  fontSize: '20px',
  fontWeight: 600,
  color: moeColors.ui.textPrimary,
  marginBottom: '8px',
},
loadingSubtitle: {
  fontSize: '14px',
  color: moeColors.ui.textSecondary,
},
progressContainer: {
  marginBottom: '24px',
},
progressText: {
  fontSize: '14px',
  fontWeight: 600,
  color: moeColors.ui.textPrimary,
  marginBottom: '8px',
},
progressBar: {
  width: '100%',
  height: '8px',
  background: moeColors.ui.backgroundSecondary,
  borderRadius: moeBorderRadius.sm,
  overflow: 'hidden',
},
progressFill: {
  height: '100%',
  background: moduleColors.analytics,
  transition: 'width 0.3s ease',
},
questionCard: {
  background: moeColors.ui.background,
  borderRadius: moeBorderRadius.lg,
  padding: '32px',
  border: `1px solid ${moeColors.ui.border}`,
  boxShadow: moeShadows.md,
  marginBottom: '24px',
},
questionNumber: {
  fontSize: '14px',
  fontWeight: 600,
  color: moduleColors.analytics,
  marginBottom: '16px',
},
questionText: {
  fontSize: '18px',
  fontWeight: 600,
  color: moeColors.ui.textPrimary,
  marginBottom: '24px',
  lineHeight: '1.6',
},
answersGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
},
answerBtn: {
  padding: '16px',
  background: moeColors.ui.backgroundSecondary,
  border: `2px solid ${moeColors.ui.border}`,
  borderRadius: moeBorderRadius.md,
  fontSize: '14px',
  fontWeight: 500,
  color: moeColors.ui.textPrimary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
},
answerBtnSelected: {
  background: moduleColors.analytics,
  borderColor: moduleColors.analytics,
  color: 'white',
},
navigation: {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
},
navBtn: {
  padding: '12px 32px',
  background: moduleColors.analytics,
  color: 'white',
  border: 'none',
  borderRadius: moeBorderRadius.md,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
},
resultsScreen: {
  textAlign: 'center',
  padding: '48px',
  background: moeColors.ui.background,
  borderRadius: moeBorderRadius.lg,
  border: `1px solid ${moeColors.ui.border}`,
  boxShadow: moeShadows.md,
},
resultsIcon: {
  fontSize: '64px',
  marginBottom: '16px',
},
resultsTitle: {
  fontSize: '24px',
  fontWeight: 700,
  color: moeColors.ui.textPrimary,
  marginBottom: '16px',
},
resultsScore: {
  fontSize: '48px',
  fontWeight: 700,
  color: moduleColors.analytics,
  marginBottom: '8px',
},
resultsPercentage: {
  fontSize: '32px',
  fontWeight: 600,
  color: moeColors.primary.green,
  marginBottom: '16px',
},
resultsMessage: {
  fontSize: '16px',
  color: moeColors.ui.textSecondary,
  marginBottom: '24px',
},
resultsActions: {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  flexWrap: 'wrap',
},
actionBtn: {
  padding: '12px 32px',
  background: moduleColors.analytics,
  color: 'white',
  border: 'none',
  borderRadius: moeBorderRadius.md,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
},
actionBtnSecondary: {
  background: moeColors.ui.backgroundSecondary,
  color: moeColors.ui.textPrimary,
  border: `1px solid ${moeColors.ui.border}`,
},
cardsGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px',
  marginBottom: '24px',
},
card: {
  background: moeColors.ui.background,
  borderRadius: moeBorderRadius.lg,
  padding: '24px',
  border: `1px solid ${moeColors.ui.border}`,
  boxShadow: moeShadows.sm,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  ':hover': {
    boxShadow: moeShadows.md,
    transform: 'translateY(-2px)',
  }
},
backBtn: {
  background: moeColors.ui.backgroundSecondary,
  color: moeColors.ui.textPrimary,
  border: `1px solid ${moeColors.ui.border}`,
  padding: '10px 20px',
  borderRadius: moeBorderRadius.md,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
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
        {isArabic ? 'التحليلات والاختبارات' : 'Analytics & Assessments'}
      </h1>
    </div>

    {/* ADD TABS HERE */}
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

    {/* Error Display */}
    {error && (
      <div style={styles.errorState}>
        <p style={{ margin: 0, fontWeight: 600 }}>❌ {error}</p>
      </div>
    )}

    {/* TAB 1: Analysis Content */}
    {activeTab === 'analysis' && (
      <>
        {(
          <>
            <div style={styles.header}>
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
                    : (isArabic ? ' تحليل' : 'Analyze')
                  }
                </button>
              </div>
            </div>

            {!analyticsData && !loading && (
              <div style={styles.card}>
                <div style={styles.emptyState}>
                  <p style={{ fontSize: '48px', marginBottom: '16px' }}>📊</p>
                  <h3>{isArabic ? 'ابدأ التحليل' : 'Start Analysis'}</h3>
                  <p>{isArabic ? 'قم برفع ملف Excel أو CSV لتحليل بيانات الطلاب' : 'Upload an Excel or CSV file to analyze student data'}</p>
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
          </>
        )}
      </>
    )}

    {/* TAB 2: Analysis for each student Content */}
{activeTab === 'student-analysis' && (
  <div>
    {/* CHECK IF FILE IS UPLOADED FIRST */}
    {!uploadedFileData ? (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📤</p>
          <h3>{isArabic ? 'يرجى رفع الملف أولاً' : 'Please Upload File First'}</h3>
          <p>{isArabic ? 'قم بالذهاب إلى تبويب "التحليل" ورفع ملف Excel أو CSV أولاً' : 'Go to "Analysis" tab and upload an Excel or CSV file first'}</p>
          <button
            style={styles.actionBtn}
            onClick={() => setActiveTab('analysis')}
          >
            {isArabic ? 'الذهاب إلى التحليل' : 'Go to Analysis'}
          </button>
        </div>
      </div>
    ) : (
      <>
        {/* Dropdown Section */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontWeight: "600", marginRight: "10px" }}>
            {isArabic ? "اختر طالب:" : "Select Student:"}
          </label>

          {loadingStudentList ? (
            <span>{isArabic ? "جاري التحميل..." : "Loading..."}</span>
          ) : (
            <select
              style={{
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                minWidth: "200px"
              }}
              value={selectedStudent || ""}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                loadStudentAnalysis(e.target.value);
              }}
            >
              <option value="">
                {isArabic ? "اختر طالبًا" : "Choose a student"}
              </option>

              {studentList.map((student, index) => (
                <option key={index} value={student}>
                  {student}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Analysis Content */}
        {loadingAnalysis && (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
              <h3>{isArabic ? 'جاري التحليل...' : 'Analyzing...'}</h3>
              <p>{isArabic ? 'يرجى الانتظار بينما نقوم بتحليل بيانات الطالب' : 'Please wait while we analyze student data'}</p>
            </div>
          </div>
        )}

        {!loadingAnalysis && studentAnalysis && (
          <div style={styles.card}>
            <h3 style={styles.chartTitle}>
              {isArabic ? `نتيجة التحليل - ${selectedStudent}` : `Analysis Result - ${selectedStudent}`}
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: moduleColors.analytics, marginBottom: '12px' }}>
                {isArabic ? 'الملخص:' : 'Summary:'}
              </h4>
              <p style={{ lineHeight: '1.6', color: moeColors.ui.textPrimary }}>
                {studentAnalysis.summary}
              </p>
            </div>

            {studentAnalysis.recommendations && studentAnalysis.recommendations.length > 0 && (
              <div>
                <h4 style={{ color: moduleColors.analytics, marginBottom: '12px' }}>
                  💡 {isArabic ? 'التوصيات:' : 'Recommendations:'}
                </h4>
                <ul style={styles.insightList}>
                  {studentAnalysis.recommendations.map((rec, i) => (
                    <li key={i} style={styles.insightItem}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Show message when no student is selected */}
        {!loadingAnalysis && !studentAnalysis && selectedStudent === null && (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🎓</p>
              <h3>{isArabic ? 'اختر طالبًا للتحليل' : 'Select a Student to Analyze'}</h3>
              <p>{isArabic ? 'اختر طالبًا من القائمة أعلاه لعرض التحليل الخاص به' : 'Select a student from the dropdown above to view their analysis'}</p>
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}
  </div>
);
};

export default TeacherUploadModule;