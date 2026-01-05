import React, { useState, useEffect, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate(200);
      }
    }
  };

  // 🎨 预处理 Block
  const cleanBlock = {
    ...block,
    callout: { ...block.callout, rich_text: [] }
  };

  return (
    // 外层容器：控制圆角和阴影
    <div 
        ref={containerRef}
        className="relative my-8 rounded-2xl shadow-2xl group border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-all duration-500 ease-in-out"
    >
      
      {/* =========================================================
          关键修改：高度控制层
          1. 锁定状态：限制最大高度 max-h-[450px] 并隐藏溢出 overflow-hidden
          2. 解锁状态：max-h-full (无限制)，显示全部
      ========================================================= */}
      <div 
        className={`
          relative w-full transition-all duration-700 ease-in-out
          ${isUnlocked ? 'max-h-full opacity-100' : 'max-h-[450px] overflow-hidden'}
        `}
      >
        
        {/* 内容层：模糊处理 */}
        <div 
            className={`
                h-full w-full
                ${!isUnlocked && 'filter blur-2xl scale-105 opacity-50 pointer-events-none select-none'}
            `}
        >
            <Callout block={cleanBlock}>
                {children}
            </Callout>
        </div>

        {/* 覆盖层：未解锁时，给底部加一个渐变遮罩，让截断更自然 */}
        {!isUnlocked && (
             <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-[#121212] to-transparent z-10"></div>
        )}

      </div>


      {/* =========================================================
          锁界面 UI 层 (Overlay)
          使用 absolute inset-0 居中显示在限制了高度的容器内
      ========================================================= */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
          
          <div className="relative z-30 flex flex-col items-center w-full max-w-sm p-6 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg">
            
            <h3 className="font-extrabold text-2xl mb-2 text-neutral-900 dark:text-white drop-shadow-md">
              受保护的内容
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 font-medium text-center">
              请输入密码查看完整内容。
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
                className={`
                  w-full px-6 py-3 rounded-xl font-bold text-white
                  bg-blue-600 hover:bg-blue-500
                  border-b-[4px] border-blue-800 hover:border-blue-700
                  active:border-b-0 active:translate-y-[4px]
                  shadow-lg shadow-blue-900/40
                  transition-all duration-100
                `}
              >
                解锁全部内容
              </button>
            </div>

            {/* 错误提示 */}
            <div className={`
              mt-3 px-3 py-1 rounded-full text-xs font-bold text-red-600 bg-red-100/90 backdrop-blur-sm
              transition-all duration-300 transform
              ${error ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none absolute'}
            `}>
              密码错误
            </div>

          </div>
        </div>
      )}

      {/* 解锁后的控制按钮 */}
      {isUnlocked && (
        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button 
             onClick={() => {
               localStorage.removeItem(`unlocked-${block.id}`);
               setIsUnlocked(false);
               // 重新上锁时滚动回顶部，体验更好
               if (containerRef.current) {
                   containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
               }
             }}
             className="text-xs bg-black/5 dark:bg-white/10 hover:bg-neutral-800 hover:text-white px-3 py-1.5 rounded backdrop-blur-md text-neutral-500 transition-colors"
           >
             🔒 锁定折叠
           </button>
        </div>
      )}

    </div>
  );
};
