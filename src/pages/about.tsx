import CONFIG from '@/blog.config'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { BlockRender } from '../components/blocks/BlockRender'
import { LargeTitle } from '../components/LargeTitle'
import ContainerLayout from '../components/post/ContainerLayout'
import { WidgetCollection } from '../components/section/WidgetCollection'
import withNavFooter from '../components/withNavFooter'
import { formatBlocks } from '../lib/blog/format/block'
import { formatWidgets, preFormatWidgets } from '../lib/blog/format/widget'
import getBlogStats from '../lib/blog/getBlogStats'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '../lib/notion/getBlocks'
import { getWidgets } from '../lib/notion/getBlogData'
import { addSubTitle } from '../lib/util'
import { SharedNavFooterStaticProps } from '../types/blog'

const { ABOUT } = CONFIG.DEFAULT_SPECIAL_PAGES

const AboutPage: NextPage<{ blocks: any, title: string, widgets: any }> = ({ blocks, title, widgets }) => {
  return (
    <>
      <ContainerLayout>
        <LargeTitle className="mb-4" title={title} />
        <div className="break-words rounded-2xl bg-white px-8 py-4 dark:bg-neutral-900">
          <BlockRender blocks={blocks} />
        </div>
        <div className="mt-4">
          {widgets && <WidgetCollection widgets={widgets} />}
        </div>
      </ContainerLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (_context: GetStaticPropsContext, sharedPageStaticProps: any) => {
    addSubTitle(sharedPageStaticProps.props, ABOUT)
    const page = sharedPageStaticProps.props.navPages.find((p: any) => p.slug === ABOUT) ?? null
      
    const blocks = await getAllBlocks(page?.id ?? '')
    const formattedBlocks = await formatBlocks(blocks)

    const blogStats = await getBlogStats()
    const widgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(widgets)
    
    // 🛡️ 核心修复：同样使用 as any
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats as any)

    const safeWidgets = formattedWidgets as any
    if (safeWidgets?.profile) {
      if (safeWidgets.profile.links === undefined) safeWidgets.profile.links = null
    }

    return {
      props: {
        ...sharedPageStaticProps.props,
        blocks: formattedBlocks || [],
        title: page?.title ?? 'About',
        widgets: safeWidgets || {},
      },
      revalidate: 1,
    }
  }
)

const withNavPage = withNavFooter(AboutPage)
export default withNavPage