import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles.module.css';

interface UserFormData {
  username: string;
  email: string;
  role: string;
  status: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

interface MockUser {
  username: string;
  email: string;
  role: string;
  status: string;
}

const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    role: '',
    status: 'active',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 模拟用户数据
  const mockUsers: Record<string, MockUser> = {
    user1: {
      username: '张律师',
      email: 'zhang@lawfirm.com',
      role: 'compliance_lawyer',
      status: 'active',
    },
    user2: {
      username: '李助理',
      email: 'li@lawfirm.com',
      role: 'user',
      status: 'active',
    },
    user3: {
      username: '王管理员',
      email: 'wang@lawfirm.com',
      role: 'admin',
      status: 'active',
    },
  };

  const userId = searchParams.get('userId');
  const isEditMode = userId && mockUsers[userId];

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '开源合规智能助手 - 用户编辑';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 初始化表单数据
  useEffect(() => {
    if (isEditMode && userId) {
      const userData = mockUsers[userId];
      setFormData(prev => ({
        ...prev,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      }));
    }
  }, [isEditMode, userId]);

  // ESC键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  // 表单验证函数
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      username: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: '',
    };

    // 验证用户名
    const username = formData.username.trim();
    if (!username) {
      newErrors.username = '用户名不能为空';
      isValid = false;
    }

    // 验证邮箱
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = '邮箱不能为空';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 验证角色
    if (!formData.role) {
      newErrors.role = '请选择角色';
      isValid = false;
    }

    // 新建模式下验证密码
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = '密码不能为空';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = '密码长度至少6位';
        isValid = false;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }
    }

    // 编辑模式下如果输入了密码，验证密码
    if (isEditMode) {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = '密码长度至少6位';
        isValid = false;
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 清除对应字段的错误信息
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 处理字段失焦验证
  const handleFieldBlur = (field: keyof FormErrors) => {
    const newErrors = { ...formErrors };

    switch (field) {
    case 'username':
      if (!formData.username.trim()) {
        newErrors.username = '用户名不能为空';
      } else {
        newErrors.username = '';
      }
      break;
    case 'email': {
      const email = formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        newErrors.email = '邮箱不能为空';
      } else if (!emailRegex.test(email)) {
        newErrors.email = '请输入有效的邮箱地址';
      } else {
        newErrors.email = '';
      }
      break;
    }
    case 'role':
      if (!formData.role) {
        newErrors.role = '请选择角色';
      } else {
        newErrors.role = '';
      }
      break;
    case 'password':
      if (formData.password && formData.password.length < 6) {
        newErrors.password = '密码长度至少6位';
      } else {
        newErrors.password = '';
      }
      break;
    case 'confirmPassword':
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      } else {
        newErrors.confirmPassword = '';
      }
      break;
    }

    setFormErrors(newErrors);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 构建提交数据
      const submitData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
      };

      // 如果输入了密码，添加到数据中
      if (formData.password) {
        Object.assign(submitData, { password: formData.password });
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('保存用户数据:', submitData);

      // 显示成功提示
      alert(isEditMode ? '用户信息更新成功！' : '用户创建成功！');

      // 返回用户管理页
      navigate('/user-manage');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理关闭弹窗
  const handleCloseModal = () => {
    navigate(-1);
  };

  // 处理背景点击
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      navigate(-1);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 模态弹窗背景 */}
      <div
        className={`fixed inset-0 ${styles.modalBackdrop} flex items-center justify-center z-50 p-4`}
        onClick={handleBackdropClick}
      >
        {/* 弹窗主体 */}
        <div className="bg-white rounded-xl shadow-modal w-full max-w-md mx-auto">
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <h2 className="text-xl font-semibold text-text-primary">
              {isEditMode ? '编辑用户' : '新建用户'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 用户名 */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                  用户名 *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('username')}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  placeholder="请输入用户名"
                  required
                />
                {formErrors.username && (
                  <div className={styles.errorMessage}>{formErrors.username}</div>
                )}
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                  邮箱 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  placeholder="请输入邮箱地址"
                  required
                />
                {formErrors.email && <div className={styles.errorMessage}>{formErrors.email}</div>}
              </div>

              {/* 角色 */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-text-primary">
                  角色 *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('role')}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                  required
                >
                  <option value="">请选择角色</option>
                  <option value="admin">管理员</option>
                  <option value="compliance_lawyer">合规律师</option>
                  <option value="user">普通用户</option>
                  <option value="read_only">只读用户</option>
                </select>
                {formErrors.role && <div className={styles.errorMessage}>{formErrors.role}</div>}
              </div>

              {/* 状态 */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-text-primary">
                  状态
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>

              {/* 密码区域（新建时显示，编辑时隐藏） */}
              {!isEditMode && (
                <div className="space-y-4">
                  {/* 密码 */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-text-primary"
                    >
                      密码 *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('password')}
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      placeholder="请输入密码"
                      required
                    />
                    {formErrors.password && (
                      <div className={styles.errorMessage}>{formErrors.password}</div>
                    )}
                  </div>

                  {/* 确认密码 */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-text-primary"
                    >
                      确认密码 *
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                      placeholder="请再次输入密码"
                      required
                    />
                    {formErrors.confirmPassword && (
                      <div className={styles.errorMessage}>{formErrors.confirmPassword}</div>
                    )}
                  </div>
                </div>
              )}

              {/* 编辑模式下的密码提示 */}
              {isEditMode && (
                <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-20 rounded-lg">
                  <p className="text-sm text-info">
                    <i className="fas fa-info-circle mr-2"></i>
                    如需修改密码，请输入新密码；如不修改，请留空。
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* 弹窗底部 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-light bg-gray-50 rounded-b-xl">
            <button type="button" onClick={handleCloseModal} className={styles.btnSecondary}>
              取消
            </button>
            <button
              type="submit"
              form="user-form"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={styles.btnPrimary}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  保存中...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  保存
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;
