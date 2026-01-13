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
        <div className="relative z-10 w-full max-w-[280px] rounded-2xl animate-modal-enter bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 p-6 text-center shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1">商家编号</h3>
          <p className="text-[10px] text-gray-400 mb-4">点击编号复制</p>
          <div onClick={handleCopy} className="group relative cursor-pointer mb-5 p-3 bg-black/40 rounded-xl border border-white/5">
            <span className="text-xl font-mono font-bold text-white tracking-widest">{SHOP_CODE}</span>
            <div className={`absolute inset-0 flex items-center justify-center rounded-xl bg-blue-600 transition-all ${isCopied ? 'opacity-100' : 'opacity-0'}`}><span className="text-xs font-bold text-white">已复制</span></div>
          </div>
          <button className="w-full py-2 rounded-lg bg-white text-xs font-bold text-black" onClick={() => setShowModal(false)}>关闭</button>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <React.StrictMode>
      <style jsx global>{`
        @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } }
        @keyframes borderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-border-flow { background-size: 200% 200%; animation: borderFlow 4s ease infinite; }
      `}</style>
      {showModal && <Modal />}

      <div className="relative h-full w-full group/card transition-transform duration-500 ease-out hover:scale-[1.01]">
        <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50 opacity-0 group-hover/card:opacity-100 blur-[2px] transition-opacity animate-border-flow"></div>
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/5 shadow-xl bg-[#151516]/70 backdrop-blur-xl flex flex-col p-4 md:p-5">
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60px] md:min-h-[80px]">
             <div className="relative flex items-center">
               <h2 className="text-lg md:text-xl font-bold text-white tracking-wider antialiased">会员服务</h2>
               <div className="absolute -right-4 top-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
             </div>
          </div>

          <div className="flex flex-col gap-2 w-full"> 
              <button onClick={() => setShowModal(true)} className="group/btn relative w-full h-9 rounded-lg overflow-hidden bg-white text-black text-xs font-bold transition-all hover:brightness-95 active:scale-95 shadow-md">
                <span className="relative z-10">👑 会员价格</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
              </button>

              <button onClick={() => window.location.href = 'https://login.1zs.top/'} className="group/btn relative w-full h-9 rounded-lg overflow-hidden bg-red-600 text-white text-xs font-bold transition-all hover:bg-red-500 active:scale-95 shadow-md border border-white/5">
                <span className="relative z-10">前往一站式</span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
              </button>
          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
