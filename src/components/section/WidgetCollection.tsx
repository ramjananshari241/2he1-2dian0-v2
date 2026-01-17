import { ProfileWidget } from '../widget/ProfileWidget'
import { StatsWidget } from '../widget/StatsWidget'

export const WidgetCollection = ({
  widgets,
}: {
  widgets: { [key: string]: any }
}) => {
  return (
    <div
      className="mb-6 grid grid-cols-2 gap-4 md:gap-8 lg:gap-10"
      data-aos="fade-up"
    >
      {/* 左侧：Profile 组件 (保持不变) */}
      <ProfileWidget data={widgets.profile} />
      
      {/* 右侧：Stats 组件 (改为接收 announcement 数据) */}
      {/* ⚠️ 注意：确保你在 Notion 中有一篇文章的 Slug 设置为了 'announcement' (或者 'annoucement'，请检查你的拼写) */}
      <StatsWidget data={widgets.announcement} />
    </div>
  )
}
