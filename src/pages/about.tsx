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
import { BlockResponse } from '../types/notion'

const { ABOUT } = CONFIG.DEFAULT_SPECIAL_PAGES

const About: NextPage<{
  blocks: BlockResponse[]
  title: string
  widgets: {
    [key: string]: any
  }
}> = ({ blocks, title, widgets }) => {
  return (
    <>
      <ContainerLayout>
        <LargeTitle className="mb-4" title={title} />
        <div className="break-words rounded-2xl bg-white px-8 py-4 dark:bg-neutral-900">
          <BlockRender blocks={blocks} />
        </div>
        <div className="mt-4">
          {/* 增加保护：只有当 widgets 存在时才渲染 */}
          {widgets && <WidgetCollection widgets={widgets} />}
        </div>
      </ContainerLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (
    _context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    addSubTitle(sharedPageStaticProps.props, ABOUT)
    const page =
      sharedPageStaticProps.props.navPages.find(
        (page) => page.slug === ABOUT
      ) ?? null
      
    // 获取 Blocks
    const blocks = await getAllBlocks(page?.id ?? '')
    const formattedBlocks = await formatBlocks(blocks)

    // 获取 Widgets
    const blogStats = await getBlogStats()
    const widgets = await getWidgets()
    const preFormattedWidgets = await preFormatWidgets(widgets)
    const formattedWidgets = await formatWidgets(preFormattedWidgets, blogStats)

    // =========================================================
    // 🛡️ 核心修复：数据“防弹”处理 (防止因 Notion 内容缺失导致部署失败)
    // =========================================================
    
    // 1. 修复 widgets.profile.links 为 undefined 导致的序列化报错
    if (formattedWidgets && formattedWidgets.profile) {
        // Next.js getStaticProps 不允许返回 undefined，必须转为 null
        if (formattedWidgets.profile.links === undefined) {
            formattedWidgets.profile.links = null;
        }
    }

    // 2. 确保 blocks 不是 undefined
    const safeBlocks = formattedBlocks || [];

    // 3. 确保 title 不是 undefined
    const safeTitle = page?.title ?? 'About';

    return {
      props: {
        ...sharedPageStaticProps.props,
        blocks: safeBlocks,
        title: safeTitle,
        widgets: formattedWidgets || {}, // 确保 widgets 本身不为空对象
      },
      revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
)

const withNavPage = withNavFooter(About)

export default withNavPage