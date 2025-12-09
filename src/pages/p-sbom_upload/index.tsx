

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface FileUploadState {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  showFileInfo: boolean;
  showUploadProgress: boolean;
  autoReview: boolean;
  overwriteExisting: boolean;
  isDragOver: boolean;
}

const SbomUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadState, setUploadState] = useState<FileUploadState>({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    showFileInfo: false,
    showUploadProgress: false,
    autoReview: true,
    overwriteExisting: false,
    isDragOver: false
  });

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 上传SBOM文件';
    return () => { document.title = originalTitle; };
  }, []);

  // ESC键关闭弹窗
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
  }, []);

  // 关闭弹窗
  const handleCloseModal = () => {
    navigate('/sbom-list');
  };

  // 点击背景关闭弹窗
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // 文件选择区域点击事件
  const handleFileDropZoneClick = () => {
    if (!uploadState.selectedFile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 文件输入变化事件
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  // 拖拽事件
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  // 处理文件选择
  const handleFileSelection = (file: File) => {
    // 验证文件类型
    const allowedTypes = ['.spdx', '.spdx.json', '.spdx.xml', '.cdx', '.cdx.json', '.swid'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some(type => fileName.endsWith(type));
    
    if (!isValidType) {
      alert('不支持的文件格式，请选择 SPDX、CycloneDX 或 SWID 格式的文件。');
      return;
    }

    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      showFileInfo: true,
      showUploadProgress: false
    }));
  };

  // 移除文件
  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setUploadState(prev => ({
      ...prev,
      selectedFile: null,
      showFileInfo: false,
      showUploadProgress: false,
      uploadProgress: 0
    }));
  };

  // 上传文件
  const handleUploadFile = () => {
    if (!uploadState.selectedFile) return;
    
    setUploadState(prev => ({
      ...prev,
      showFileInfo: false,
      showUploadProgress: true,
      isUploading: true,
      uploadProgress: 0
    }));
    
    // 模拟上传进度
    simulateUpload();
  };

  // 模拟上传进度
  const simulateUpload = () => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // 上传完成
        setTimeout(() => {
          // 模拟生成SBOM ID
          const sbomId = 'sbom_' + Date.now();
          
          // 跳转到SBOM详情页
          navigate(`/sbom-detail?sbomId=${sbomId}`);
        }, 500);
      }
      
      setUploadState(prev => ({ ...prev, uploadProgress: progress }));
    }, 200);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div 
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        {/* 弹窗容器 */}
        <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-upload text-primary"></i>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">上传SBOM文件</h2>
            </div>
            <button 
              onClick={handleCloseModal}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* 文件选择区域 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-3">选择SBOM文件</label>
              
              {/* 拖拽上传区域 */}
              <div 
                className={`${styles.fileDropZone} ${uploadState.isDragOver ? 'dragover' : ''} border-2 border-dashed border-border-light rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors`}
                onClick={handleFileDropZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* 上传占位符 */}
                {!uploadState.showFileInfo && !uploadState.showUploadProgress && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                      <i className="fas fa-cloud-upload-alt text-primary text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-text-primary mb-2">拖拽文件到此处或点击选择</p>
                      <p className="text-sm text-text-secondary">支持 SPDX、CycloneDX、SWID 等格式</p>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i className="fas fa-folder-open mr-2"></i>
                      <span>选择文件</span>
                    </div>
                  </div>
                )}

                {/* 已选择文件显示 */}
                {uploadState.showFileInfo && uploadState.selectedFile && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                          <i className="fas fa-file-alt text-primary"></i>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{uploadState.selectedFile.name}</p>
                          <p className="text-sm text-text-secondary">{formatFileSize(uploadState.selectedFile.size)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleRemoveFile}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* 上传进度 */}
                {uploadState.showUploadProgress && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">上传中...</span>
                      <span className="text-sm text-text-secondary">{Math.round(uploadState.uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${styles.progressBar} bg-primary h-2 rounded-full`}
                        style={{ width: `${uploadState.uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* 隐藏的文件输入 */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".spdx,.spdx.json,.spdx.xml,.cdx,.cdx.json,.swid" 
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            {/* 支持格式说明 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-primary mb-3">支持的文件格式</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-file-code text-primary"></i>
                  <div>
                    <p className="text-sm font-medium text-text-primary">SPDX</p>
                    <p className="text-xs text-text-secondary">.spdx, .spdx.json, .spdx.xml</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-file-code text-success"></i>
                  <div>
                    <p className="text-sm font-medium text-text-primary">CycloneDX</p>
                    <p className="text-xs text-text-secondary">.cdx, .cdx.json</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <i className="fas fa-file-code text-warning"></i>
                  <div>
                    <p className="text-sm font-medium text-text-primary">SWID</p>
                    <p className="text-xs text-text-secondary">.swid</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 上传选项 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-primary mb-3">上传选项</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={uploadState.autoReview}
                    onChange={(e) => setUploadState(prev => ({ ...prev, autoReview: e.target.checked }))}
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary focus:ring-2" 
                  />
                  <span className="text-sm text-text-primary">上传后自动开始合规评审</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={uploadState.overwriteExisting}
                    onChange={(e) => setUploadState(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                    className="w-4 h-4 text-primary border-border-light rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-text-primary">覆盖同名文件</span>
                </label>
              </div>
            </div>
          </div>

          {/* 弹窗底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50">
            <button 
              onClick={handleCloseModal}
              className="px-6 py-2 text-text-secondary border border-border-light rounded-lg hover:bg-white hover:text-text-primary transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleUploadFile}
              disabled={!uploadState.selectedFile || uploadState.isUploading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <span>{uploadState.isUploading ? '上传中...' : '上传文件'}</span>
              {uploadState.isUploading && (
                <i className="fas fa-spinner fa-spin ml-2"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SbomUploadPage;

