import CONFIG from '@/blog.config'
import { GetStaticProps, NextPage } from 'next'
import ContainerLayout from '../components/post/ContainerLayout'
import { WidgetCollection } from '../components/section/WidgetCollection'
import withNavFooter from '../components/withNavFooter'
import { formatPosts } from '../lib/blog/format/post'
import { formatWidgets, preFormatWidgets } from '../lib/blog/format/widget'
import getBlogStats from '../lib/blog/getBlogStats'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getWidgets } from '../lib/notion/getBlogData'
import { getLimitPosts } from '../lib/notion/getDatabase'
import { MainPostsCollection } from '../components/section/MainPostsCollection'
import { MorePostsCollection } from '../components/section/MorePostsCollection'
import { Post } from '../types/blog'
import { ApiScope } from '../types/notion'

const Home: NextPage<{ posts: Post[], widgets: any }> = ({ posts, widgets }) => {
  return (
    <>
      <ContainerLayout>
        <WidgetCollection widgets={widgets} />
        <div data-aos="fade-up" data-aos-delay={300}>
          <MainPostsCollection posts={posts} />
        </div>
      </ContainerLayout>
      <MorePostsCollection posts={posts} />
    </>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (_context, sharedPageStaticProps: any) => {
    console.log('--- [ISR 触发] 正在生成首页内容 ---')
    const { LARGE, MEDIUM, SMALL, MORE } = CONFIG.HOME_POSTS_COUNT
    const sum = LARGE + MEDIUM + SMALL + MORE + 5

    // 抓取文章数据
    const postsRaw = await getLimitPosts(sum, ApiScope.Home)
    const allFormattedPosts = await formatPosts(postsRaw)

    // 公告栏拦截
    const announcementPost = allFormattedPosts.find(p => p.slug === 'announcement') || null
    const filteredPosts = allFormattedPosts.filter(p => p.slug !== 'announcement')

    // 获取侧边栏组件
    const blogStats = await getBlogStats()
    const rawWidgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(rawWidgets)
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats as any)

    // 防崩补丁
    const safeWidgets = formattedWidgets as any
    if (safeWidgets?.profile) {
      if (safeWidgets.profile.links === undefined) safeWidgets.profile.links = null
    }
    safeWidgets.announcement = announcementPost

    return {
      props: {
        ...sharedPageStaticProps.props,
        posts: filteredPosts.slice(0, sum - 5),
        widgets: safeWidgets,
      },
      // 🟢 核心配置：1秒更新一次。Vercel 在检测到 Notion 变动后会自动刷新缓存
      revalidate: 1, 
    }
  }
)

const withNavPage = withNavFooter(Home, undefined, true)
export default withNavPage