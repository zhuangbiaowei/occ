

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface DocumentData {
  id: string;
  title: string;
  currentTags: string[];
  currentCategory: string;
}

const KbCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 获取URL参数
  const docId = searchParams.get('docId') || 'doc1';
  const kbId = searchParams.get('kbId') || 'kb1';

  // 模拟数据
  const [currentDocument] = useState<DocumentData>({
    id: docId,
    title: '开源许可证指南v2.0',
    currentTags: ['许可证', '合规', '开源'],
    currentCategory: '法律规范'
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([
    '法律规范',
    '案例分析',
    '内部指引',
    '政策文件',
    '行业标准'
  ]);

  const [availableTags, setAvailableTags] = useState<string[]>([
    '许可证', '合规', '开源', 'MIT', 'Apache', 'GPL',
    '法律', '风险', '案例', '指南', '标准', '政策'
  ]);

  // 当前选中的标签和分类
  const [selectedTags, setSelectedTags] = useState<string[]>([...currentDocument.currentTags]);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentDocument.currentCategory);

  // 输入框状态
  const [categoryInputValue, setCategoryInputValue] = useState<string>('');
  const [tagInputValue, setTagInputValue] = useState<string>('');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 管理文档分类与标签';
    return () => { document.title = originalTitle; };
  }, []);

  // 处理ESC键关闭弹窗
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

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };

  // 选择分类
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // 添加标签
  const handleAddTag = (tag: string) => {
    setSelectedTags(prevTags => [...prevTags, tag]);
  };

  // 添加新分类
  const handleAddNewCategory = () => {
    const categoryName = categoryInputValue.trim();

    if (!categoryName) {
      alert('请输入分类名称');
      return;
    }

    if (availableCategories.includes(categoryName)) {
      alert('分类已存在');
      return;
    }

    setAvailableCategories(prevCategories => [...prevCategories, categoryName]);
    setSelectedCategory(categoryName);
    setCategoryInputValue('');
  };

  // 添加新标签
  const handleAddNewTag = () => {
    const tagName = tagInputValue.trim();

    if (!tagName) {
      alert('请输入标签名称');
      return;
    }

    if (availableTags.includes(tagName)) {
      alert('标签已存在');
      return;
    }

    setAvailableTags(prevTags => [...prevTags, tagName]);
    setTagInputValue('');
  };

  // 保存更改
  const handleSaveChanges = () => {
    console.log('保存文档分类与标签:', {
      docId: docId,
      category: selectedCategory,
      tags: selectedTags
    });

    alert('分类与标签保存成功！');
    navigate(`/kb-detail?kbId=${kbId}`);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    navigate(-1);
  };

  // 点击遮罩关闭弹窗
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // 处理回车添加分类
  const handleCategoryInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddNewCategory();
    }
  };

  // 处理回车添加标签
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddNewTag();
    }
  };

  // 可用标签（排除已选中的）
  const availableTagsToShow = availableTags.filter(tag => !selectedTags.includes(tag));

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗遮罩 */}
      <div 
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        {/* 弹窗主体 */}
        <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <h2 className="text-xl font-semibold text-text-primary">管理文档分类与标签</h2>
            <button 
              onClick={handleCloseModal}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6 space-y-6">
            {/* 当前标签区域 */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">当前标签</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTags.length === 0 ? (
                  <span className="text-text-secondary text-sm">暂无标签</span>
                ) : (
                  selectedTags.map((tag, index) => (
                    <span 
                      key={index}
                      className={`${styles.tagItem} ${styles.tagSelected} px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-2`}
                    >
                      <span>{tag}</span>
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 分类选择区域 */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">文档分类</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableCategories.map((category, index) => (
                  <div 
                    key={index}
                    onClick={() => handleSelectCategory(category)}
                    className={`${styles.categoryItem} px-4 py-3 rounded-lg cursor-pointer ${
                      category === selectedCategory ? styles.categorySelected : ''
                    }`}
                  >
                    {category}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={categoryInputValue}
                    onChange={(e) => setCategoryInputValue(e.target.value)}
                    onKeyPress={handleCategoryInputKeyPress}
                    placeholder="输入新分类名称..." 
                    className="flex-1 px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button 
                    onClick={handleAddNewCategory}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* 标签选择区域 */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">可用标签</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableTagsToShow.length === 0 ? (
                  <span className="text-text-secondary text-sm">暂无可用标签</span>
                ) : (
                  availableTagsToShow.map((tag, index) => (
                    <span 
                      key={index}
                      onClick={() => handleAddTag(tag)}
                      className={`${styles.tagItem} ${styles.tagAvailable} px-3 py-1 rounded-full text-sm font-medium border cursor-pointer`}
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={tagInputValue}
                  onChange={(e) => setTagInputValue(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="输入新标签名称..." 
                  className="flex-1 px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button 
                  onClick={handleAddNewTag}
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 弹窗底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50 rounded-b-xl">
            <button 
              onClick={handleCloseModal}
              className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSaveChanges}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KbCategoryPage;

