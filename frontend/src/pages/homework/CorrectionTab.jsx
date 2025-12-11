import React, { useState, useRef, useEffect } from 'react';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

const CorrectionTab = ({ sessionId, isDarkMode }) => {
  const UPLOAD_ENDPOINT = 'http://localhost:5678/webhook-test/57d6e5d5-7094-47cd-bb61-0006b1160f32';
  const MAX_SIZE = 20 * 1024 * 1024;

  // Load jsPDF library
  useEffect(() => {
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  //for PDF preview
  const [pdfContent, setPdfContent] = useState(null);   // base-64 string
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentHomeworkId, setCurrentHomeworkId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isDragging, setIsDragging] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  // Access theme values consistently
  const surfaceColor = isDarkMode ? moeColors.ui.surfaceDark : moeColors.ui.surface;
  const backgroundColor = isDarkMode ? '#0f172a' : '#fafbfc';
  const textPrimaryColor = isDarkMode ? moeColors.ui.textPrimaryDark : moeColors.ui.textPrimary;
  const textSecondaryColor = isDarkMode ? moeColors.ui.textSecondaryDark : moeColors.ui.textSecondary;
  const borderColor = moeColors.ui.border;

  // Define status colors directly (since moeColors.feedback doesn't exist)
  const statusColors = {
    info: '#0da9a6',
    success: '#07a869',
    error: '#dc2626',
  };

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 968 ? '1fr 1fr' : '1fr',
      gap: '24px',
    },
    card: {
      background: surfaceColor,
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.lg,
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: 700,
      color: moduleColors.homework,
      marginBottom: '24px',
      paddingBottom: '12px',
      borderBottom: `1px solid ${borderColor}`,
    },
    dropzone: {
      border: `2px dashed ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      padding: '32px',
      textAlign: 'center',
      cursor: 'pointer',
      background: backgroundColor,
      marginBottom: '24px',
      transition: 'border-color 0.2s',
    },
    dropzoneActive: {
      borderColor: moduleColors.homework,
      background: `${moduleColors.homework}15`,
    },
    dropzoneText: {
      fontSize: '1rem',
      fontWeight: 500,
      marginBottom: '8px',
    },
    dropzoneSubtext: {
      fontSize: '0.875rem',
      color: textSecondaryColor,
    },
    preview: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      marginBottom: '24px',
      background: backgroundColor,
    },
    previewImage: {
      width: '48px',
      height: '48px',
      objectFit: 'cover',
      borderRadius: moeBorderRadius.sm,
    },
    fileName: {
      fontWeight: 600,
      marginBottom: '4px',
    },
    fileSize: {
      color: textSecondaryColor,
    },
    removeBtn: {
      background: 'transparent',
      color: textSecondaryColor,
      padding: '8px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.sm,
      cursor: 'pointer',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '8px',
      color: textPrimaryColor,
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px',
      background: backgroundColor,
      color: textPrimaryColor,
    },
    primaryBtn: {
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      border: 'none',
      width: '100%',
      background: moduleColors.homework,
      transition: 'background 0.2s',
      opacity: (!uploadedFile || isUploading) ? 0.5 : 1,
      cursor: (!uploadedFile || isUploading) ? 'not-allowed' : 'pointer',
    },
    progress: {
      height: '6px',
      background: isDarkMode ? surfaceColor : moeColors.ui.background,
      borderRadius: moeBorderRadius.md,
      overflow: 'hidden',
      margin: '24px 0',
    },
    progressFill: {
      height: '100%',
      background: moduleColors.homework,
      transition: 'width 0.3s',
    },
    status: {
      padding: '12px 16px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      margin: '24px 0',
      borderLeft: '4px solid',
    },
    statusInfo: {
      background: `${statusColors.info}15`,
      borderLeftColor: statusColors.info,
    },
    statusSuccess: {
      background: `${statusColors.success}15`,
      borderLeftColor: statusColors.success,
    },
    statusError: {
      background: `${statusColors.error}15`,
      borderLeftColor: statusColors.error,
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: textSecondaryColor,
      border: `1px dashed ${borderColor}`,
      borderRadius: moeBorderRadius.md,
    },
    resultHeader: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    percentage: {
      fontSize: '3rem',
      fontWeight: 700,
      color: moduleColors.homework,
      marginBottom: '8px',
    },
    score: {
      fontSize: '1rem',
      fontWeight: 500,
      color: textSecondaryColor,
    },
    comment: {
      padding: '24px',
      borderRadius: moeBorderRadius.md,
      borderRight: `3px solid ${moduleColors.homework}`,
      whiteSpace: 'pre-wrap',
      lineHeight: 1.8,
      marginBottom: '24px',
      fontSize: '0.875rem',
      background: backgroundColor,
    },
    timestamp: {
      color: textSecondaryColor,
      fontSize: '0.75rem',
      textAlign: 'center',
      marginBottom: '24px',
    },
    secondaryBtn: {
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
      border: 'none',
      width: '100%',
      background: moduleColors.homework,
      transition: 'background 0.2s',
    },
    toast: {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      color: 'white',
      zIndex: 200,
      background: statusColors[toast.type] || statusColors.info,
    },
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' بايت';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' كيلوبايت';
    return (bytes / (1024 * 1024)).toFixed(1) + ' ميجابايت';
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type: type || 'info' });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > MAX_SIZE) {
      showToast('حجم الملف كبير جداً. الحد الأقصى 20 ميجابايت', 'error');
      return;
    }

    setUploadedFile(file);
    const newHwId = 'hw-' + Date.now().toString(36);
    setCurrentHomeworkId(newHwId);
    setStatus({ message: 'جاهز للرفع', type: 'info' });

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setCurrentHomeworkId(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatus({ message: '', type: 'info' });
    showToast('تم إلغاء اختيار الملف', 'info');
  };

  const uploadFile = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setStatus({ message: 'جاري الرفع والتصحيح...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('file_name', uploadedFile.name);
      formData.append('homework_id', currentHomeworkId);
      formData.append('session_id', sessionId);
      formData.append('userPrompt', userPrompt.trim() || 'صحح هذا الواجب بعناية');

      setUploadProgress(90);

      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('فشل التصحيح: ' + response.status);
      }

      const apiResult = await response.json();

      // أضف السطر التالي مباشرة بعد الـ json()
      const output = Array.isArray(apiResult) ? apiResult[0] : apiResult;

      // الآن تحقّق من الـ output الجديد
      if (
        output &&
        typeof output.percentage === 'string' &&   // أرسلتَها string
        typeof output.score === 'string' &&
        typeof output.max_score === 'string' &&
        typeof output.comment === 'string'
      ) {
        setResult(output);                       // استخدم الـ output
        showToast('تم التصحيح بنجاح!', 'success');
        setStatus({ message: 'تم التصحيح بنجاح!', type: 'success' });
      } else {
        throw new Error('صيغة الاستجابة غير صحيحة');
      }

      // PDF اختياري
      setPdfContent(output?.document_content || null);
    } catch (error) {
      console.error('Error:', error);
      setStatus({ message: 'فشل التصحيح: ' + error.message, type: 'error' });
      showToast('فشل التصحيح', 'error');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };
  /*  PDF preview  */
  /*  Document preview - handles both text and base64 PDF  */
  const DocumentPreview = ({ content, fileName }) => {
    if (!content) return null;

    // Check if it's base64-encoded PDF
    const isPdfBase64 = content.startsWith('JVBERi0') || content.includes('data:application/pdf');

     const handleDownloadPDF = async () => {
      try {
        if (isPdfBase64) {
          // Download existing PDF
          const cleanBase64 = content.replace(/^data:application\/pdf;base64,/, '');
          const blob = b64toBlob(cleanBase64, 'application/pdf');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName || 'homework_corrected.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // Convert text to PDF using jsPDF
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          // Add Arabic font support
          doc.setFont('helvetica');
          doc.setFontSize(12);
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 20;
          const maxWidth = pageWidth - (margin * 2);
          const lineHeight = 7;
          let yPosition = margin;
          
          // Split content into lines
          const lines = content.split('\n');
          
          lines.forEach((line) => {
            if (!line.trim()) {
              yPosition += lineHeight / 2;
              return;
            }
            
            // Split long lines
            const wrappedLines = doc.splitTextToSize(line, maxWidth);
            
            wrappedLines.forEach((wrappedLine) => {
              // Check if we need a new page
              if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
              }
              
              doc.text(wrappedLine, margin, yPosition);
              yPosition += lineHeight;
            });
          });
          
          // Download the PDF
          const pdfFileName = fileName?.replace(/\.[^/.]+$/, '.pdf') || 'homework_content.pdf';
          doc.save(pdfFileName);
        }
        showToast('تم تحميل الملف بنجاح', 'success');
      } catch (error) {
        console.error('Download error:', error);
        showToast('فشل تحميل الملف', 'error');
      }
    };

    if (isPdfBase64) {
      // Handle base64 PDF
      const cleanBase64 = content.replace(/^data:application\/pdf;base64,/, '');
      const blob = b64toBlob(cleanBase64, 'application/pdf');
      const url = URL.createObjectURL(blob);
      return (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: textPrimaryColor }}>
              📄 معاينة المستند
            </span>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '8px 16px',
                borderRadius: moeBorderRadius.sm,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'white',
                border: 'none',
                background: moduleColors.homework,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⬇️ تحميل PDF
            </button>
          </div>
          <iframe
            src={url}
            width="100%"
            height={400}
            style={{ border: `1px solid ${borderColor}`, borderRadius: moeBorderRadius.md }}
            title="معاينة الواجب"
          />
        </div>
      );
    }

    // Handle plain text content with better formatting
    const formatContent = (text) => {
      // Split into sections if there are clear headers/titles
      const lines = text.split('\n');
      let formatted = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Detect headers (lines that are short, capitalized, or followed by separator)
        const isHeader = (
          (trimmed.length > 0 && trimmed.length < 50 && !trimmed.endsWith('.')) ||
          /^[A-Z\u0600-\u06FF\s]+$/.test(trimmed) ||
          /^#+\s/.test(trimmed) ||
          /^[-=]{3,}$/.test(lines[idx + 1]?.trim() || '')
        );

        if (isHeader && trimmed.length > 0) {
          formatted.push({
            type: 'header',
            content: trimmed.replace(/^#+\s/, '')
          });
        } else if (/^[-=]{3,}$/.test(trimmed)) {
          // Skip separator lines
          return;
        } else if (trimmed.length > 0) {
          formatted.push({
            type: 'text',
            content: line
          });
        } else {
          formatted.push({
            type: 'break',
            content: ''
          });
        }
      });

      return formatted;
    };

    const formattedContent = formatContent(content);

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: textPrimaryColor }}>
            📄 محتوى المستند
          </span>
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: '8px 16px',
              borderRadius: moeBorderRadius.sm,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'white',
              border: 'none',
              background: moduleColors.homework,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⬇️ تحميل النص
          </button>
        </div>
        <div style={{
          padding: '20px',
          border: `1px solid ${borderColor}`,
          borderRadius: moeBorderRadius.md,
          background: backgroundColor,
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {formattedContent.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: moduleColors.homework,
                  marginTop: idx > 0 ? '16px' : '0',
                  marginBottom: '8px',
                  paddingBottom: '4px',
                  borderBottom: `2px solid ${borderColor}`
                }}>
                  {item.content}
                </div>
              );
            } else if (item.type === 'break') {
              return <div key={idx} style={{ height: '12px' }} />;
            } else {
              return (
                <div key={idx} style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.8,
                  color: textPrimaryColor,
                  marginBottom: '8px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {item.content}
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  /*  helper: base64 → blob  */
  const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const bytes = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) bytes[i] = slice.charCodeAt(i);
      byteArrays.push(new Uint8Array(bytes));
    }
    return new Blob(byteArrays, { type: contentType });
  };
  return (
    <div style={styles.grid}>
      <div style={styles.card}>
        <div style={styles.sectionTitle}>📤 رفع الواجب</div>

        <div
          style={{
            ...styles.dropzone,
            ...(isDragging ? styles.dropzoneActive : {}),
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
          <div style={styles.dropzoneText}>
            اسحب الملف وأفلته هنا أو <strong>اختر ملفاً</strong>
          </div>
          <div style={styles.dropzoneSubtext}>
            الحد الأقصى 20 ميجابايت • PDF, DOCX, TXT, PNG, JPG
          </div>
        </div>

        {uploadedFile && (
          <div style={styles.preview}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
            ) : (
              <span style={{ fontSize: '2rem' }}>📄</span>
            )}
            <div style={{ flex: 1 }}>
              <div style={styles.fileName}>{uploadedFile.name}</div>
              <div style={styles.fileSize}>{formatBytes(uploadedFile.size)}</div>
            </div>
            <button style={styles.removeBtn} onClick={removeFile}>❌</button>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <label style={styles.label}>
            تعليمات للوكيل (اختياري)
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="صحح هذا الواجب بعناية"
            style={styles.textarea}
          />
        </div>

        <button style={styles.primaryBtn} onClick={uploadFile} disabled={!uploadedFile || isUploading}>
          رفع الملف
        </button>

        {isUploading && (
          <div style={styles.progress}>
            <div style={{ ...styles.progressFill, width: uploadProgress + '%' }} />
          </div>
        )}

        {status.message && (
          <div style={{ ...styles.status, ...styles[`status${status.type}`] }}>
            {status.message}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>📊 نتيجة التصحيح</div>

        {!result ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            <div>لم يتم رفع أي ملف بعد</div>
          </div>
        ) : (
          <div>
            <div style={styles.resultHeader}>
              <div style={styles.percentage}>{result.percentage}%</div>
              <div style={styles.score}>{result.score} من {result.max_score}</div>
            </div>
            <DocumentPreview content={pdfContent} fileName={uploadedFile?.name} />

            <div style={styles.comment}>
              {result.comment}
            </div>

            <div style={styles.timestamp}>
              تم التصحيح في: {new Date().toLocaleDateString('ar-SA')} {new Date().toLocaleTimeString('ar-SA')}
            </div>

            <button style={styles.secondaryBtn} onClick={uploadFile} disabled={!uploadedFile}>
              إعادة التصحيح
            </button>
          </div>
        )}
      </div>

      {toast.show && (
        <div style={styles.toast}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CorrectionTab;