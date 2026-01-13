import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect } from 'react'
// @ts-ignore
import { createPortal } from 'react-dom'

const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: BlogStats }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(SHOP_CODE)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [showModal])

  const Modal = () => {
    if (!mounted) return null
    // @ts-ignore
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <style jsx>{` @keyframes modalEnter { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } } .animate-modal-enter { animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; } `}</style>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)}></div>
        <div className="relative z-10 w-full max-w-[320px] rounded-3xl animate-modal-enter bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 p-8 text-center shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-2">商家编号</h3>
          <p className="text-xs text-gray-400 mb-6 font-medium">点击下方编号即可复制</p>
          <div onClick={handleCopy} className="group relative cursor-pointer mb-6 p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-2xl font-mono font-black text-white tracking-widest">{SHOP_CODE}</span>
            <div className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-blue-600 transition-all ${isCopied ? 'opacity-100' : 'opacity-0'}`}><span className="text-xs font-bold text-white">已复制 ✅</span></div>
          </div>
          <button className="w-full py-3 rounded-xl text-sm font-bold text-black bg-white" onClick={() => setShowModal(false)}>关闭</button>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <React.StrictMode>
      <style jsx global>{` @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } } @keyframes borderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .animate-shimmer { animation: shimmer 1.5s infinite; } .animate-border-flow { background-size: 200% 200%; animation: borderFlow 3s ease infinite; } `}</style>
      {showModal && <Modal />}

      <div className="relative h-full w-full group/card transition-transform duration-500 ease-out hover:scale-[1.02]">
        <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover/card:opacity-70 blur-sm transition-opacity animate-border-flow"></div>
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#151516]/80 backdrop-blur-2xl flex flex-col p-6 md:p-8">
          
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="relative flex items-center">
               <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest drop-shadow-md antialiased group-hover/card:text-blue-50 transition-colors">
                 会员服务
               </h2>
               <div className="absolute -right-5 top-1.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
             </div>
          </div>

          <div className="flex flex-col gap-3 w-full mt-6"> 
              {/* 按钮大尺寸版 (h-12) */}
              <button onClick={() => setShowModal(true)} className="group/btn relative w-full h-11 md:h-12 rounded-xl overflow-hidden bg-white text-black text-sm font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-xl">
                <span className="relative z-10">👑 会员价格</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
              </button>

              <button onClick={() => window.location.href = 'https://login.1zs.top/'} className="group/btn relative w-full h-11 md:h-12 rounded-xl overflow-hidden bg-red-600 text-white text-sm font-bold tracking-wide transition-all hover:scale-105 active:scale-95 shadow-xl border border-white/5">
                <span className="relative z-10">前往一站式</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
              </button>
          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
