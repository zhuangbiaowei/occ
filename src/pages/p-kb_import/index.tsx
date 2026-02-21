import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import styles from './styles.module.css';

interface SelectedFile {
  file: File;
  id: string;
}

interface ImportOptions {
  overwriteExisting: boolean;
  autoExtractTags: boolean;
  autoClassify: boolean;
  enableOCR: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const KbImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const KBID = searchParams.get('kbId') || 'default';
  const accessToken = useAuthStore(state => state.accessToken);

  // State management
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [progressText, setProgressText] = useState('准备上传...');
  const [isDragOver, setIsDragOver] = useState(false);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    overwriteExisting: false,
    autoExtractTags: true,
    autoClassify: true,
    enableOCR: false,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set page title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 导入知识库文档';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Close modal handler
  const handleCloseModal = () => {
    if (!isUploading) {
      navigate(`/kb-detail?kbId=${KBID}`);
    }
  };

  // Check file validity
  const isValidFile = (file: File): boolean => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md', '.markdown'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  const isFileSizeValid = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return file.size <= maxSize;
  };

  // Add file to list
  const addFileToList = (file: File): boolean => {
    if (!isValidFile(file)) {
      alert(`文件 "${file.name}" 格式不支持，请选择 PDF、Word、TXT 或 Markdown 格式的文件。`);
      return false;
    }

    if (!isFileSizeValid(file)) {
      alert(`文件 "${file.name}" 大小超过 50MB 限制。`);
      return false;
    }

    // Check for existing file with same name
    const existingFileIndex = selectedFiles.findIndex(f => f.file.name === file.name);
    if (existingFileIndex !== -1) {
      if (confirm(`文件 "${file.name}" 已存在，是否替换？`)) {
        setSelectedFiles(prev => prev.filter(f => f.file.name !== file.name));
      } else {
        return false;
      }
    }

    const newFile: SelectedFile = {
      file,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
    };

    setSelectedFiles(prev => [...prev, newFile]);
    return true;
  };

  // Remove file from list
  const removeFileFromList = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle file selection
  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      addFileToList(file);
    });

    // Clear input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    Array.from(files).forEach(file => {
      addFileToList(file);
    });
  };

  // Handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle import options change
  const handleOptionChange = (key: keyof ImportOptions) => {
    setImportOptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  // Upload files
  const uploadFiles = async () => {
    setShowUploadProgress(true);
    setIsUploading(true);
    setProgressText("Uploading...");
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach(item => formData.append("files", item.file));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/knowledge-bases/${KBID}/documents/upload`,
        {
          method: "POST",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          body: formData,
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Upload failed");
      }

      setUploadProgress(100);
      setProgressText("Upload complete");
      setTimeout(() => {
        alert("Upload success");
        handleCloseModal();
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setProgressText("Upload failed");
      alert(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle import start
  const handleImportStart = async () => {
    if (selectedFiles.length === 0) {
      alert('请先选择要导入的文件');
      return;
    }

    console.log(
      '开始导入文件:',
      selectedFiles.map(f => f.file),
      '选项:',
      importOptions
    );
    await uploadFiles();
  };

  // Handle modal backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUploading]);

  // Get file icon based on extension
  const getFileIcon = (fileName: string): string => {
    const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
    if (fileExtension === '.pdf') return 'fa-file-pdf';
    else if (fileExtension === '.doc' || fileExtension === '.docx') return 'fa-file-word';
    else if (fileExtension === '.txt') return 'fa-file-text';
    else if (fileExtension === '.md' || fileExtension === '.markdown') return 'fa-file-alt';
    return 'fa-file';
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Modal backdrop */}
      <div
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        {/* Modal body */}
        <div
          className={`bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden ${styles.fadeIn}`}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-upload text-primary"></i>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">导入知识库文档</h2>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* Modal content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* File selection section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-3">
                选择文档文件
              </label>

              {/* Drag and drop upload area */}
              <div
                className={`${styles.fileDropZone} ${isDragOver ? 'dragover' : ''} rounded-lg p-8 text-center cursor-pointer`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileInputClick}
              >
                <div>
                  <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cloud-upload-alt text-primary text-2xl"></i>
                  </div>
                  <p className="text-text-primary font-medium mb-2">拖拽文件到此处或点击选择文件</p>
                  <p className="text-sm text-text-secondary mb-4">
                    支持 PDF、Word、TXT、Markdown 格式，单个文件最大 50MB
                  </p>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleFileInputClick();
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i className="fas fa-folder-open mr-2"></i>
                    选择文件
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md,.markdown"
                    onChange={e => handleFileSelection(e.target.files)}
                  />
                </div>
              </div>
            </div>

            {/* Selected files section */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  已选择文件 (<span>{selectedFiles.length}</span>)
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedFiles.map(selectedFile => (
                    <div
                      key={selectedFile.id}
                      className={`${styles.fileItem} flex items-center justify-between p-3 bg-white border border-border-light rounded-lg`}
                    >
                      <div className="flex items-center space-x-3">
                        <i
                          className={`fas ${getFileIcon(selectedFile.file.name)} text-text-secondary`}
                        ></i>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {selectedFile.file.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {(selectedFile.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFileFromList(selectedFile.id)}
                        className="p-1 text-text-secondary hover:text-danger transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-3">导入选项</label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="overwrite-existing"
                    checked={importOptions.overwriteExisting}
                    onChange={() => handleOptionChange('overwriteExisting')}
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                  />
                  <label htmlFor="overwrite-existing" className="text-sm text-text-primary">
                    覆盖同名文件
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto-extract-tags"
                    checked={importOptions.autoExtractTags}
                    onChange={() => handleOptionChange('autoExtractTags')}
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                  />
                  <label htmlFor="auto-extract-tags" className="text-sm text-text-primary">
                    自动识别标签
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto-classify"
                    checked={importOptions.autoClassify}
                    onChange={() => handleOptionChange('autoClassify')}
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                  />
                  <label htmlFor="auto-classify" className="text-sm text-text-primary">
                    自动分类
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enable-ocr"
                    checked={importOptions.enableOCR}
                    onChange={() => handleOptionChange('enableOCR')}
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary"
                  />
                  <label htmlFor="enable-ocr" className="text-sm text-text-primary">
                    启用 OCR 识别图片中的文字
                  </label>
                </div>
              </div>
            </div>

            {/* Upload progress section */}
            {showUploadProgress && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-3">上传进度</label>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`${styles.progressBar} bg-primary h-2 rounded-full`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2">{/* File progress items would go here */}</div>
                  <p className="text-sm text-text-secondary">{progressText}</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50">
            <button
              onClick={handleCloseModal}
              className="px-6 py-2 border border-border-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors">
              取消
            </button>
            <button
              onClick={handleImportStart}
              disabled={selectedFiles.length === 0 || isUploading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <i className={`fas ${isUploading ? 'fa-redo' : 'fa-upload'} mr-2`}></i>
              {isUploading ? '重新上传' : '开始导入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KbImportPage;
