/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// 移除 WidgetContainer 引用，使用自定义容器以保持和 Profile 一致
// import { WidgetContainer } from './WidgetContainer' 

// 硬编码站长ID
const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: any }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 1. 数据获取 (严格按照你的要求使用 excerpt)
  const cover = data?.cover?.source || data?.cover || data?.pageCover || ''; 
  const title = data?.title || '暂无公告';
  // 核心修改：使用 excerpt
  const description = data?.excerpt || data?.summary || '暂无详细内容...';
  // 链接跳转逻辑
  const slug = data?.slug ? `/post/${data.slug}` : null;

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

  // --- 极简弹窗 (只显示站长ID) ---
  const Modal = () => {
    if (!mounted) return null
    
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* 弹窗动画 */}
        <style jsx>{`
          @keyframes modalEnter { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
          .animate-modal-enter { animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        {/* 遮罩 */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setShowModal(false)}
        ></div>
        
        {/* 弹窗主体 */}
        <div className="relative z-10 w-full max-w-[260px] overflow-hidden rounded-2xl animate-modal-enter
          bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-center p-6"
        >
          <h3 className="text-base font-bold text-white mb-4 tracking-wide">
            站长 ID
          </h3>
          
          {/* 编号显示区 */}
          <div 
            onClick={handleCopy}
            className="group relative cursor-pointer p-3 bg-black/50 rounded-xl border border-white/5 hover:border-blue-500/50 transition-all active:scale-95"
          >
            <span className="text-xl font-mono font-bold text-white tracking-wider">
              {SHOP_CODE}
            </span>
            {/* 复制反馈 */}
            <div className={`absolute inset-0 flex items-center justify-center rounded-xl bg-blue-600 transition-all duration-200 ${isCopied ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <span className="text-xs font-bold text-white">已复制 ✅</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 w-full py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
            onClick={() => setShowModal(false)}
          >
            关闭
          </button>
        </div>
      </div>
    )
  }

  // --- 动态渲染标签 ---
  // 如果有文章数据，上半部分包裹 Link；否则为 div
  const ContentWrapper = slug ? Link : 'div';
  // 注意：Link 需要 href 属性，div 不需要
  const wrapperProps = slug 
    ? { href: slug, className: "flex-1 flex flex-col justify-center group/text cursor-pointer relative z-20" } 
    : { className: "flex-1 flex flex-col justify-center relative z-20 opacity-80" };

  return (
    <React.StrictMode>
      <style jsx global>{`
        @keyframes borderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-border-flow { background-size: 200% 200%; animation: borderFlow 3s ease infinite; }
      `}</style>

      {showModal && <Modal />}

      {/* 
         外部容器：完全复用 ProfileWidget 的样式
         保持左右两个组件视觉高度一致、风格统一
      */}
      <div className="relative h-full w-full group/card transition-transform duration-500 ease-out hover:scale-[1.015]">
        
        {/* 流光边缘 */}
        <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover/card:opacity-70 blur-sm transition-opacity duration-500 animate-border-flow"></div>

        {/* 主体容器 */}
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#151516] flex flex-col">
          
          {/* ================= 背景图层 ================= */}
          <div className="absolute inset-0 z-0">
            {cover ? (
              <img 
                src={cover} 
                alt="Announcement Cover" 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110 opacity-90"
              />
            ) : (
              // 兜底背景：如果没有封面图，显示一个深邃的渐变背景
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900"></div>
            )}
            
            {/* 渐变遮罩：确保文字清晰可见 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20"></div>
          </div>

          {/* ================= 内容层 ================= */}
          <div className="relative z-10 flex flex-col h-full justify-between p-5 md:p-6">
            
            {/* 上半部分：公告内容 (可点击跳转) */}
            {/* @ts-ignore */}
            <ContentWrapper {...wrapperProps}>
               {/* 装饰性标签 */}
               <div className="mb-2 flex items-center gap-1.5 opacity-90">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase">公告</span>
               </div>

               {/* 标题 */}
               <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight mb-2 group-hover/text:text-blue-300 transition-colors line-clamp-2">
                 {title}
               </h2>

               {/* 摘要 (excerpt) */}
               <p className="text-xs text-gray-300/90 font-medium line-clamp-2 leading-relaxed">
                 {description}
               </p>
            </ContentWrapper>

            {/* 下半部分：站长 ID 按钮 */}
            <div className="w-full mt-4 relative z-20">
              <button 
                onClick={(e) => {
                  e.preventDefault(); // 防止触发 Link 跳转
                  e.stopPropagation();
                  setShowModal(true);
                }} 
                type="button" 
                className="w-full h-9 rounded-xl flex items-center justify-center gap-2
                  bg-white/10 backdrop-blur-md border border-white/20
                  text-xs font-bold text-white tracking-wide
                  transition-all duration-300
                  hover:bg-white/20 hover:scale-[1.02] active:scale-95 active:bg-white/5"
              >
                <span className="text-sm">🆔</span>
                <span>站长 ID</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
