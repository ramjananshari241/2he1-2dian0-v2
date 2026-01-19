import React, { useState, useEffect } from 'react'
import { Callout } from './BasicBlock'

export const EncryptedCallout = ({ block, children }: { block: any; children: any }) => {
  // 1. 获取内容与解析
  const richText = block.callout?.rich_text || [];
  const rawText = richText.map((t: any) => t.plain_text).join('') || '';
  
  // 正则匹配：以 LOCK: 开头
  const lockMatch = rawText.match(/^LOCK:\s*(.*)$/);
  const isLockedBlock = !!lockMatch;

  // 如果没有 LOCK: 标记，直接渲染原本的 Callout 组件
  if (!isLockedBlock) {
    return <Callout block={block}>{children}</Callout>;
  }

  // 获取密码（去除首尾空格）
  const password = lockMatch[1].trim();
  // 判断模式：有密码则是"密码模式"，无密码则是"无密码模式"
  const hasPassword = password.length > 0;

  const [input, setInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // 检查本地缓存
  useEffect(() => {
    if (localStorage.getItem(`unlocked-${block.id}`) === 'true') {
      setIsUnlocked(true);
    }
  }, [block.id]);

  const handleUnlock = () => {
    // 只有有密码时才校验，无密码直接过
    if (hasPassword && input !== password) {
      setError(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
      return;
    }

    setIsUnlocked(true);
    setError(false);
    localStorage.setItem(`unlocked-${block.id}`, 'true');
  };

  // 🎨 预处理 Block (解锁后)
  // 我们只清空标题文字 "LOCK:xxx"，保留图标，确保 Callout 结构完整
  const cleanBlock = {
    ...block,
    callout: {
      ...block.callout,
      rich_text: [] 
    }
  };

  // --- 状态 A: 已解锁 ---
  if (isUnlocked) {
    return (
      <div className="relative animate-fade-in group">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button 
             onClick={() => {
               localStorage.removeItem(`unlocked-${block.id}`);
               setIsUnlocked(false);
               setInput('');
             }}
             className="text-xs bg-neutral-200 dark:bg-neutral-800/80 hover:bg-red-500 hover:text-white px-2 py-1 rounded-md text-neutral-500 backdrop-blur-sm transition-colors"
           >
             {hasPassword ? '🔒 锁定' : '🙈 折叠'}
           </button>
        </div>
        {/* 直接渲染原本的 Callout，不切割 children，保证内容绝对显示 */}
        <Callout block={cleanBlock}>{children}</Callout>
      </div>
    );
  }

  // --- 状态 B: 未解锁 (稳定版 UI) ---
  return (
    <div className="relative my-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-xl">
      
      {/* 静态背景 (移除复杂动画，防止闪烁) */}
      <div className="absolute inset-0 bg-neutral-50 dark:bg-[#121212]"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 py-10 px-6 flex flex-col items-center justify-center text-center select-none">
        
        <h3 className="font-extrabold text-2xl mb-3 text-neutral-900 dark:text-white">
          {hasPassword ? '受保护的内容' : '敏感内容折叠'}
        </h3>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs leading-relaxed">
          {hasPassword 
            ? '该区域包含加密内容，请输入密码解锁。' 
            : '该区域可能包含敏感内容或大尺寸媒体，点击下方按钮展开。'}
        </p>
        
        <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 items-stretch justify-center">
          
          {/* 只有在有密码时，才显示输入框 */}
          {hasPassword && (
            <input 
              type="password" 
              placeholder="请输入密码..."
              className={`
                flex-1 px-4 py-2.5 rounded-xl 
                text-neutral-900 dark:text-white
                bg-white dark:bg-neutral-900 
                border-2 transition-all outline-none
                ${error 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-transparent focus:border-blue-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }
              `}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if(error) setError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
          )}

          {/* 解锁按钮 */}
          <button 
            onClick={handleUnlock}
            className={`
              px-6 py-2.5 rounded-xl font-bold text-white whitespace-nowrap transition-all shadow-lg active:scale-95
              ${hasPassword 
                ? 'bg-blue-600 hover:bg-blue-500' 
                : 'bg-blue-600 hover:bg-red-500 w-full sm:w-auto' // 无密码时用红色警示色，且显眼
              }
            `}
          >
            {hasPassword ? '解锁' : '显示内容'}
          </button>
        </div>

        {/* 错误提示 */}
        {hasPassword && (
          <div className={`
            mt-4 text-sm font-medium text-red-500 transition-all duration-300
            ${error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'}
          `}>
            <span>🚫 密码错误</span>
          </div>
        )}
      </div>
    </div>
  );
};
