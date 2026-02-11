import CONFIG from '@/blog.config'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
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
import { Post, SharedNavFooterStaticProps } from '../types/blog'
import { ApiScope } from '../types/notion'

const Home: NextPage<{
  posts: Post[]
  widgets: {
    [key: string]: any
  }
}> = ({ posts, widgets }) => {
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
  async (
    _context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    const { LARGE, MEDIUM, SMALL, MORE } = CONFIG.HOME_POSTS_COUNT
    const sum = LARGE + MEDIUM + SMALL + MORE + 5

    const postsRaw = await getLimitPosts(sum, ApiScope.Home)
    const allFormattedPosts = await formatPosts(postsRaw)

    const announcementPost = allFormattedPosts.find(p => p.slug === 'announcement') || null
    const filteredPosts = allFormattedPosts.filter(p => p.slug !== 'announcement')

    const blogStats = await getBlogStats()
    const rawWidgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(rawWidgets)
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats)

    // 🛡️ 保持 2.0 版本的防崩保护
    if (formattedWidgets && formattedWidgets.profile) {
        if (formattedWidgets.profile.links === undefined) {
            formattedWidgets.profile.links = null;
        }
    }

    ;(formattedWidgets as any).announcement = announcementPost

    return {
      props: {
        ...sharedPageStaticProps.props,
        posts: filteredPosts.slice(0, sum - 5), 
        widgets: formattedWidgets || {},
      },
      // 🟢 核心优化：首页开启自动更新
      // 每 10 秒检查一次 Notion，如有新文章会自动刷出
      revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
)

const withNavPage = withNavFooter(Home, undefined, true)

export default withNavPage
