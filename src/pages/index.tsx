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
    const { LARGE, MEDIUM, SMALL, MORE } = CONFIG.HOME_POSTS_COUNT
    const sum = LARGE + MEDIUM + SMALL + MORE + 5
    const postsRaw = await getLimitPosts(sum, ApiScope.Home)
    const allFormattedPosts = await formatPosts(postsRaw)

    const announcementPost = allFormattedPosts.find(p => p.slug === 'announcement') || null
    const filteredPosts = allFormattedPosts.filter(p => p.slug !== 'announcement')

    const blogStats = await getBlogStats()
    const rawWidgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(rawWidgets)
    
    // 🛡️ 核心修复：通过 as any 解决 blogStats 类型不匹配导致的红字报错
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats as any)

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
      revalidate: 1, 
    }
  }
)

const withNavPage = withNavFooter(Home, undefined, true)
export default withNavPage