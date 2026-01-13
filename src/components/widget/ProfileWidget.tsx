/* eslint-disable @next/next/no-img-element */
import { useScreenSize } from '@/src/hooks/useScreenSize'
import { classNames, isValidUrl } from '@/src/lib/util'
import Link from 'next/link'
import React from 'react'
import { DynamicIcon } from '../DynamicIcon'

const LinkIcon = ({ icon }: { icon: string }) => {
  if (!icon) return null;
  if (isValidUrl(icon) || icon.startsWith('/')) {
    return <img className="w-5 h-5 drop-shadow-sm mr-2" src={icon} alt="icon" />
  }
  return <div className="drop-shadow-sm mr-2"><DynamicIcon nameIcon={icon} propsIcon={{ size: 18 }} /></div>
}

export const ProfileWidget = ({ data }: { data: any }) => {
  const { isMobile } = useScreenSize()

  // 从 Notion 数据库动态读取
  const avatarSrc = data?.logo?.src || data?.image || data?.avatar || '';
  const name = data?.name || 'PRO BLOG';
  const bio = data?.description || '';

  return (
    <React.StrictMode>
      <style jsx global>{`
        @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } }
        @keyframes borderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-border-flow { background-size: 200% 200%; animation: borderFlow 3s ease infinite; }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
      `}</style>

      <div className="relative h-full w-full group/card transition-transform duration-500 ease-out hover:scale-[1.02]">
        {/* 流光边缘 */}
        <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover/card:opacity-70 blur-sm transition-opacity duration-500 animate-border-flow"></div>

        {/* 卡片主体 */}
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#151516]/80 backdrop-blur-2xl flex flex-col">
          
          {/* 背景光斑 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-[40px] pointer-events-none group-hover/card:bg-purple-600/20 transition-colors"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] pointer-events-none group-hover/card:bg-blue-600/20 transition-colors"></div>

          <div className="relative z-10 flex flex-col h-full p-5 md:p-7 justify-between">
            
            {/* 上半部分：头像 + 文字内容 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                {/* 头像 */}
                <div className="relative group/avatar shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur opacity-40 group-hover/avatar:opacity-70 transition duration-500"></div>
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full ring-2 ring-white/10 overflow-hidden bg-neutral-800">
                    {avatarSrc ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">P</div>}
                  </div>
                </div>

                {/* Notion 数据文字 */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight antialiased drop-shadow-md">
                      {name}
                    </h2>
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed antialiased">
                      {bio}
                    </p>
                </div>
            </div>

            {/* 下半部分：三个按钮 (大尺寸版) */}
            <div className="w-full mt-6">
              {/* 移动端: 1列或大间距 | 桌面端: 3列等分 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full">
                
                {/* 按钮 1 */}
                <Link href="/about" className="group/btn relative h-11 md:h-12 w-full rounded-xl overflow-hidden flex items-center justify-center text-xs md:text-sm font-bold text-white tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}>
                  <div className="relative z-10 flex items-center"><LinkIcon icon="FaCrown" /><span>入会说明</span></div>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
                </Link>

                {/* 按钮 2 */}
                <Link href="/download" className="group/btn relative h-11 md:h-12 w-full rounded-xl overflow-hidden flex items-center justify-center text-xs md:text-sm font-bold text-white tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <div className="relative z-10 flex items-center"><LinkIcon icon="IoMdCloudDownload" /><span>下载说明</span></div>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
                </Link>

                {/* 按钮 3 */}
                <Link href="/friends" className="group/btn relative h-11 md:h-12 w-full rounded-xl overflow-hidden flex items-center justify-center text-xs md:text-sm font-bold text-white tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0284c7 100%)' }}>
                  <div className="relative z-10 flex items-center"><LinkIcon icon="HiOutlineViewGridAdd" /><span>更多资源</span></div>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
                </Link>

              </div>
            </div>

          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
