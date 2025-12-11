import React, { useState, useRef, useEffect } from 'react';
import { moeColors, moduleColors, moeBorderRadius } from '../../theme/moeTheme';

const parseMarkdown = (text) => {
  if (!text) return '';

  // Bold: **text** or __text__
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
  // If URL does not start with http or https, prepend https://
  const fixedUrl = url.startsWith('http') ? url : `https://${url}`;

  return `<a href="${fixedUrl}" target="_blank" style="color: inherit; text-decoration: underline;">${label}</a>`;
});
  // Headers: ## text
  text = text.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.1em; font-weight: 600; margin: 8px 0;">$1</h3>');
  text = text.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.2em; font-weight: 600; margin: 10px 0;">$1</h2>');
  text = text.replace(/^# (.*$)/gm, '<h1 style="font-size: 1.3em; font-weight: 600; margin: 12px 0;">$1</h1>');

  // Line breaks
  text = text.replace(/\n/g, '<br/>');

  // Bullet points: - item or * item
  text = text.replace(/^[•\-\*] (.+)$/gm, '<div style="margin-left: 16px;">• $1</div>');

  // Code blocks: `code`
  text = text.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');

  return text;
};

const CreationTab = ({ isDarkMode }) => {
  //n8n webhook
  const WEBHOOK_ENDPOINT = 'http://localhost:5678/webhook/Homework_Creation';

  const [creationStage, setCreationStage] = useState('initial');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك في إنشاء الواجبات. ما هو عنوان الواجب الذي تريد إنشاءه؟',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [homeworkLinks, setHomeworkLinks] = useState({ homework: '', solved: '' });

  // Configuration State
  const [educationLevel, setEducationLevel] = useState('');
  const [track, setTrack] = useState('');
  const [subject, setSubject] = useState('');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [questionCounts, setQuestionCounts] = useState({
    mcq: 0,
    trueFalse: 0,
    essay: 0,
    problemSolving: 0
  });

  // Data mappings
  const educationLevels = ['الابتدائية', 'المتوسطة', 'الثانوية'];

  const tracks = {
    'الثانوية': [
      'المسار العام',
      'مسار علوم الحاسب والهندسة',
      'مسار الصحة والحياة',
      'مسار إدارة الأعمال',
      'المسار الشرعي'
    ]
  };

  const subjects = {
    'الابتدائية': ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 'التربية الإسلامية'],
    'المتوسطة': ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 'الدراسات الاجتماعية', 'التربية الإسلامية'],
    'المسار العام': ['الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة العربية', 'اللغة الإنجليزية'],
    'مسار علوم الحاسب والهندسة': ['علوم الحاسب', 'الهندسة', 'الرياضيات المتقدمة', 'الفيزياء التطبيقية'],
    'مسار الصحة والحياة': ['الأحياء', 'الكيمياء الحيوية', 'علم التشريح', 'علم وظائف الأعضاء'],
    'مسار إدارة الأعمال': ['الاقتصاد', 'المحاسبة', 'إدارة الأعمال', 'التسويق'],
    'المسار الشرعي': ['الفقه', 'التوحيد', 'الحديث', 'التفسير', 'اللغة العربية']
  };

  // Theme values
  const surfaceColor = isDarkMode ? moeColors.ui.surfaceDark : moeColors.ui.surface;
  const backgroundColor = isDarkMode ? '#0f172a' : '#fafbfc';
  const textPrimaryColor = isDarkMode ? moeColors.ui.textPrimaryDark : moeColors.ui.textPrimary;
  const textSecondaryColor = isDarkMode ? moeColors.ui.textSecondaryDark : moeColors.ui.textSecondary;
  const borderColor = moeColors.ui.border;

  // Define status colors
  const statusColors = {
    info: '#0da9a6',
    success: '#07a869',
    error: '#dc2626',
  };

  // Sidebar options
  const sidebarOptions = [
    { icon: '📝', label: 'عنوان جديد', action: 'title', prompt: 'ما هو عنوان الواجب الجديد؟' },
    { icon: '📘', label: 'إضافة اختيار من متعدد', action: 'mcq', prompt: 'أريد إضافة سؤال اختيار من متعدد عن:' },
    { icon: '✅', label: 'إضافة صواب/خطأ', action: 'tf', prompt: 'أريد إضافة سؤال صواب/خطأ عن:' },
    { icon: '🧮', label: 'إضافة مسألة', action: 'problem', prompt: 'أريد إضافة مسألة حل عن:' },
    { icon: '📊', label: 'هيكل الواجب', action: 'structure', prompt: 'أريد رؤية هيكل الواجب الحالي' },
    { icon: '✅', label: 'إنهاء الإنشاء', action: 'complete', prompt: 'تم إنشاء الواجب بنجاح' },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Reset track and subject when education level changes
  useEffect(() => {
    setTrack('');
    setSubject('');
  }, [educationLevel]);

  // Reset subject when track changes
  useEffect(() => {
    setSubject('');
  }, [track]);

  // Send stage to backend
  const sendStageToBackend = async (stage) => {
    try {
      await fetch(`${WEBHOOK_ENDPOINT}/stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homework_id: `hw-${Date.now()}`,
          stage: stage
        }),
      });
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  // File handlers
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);

    if (files.length !== validFiles.length) {
      setStatus({ message: 'بعض الملفات تجاوزت الحد الأقصى 10 ميجابايت', type: 'error' });
      setTimeout(() => setStatus({ message: '', type: 'info' }), 3000);
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileName) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' بايت';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' كيلوبايت';
    return (bytes / (1024 * 1024)).toFixed(1) + ' ميجابايت';
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  // Handle sidebar option
  const handleSidebarOption = (option) => {
    setSidebarOpen(false);
    setChatInput(option.prompt);
    // Auto-send the prompt
    setTimeout(() => handleSend(option.prompt), 100);
  };

  // Generate homework configuration JSON
  const generateConfigJSON = () => {
    return {
      educationLevel,
      track: educationLevel === 'الثانوية' ? track : null,
      subject,
      homeworkTitle,
      additionalInstructions,
      questionCounts
    };
  };

  // Handle Generate Homework button
  const handleGenerateHomework = () => {
    const config = generateConfigJSON();

    // Validation
    if (!educationLevel || !subject || !homeworkTitle) {
      setStatus({ message: 'يرجى ملء الحقول المطلوبة (المرحلة، المادة، العنوان)', type: 'error' });
      setTimeout(() => setStatus({ message: '', type: 'info' }), 3000);
      return;
    }

    if (educationLevel === 'الثانوية' && !track) {
      setStatus({ message: 'يرجى اختيار المسار للمرحلة الثانوية', type: 'error' });
      setTimeout(() => setStatus({ message: '', type: 'info' }), 3000);
      return;
    }

    const totalQuestions = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
    if (totalQuestions === 0) {
      setStatus({ message: 'يرجى إضافة سؤال واحد على الأقل', type: 'error' });
      setTimeout(() => setStatus({ message: '', type: 'info' }), 3000);
      return;
    }

    // Create auto-message
    let autoMessage = `إنشاء واجب جديد:\n`;
    autoMessage += ` المرحلة: ${educationLevel}\n`;
    if (educationLevel === 'الثانوية') autoMessage += ` المسار: ${track}\n`;
    autoMessage += ` المادة: ${subject}\n`;
    autoMessage += ` العنوان: ${homeworkTitle}\n`;
    if (questionCounts.mcq > 0) autoMessage += `• أسئلة اختيار من متعدد: ${questionCounts.mcq}\n`;
    if (questionCounts.trueFalse > 0) autoMessage += `• أسئلة صواب/خطأ: ${questionCounts.trueFalse}\n`;
    if (questionCounts.essay > 0) autoMessage += `• أسئلة مقالية: ${questionCounts.essay}\n`;
    if (questionCounts.problemSolving > 0) autoMessage += `• مسائل حل: ${questionCounts.problemSolving}\n`;
    if (additionalInstructions) autoMessage += `\nتعليمات إضافية: ${additionalInstructions}`;

    handleSend(autoMessage, config);
    setConfigPanelOpen(false);
  };

  // Send message
  const handleSend = async (overrideMessage, configData = null) => {
    const message = overrideMessage || chatInput.trim();
    if (!message && uploadedFiles.length === 0) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    if (uploadedFiles.length > 0) {
      userMessage.files = uploadedFiles.map(f => f.name).join(', ');
    }

    setChatHistory(prev => [...prev, userMessage]);
    if (!overrideMessage) setChatInput('');
    setUploadedFiles([]);
    setIsTyping(true);
    setStatus({ message: 'جاري المعالجة...', type: 'info' });

    try {
      // Prepare payload
      const payload = {
        message: message,
        files: uploadedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        session_id: sessionId,
        homework_id: `hw-${Date.now()}`,
        stage: creationStage,
        config: configData || null
      };

      // Call webhook
      const response = await fetch(WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('فشل الاتصال بالخادم');

      const result = await response.json();

      // Add assistant response
      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant',
          content: result.output || 'تم استلام طلبك بنجاح',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          hasDocument: !!result.homework, 
          documentLinks: result.homework ? { 
            homework: result.homework,
            solved: result['homework-solved'] || ''
          } : null
        };

        setChatHistory(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        setStatus({ message: '', type: 'info' });

        // Check if document links are present
        if (result.homework) {
          setHomeworkLinks({
            homework: result.homework,
            solved: result['homework-solved'] || ''
          });
          // Convert edit link to preview link
          const previewLink = result.homework.replace('/edit', '/preview');
          setPreviewUrl(previewLink);
          setPreviewOpen(true); // Auto-open preview
        }

        // Update stage based on conversation
        if (creationStage === 'initial' && result.output) {
          setCreationStage('editing');
          sendStageToBackend('editing');
        }
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ في المعالجة. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
      setStatus({ message: 'فشل المعالجة', type: 'error' });
    }
  };

  // Complete creation
  const handleComplete = async () => {
    setCreationStage('done');
    setStatus({ message: 'تم إنشاء الواجب بنجاح', type: 'success' });

    setChatHistory(prev => [...prev, {
      role: 'assistant',
      content: '✅ تم إنهاء إنشاء الواجب وحفظه بنجاح!',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }]);

    await sendStageToBackend('done');
  };

  // Get available subjects based on selection
  const getAvailableSubjects = () => {
    if (educationLevel === 'الثانوية' && track) {
      return subjects[track] || [];
    } else if (educationLevel && educationLevel !== 'الثانوية') {
      return subjects[educationLevel] || [];
    }
    return [];
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: backgroundColor,
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
    },
    mainLayout: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },

    //docment preview style
    previewPanel: {
      position: 'absolute',
      right: '0',
      top: '0',
      height: '100%',
      width: '50%',
      background: surfaceColor,
      borderLeft: `1px solid ${borderColor}`,
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      transform: previewOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: '999',
      display: 'flex',
      flexDirection: 'column',
    },
    previewHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: surfaceColor,
      borderBottom: `1px solid ${borderColor}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    previewTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: textPrimaryColor,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewActions: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    previewBtn: {
      padding: '8px 16px',
      background: moduleColors.homework,
      color: 'white',
      border: 'none',
      borderRadius: moeBorderRadius.sm,
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    closePreviewBtn: {
      width: '32px',
      height: '32px',
      background: backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.sm,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: textSecondaryColor,
      fontSize: '20px',
      transition: 'all 0.2s',
    },
    previewIframe: {
      flex: 1,
      border: 'none',
      width: '100%',
      background: 'white',
    },
    previewOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.3)',
      zIndex: '998',
      display: previewOpen ? 'block' : 'none',
    },
    // Sidebar
    sidebar: {
      position: 'absolute',
      left: '0',
      top: '0',
      height: '100%',
      width: '280px',
      background: surfaceColor,
      borderRight: `1px solid ${borderColor}`,
      padding: '24px 16px',
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: '999',
      overflowY: 'auto',
    },
    sidebarOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: '998',
      display: sidebarOpen ? 'block' : 'none',
    },
    sidebarTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: textPrimaryColor,
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: `1px solid ${borderColor}`,
    },
    sidebarOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      marginBottom: '8px',
      background: backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    sidebarIcon: {
      fontSize: '1.25rem',
    },
    sidebarLabel: {
      fontSize: '0.875rem',
      color: textPrimaryColor,
      fontWeight: 500,
    },
    // Config Panel
    configPanel: {
      position: 'absolute',
      right: '0',
      top: '0',
      height: '100%',
      width: '320px',
      background: surfaceColor,
      borderLeft: `1px solid ${borderColor}`,
      padding: '24px 16px',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      transform: configPanelOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: '999',
      overflowY: 'auto',
    },
    configPanelOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      zIndex: '998',
      display: configPanelOpen ? 'block' : 'none',
    },
    configTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: textPrimaryColor,
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: `2px solid ${moduleColors.homework}`,
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: textPrimaryColor,
      marginBottom: '8px',
    },
    required: {
      color: '#dc2626',
      marginLeft: '4px',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      background: backgroundColor,
      color: textPrimaryColor,
      cursor: 'pointer',
      outline: 'none',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      background: backgroundColor,
      color: textPrimaryColor,
      outline: 'none',
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      background: backgroundColor,
      color: textPrimaryColor,
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
    },
    questionTypeSection: {
      marginBottom: '16px',
      padding: '12px',
      background: backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
    },
    questionTypeLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: textPrimaryColor,
      marginBottom: '8px',
      display: 'block',
    },
    numberInput: {
      width: '100%',
      padding: '8px 10px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.sm,
      fontSize: '14px',
      background: surfaceColor,
      color: textPrimaryColor,
      outline: 'none',
    },
    generateButton: {
      width: '100%',
      padding: '12px',
      background: `linear-gradient(135deg, ${moduleColors.homework}, #0da9a6)`,
      color: 'white',
      border: 'none',
      borderRadius: moeBorderRadius.md,
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      marginTop: '24px',
      transition: 'all 0.2s',
    },
    generateButtonInline: {
      width: '100%',
      padding: '14px 20px',
      background: `linear-gradient(135deg, ${moduleColors.homework}, #0da9a6)`,
      color: 'white',
      border: 'none',
      borderRadius: moeBorderRadius.md,
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(13, 169, 166, 0.3)',
    },
    configList: {
      background: surfaceColor,
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.lg,
      padding: '24px',
      marginBottom: '32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    configItem: {
      marginBottom: '24px',
    },
    configLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 600,
      color: textPrimaryColor,
      marginBottom: '10px',
    },
    slidingList: {
      display: 'flex',
      gap: '10px',
      overflowX: 'auto',
      padding: '4px',
      scrollbarWidth: 'thin',
    },
    slidingItem: {
      padding: '10px 20px',
      background: backgroundColor,
      border: `2px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      fontWeight: '500',
      color: textPrimaryColor,
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    slidingItemActive: {
      background: moduleColors.homework,
      borderColor: moduleColors.homework,
      color: 'white',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(13, 169, 166, 0.3)',
    },
    configInput: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '15px',
      background: backgroundColor,
      color: textPrimaryColor,
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    configTextarea: {
      width: '100%',
      padding: '12px 16px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      background: backgroundColor,
      color: textPrimaryColor,
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      lineHeight: '1.5',
    },
    questionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
    },
    questionGridItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    questionLabel: {
      fontSize: '13px',
      fontWeight: 500,
      color: textSecondaryColor,
    },
    questionInput: {
      padding: '10px 12px',
      border: `1px solid ${borderColor}`,
      borderRadius: moeBorderRadius.sm,
      fontSize: '15px',
      background: backgroundColor,
      color: textPrimaryColor,
      outline: 'none',
      textAlign: 'center',
      fontWeight: '600',
    },
    chatDivider: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '24px 0 0 0',
      paddingTop: '20px',
      borderTop: `2px solid ${borderColor}`,
    },
    chatDividerText: {
      fontSize: '14px',
      fontWeight: 600,
      color: textSecondaryColor,
      padding: '0 12px',
    },
    // Main Chat Area
    mainArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginLeft: sidebarOpen ? '280px' : '0',
      marginRight: previewOpen ? '50%' : '0',
      transition: 'margin 0.3s ease-in-out',
    },
    header: {
      background: surfaceColor,
      borderBottom: `1px solid ${borderColor}`,
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logo: {
      width: '32px',
      height: '32px',
      background: `linear-gradient(135deg, ${moduleColors.homework}, #0da9a6)`,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: textPrimaryColor,
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: textSecondaryColor,
      fontSize: '0.875rem',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      background: '#07a869',
      borderRadius: '50%',
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px 32px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    },
    message: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      animation: 'slideIn 0.2s ease-out',
    },
    userMessage: {
      flexDirection: 'row-reverse',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
      background: moduleColors.homework,
    },
    userAvatar: {
      background: '#3d7eb9',
    },
    avatarSvg: {
      width: '18px',
      height: '18px',
      color: 'white',
    },
    messageContent: {
      maxWidth: '75%',
      padding: '14px 18px',
      borderRadius: '12px',
      lineHeight: '1.6',
      fontSize: '15px',
      position: 'relative',
      whiteSpace: 'pre-wrap',
    },
    assistantContent: {
      background: moduleColors.homework,
      color: 'white',
      border: `1px solid ${moduleColors.homework}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    userContent: {
      background: '#3d7eb9',
      color: 'white',
      border: `1px solid #3d7eb9`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    timestamp: {
      fontSize: '12px',
      marginTop: '6px',
      opacity: '0.8',
    },
    attachedFiles: {
      marginTop: '8px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    fileTag: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.3)',
      padding: '6px 10px',
      borderRadius: '6px',
      fontSize: '13px',
    },
    fileTagRemove: {
      cursor: 'pointer',
      fontSize: '16px',
      lineHeight: '1',
      marginLeft: '4px',
    },
    inputArea: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: surfaceColor,
      borderTop: `1px solid ${borderColor}`,
      padding: '16px 32px',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
    },
    statusBar: {
      padding: '8px 16px',
      borderRadius: moeBorderRadius.md,
      fontSize: '14px',
      marginBottom: '8px',
      borderLeft: '4px solid',
    },
    statusBarInfo: {
      background: `${statusColors.info}15`,
      borderLeftColor: statusColors.info,
      color: statusColors.info,
    },
    statusBarSuccess: {
      background: `${statusColors.success}15`,
      borderLeftColor: statusColors.success,
      color: statusColors.success,
    },
    statusBarError: {
      background: `${statusColors.error}15`,
      borderLeftColor: statusColors.error,
      color: statusColors.error,
    },
    inputControls: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    attachBtn: {
      padding: '12px',
      background: 'rgba(13, 169, 166, 0.1)',
      border: `1px solid ${borderColor}`,
      color: '#0da9a6',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachBtnActive: {
      background: `${moduleColors.homework}25`,
      borderColor: moduleColors.homework,
      color: moduleColors.homework,
    },
    inputWrapper: {
      flex: 1,
    },
    sendBtn: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${moduleColors.homework}, #0da9a6)`,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    completeBtn: {
      padding: '12px 24px',
      background: '#07a869',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500',
      marginLeft: '8px',
    },
    hiddenInput: {
      display: 'none',
    },
    typingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 18px',
      background: surfaceColor,
      borderRadius: '8px',
      border: `1px solid ${borderColor}`,
      color: textSecondaryColor,
      fontSize: '13px',
    },
    typingDots: {
      display: 'flex',
      gap: '4px',
    },
    typingDot: {
      width: '6px',
      height: '6px',
      background: textSecondaryColor,
      borderRadius: '50%',
      animation: 'pulse 1.4s infinite ease-in-out both',
    },
    //preview button 
    previewMessageBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      marginTop: '12px',
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.4)',
      borderRadius: moeBorderRadius.sm,
      color: 'white',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      {/* Main Chat Area */}
      <div style={styles.mainArea}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>
              <svg style={styles.avatarSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div style={styles.headerTitle}>إنشاء واجب جديد</div>
          </div>
          <div style={styles.status}>
            <div style={styles.statusDot}></div>
            <span>{creationStage === 'initial' ? 'إنشاء' : creationStage === 'editing' ? 'تعديل' : 'مكتمل'}</span>
          </div>
        </div>

        {/* Messages Area */}
        <div style={styles.messagesArea}>
          {/* Configuration List at the top */}
          <div style={styles.configList}>
            {/* Education Level */}
            <div style={styles.configItem}>
              <label style={styles.configLabel}>
                المرحلة الدراسية<span style={styles.required}>*</span>
              </label>
              <div style={styles.slidingList}>
                {educationLevels.map((level) => (
                  <div
                    key={level}
                    style={{
                      ...styles.slidingItem,
                      ...(educationLevel === level ? styles.slidingItemActive : {})
                    }}
                    onClick={() => setEducationLevel(level)}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>

            {/* Track (only for secondary) */}
            {educationLevel === 'الثانوية' && (
              <div style={styles.configItem}>
                <label style={styles.configLabel}>
                  المسار<span style={styles.required}>*</span>
                </label>
                <div style={styles.slidingList}>
                  {tracks['الثانوية'].map((t) => (
                    <div
                      key={t}
                      style={{
                        ...styles.slidingItem,
                        ...(track === t ? styles.slidingItemActive : {})
                      }}
                      onClick={() => setTrack(t)}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject */}
            {((educationLevel && educationLevel !== 'الثانوية') || (educationLevel === 'الثانوية' && track)) && (
              <div style={styles.configItem}>
                <label style={styles.configLabel}>
                  المادة<span style={styles.required}>*</span>
                </label>
                <div style={styles.slidingList}>
                  {getAvailableSubjects().map((subj) => (
                    <div
                      key={subj}
                      style={{
                        ...styles.slidingItem,
                        ...(subject === subj ? styles.slidingItemActive : {})
                      }}
                      onClick={() => setSubject(subj)}
                    >
                      {subj}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homework Title */}
            <div style={styles.configItem}>
              <label style={styles.configLabel}>
                عنوان الواجب<span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                style={styles.configInput}
                value={homeworkTitle}
                onChange={(e) => setHomeworkTitle(e.target.value)}
                placeholder="مثال: واجب الوحدة الأولى"
              />
            </div>

            {/* Question Types in Grid */}
            <div style={styles.configItem}>
              <label style={styles.configLabel}>أنواع الأسئلة</label>
              <div style={styles.questionGrid}>
                <div style={styles.questionGridItem}>
                  <label style={styles.questionLabel}>اختيار من متعدد</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.questionInput}
                    value={questionCounts.mcq}
                    onChange={(e) => setQuestionCounts({ ...questionCounts, mcq: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.questionGridItem}>
                  <label style={styles.questionLabel}>صواب/خطأ</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.questionInput}
                    value={questionCounts.trueFalse}
                    onChange={(e) => setQuestionCounts({ ...questionCounts, trueFalse: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.questionGridItem}>
                  <label style={styles.questionLabel}>مقالية</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.questionInput}
                    value={questionCounts.essay}
                    onChange={(e) => setQuestionCounts({ ...questionCounts, essay: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.questionGridItem}>
                  <label style={styles.questionLabel}>مسائل</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.questionInput}
                    value={questionCounts.problemSolving}
                    onChange={(e) => setQuestionCounts({ ...questionCounts, problemSolving: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Additional Instructions */}
            <div style={styles.configItem}>
              <label style={styles.configLabel}>تعليمات إضافية (اختياري)</label>
              <textarea
                style={styles.configTextarea}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="أي تعليمات أو ملاحظات إضافية..."
                rows="3"
              />
            </div>

            {/* Generate Button */}
            <button
              style={styles.generateButtonInline}
              onClick={handleGenerateHomework}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '18px' }}>🚀</span>
              <span>إنشاء الواجب</span>
            </button>

            {/* Divider */}
            <div style={styles.chatDivider}>
              <span style={styles.chatDividerText}>💬 المحادثة</span>
            </div>
          </div>

          {chatHistory.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : {})
              }}
            >
              <div style={{
                ...styles.messageContent,
                ...(msg.role === 'user' ? styles.userContent : styles.assistantContent)
              }}>
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                {msg.files && (
                  <div style={styles.attachedFiles}>
                    {msg.files.split(', ').map((file, i) => (
                      <div key={i} style={styles.fileTag}>
                        <span>{getFileIcon(file)}</span>
                        <span>{file.length > 15 ? file.substring(0, 15) + '...' : file}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Add Preview Button for messages with documents */}
                {msg.hasDocument && msg.documentLinks && (
                  <button
                    style={styles.previewMessageBtn}
                    onClick={() => {
                      setHomeworkLinks(msg.documentLinks);
                      const previewLink = msg.documentLinks.homework.replace('/edit', '/preview');
                      setPreviewUrl(previewLink);
                      setPreviewOpen(true);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span>📄</span>
                    <span>عرض الواجب</span>
                  </button>
                )}
                <div style={styles.timestamp}>{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={styles.message}>
              <div style={styles.avatar}>
                <svg style={styles.avatarSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364 6.364l-2.828-2.828M8.464 8.464L5.636 5.636m12.728 0l-2.828 2.828m-7.072 7.072l-2.828 2.828"></path>
                </svg>
              </div>
              <div style={styles.typingIndicator}>
                <span>جاري المعالجة</span>
                <div style={styles.typingDots}>
                  <div style={styles.typingDot}></div>
                  <div style={styles.typingDot}></div>
                  <div style={styles.typingDot}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Status Bar */}
        {status.message && (
          <div style={{
            ...styles.statusBar,
            ...(status.type === 'info' ? styles.statusBarInfo :
              status.type === 'success' ? styles.statusBarSuccess :
                styles.statusBarError),
          }}>
            {status.message}
          </div>
        )}

        {/* Input Area */}
        <div style={styles.inputArea}>
          {/* Attached Files */}
          {uploadedFiles.length > 0 && (
            <div style={styles.attachedFiles}>
              {uploadedFiles.map((file, index) => (
                <div key={index} style={styles.fileTag}>
                  <span>{getFileIcon(file.type)}</span>
                  <span>{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</span>
                  <span style={styles.fileTagRemove} onClick={() => removeFile(file.name)}>×</span>
                </div>
              ))}
            </div>
          )}

          <div style={styles.inputControls}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              style={styles.hiddenInput}
              onChange={handleFileUpload}
            />
            <button
              style={{ ...styles.attachBtn, ...(uploadedFiles.length > 0 ? styles.attachBtnActive : {}) }}
              onClick={() => fileInputRef.current.click()}
              title="إرفاق ملفات"
            >
              <svg style={{ width: '20px', height: '20px', color: 'currentColor' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                style={styles.input}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="اكتب تعليماتك هنا... (Shift+Enter لسطر جديد)"
              />
            </div>
            <button style={styles.sendBtn} onClick={() => handleSend()} disabled={!chatInput.trim() && uploadedFiles.length === 0}>
              <span>إرسال</span>
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
            {creationStage === 'editing' && (
              <button style={styles.completeBtn} onClick={handleComplete}>
                تم
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Preview Panel Overlay */}
      <div style={styles.previewOverlay} onClick={() => setPreviewOpen(false)}></div>

      {/* Preview Panel */}
      <div style={styles.previewPanel}>
        <div style={styles.previewHeader}>
          <div style={styles.previewTitle}>
            <span>📄</span>
            <span>معاينة الواجب</span>
          </div>
          <div style={styles.previewActions}>
            {homeworkLinks.homework && (
              <button
                style={styles.previewBtn}
                onClick={() => window.open(homeworkLinks.homework, '_blank')}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>🔗</span>
                <span>فتح في Google Docs</span>
              </button>
            )}
            {homeworkLinks.solved && (
              <button
                style={{ ...styles.previewBtn, background: '#07a869' }}
                onClick={() => window.open(homeworkLinks.solved, '_blank')}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <span>✅</span>
                <span>النسخة المصححة</span>
              </button>
            )}
            <button
              style={styles.closePreviewBtn}
              onClick={() => setPreviewOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.background = borderColor}
              onMouseLeave={(e) => e.currentTarget.style.background = backgroundColor}
            >
              ×
            </button>
          </div>
        </div>
        {previewUrl && (
          <iframe
            src={previewUrl}
            style={styles.previewIframe}
            title="Document Preview"
            allow="autoplay"
          />
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CreationTab;