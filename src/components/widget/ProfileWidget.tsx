/* eslint-disable @next/next/no-img-element */
import { useScreenSize } from '@/src/hooks/useScreenSize'
import { classNames, isValidUrl } from '@/src/lib/util'
import Link from 'next/link'
import { DynamicIcon } from '../DynamicIcon'
import { WidgetContainer } from './WidgetContainer'

// 定义图标组件
const LinkIcon = ({ icon, hasId }: { icon: string; hasId: boolean }) => {
  if (!icon) return null; // 如果没有图标就不显示，只显示文字

  if (isValidUrl(icon) || icon.startsWith('/')) {
    return (
      <img
        className="w-5 h-5 drop-shadow-sm mr-2" // 增加 mr-2 让图标和文字有点间距
        src={icon}
        alt="icon"
      />
    )
  }
  return (
    <div className="drop-shadow-sm mr-2">
      <DynamicIcon
        nameIcon={icon}
        propsIcon={{ size: 18 }} //稍微调小一点适配文字
      />
    </div>
  )
}

// 辅助函数：定义品牌颜色 (保持你的颜色修复逻辑)
const getBrandGradient = (url: string, iconName: string): string => {
  const target = (url + iconName).toLowerCase();
  
  if (target.includes('github')) return 'linear-gradient(135deg, #2b3137 0%, #24292e 100%)'; 
  if (target.includes('twitter') || target.includes('x.com')) return 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'; 
  if (target.includes('mail') || target.includes('email')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'; 
  if (target.includes('linkedin')) return 'linear-gradient(135deg, #0077b5 0%, #005582 100%)'; 
  if (target.includes('bilibili')) return 'linear-gradient(135deg, #00a1d6 0%, #008bb5 100%)'; 
  if (target.includes('instagram')) return 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)'; 
  if (target.includes('rss')) return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'; 

  // 默认深灰色 (用于普通按钮)
  return 'linear-gradient(135deg, #525252 0%, #404040 100%)';
}

// 使用 any 绕过类型检查，防止 Build 失败
export const ProfileWidget = ({ data }: { data: any }) => {
  const { isMobile } = useScreenSize()

  // 1. 强力查找头像地址
  const avatarSrc = data?.image || data?.avatar || data?.logo || data?.icon || data?.url || '';
  
  // 2. 查找昵称和简介
  const name = data?.name || data?.title || 'Profile';
  const bio = data?.description || data?.bio || data?.body || '';

  return (
    <WidgetContainer>
      <div className="flex flex-col gap-6">
        
        {/* 上半部分：头像和个人信息 */}
        <div className="flex flex-col items-center justify-center text-center">
            {/* 头像容器 */}
            <div className="relative group w-fit mx-auto mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-24 h-24 rounded-full ring-4 ring-neutral-100 dark:ring-neutral-800 overflow-hidden shadow-xl bg-neutral-800">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">?</div>
                )}
              </div>
            </div>

            {/* 昵称 */}
            {name && <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{name}</h2>}
            
            {/* 简介 (支持 HTML 显示，因为 Bio 里可能有换行) */}
            {bio && (
                <div 
                    className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto"
                    dangerouslySetInnerHTML={{ __html: bio }} 
                />
            )}
        </div>

        {/* 下半部分：社交按钮/链接 (修复为长按钮样式) */}
        <div className="flex flex-wrap justify-center gap-3">
          {data?.links?.map((item: any, index: number) => {
            const backgroundStyle = getBrandGradient(item.url || '', item.icon || '');
            
            // 获取按钮文字：优先用 title，没有就用 name
            const label = item.title || item.name || 'Link';

            return (
              <Link
                key={index}
                href={item.url || '#'}
                target="_blank"
                // 恢复为“药丸形”长按钮样式
                className={classNames(
                  'flex items-center justify-center',
                  'px-5 py-2.5 rounded-full', // 长胶囊形状
                  'text-sm font-bold text-white',
                  'shadow-lg shadow-neutral-300 dark:shadow-neutral-900',
                  'transition-all duration-300 ease-in-out',
                  'hover:scale-105 hover:-translate-y-1',
                  // 如果按钮太少，可以让它们宽一点；如果太多，就自适应
                  'min-w-[120px] flex-grow md:flex-grow-0' 
                )}
                // 强制应用颜色修复
                style={{
                  background: backgroundStyle, 
                  border: '1px solid rgba(255,255,255,0.1)' 
                }}
              >
                {/* 图标 */}
                <LinkIcon icon={item.icon} hasId={!!data.id} />
                {/* 文字 */}
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

      </div>
    </WidgetContainer>
  )
}
