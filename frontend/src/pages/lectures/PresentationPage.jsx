import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moeColors, moeBorderRadius } from '../../theme/moeTheme';

const PresentationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    unit: '',
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePresentation = async () => {
    console.log('إنشاء عرض تقديمي clicked');
    
    // Validate inputs
    if (!formData.grade || !formData.subject || !formData.unit || !formData.topic) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }

    // Show loading
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Replace with your actual webhook URL from n8n
      const webhookUrl = 'http://localhost:5678/webhook/presentation-generator';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const apiResult = await response.json();
      
      // DEBUG: Print full response to console
      console.log('========== FULL API RESPONSE ==========');
      console.log(JSON.stringify(apiResult, null, 2));
      console.log('=======================================');

      setLoading(false);

      if (apiResult.success) {
        // Extract data safely with multiple fallbacks
        let fileName = 'عرض_تقديمي.pptx';
        let slideCount = 'جاري الحساب...';
        
        // Try to get fileName
        if (apiResult.metadata && apiResult.metadata.fileName) {
          fileName = apiResult.metadata.fileName;
        } else if (apiResult.metadata && apiResult.metadata.topic) {
          fileName = apiResult.metadata.topic + '_عرض_تقديمي.pptx';
        } else if (formData.topic) {
          fileName = formData.topic + '_عرض_تقديمي.pptx';
        }
        
        // Try to get slideCount
        if (apiResult.metadata && apiResult.metadata.slideCount) {
          slideCount = apiResult.metadata.slideCount;
        } else if (apiResult.slideCount) {
          slideCount = apiResult.slideCount;
        }
        
        setResult({
          success: true,
          fileName,
          slideCount,
          subject: apiResult.metadata?.subject || formData.subject,
          grade: apiResult.metadata?.grade || formData.grade,
          presentationLink: apiResult.presentationLink
        });
      } else {
        throw new Error(apiResult.error || 'حدث خطأ في إنشاء العرض التقديمي');
      }
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
      setError(err.message);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: moeColors.ui.background,
      paddingBottom: '40px',
    },
    header: {
      background: 'white',
      borderBottom: `1px solid ${moeColors.ui.border}`,
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    backButton: {
      background: 'transparent',
      border: `1px solid ${moeColors.ui.border}`,
      borderRadius: moeBorderRadius.md,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: moeColors.ui.textPrimary,
      fontWeight: 500,
      transition: 'all 0.2s',
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: moeColors.ui.textPrimary,
    },
    contentWrapper: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 24px',
    },
    card: {
      background: 'white',
      borderRadius: moeBorderRadius.lg,
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${moeColors.ui.border}`,
    },
    cardHeader: {
      textAlign: 'center',
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: `2px solid ${moeColors.ui.border}`,
    },
    logo: {
      width: '64px',
      height: '64px',
      margin: '0 auto 16px',
      background: 'linear-gradient(135deg, #07a869 0%, #0da9a6 100%)',
      borderRadius: moeBorderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
    },
    title: {
      color: moeColors.ui.textPrimary,
      marginBottom: '8px',
      fontSize: '24px',
      fontWeight: 700,
    },
    subtitle: {
      color: moeColors.ui.textSecondary,
      fontSize: '14px',
      marginBottom: '8px',
    },
    moeText: {
      color: '#07a869',
      fontSize: '13px',
      fontWeight: 500,
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: moeColors.ui.textPrimary,
      fontWeight: 500,
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: `2px solid ${moeColors.ui.border}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      transition: 'all 0.3s',
      backgroundColor: moeColors.ui.background,
      color: moeColors.ui.textPrimary,
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: `2px solid ${moeColors.ui.border}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      transition: 'all 0.3s',
      backgroundColor: moeColors.ui.background,
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2307a869' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left 12px center',
      backgroundSize: '20px',
      paddingLeft: '40px',
      color: moeColors.ui.textPrimary,
    },
    submitBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #07a869 0%, #0da9a6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: moeBorderRadius.md,
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '8px',
    },
    loading: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#07a869',
    },
    spinner: {
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #07a869',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px',
    },
    result: {
      marginTop: '24px',
    },
    successMessage: {
      backgroundColor: '#ecfdf5',
      border: `2px solid #10b981`,
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
    },
    successTitle: {
      color: '#065f46',
      marginBottom: '16px',
      fontWeight: 700,
      fontSize: '18px',
      textAlign: 'center',
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      border: `2px solid #ef4444`,
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      textAlign: 'center',
    },
    errorTitle: {
      color: '#991b1b',
      marginBottom: '8px',
      fontWeight: 700,
      fontSize: '18px',
    },
    errorText: {
      color: '#991b1b',
    },
    infoBox: {
      backgroundColor: moeColors.ui.background,
      borderRight: '4px solid #0da9a6',
      padding: '16px',
      borderRadius: moeBorderRadius.md,
      margin: '16px 0',
    },
    infoText: {
      color: moeColors.ui.textPrimary,
      margin: '6px 0',
      fontSize: '14px',
    },
    strong: {
      color: moeColors.ui.textPrimary,
      fontWeight: 600,
    },
    slidesBtn: {
      display: 'block',
      width: '100%',
      marginTop: '16px',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #07a869 0%, #0da9a6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: moeBorderRadius.md,
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      textDecoration: 'none',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .presentation-input:focus,
          .presentation-select:focus {
            outline: none;
            border-color: #07a869;
            background-color: white;
            box-shadow: 0 0 0 3px rgba(7, 168, 105, 0.1);
          }
          
          .presentation-submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(7, 168, 105, 0.3);
          }
          
          .presentation-submit-btn:active:not(:disabled) {
            transform: translateY(0);
          }
          
          .presentation-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .presentation-slides-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(7, 168, 105, 0.3);
          }
          
          .presentation-back-btn:hover {
            background-color: #f9fafb;
            border-color: #9ca3af;
          }
          
          optgroup {
            font-weight: 700;
            color: #15445a;
          }
          
          option {
            padding: 8px;
            font-weight: 400;
          }
        `}
      </style>
      
      {/* Header with Back Button */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button
            style={styles.backButton}
            className="presentation-back-btn"
            onClick={() => navigate('/lectures')}
          >
            <span>←</span>
            <span>رجوع</span>
          </button>
          <h2 style={styles.headerTitle}>إنشاء عرض تقديمي</h2>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logo}>📊</div>
            <h1 style={styles.title}>إنشاء عرض تقديمي</h1>
            <p style={styles.subtitle}>الذكاء الاصطناعي ينشئ العروض التقديمية تلقائياً</p>
            <p style={styles.moeText}>المملكة العربية السعودية - وزارة التعليم</p>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="grade">الفصل الدراسي</label>
              <select
                style={styles.select}
                className="presentation-select"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
              >
                <option value="">اختر الصف الدراسي...</option>
                <optgroup label="المرحلة الابتدائية">
                  <option value="الصف الأول الابتدائي">الصف الأول الابتدائي</option>
                  <option value="الصف الثاني الابتدائي">الصف الثاني الابتدائي</option>
                  <option value="الصف الثالث الابتدائي">الصف الثالث الابتدائي</option>
                  <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                  <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                  <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                </optgroup>
                <optgroup label="المرحلة المتوسطة">
                  <option value="الصف الأول المتوسط">الصف الأول المتوسط</option>
                  <option value="الصف الثاني المتوسط">الصف الثاني المتوسط</option>
                  <option value="الصف الثالث المتوسط">الصف الثالث المتوسط</option>
                </optgroup>
                <optgroup label="المرحلة الثانوية">
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </optgroup>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="subject">المادة</label>
              <input
                style={styles.input}
                className="presentation-input"
                type="text"
                id="subject"
                name="subject"
                placeholder="العلوم"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="unit">الوحدة</label>
              <input
                style={styles.input}
                className="presentation-input"
                type="text"
                id="unit"
                name="unit"
                placeholder="الفصل الأول"
                value={formData.unit}
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="topic">الموضوع</label>
              <input
                style={styles.input}
                className="presentation-input"
                type="text"
                id="topic"
                name="topic"
                placeholder="أسلوب العلم"
                value={formData.topic}
                onChange={handleInputChange}
              />
            </div>

            <div style={styles.formGroup}>
              <button
                type="button"
                style={styles.submitBtn}
                className="presentation-submit-btn"
                onClick={handleCreatePresentation}
                disabled={loading}
              >
                {loading ? '⏳ جاري الإنشاء...' : '📊 إنشاء عرض تقديمي'}
              </button>
            </div>

            {loading && (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>جاري إنشاء العرض التقديمي...</p>
              </div>
            )}

            {result && (
              <div style={styles.result}>
                <div style={styles.successMessage}>
                  <h3 style={styles.successTitle}>✅ تم إنشاء العرض التقديمي بنجاح</h3>
                  
                  <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                      <span style={styles.strong}>اسم الملف:</span> {result.fileName}
                    </p>
                    <p style={styles.infoText}>
                      <span style={styles.strong}>عدد الشرائح:</span> {result.slideCount}
                    </p>
                    <p style={styles.infoText}>
                      <span style={styles.strong}>المادة:</span> {result.subject}
                    </p>
                    <p style={styles.infoText}>
                      <span style={styles.strong}>الصف:</span> {result.grade}
                    </p>
                  </div>
                  
                  <a
                    href={result.presentationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.slidesBtn}
                    className="presentation-slides-btn"
                  >
                    📊 فتح العرض التقديمي ↗
                  </a>
                </div>
              </div>
            )}

            {error && (
              <div style={styles.result}>
                <div style={styles.errorMessage}>
                  <h3 style={styles.errorTitle}>❌ خطأ</h3>
                  <p style={styles.errorText}>{error}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PresentationPage;
