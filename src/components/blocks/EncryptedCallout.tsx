import React, { useState, useEffect, useRef } from 'react'
import { Callout } from './BasicBlock'

export const EncryptedCallout = ({ block, children }: { block: any; children: any }) => {
  // 1. 获取内容与解析
  const richText = block.callout?.rich_text || [];
  const rawText = richText.map((t: any) => t.plain_text).join('') || '';
  
  // 正则匹配：只要以 LOCK: 开头就算锁定，捕获后面的内容作为密码
  const lockMatch = rawText.match(/^LOCK:\s*(.*)$/);
  const isLockedBlock = !!lockMatch;

  // 如果没有 LOCK: 标记，直接渲染原本的 Callout 组件
  if (!isLockedBlock) {
    return <Callout block={block}>{children}</Callout>;
  }

  // 获取密码（去除首尾空格）
  const password = lockMatch[1].trim();
  // 判断模式：有密码则是"密码模式"，无密码则是"敏感确认模式"
  const isPasswordMode = password.length > 0;

  const [input, setInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // 新增：控制敏感内容的二次确认界面
  const containerRef = useRef<HTMLDivElement>(null);

  // 检查本地缓存
  useEffect(() => {
    if (localStorage.getItem(`unlocked-${block.id}`) === 'true') {
      setIsUnlocked(true);
    }
  }, [block.id]);

  // 处理解锁逻辑
  const handleUnlock = () => {
    // 密码模式验证
    if (isPasswordMode) {
      if (input === password) {
        unlockSuccess();
      } else {
        setError(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
      }
    } else {
      // 敏感模式直接解锁
      unlockSuccess();
    }
  };

  const unlockSuccess = () => {
    setIsUnlocked(true);
    setError(false);
    localStorage.setItem(`unlocked-${block.id}`, 'true');
  }

  // 🎨 预处理 Block (解锁后)
  const cleanBlock = {
    ...block,
    callout: {
      ...block.callout,
      rich_text: [], // 清空标题文字 "LOCK:xxx"
      icon: null     // 清空图标
    }
  };

  // ✂️ 内容裁切逻辑 (保留之前的 Bug 修复)
  // 移除第一个子元素（即分割线），确保无缝衔接
  const childrenArray = React.Children.toArray(children);
  const unlockedContent = isUnlocked && childrenArray.length > 0 
      ? childrenArray.slice(1) 
      : childrenArray;

  return (
    <div 
        ref={containerRef}
        className={`
            relative my-8 rounded-2xl shadow-2xl group border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all duration-500 ease-in-out
            ${isUnlocked ? 'border-none shadow-none bg-transparent' : ''} 
        `}
    >
      
      {/* ================= 内容层 ================= */}
      <div 
        className={`
          relative w-full transition-all duration-700 ease-in-out
          ${isUnlocked ? 'max-h-full opacity-100' : 'max-h-[450px] overflow-hidden'}
          
          /* 消除内边距 CSS */
          [&_.notion-callout]:!p-0
          [&_.notion-callout]:!bg-transparent
          [&_.notion-callout]:!border-none
          [&_.notion-callout]:!m-0
        `}
      >
        <div 
            className={`
                h-full w-full
                ${!isUnlocked && 'filter blur-2xl scale-105 opacity-50 pointer-events-none select-none'}
            `}
        >
            <Callout block={cleanBlock}>
                {/* 这里的 Fragment 包裹是为了防止 TS 类型报错 */}
                <>{unlockedContent}</>
            </Callout>
        </div>

        {/* 遮罩层 (未解锁时) */}
        {!isUnlocked && (
             <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-[#121212] to-transparent z-10"></div>
        )}
      </div>


      {/* ================= 锁界面 UI (Overlay) ================= */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
          <div className="relative z-30 flex flex-col items-center w-full max-w-sm p-6 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg transition-all duration-300">
            
            {/* --- 分支 1: 密码模式 --- */}
            {isPasswordMode ? (
              <>
                <h3 className="font-extrabold text-2xl mb-2 text-neutral-900 dark:text-white drop-shadow-md">
                  受保护的内容
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 font-medium text-center">
                  内容已隐藏，请输入密码查看。
                </p>
                <div className="w-full flex flex-col gap-3">
                  <input 
                    type="password" 
                    placeholder="访问密码"
                    className={`
                      w-full px-4 py-3 rounded-xl text-center font-bold tracking-widest
                      text-neutral-900 
                      bg-white/60 dark:bg-black/50
                      border-2 backdrop-blur-xl outline-none transition-all
                      placeholder-neutral-500 placeholder:font-normal placeholder:tracking-normal
                      ${error 
                        ? 'border-red-500 ring-2 ring-red-500/30' 
                        : 'border-white/30 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/30'
                      }
                    `}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if(error) setError(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  />
                  <button 
                    onClick={handleUnlock}
                    className="w-full px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 border-b-[4px] border-blue-800 hover:border-blue-700 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-blue-900/40 transition-all duration-100"
                  >
                    解锁
                  </button>
                </div>
                {error && (
                  <div className="mt-3 px-3 py-1 rounded-full text-xs font-bold text-red-600 bg-red-100/90 backdrop-blur-sm animate-pulse">
                    密码错误
                  </div>
                )}
              </>
            ) : (
              /* --- 分支 2: 敏感内容/无密码模式 --- */
              <>
                {!showConfirm ? (
                  /* 初始状态：点击查看 */
                  <div 
                    onClick={() => setShowConfirm(true)}
                    className="flex flex-col items-center cursor-pointer group/sensitive w-full py-4"
                  >
                    <div className="text-4xl mb-3 filter drop-shadow-lg group-hover/sensitive:scale-110 transition-transform duration-300">
                      ⚠️
                    </div>
                    <h3 className="font-extrabold text-xl mb-2 text-neutral-900 dark:text-white">
                      敏感内容折叠
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      点击展开查看详情
                    </p>
                  </div>
                ) : (
                  /* 确认状态：勾叉选择 */
                  <div className="flex flex-col items-center animate-fade-in">
                    <h3 className="font-bold text-lg mb-2 text-neutral-900 dark:text-white">
                      是否确认查看？
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-[200px]">
                      该区域可能包含敏感内容或大尺寸媒体资源
                    </p>
                    
                    <div className="flex items-center gap-6">
                      {/* ❌ 取消按钮 */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirm(false);
                        }}
                        className="group flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500 hover:scale-110 transition-all duration-300"
                      >
                         <span className="text-red-500 group-hover:text-white text-xl">✕</span>
                      </button>

                      {/* ✅ 确认按钮 */}
                      <button 
                        onClick={handleUnlock}
                        className="group flex items-center justify-center w-16 h-16 rounded-full bg-green-500 shadow-lg shadow-green-500/30 hover:scale-110 hover:bg-green-400 transition-all duration-300"
                      >
                         <span className="text-white text-2xl">✓</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

      {/* 解锁后的控制按钮 */}
      {isUnlocked && (
        <div className="absolute top-0 right-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button 
             onClick={() => {
               localStorage.removeItem(`unlocked-${block.id}`);
               setIsUnlocked(false);
               setShowConfirm(false); // 重置确认状态
               if (containerRef.current) {
                   containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
               }
             }}
             className="text-xs bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-bl-xl text-neutral-500 transition-colors shadow-sm"
           >
             {isPasswordMode ? '🔒 重新锁定' : '🙈 折叠内容'}
           </button>
        </div>
      )}

    </div>
  );
};
