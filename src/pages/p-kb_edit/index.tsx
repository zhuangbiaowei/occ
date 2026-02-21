import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface DocumentData {
  title: string;
  content: string;
  tags: string[];
  knowledgeBase: string;
  createdAt: string;
  modifiedAt: string;
  fileType: string;
}

const KbEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentEditorRef = useRef<HTMLDivElement>(null);

  const docId = searchParams.get('docId');
  const kbId = searchParams.get('kbId') || 'kb1';
  const isEditMode = Boolean(docId);

  const [documentData, setDocumentData] = useState<DocumentData>({
    title: '',
    content: '',
    tags: [],
    knowledgeBase: '法律知识库',
    createdAt: new Date().toLocaleString('zh-CN'),
    modifiedAt: new Date().toLocaleString('zh-CN'),
    fileType: 'Markdown',
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 模拟文档数据
  const mockDocuments: Record<string, DocumentData> = {
    doc1: {
      title: '开源许可证合规指南',
      content:
        '<h1>开源许可证合规指南</h1><p>本指南详细介绍了常见的开源许可证及其合规要求。</p><h2>1. MIT许可证</h2><p>MIT许可证是最宽松的开源许可证之一，允许商业使用、修改和分发。</p><ul><li>必须保留原始版权声明</li><li>可以用于商业产品</li><li>无需公开修改后的源代码</li></ul>',
      tags: ['开源许可证', 'MIT', '合规指南'],
      knowledgeBase: '法律知识库',
      createdAt: '2024-01-15 10:30',
      modifiedAt: '2024-01-15 14:20',
      fileType: 'Markdown',
    },
    doc2: {
      title: 'GPL许可证详解',
      content:
        '<h1>GPL许可证详解</h1><p>GPL（GNU General Public License）是一种 copyleft 许可证，要求衍生作品也必须使用GPL许可证。</p><h2>主要条款</h2><p>GPL的核心要求是：</p><ol><li>必须提供源代码</li><li>修改后的作品必须同样开源</li><li>必须保留原始许可证</li></ol>',
      tags: ['GPL', 'copyleft', '法律条款'],
      knowledgeBase: '法律知识库',
      createdAt: '2024-01-14 09:15',
      modifiedAt: '2024-01-14 16:45',
      fileType: 'Markdown',
    },
  };

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 编辑文档';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 初始化页面数据
  useEffect(() => {
    if (isEditMode && docId && mockDocuments[docId]) {
      setDocumentData({ ...mockDocuments[docId] });
    } else {
      setDocumentData({
        title: '',
        content: '',
        tags: [],
        knowledgeBase: '法律知识库',
        createdAt: new Date().toLocaleString('zh-CN'),
        modifiedAt: new Date().toLocaleString('zh-CN'),
        fileType: 'Markdown',
      });
    }
  }, [isEditMode, docId]);

  // 初始化编辑器内容
  useEffect(() => {
    const contentEditor = contentEditorRef.current;
    if (contentEditor && !documentData.content.trim()) {
      contentEditor.innerHTML =
        '<div class="text-text-secondary placeholder-text-secondary">请输入文档内容...</div>';
    }
  }, [documentData.content]);

  // 处理编辑器焦点事件
  const handleEditorFocus = () => {
    const contentEditor = contentEditorRef.current;
    if (
      contentEditor &&
      contentEditor.innerHTML.trim() ===
        '<div class="text-text-secondary placeholder-text-secondary">请输入文档内容...</div>'
    ) {
      contentEditor.innerHTML = '';
    }
  };

  const handleEditorBlur = () => {
    const contentEditor = contentEditorRef.current;
    if (contentEditor && !contentEditor.innerHTML.trim()) {
      contentEditor.innerHTML =
        '<div class="text-text-secondary placeholder-text-secondary">请输入文档内容...</div>';
    }
  };

  // 获取编辑器内容
  const getEditorContent = (): string => {
    const contentEditor = contentEditorRef.current;
    if (!contentEditor) return '';

    const content = contentEditor.innerHTML.trim();
    if (
      content ===
      '<div class="text-text-secondary placeholder-text-secondary">请输入文档内容...</div>'
    ) {
      return '';
    }
    return content;
  };

  // 富文本编辑器命令
  const executeEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value || undefined);
    const contentEditor = contentEditorRef.current;
    if (contentEditor) {
      contentEditor.focus();
    }
  };

  // 处理工具栏按钮点击
  const handleToolbarButtonClick = (command: string, value?: string) => {
    executeEditorCommand(command, value);
  };

  // 处理链接插入
  const handleInsertLink = () => {
    const url = prompt('请输入链接地址:');
    if (url) {
      executeEditorCommand('createLink', url);
    }
  };

  // 处理图片插入
  const handleInsertImage = () => {
    const url = prompt('请输入图片地址:');
    if (url) {
      executeEditorCommand('insertImage', url);
    }
  };

  // 处理表格插入
  const handleInsertTable = () => {
    const tableHtml = `
      <table border="1" cellpadding="4" style="border-collapse: collapse; margin: 10px 0;">
        <tr><td>单元格1</td><td>单元格2</td></tr>
        <tr><td>单元格3</td><td>单元格4</td></tr>
      </table>
    `;
    executeEditorCommand('insertHTML', tableHtml);
  };

  // 添加标签
  const addTag = (tagName: string) => {
    if (!tagName.trim()) return;
    if (documentData.tags.includes(tagName.trim())) return;

    setDocumentData(prev => ({
      ...prev,
      tags: [...prev.tags, tagName.trim()],
    }));
    setNewTagInput('');
  };

  // 删除标签
  const removeTag = (tagIndex: number) => {
    setDocumentData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== tagIndex),
    }));
  };

  // 处理新标签输入
  const handleNewTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagInput(e.target.value);
  };

  const handleNewTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTagInput);
    }
  };

  const handleAddTagClick = () => {
    addTag(newTagInput);
  };

  // 处理表单提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = documentData.title.trim();
    const content = getEditorContent();

    if (!title) {
      alert('请输入文档标题');
      return;
    }

    if (!content) {
      alert('请输入文档内容');
      return;
    }

    setIsSaving(true);

    // 模拟保存操作
    console.log('保存文档:', {
      title,
      content,
      tags: documentData.tags,
      kbId: kbId,
    });

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    navigate(`/kb-detail?kbId=${kbId}`);
  };

  // 处理关闭弹窗
  const handleCloseModal = () => {
    navigate(-1);
  };

  // 处理背景点击
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // 处理ESC键
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

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        {/* 弹窗内容 */}
        <div
          className={`bg-white rounded-xl shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden ${styles.modalEnter}`}
        >
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-edit text-primary"></i>
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                {isEditMode ? '编辑文档' : '新建文档'}
              </h2>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗主体 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* 文档标题 */}
              <div className="space-y-2">
                <label
                  htmlFor="document-title"
                  className="block text-sm font-medium text-text-primary"
                >
                  文档标题 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="document-title"
                  name="title"
                  value={documentData.title}
                  onChange={e => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary"
                  placeholder="请输入文档标题"
                  required
                />
                <p className="text-xs text-text-secondary">标题应简洁明了，能够准确反映文档内容</p>
              </div>

              {/* 文档内容编辑器 */}
              <div className="space-y-2">
                <label
                  htmlFor="document-content"
                  className="block text-sm font-medium text-text-primary"
                >
                  文档内容 <span className="text-danger">*</span>
                </label>

                {/* 编辑器工具栏 */}
                <div
                  className={`${styles.editorToolbar} flex flex-wrap items-center gap-1 p-3 border border-border-light rounded-t-lg bg-gray-50`}
                >
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('bold')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('italic')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('underline')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                  <div className="w-px h-6 bg-border-light mx-2"></div>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('formatBlock', 'h1')}
                    className="px-3 py-2 text-sm text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-heading mr-1"></i>H1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('formatBlock', 'h2')}
                    className="px-3 py-2 text-sm text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-heading mr-1"></i>H2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('formatBlock', 'h3')}
                    className="px-3 py-2 text-sm text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-heading mr-1"></i>H3
                  </button>
                  <div className="w-px h-6 bg-border-light mx-2"></div>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('insertUnorderedList')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('insertOrderedList')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>
                  <div className="w-px h-6 bg-border-light mx-2"></div>
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-link"></i>
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertImage}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-image"></i>
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertTable}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-table"></i>
                  </button>
                  <div className="w-px h-6 bg-border-light mx-2"></div>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('undo')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-undo"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolbarButtonClick('redo')}
                    className="p-2 text-text-secondary hover:text-primary rounded"
                  >
                    <i className="fas fa-redo"></i>
                  </button>
                </div>

                {/* 编辑器内容区域 */}
                <div
                  ref={contentEditorRef}
                  id="document-content"
                  data-name="content"
                  className="w-full min-h-[400px] px-4 py-3 border border-t-0 border-border-light rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-secondary"
                  contentEditable="true"
                  onFocus={handleEditorFocus}
                  onBlur={handleEditorBlur}
                  suppressContentEditableWarning={true}
                />

                <p className="text-xs text-text-secondary">
                  支持富文本编辑，可使用工具栏添加格式、列表、链接等
                </p>
              </div>

              {/* 标签管理 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">标签</label>

                {/* 当前标签列表 */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {documentData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`${styles.tagItem} inline-flex items-center px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm`}
                      >
                        {tag}
                        <button
                          type="button"
                          className={`${styles.tagRemove} ml-2 text-primary hover:text-white`}
                          onClick={() => removeTag(index)}
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 添加新标签 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={handleNewTagInputChange}
                    onKeyPress={handleNewTagInputKeyPress}
                    className="flex-1 px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="输入标签名称，按回车添加"
                  />
                  <button
                    type="button"
                    onClick={handleAddTagClick}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    <i className="fas fa-plus mr-1"></i>添加
                  </button>
                </div>

                {/* 常用标签建议 */}
                <div className="space-y-2">
                  <p className="text-xs text-text-secondary">常用标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {['法律条款', '开源许可证', 'MIT', 'Apache', 'GPL', '合规指南'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-xs hover:bg-primary hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 文档信息 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-text-primary">文档信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">知识库：</span>
                    <span className="text-text-primary">{documentData.knowledgeBase}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">创建时间：</span>
                    <span className="text-text-primary">{documentData.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">最后修改：</span>
                    <span className="text-text-primary">{documentData.modifiedAt}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">文件类型：</span>
                    <span className="text-text-primary">{documentData.fileType}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* 弹窗底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              form="document-form"
              onClick={handleFormSubmit}
              disabled={isSaving}
              className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${
                isSaving ? 'bg-success' : 'bg-primary hover:bg-blue-600'
              }`}
            >
              <i className={`fas ${isSaving ? 'fa-check' : 'fa-save'} mr-2`}></i>
              {isSaving ? '保存成功' : '保存文档'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KbEditPage;
