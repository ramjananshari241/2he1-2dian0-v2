/* eslint-disable @next/next/no-img-element */
import { classNames } from '@/src/lib/util'
import { Post } from '@/src/types/blog'
import Link from 'next/link'
import React from 'react' // 👈 显式引入以防报错
import { PostCategory, PostImage, PostTime } from './CardInfo'

type GridCardProps = {
  post: Post
  size: 'small' | 'medium' | 'large'
}

/**
 * 4.0 响应式尺寸配置
 * 重点修复了 large 在移动端（无 md 前缀）的比例和高度
 */
const SIZE = {
  large: {
    // 移动端：高度自适应，纵向排列 | 桌面端：横向排列固定高度
    card: classNames(
      'w-full h-auto flex-col',
      'md:flex-row md:h-[18rem]', 
      'lg:h-[22.5rem]'
    ),
    // 移动端：高度固定为 200px(h-52) 且占满宽度 | 桌面端：宽度占比 60%
    image: classNames(
      'h-52 w-full', 
      'md:h-full md:w-[60%]',
      'lg:w-[62%]'
    ),
    title: classNames(
      'text-xl leading-snug', 
      'md:text-2xl md:leading-tight md:line-clamp-3',
      'lg:text-3xl'
    ),
  },
  medium: {
    card: 'h-auto min-h-[24rem] flex-col',
    image: 'h-56 w-full',
    title: 'text-xl leading-tight line-clamp-2',
  },
  small: {
    card: 'h-auto min-h-[22rem] flex-col',
    image: 'h-48 w-full',
    title: 'line-clamp-2 text-lg leading-tight md:text-base',
  },
}

const GridCard = ({ post, size }: GridCardProps) => {
  const { title, slug, cover, date, category } = post

  return (
    <React.StrictMode>
      <Link
        href={{
          pathname: '/post/[slug]',
          query: {
            slug: slug,
          },
        }}
      >
        <div
          className={classNames(
            // 基础视觉：统一 iOS 磨砂玻璃风格 + 鼠标交互反馈
            'group relative flex transform-gpu cursor-pointer select-none overflow-hidden rounded-[2.5rem]',
            'bg-[#151516]/70 backdrop-blur-xl border border-white/10 shadow-2xl',
            'transition-all duration-500 ease-out hover:scale-[1.015] hover:bg-[#1c1c1e]/90',
            'active:scale-[0.98]',
            SIZE[size].card
          )}
        >
          {/* 内部高光氛围 - 悬停时增强质感 */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <header
            className={classNames(
              'relative overflow-hidden shrink-0 transition-all duration-500',
              SIZE[size].image
            )}
          >
            {/* 使用 object-cover 确保图片即使在不同比例下也不变形 */}
            <PostImage
              cover={cover}
              alt={title}
              className={
                'w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100'
              }
            />
            {/* 图片层渐变，提升标题对比度 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent"></div>
          </header>

          <div className="z-10 flex flex-col justify-between flex-1 p-6 md:p-8 transition-all duration-500">
            <article className="flex flex-col items-start gap-2 md:gap-3">
              {/* 分类标签 */}
              <PostCategory category={category} />
              
              {/* 标题优化：font-extrabold 解决压扁感，antialiased 解决模糊 */}
              <h2
                className={`${SIZE[size].title} font-extrabold text-white antialiased tracking-tight transition-colors group-hover:text-blue-100`}
              >
                {title}
              </h2>
            </article>
            
            {/* 时间部分与装饰 */}
            <div className="mt-4 border-t border-white/5 pt-4 opacity-50 flex justify-between items-center w-full">
              <PostTime date={date.created} />
              
              {/* 桌面端特有的箭头，增加指向性 */}
              <div className="hidden md:block transform transition-transform duration-300 group-hover:translate-x-1 text-white/40">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </React.StrictMode>
  )
}

export default GridCard
