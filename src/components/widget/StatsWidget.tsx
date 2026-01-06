import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect } from 'react'
// @ts-ignore
import { createPortal } from 'react-dom'
import { WidgetContainer } from './WidgetContainer'

// 硬编码商家编号
const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: BlogStats }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(SHOP_CODE)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal])

  // --- 弹窗组件 ---
  const Modal = () => {
    if (!mounted) return null
    
    // @ts-ignore
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={() => setShowModal(false)}
        ></div>
        
        <div className="relative z-10 w-full max-w-[280px] transform overflow-hidden rounded-2xl bg-[#1c1c1e] p-6 text-center shadow-2xl transition-all border border-white/10 animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80"></div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <span className="text-xl">🏷️</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1 tracking-wide">商家编号</h3>
          <p className="text-xs text-gray-400 mb-5">点击下方卡片复制编号</p>
          <div 
            onClick={handleCopy}
            className="group relative cursor-pointer mb-5 p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner hover:border-blue-500/50 transition-colors"
          >
            <span className="text-xl font-mono font-bold text-white tracking-widest">{SHOP_CODE}</span>
            <div className={`absolute inset-0 flex items-center justify-center rounded-xl bg-blue-600 transition-all duration-200 ${isCopied ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <span className="text-xs font-bold text-white">已复制 ✅</span>
            </div>
          </div>
          <button
            type="button"
            className="w-full py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
            onClick={() => setShowModal(false)}
          >
            关闭
          </button>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <React.StrictMode>
      {/* 注入流光动画 CSS */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {showModal && <Modal />}

      {/* 外部容器：iOS 风格 3D 毛玻璃 */}
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl group select-none">
        {/* 背景层 */}
        <div className="absolute inset-0 bg-[#151516]/60 backdrop-blur-2xl z-0"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[40px] pointer-events-none"></div>

        {/* 内容层 */}
        <div className="relative z-10 flex flex-col h-full justify-between p-6">
          
          {/* 上半部分：标题 */}
          <div className="flex-1 flex flex-col items-center justify-center">
             {/* 
                字体修复：
                1. 使用 font-extrabold (800) 而非 black (900)，解决模糊粘连。
                2. 使用 antialiased 开启抗锯齿，文字更锐利。
             */}
             <h2 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg antialiased">
               查看商家编号
             </h2>
          </div>

          {/* 下半部分：动效扁平按钮组 */}
          <div className="flex flex-col gap-3 w-full mt-2"> 
              
              {/* 按钮 1：查看编号 (白色流光) */}
              <button 
                onClick={() => setShowModal(true)} 
                type="button" 
                // 核心改动：overflow-hidden 用于遮罩流光，relative 用于定位流光
                className="group relative w-full h-9 rounded-lg overflow-hidden
                  bg-white text-black 
                  text-xs font-bold tracking-wide antialiased
                  shadow-lg shadow-white/5
                  transition-all duration-300
                  hover:scale-[1.02] active:scale-95"
              >
                {/* 流光层：白色半透明光带扫过 */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-shimmer z-0 pointer-events-none"></div>
                
                {/* 文字层：z-10 确保在流光之上 */}
                <span className="relative z-10">查看商家编号</span>
              </button>

              {/* 按钮 2：前往一站式 (红色流光) */}
              <button 
                onClick={() => window.location.href = 'https://login.1zs.top/'} 
                type="button" 
                className="group relative w-full h-9 rounded-lg overflow-hidden
                  bg-red-600 text-white 
                  text-xs font-bold tracking-wide antialiased
                  border border-white/5
                  shadow-lg shadow-red-600/20
                  transition-all duration-300
                  hover:bg-red-500 hover:scale-[1.02] active:scale-95" 
              >
                {/* 流光层：高亮白光扫过 */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer z-0 pointer-events-none"></div>
                
                <span className="relative z-10">前往一站式</span>
              </button>

          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
