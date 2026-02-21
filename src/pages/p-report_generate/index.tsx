import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface ReviewData {
  sbomFileName: string;
  defaultReportName: string;
  summary: string;
}

const ReportGeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 状态管理
  const [reportName, setReportName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'word'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    sbomFileName: 'project-x-v2.1.spdx',
    defaultReportName: 'project-x-v2.1 合规评审报告',
    summary:
      '本次评审针对SBOM文件"project-x-v2.1.spdx"进行了全面的合规性分析。共识别开源组件23个，其中高风险组件2个，中风险组件5个，低风险组件16个。主要风险点包括许可证兼容性问题和专利风险。',
  });

  // 获取URL参数
  const reviewId = searchParams.get('reviewId') || 'review-001';

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 生成评审报告';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 模拟评审数据加载
  useEffect(() => {
    const mockReviewData: Record<string, ReviewData> = {
      'review-001': {
        sbomFileName: 'project-x-v2.1.spdx',
        defaultReportName: 'project-x-v2.1 合规评审报告',
        summary:
          '本次评审针对SBOM文件"project-x-v2.1.spdx"进行了全面的合规性分析。共识别开源组件23个，其中高风险组件2个，中风险组件5个，低风险组件16个。主要风险点包括许可证兼容性问题和专利风险。',
      },
      'review-002': {
        sbomFileName: 'mobile-app-v1.5.cdx',
        defaultReportName: 'mobile-app-v1.5 合规评审报告',
        summary:
          '本次评审针对SBOM文件"mobile-app-v1.5.cdx"进行了全面的合规性分析。共识别开源组件18个，其中高风险组件1个，中风险组件3个，低风险组件14个。主要风险点为许可证兼容性问题。',
      },
    };

    const data = mockReviewData[reviewId] || mockReviewData['review-001'];
    setReviewData(data);
    setReportName(data.defaultReportName);
  }, [reviewId]);

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

  // 处理关闭弹窗
  const handleCloseModal = () => {
    navigate(`/review-result?reviewId=${reviewId}`);
  };

  // 处理背景点击
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // 处理格式选择
  const handleFormatSelect = (format: 'pdf' | 'word') => {
    setSelectedFormat(format);
  };

  // 处理刷新预览
  const handleRefreshPreview = () => {
    console.log('刷新预览', { reportName, template: selectedTemplate, format: selectedFormat });
    // 这里可以根据选择的模板更新预览内容
  };

  // 处理生成报告
  const handleGenerateReport = () => {
    const trimmedReportName = reportName.trim();

    if (!trimmedReportName) {
      alert('请输入报告名称');
      return;
    }

    // 显示加载状态
    setShowLoadingOverlay(true);
    setIsGenerating(true);

    // 模拟生成过程
    setTimeout(() => {
      // 隐藏加载状态
      setShowLoadingOverlay(false);
      setIsGenerating(false);

      // 模拟文件下载
      console.log('生成报告', {
        reviewId: reviewId,
        reportName: trimmedReportName,
        template: selectedTemplate,
        format: selectedFormat,
      });

      // 模拟下载链接
      const link = document.createElement('a');
      link.href = '#'; // 实际项目中这里应该是生成的文件URL
      link.download = `${trimmedReportName}.${selectedFormat === 'pdf' ? 'pdf' : 'docx'}`;
      link.click();

      // 关闭弹窗并返回评审结果页
      handleCloseModal();
    }, 2000);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        {/* 弹窗内容 */}
        <div
          className={`bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto ${styles.modalEnter}`}
        >
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-pdf text-primary text-sm"></i>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">生成评审报告</h2>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6 space-y-6">
            {/* 报告信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary">报告信息</h3>

              {/* 关联SBOM信息 */}
              <div className="bg-bg-light rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-file-alt text-primary"></i>
                  <div>
                    <p className="text-sm font-medium text-text-primary">关联SBOM</p>
                    <p className="text-sm text-text-secondary">{reviewData.sbomFileName}</p>
                  </div>
                </div>
              </div>

              {/* 报告名称 */}
              <div className="space-y-2">
                <label
                  htmlFor="report-name"
                  className="block text-sm font-medium text-text-primary"
                >
                  报告名称
                </label>
                <input
                  type="text"
                  id="report-name"
                  name="report-name"
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  placeholder="请输入报告名称"
                />
              </div>

              {/* 报告模板选择 */}
              <div className="space-y-2">
                <label
                  htmlFor="template-select"
                  className="block text-sm font-medium text-text-primary"
                >
                  报告模板
                </label>
                <select
                  id="template-select"
                  name="template-select"
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className={`w-full px-4 py-3 border border-border-light rounded-lg ${styles.formInputFocus}`}
                >
                  <option value="standard">标准合规评审报告模板</option>
                  <option value="detailed">详细合规评审报告模板</option>
                  <option value="executive">管理层摘要报告模板</option>
                  <option value="technical">技术团队专用模板</option>
                </select>
              </div>

              {/* 导出格式选择 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">导出格式</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleFormatSelect('pdf')}
                    className={`${styles.formatOption} ${selectedFormat === 'pdf' ? styles.selected : ''} flex items-center justify-center space-x-3 p-4 border border-border-light rounded-lg`}
                  >
                    <i className="fas fa-file-pdf text-danger text-lg"></i>
                    <div className="text-left">
                      <p className="text-sm font-medium">PDF格式</p>
                      <p className="text-xs text-text-secondary">适用于正式文档和打印</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatSelect('word')}
                    className={`${styles.formatOption} ${selectedFormat === 'word' ? styles.selected : ''} flex items-center justify-center space-x-3 p-4 border border-border-light rounded-lg`}
                  >
                    <i className="fas fa-file-word text-info text-lg"></i>
                    <div className="text-left">
                      <p className="text-sm font-medium">Word格式</p>
                      <p className="text-xs text-text-secondary">便于后续编辑和修改</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 报告预览 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-text-primary">报告预览</h3>
                <button
                  onClick={handleRefreshPreview}
                  className="text-sm text-primary hover:text-blue-700 flex items-center space-x-1"
                >
                  <i className="fas fa-sync-alt text-xs"></i>
                  <span>刷新预览</span>
                </button>
              </div>

              <div className="bg-bg-light rounded-lg p-6 min-h-[200px]">
                <div className="space-y-4">
                  <div className="border-b border-border-light pb-4">
                    <h4 className="text-lg font-semibold text-text-primary mb-2">合规评审摘要</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {reviewData.summary}
                    </p>
                  </div>

                  <div className="border-b border-border-light pb-4">
                    <h4 className="text-lg font-semibold text-text-primary mb-2">主要风险点</h4>
                    <ul className="text-sm text-text-secondary space-y-2">
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-exclamation-triangle text-warning mt-1"></i>
                        <span>组件&apos;log4j-2.17.0&apos;使用GPL-3.0许可证，存在较强的copyleft要求</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <i className="fas fa-exclamation-triangle text-warning mt-1"></i>
                        <span>组件&apos;spring-boot-2.6.3&apos;存在已知的安全漏洞CVE-2022-22965</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-text-primary mb-2">建议措施</h4>
                    <ol className="text-sm text-text-secondary space-y-2">
                      <li>考虑替换log4j组件为Apache-2.0许可证的替代品</li>
                      <li>立即升级spring-boot至最新安全版本</li>
                      <li>建立定期的开源组件安全扫描机制</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 弹窗底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-bg-light rounded-b-xl">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 border border-border-light text-text-secondary rounded-lg hover:bg-white hover:text-text-primary transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>{isGenerating ? '生成中...' : '生成并下载'}</span>
              <i
                className={`fas ${isGenerating ? 'fa-spinner' : 'fa-download'} ${isGenerating ? styles.loadingSpinner : ''}`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* 加载遮罩 */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div
              className={`${styles.loadingSpinner} w-6 h-6 border-2 border-primary border-t-transparent rounded-full`}
            ></div>
            <span className="text-text-primary">正在生成报告，请稍候...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneratePage;
