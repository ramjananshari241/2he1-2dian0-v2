import React, { useState, useEffect } from 'react'
import { Callout } from './BasicBlock'

export const EncryptedCallout = ({ block, children }: { block: any; children: any }) => {
  // 1. 获取内容与解析
  const richText = block.callout?.rich_text || [];
  const rawText = richText.map((t: any) => t.plain_text).join('') || '';
  const lockMatch = rawText.match(/^LOCK:\s*(.+)$/);
  const isLockedBlock = !!lockMatch;

  if (!isLockedBlock) {
    return <Callout block={block}>{children}</Callout>;
  }

  const correctPassword = lockMatch[1].trim();
  const [input, setInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(`unlocked-${block.id}`) === 'true') {
      setIsUnlocked(true);
    }
  }, [block.id]);

  const handleUnlock = () => {
    if (input === correctPassword) {
      setIsUnlocked(true);
      setError(false);
      localStorage.setItem(`unlocked-${block.id}`, 'true');
    } else {
      setError(true);
      // 触发震动反馈（如果设备支持）
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate(200);
      }
    }
  };

  // --- 状态 A: 已解锁 ---
  if (isUnlocked) {
    const cleanBlock = {
      ...block,
      callout: { ...block.callout, rich_text: [] }
    };

    return (
      <div className="relative animate-fade-in group">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button 
             onClick={() => {
               localStorage.removeItem(`unlocked-${block.id}`);
               setIsUnlocked(false);
             }}
             className="text-xs bg-neutral-200 dark:bg-neutral-800/80 hover:bg-red-500 hover:text-white px-2 py-1 rounded-md text-neutral-500 backdrop-blur-sm transition-colors"
           >
             🔒 重新上锁
           </button>
        </div>
        <Callout block={cleanBlock}>{children}</Callout>
      </div>
    );
  }

  // --- 状态 B: 未解锁 (UI 大升级) ---
  return (
    <div className="relative my-8 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xl">
      
      {/* 🌟 背景装饰光斑 (增加时尚感) */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 p-8 flex flex-col items-center justify-center text-center select-none">
        
        {/* 🔐 图标：增加浮动动画 */}
        <div className="text-6xl mb-4 animate-[bounce_3s_infinite] filter drop-shadow-lg">
          🔐
        </div>

        <h3 className="font-extrabold text-2xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-400">
          受保护的内容
        </h3>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-xs leading-relaxed">
          该区域包含加密的图片或文字，请输入访问密码以解锁查看。
        </p>
        
        <div className="w-full max-w-sm flex flex-col sm:flex-row gap-4 items-stretch">
          {/* ⌨️ 输入框：增加聚焦光晕和质感 */}
          <input 
            type="password" 
            placeholder="请输入密码..."
            className={`
              flex-1 px-5 py-3 rounded-xl 
              text-neutral-900 dark:text-white
              bg-neutral-100 dark:bg-neutral-900/50 
              border-2 transition-all duration-300 outline-none
              placeholder-neutral-400 dark:placeholder-neutral-600
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                : 'border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:bg-neutral-200 dark:hover:bg-neutral-900'
              }
            `}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if(error) setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />

          {/* 🚀 3D 立体按钮 (重点修改) */}
          <button 
            onClick={handleUnlock}
            className={`
              group relative px-6 py-3 rounded-xl font-bold text-white transition-all duration-100
              bg-blue-600 hover:bg-blue-500
              border-b-[4px] border-blue-800 hover:border-blue-700
              active:border-b-0 active:translate-y-[4px]
              shadow-lg shadow-blue-500/30
              flex items-center justify-center gap-2 whitespace-nowrap
            `}
          >
            <span>解锁</span>
            {/* 箭头图标：Group Hover 时移动 */}
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* 错误提示 */}
        <div className={`
          mt-4 text-sm font-medium text-red-500 flex items-center gap-2 transition-all duration-300
          ${error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'}
        `}>
          <span>🚫 密码错误，请重试</span>
        </div>
      </div>
    </div>
  );
};
