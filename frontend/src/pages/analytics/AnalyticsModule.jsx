import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

/**
 * ANALYTICS MODULE - Owner: analytics branch
 */

const AnalyticsMain = ({ language = 'ar' }) => {
  const isArabic = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // n8n webhook URL - replace with your actual webhook URL
  const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 
    'http://localhost:5678/webhook-test/MOE-test';

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/get-data`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setSending(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: true }),
      });
      
      if (!response.ok) throw new Error('Failed to send data to n8n');
      const result = await response.json();
      alert(isArabic ? 'تم الإرسال بنجاح!' : 'Sent successfully!');
    } catch (error) {
      alert(isArabic ? 'فشل الإرسال' : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: { fontSize: '24px', fontWeight: 700, color: moeColors.ui.textPrimary },
    reportBtn: {
      background: moduleColors.analytics,
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      cursor: sending ? 'not-allowed' : 'pointer',
      opacity: sending ? 0.6 : 1,
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
          {isArabic ? 'التحليلات والتقارير' : 'Analytics & Reports'}
        </h1>
        <button 
          style={styles.reportBtn}
          onClick={handleGenerateReport}
          disabled={sending}
        >
          📊 {sending 
            ? (isArabic ? 'جاري الإرسال...' : 'Sending...') 
            : (isArabic ? 'إنشاء تقرير' : 'Generate Report')
          }
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📊</p>
          <h3>{isArabic ? 'قسم التحليلات' : 'Analytics Section'}</h3>
          <p>{isArabic ? 'قم ببناء لوحة التحليلات هنا' : 'Build analytics dashboard here'}</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>Use Chart.js or Recharts</p>
        </div>
      </div>
    </div>
  );
};

const AnalyticsModule = ({ language }) => {
  return (
    <Routes>
      <Route index element={<AnalyticsMain language={language} />} />
      <Route path="reports" element={<AnalyticsMain language={language} />} />
      <Route path="student/:studentId" element={<AnalyticsMain language={language} />} />
    </Routes>
  );
};

const sendToN8n = async (data) => {
  try {
    const webhookUrl = 'http://localhost:5678/webhook-test/MOE-test';
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to send data to n8n');
    return await response.json();
  } catch (error) {
    console.error('Error sending to n8n:', error);
    throw error;
  }
};

export default AnalyticsModule;