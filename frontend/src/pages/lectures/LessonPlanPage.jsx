import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moeColors, moeBorderRadius } from '../../theme/moeTheme';

const LessonPlanPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gradeLevel: '',
    subject: '',
    duration: '',
    lecturesPerWeek: '',
    totalWeeks: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [totalLectures, setTotalLectures] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total lectures
  useEffect(() => {
    const lectures = parseInt(formData.lecturesPerWeek) || 0;
    const weeks = parseInt(formData.totalWeeks) || 0;
    setTotalLectures(lectures * weeks);
  }, [formData.lecturesPerWeek, formData.totalWeeks]);

  const handleCreateLessonPlan = async () => {
    console.log('🚀 انقر زر إنشاء خطة الدرس');
    
    // Validate inputs
    if (!formData.gradeLevel || !formData.subject || !formData.duration || 
        !formData.lecturesPerWeek || !formData.totalWeeks) {
      alert('⚠️ الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // Show loading
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Replace with your actual webhook URL from n8n
      const webhookUrl = 'http://localhost:5678/webhook/generate-course-plan';
      
      console.log('📤 إرسال البيانات إلى n8n:', {
        gradeLevel: formData.gradeLevel,
        subject: formData.subject,
        duration: parseInt(formData.duration),
        lecturesPerWeek: parseInt(formData.lecturesPerWeek),
        totalWeeks: parseInt(formData.totalWeeks)
      });

      // ✅ Call n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gradeLevel: formData.gradeLevel,
          subject: formData.subject,
          duration: parseInt(formData.duration),
          lecturesPerWeek: parseInt(formData.lecturesPerWeek),
          totalWeeks: parseInt(formData.totalWeeks)
        })
      });

      console.log('📥 استلام الرد - Status:', response.status);
      console.log('📥 Content-Type:', response.headers.get('Content-Type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ خطأ من الخادم:', errorText);
        throw new Error(`خطأ من n8n: ${response.status} - ${errorText.substring(0, 100)}`);
      }

      // ✅ Read file as blob
      const blob = await response.blob();
      console.log('📦 تم استلام الملف - حجم:', blob.size, 'bytes');

      // ✅ Get filename from Content-Disposition header (if available)
      const disposition = response.headers.get('Content-Disposition');
      let fileName = `خطة_مادة_${formData.subject}_${formData.gradeLevel}.doc`;
      
      if (disposition && disposition.includes('filename=')) {
        const fileNameMatch = disposition.split('filename=')[1];
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch.replace(/"/g, '').trim());
        }
      }
      
      console.log('📄 اسم الملف:', fileName);

      // ✅ Create temporary download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ تم تحميل الملف بنجاح');

      setLoading(false);
      setResult({
        success: true,
        fileName: fileName,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        message: 'تم إنشاء خطة الدرس وتحميلها بنجاح!',
        downloaded: true
      });

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          gradeLevel: '',
          subject: '',
          duration: '',
          lecturesPerWeek: '',
          totalWeeks: ''
        });
        setResult(null);
      }, 5000);

    } catch (err) {
      console.error('❌ خطأ:', err);
      setLoading(false);
      setError(err.message || 'حدث خطأ غير متوقع');
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
    required: {
      color: '#e53e3e',
      marginLeft: '3px',
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
      color: moeColors.ui.textPrimary,
    },
    helperText: {
      fontSize: '13px',
      color: '#666',
      marginTop: '5px',
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
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px',
    },
    loadingTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '10px',
      color: '#07a869',
    },
    loadingText: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.8',
    },
    result: {
      marginTop: '24px',
      padding: '16px',
      borderRadius: moeBorderRadius.md,
      border: '1px solid',
    },
    successMessage: {
      background: '#d4edda',
      borderColor: '#c3e6cb',
      padding: '20px',
      borderRadius: moeBorderRadius.md,
      textAlign: 'center',
    },
    successTitle: {
      color: '#155724',
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    errorMessage: {
      background: '#f8d7da',
      borderColor: '#f5c6cb',
      padding: '20px',
      borderRadius: moeBorderRadius.md,
    },
    errorTitle: {
      color: '#721c24',
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    errorText: {
      color: '#721c24',
      fontSize: '14px',
      lineHeight: '1.6',
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
          
          .lesson-plan-input:focus,
          .lesson-plan-select:focus {
            outline: none;
            border-color: #07a869;
            background-color: white;
            box-shadow: 0 0 0 3px rgba(7, 168, 105, 0.1);
          }
          
          .lesson-plan-submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(7, 168, 105, 0.4);
          }
          
          .lesson-plan-submit-btn:active:not(:disabled) {
            transform: translateY(0);
          }
          
          .lesson-plan-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .lesson-plan-back-btn:hover {
            background-color: #f9fafb;
            border-color: #9ca3af;
          }
        `}
      </style>
      
      {/* Header with Back Button */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button
            style={styles.backButton}
            className="lesson-plan-back-btn"
            onClick={() => navigate('/lectures')}
          >
            <span>←</span>
            <span>رجوع</span>
          </button>
          <h2 style={styles.headerTitle}>إنشاء خطة مادة</h2>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logo}>📋</div>
            <h1 style={styles.title}>إنشاء خطة مادة</h1>
            <p style={styles.subtitle}>مولد خطة المحاضرات - نظام ذكي مدعوم بـ AI</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }} onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}>
            {/* Grade Level */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="gradeLevel">
                <span style={styles.required}>*</span>
                الصف الدراسي
              </label>
              <select
                style={styles.select}
                className="lesson-plan-select"
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
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

            {/* Subject */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="subject">
                <span style={styles.required}>*</span>
                المادة
              </label>
              <input
                style={styles.input}
                className="lesson-plan-input"
                type="text"
                id="subject"
                name="subject"
                placeholder="مثال: الرياضيات، الفيزياء، اللغة العربية"
                value={formData.subject}
                onChange={handleInputChange}
              />
              <div style={styles.helperText}>النظام سيقسم جميع وحدات المادة تلقائياً</div>
            </div>

            {/* Duration */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="duration">
                <span style={styles.required}>*</span>
                مدة المحاضرة (بالدقائق)
              </label>
              <input
                style={styles.input}
                className="lesson-plan-input"
                type="number"
                id="duration"
                name="duration"
                placeholder="45"
                min="15"
                max="180"
                value={formData.duration}
                onChange={handleInputChange}
              />
              <div style={styles.helperText}>المدة المعتادة: 40-60 دقيقة</div>
            </div>

            {/* Lectures Per Week */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="lecturesPerWeek">
                <span style={styles.required}>*</span>
                عدد المحاضرات في الأسبوع
              </label>
              <input
                style={styles.input}
                className="lesson-plan-input"
                type="number"
                id="lecturesPerWeek"
                name="lecturesPerWeek"
                placeholder="5"
                min="1"
                max="10"
                value={formData.lecturesPerWeek}
                onChange={handleInputChange}
              />
              <div style={styles.helperText}>كم مرة تُدرّس هذه المادة أسبوعياً؟</div>
            </div>

            {/* Total Weeks */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="totalWeeks">
                <span style={styles.required}>*</span>
                المدة الإجمالية (بالأسابيع)
              </label>
              <input
                style={styles.input}
                className="lesson-plan-input"
                type="number"
                id="totalWeeks"
                name="totalWeeks"
                placeholder="16"
                min="1"
                max="40"
                value={formData.totalWeeks}
                onChange={handleInputChange}
              />
              <div style={styles.helperText}>
                {totalLectures > 0 ? (
                  <>
                    إجمالي عدد المحاضرات: <strong style={{ color: '#07a869' }}>{totalLectures} محاضرة</strong>
                    <br />
                    سيتم تقسيم المادة كاملة عليها
                  </>
                ) : (
                  'النظام سيوزع المادة كاملة على هذه المدة'
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={styles.formGroup}>
              <button
                type="button"
                style={styles.submitBtn}
                className="lesson-plan-submit-btn"
                onClick={handleCreateLessonPlan}
                disabled={loading}
              >
                {loading ? '⏳ جاري الإنشاء...' : '🚀 إنشاء خطة مادة'}
              </button>
            </div>

            {loading && (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <h3 style={styles.loadingTitle}>جاري تقسيم المادة وتوليد الخطة...</h3>
                <p style={styles.loadingText}>
                  الذكاء الاصطناعي يقوم الآن بـ:
                  <br />• استرجاع محتوى المادة كاملاً
                  <br />• تحليل المنهج وتقسيمه
                  <br />• توزيع المواضيع على المحاضرات
                  <br />• إنشاء خطة تفصيلية
                  <br /><br />
                  قد يستغرق هذا 30-90 ثانية حسب حجم المادة
                </p>
              </div>
            )}

            {result && (
              <div style={styles.result}>
                <div style={styles.successMessage}>
                  <h3 style={styles.successTitle}>✅ تم إنشاء خطة المادة وتحميلها بنجاح</h3>
                  
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #07a869',
                    borderRadius: moeBorderRadius.lg,
                    padding: '20px',
                    marginTop: '16px',
                    textAlign: 'right'
                  }}>
                    <p style={{ 
                      color: '#155724', 
                      fontSize: '15px', 
                      lineHeight: '2',
                      margin: 0,
                      fontWeight: 500
                    }}>
                      <strong style={{ color: '#07a869' }}>اسم الملف:</strong> {result.fileName}
                      <br />
                      <strong style={{ color: '#07a869' }}>المادة:</strong> {result.subject}
                      <br />
                      <strong style={{ color: '#07a869' }}>الصف:</strong> {result.gradeLevel}
                      <br />
                      <br />
                      <span style={{ 
                        fontSize: '16px', 
                        display: 'block',
                        padding: '12px',
                        backgroundColor: '#dcfce7',
                        borderRadius: moeBorderRadius.md,
                        textAlign: 'center'
                      }}>
                        📥 تم تحميل الملف على جهازك
                        <br />
                        <small style={{ fontSize: '13px', color: '#166534' }}>
                          تحقق من مجلد التنزيلات
                        </small>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={styles.result}>
                <div style={styles.errorMessage}>
                  <h3 style={styles.errorTitle}>❌ حدث خطأ</h3>
                  <p style={styles.errorText}>{error}</p>
                  <p style={{ ...styles.errorText, marginTop: '12px', fontSize: '13px', fontWeight: 600 }}>
                    💡 نصائح لحل المشكلة:
                  </p>
                  <ul style={{ ...styles.errorText, textAlign: 'right', fontSize: '13px', lineHeight: '1.8' }}>
                    <li>تأكد من تشغيل n8n</li>
                    <li>تحقق من إعدادات Webhook (responseMode = "responseNode")</li>
                    <li>تأكد من إعدادات Send Response node صحيحة</li>
                    <li>افتح Developer Console (F12) وشوف الأخطاء</li>
                  </ul>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanPage;
