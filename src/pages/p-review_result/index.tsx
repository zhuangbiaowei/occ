import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface ReviewHistoryItem {
  action: string;
  description: string;
  timestamp: string;
  borderColor: string;
}

const ReviewResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reviewOpinionContent, setReviewOpinionContent] = useState<string>(
    `
根据AI初步评审结果及人工复核，本次SBOM合规评审发现以下主要问题：

1. **许可证冲突风险**：
   - 组件&apos;libpng-1.6.37&apos;采用GPL-2.0许可证，与项目主体的MIT许可证存在兼容性问题。建议技术团队评估替换方案，可考虑使用&apos;libpng-1.6.37&apos;的BSD许可版本或寻找替代组件。

2. **专利风险**：
   - &apos;openssl-1.1.1k&apos;存在已知专利问题，建议联系法务部门进行专项专利审查，评估侵权风险。

3. **合规义务履行**：
   - 多个组件未按许可证要求履行通知义务，需在产品文档中补充开源组件声明。

**建议措施**：
- 立即启动高风险组件替换计划
- 完善开源组件管理制度
- 加强开发团队的开源合规培训

**评审结论**：
本次评审结果为中等风险，建议在解决上述问题后再进行产品发布。
  `.trim()
  );
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('medium');
  const [isReviewCompleted, setIsReviewCompleted] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('自动保存中...');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [reviewHistoryList, setReviewHistoryList] = useState<ReviewHistoryItem[]>([
    {
      action: 'AI初步评审完成',
      description: '系统自动生成初步评审意见',
      timestamp: '2024-01-15 14:30',
      borderColor: 'border-primary',
    },
    {
      action: '张律师 进行人工调整',
      description: '修改了评审意见和风险等级',
      timestamp: '2024-01-15 15:45',
      borderColor: 'border-warning',
    },
    {
      action: '李律师 审核通过',
      description: '确认评审结果，标记为完成',
      timestamp: '2024-01-15 16:20',
      borderColor: 'border-success',
    },
  ]);

  const autoSaveTimerRef = useRef<number | null>(null);
  const reviewId = searchParams.get('reviewId') || 'review-001';
  const sbomId = searchParams.get('sbomId') || 'sbom-001';

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 评审结果';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleGenerateReport = () => {
    navigate(`/report-generate?reviewId=${reviewId}`);
  };

  const handleRegenerateReview = () => {
    if (confirm('确定要重新评审吗？当前的评审意见将会被覆盖。')) {
      setSaveStatus('重新评审中...');
      setTimeout(() => {
        setSaveStatus('自动保存中...');
        alert('重新评审完成');
      }, 2000);
    }
  };

  const handleSaveReview = () => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('已保存');

      const now = new Date();
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newHistoryItem: ReviewHistoryItem = {
        action: '张律师 修改评审意见',
        description: '更新了评审内容和风险等级',
        timestamp: timeString,
        borderColor: 'border-info',
      };

      setReviewHistoryList(prev => [newHistoryItem, ...prev]);

      alert('评审意见保存成功');
    }, 1000);
  };

  const handleReviewOpinionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setReviewOpinionContent(value);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus('正在保存...');

    autoSaveTimerRef.current = window.setTimeout(() => {
      setSaveStatus('自动保存中...');
    }, 2000);
  };

  const handleRiskLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRiskLevel(event.target.value);
    setSaveStatus('有未保存的更改...');
  };

  const handleReviewCompletedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsReviewCompleted(event.target.checked);
    setSaveStatus('有未保存的更改...');
  };

  const handleEditorToolbarAction = (action: string) => {
    const textarea = document.getElementById('review-opinion-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = textarea.value;

    let insertText = '';
    switch (action) {
    case 'bold':
      insertText = '**粗体文本**';
      break;
    case 'italic':
      insertText = '*斜体文本*';
      break;
    case 'underline':
      insertText = '__下划线文本__';
      break;
    case 'link':
      insertText = '[链接文本](链接地址)';
      break;
    case 'list':
      insertText = '\n- 列表项1\n- 列表项2\n';
      break;
    }

    const newValue = content.substring(0, start) + insertText + content.substring(end);
    setReviewOpinionContent(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
    }, 0);
  };

  const handleUserAvatarClick = () => {
    navigate('/profile');
  };

  const handleNotificationClick = () => {
    // 消息通知处理逻辑
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo和产品名称 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-balance-scale text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">开源合规智能助手</h1>
          </div>

          {/* 全局搜索框 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索知识库、SBOM文件..."
                className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm"></i>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            {/* 消息通知 */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-text-secondary hover:text-primary"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full"></span>
            </button>

            {/* 用户头像 */}
            <div className="relative">
              <button
                onClick={handleUserAvatarClick}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
              >
                <img
                  src="https://s.coze.cn/image/5sZhGK8V7_4/"
                  alt="用户头像"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-text-primary">张律师</span>
                <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}
      >
        <nav className="p-4 space-y-2">
          <Link
            to="/home"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span>首页</span>
          </Link>
          <Link
            to="/sbom-list"
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span>SBOM管理</span>
          </Link>
          <Link
            to="/kb-list"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-book text-lg"></i>
            <span>知识库管理</span>
          </Link>
          <Link
            to="/report-list"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-chart-line text-lg"></i>
            <span>报告列表</span>
          </Link>
          <Link
            to="/user-manage"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-users text-lg"></i>
            <span>用户管理</span>
          </Link>
          <Link
            to="/sys-settings"
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary`}
          >
            <i className="fas fa-cog text-lg"></i>
            <span>系统设置</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">评审结果</h2>
              <nav className="text-sm text-text-secondary">
                <Link to="/sbom-list" className="hover:text-primary">
                  SBOM管理
                </Link>
                <span className="mx-2">/</span>
                <Link to={`/sbom-detail?sbomId=${sbomId}`} className="hover:text-primary">
                  SBOM详情
                </Link>
                <span className="mx-2">/</span>
                <span>评审结果</span>
              </nav>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRegenerateReview}
                className="px-4 py-2 border border-border-light rounded-lg text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                <i className="fas fa-redo mr-2"></i>重新评审
              </button>
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-file-pdf mr-2"></i>生成报告
              </button>
            </div>
          </div>
        </div>

        {/* 评审概览区 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">评审概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-warning bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-exclamation-triangle text-warning text-2xl"></i>
              </div>
              <p className="text-2xl font-bold text-text-primary">中等风险</p>
              <p className="text-sm text-text-secondary">风险等级</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-danger bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shield-alt text-danger text-2xl"></i>
              </div>
              <p className="text-2xl font-bold text-text-primary">3</p>
              <p className="text-sm text-text-secondary">高风险组件</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warning bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-exclamation-circle text-warning text-2xl"></i>
              </div>
              <p className="text-2xl font-bold text-text-primary">7</p>
              <p className="text-sm text-text-secondary">中风险组件</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-check-circle text-success text-2xl"></i>
              </div>
              <p className="text-2xl font-bold text-text-primary">24</p>
              <p className="text-sm text-text-secondary">低风险组件</p>
            </div>
          </div>
        </section>

        {/* AI评审意见区 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">AI评审意见</h3>

          {/* 主要风险点 */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-text-primary mb-3">主要风险点</h4>
            <div className="space-y-3">
              <div className={`${styles.riskHigh} p-4 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-triangle text-danger mt-1"></i>
                  <div>
                    <h5 className="font-medium text-text-primary">GPL许可证冲突</h5>
                    <p className="text-sm text-text-secondary mt-1">
                      组件&apos;libpng-1.6.37&apos;使用GPL-2.0许可证，与项目的MIT许可证存在潜在冲突。根据《开源许可证兼容性指南》第3.2节，GPL系列许可证要求衍生作品必须采用相同许可证。
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <a href="#" className="text-xs text-primary hover:text-blue-700">
                        查看法律依据
                      </a>
                      <a href="#" className="text-xs text-primary hover:text-blue-700">
                        查看内部指导
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.riskMedium} p-4 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-circle text-warning mt-1"></i>
                  <div>
                    <h5 className="font-medium text-text-primary">专利风险</h5>
                    <p className="text-sm text-text-secondary mt-1">
                      组件&apos;openssl-1.1.1k&apos;存在已知的专利问题。根据内部知识库中的案例&apos;专利侵权风险评估标准&apos;，建议进行专利审查。
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <a href="#" className="text-xs text-primary hover:text-blue-700">
                        查看相关案例
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.riskMedium} p-4 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-circle text-warning mt-1"></i>
                  <div>
                    <h5 className="font-medium text-text-primary">许可证义务履行</h5>
                    <p className="text-sm text-text-secondary mt-1">
                      多个组件未正确履行许可证要求的通知义务。根据《开源合规管理办法》第4.1条，需要在产品文档中明确声明使用的开源组件及其许可证。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 法律依据 */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-text-primary mb-3">法律依据</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start space-x-2">
                  <i className="fas fa-book text-primary mt-1 text-xs"></i>
                  <span>《中华人民共和国著作权法》第二十四条 - 合理使用的范围和条件</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="fas fa-book text-primary mt-1 text-xs"></i>
                  <span>《计算机软件保护条例》第八条 - 软件著作权人享有的权利</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="fas fa-book text-primary mt-1 text-xs"></i>
                  <span>《开源许可证兼容性指南》第3.2节 - GPL系列许可证兼容性</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 内部指导 */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-text-primary mb-3">内部指导</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start space-x-2">
                  <i className="fas fa-lightbulb text-warning mt-1 text-xs"></i>
                  <span>案例参考：某电商平台因GPL许可证冲突被起诉案（案号：2023-001）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="fas fa-lightbulb text-warning mt-1 text-xs"></i>
                  <span>最佳实践：建议使用MIT、Apache-2.0等商业友好型许可证</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="fas fa-lightbulb text-warning mt-1 text-xs"></i>
                  <span>处理流程：发现高风险组件后应及时通知技术团队进行替换评估</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 人工调整区 */}
        <section className="bg-white rounded-xl shadow-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">人工调整</h3>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <i className="fas fa-save"></i>
              <span>{saveStatus}</span>
            </div>
          </div>

          {/* 评审意见编辑器 */}
          <div className="mb-4">
            <label
              htmlFor="review-opinion-editor"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              最终评审意见
            </label>
            <div className={styles.editorToolbar}>
              <button
                type="button"
                onClick={() => handleEditorToolbarAction('bold')}
                className="p-1 text-text-secondary hover:text-primary"
                title="加粗"
              >
                <i className="fas fa-bold"></i>
              </button>
              <button
                type="button"
                onClick={() => handleEditorToolbarAction('italic')}
                className="p-1 text-text-secondary hover:text-primary"
                title="斜体"
              >
                <i className="fas fa-italic"></i>
              </button>
              <button
                type="button"
                onClick={() => handleEditorToolbarAction('underline')}
                className="p-1 text-text-secondary hover:text-primary"
                title="下划线"
              >
                <i className="fas fa-underline"></i>
              </button>
              <button
                type="button"
                onClick={() => handleEditorToolbarAction('link')}
                className="p-1 text-text-secondary hover:text-primary"
                title="插入链接"
              >
                <i className="fas fa-link"></i>
              </button>
              <button
                type="button"
                onClick={() => handleEditorToolbarAction('list')}
                className="p-1 text-text-secondary hover:text-primary"
                title="插入列表"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
            <textarea
              id="review-opinion-editor"
              className={`${styles.editorContent} w-full focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="请输入或修改评审意见..."
              value={reviewOpinionContent}
              onChange={handleReviewOpinionChange}
            />
          </div>

          {/* 风险等级调整 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">最终风险等级</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="risk-level"
                  value="low"
                  className="text-success focus:ring-success"
                  checked={selectedRiskLevel === 'low'}
                  onChange={handleRiskLevelChange}
                />
                <span className="text-sm text-text-primary">低风险</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="risk-level"
                  value="medium"
                  className="text-warning focus:ring-warning"
                  checked={selectedRiskLevel === 'medium'}
                  onChange={handleRiskLevelChange}
                />
                <span className="text-sm text-text-primary">中等风险</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="risk-level"
                  value="high"
                  className="text-danger focus:ring-danger"
                  checked={selectedRiskLevel === 'high'}
                  onChange={handleRiskLevelChange}
                />
                <span className="text-sm text-text-primary">高风险</span>
              </label>
            </div>
          </div>

          {/* 评审状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReviewCompleted}
                  onChange={handleReviewCompletedChange}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">评审完成</span>
              </label>
            </div>
            <button
              onClick={handleSaveReview}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>保存中...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>保存评审意见
                </>
              )}
            </button>
          </div>
        </section>

        {/* 评审日志/历史区 */}
        <section className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">评审历史</h3>
          <div className="space-y-4">
            {reviewHistoryList.map((item, index) => (
              <div key={index} className={`border-l-4 ${item.borderColor} pl-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.action}</p>
                    <p className="text-xs text-text-secondary">{item.description}</p>
                  </div>
                  <span className="text-xs text-text-secondary">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReviewResultPage;
