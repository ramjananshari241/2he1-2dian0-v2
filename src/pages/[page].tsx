import CONFIG from '@/blog.config'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { BlockRender } from '../components/blocks/BlockRender'
import { Empty } from '../components/Empty'
import { LargeTitle } from '../components/LargeTitle'
import { BlogLayoutPure } from '../components/layout/BlogLayout'
import ContainerLayout from '../components/post/ContainerLayout'
import { Section404 } from '../components/section/Section404'
import withNavFooter from '../components/withNavFooter'
import { formatBlocks } from '../lib/blog/format/block'
import { formatPages } from '../lib/blog/format/page'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '../lib/notion/getBlocks'
import { getPages } from '../lib/notion/getBlogData'
import { addSubTitle } from '../lib/util'
import {
  NextPageWithLayout,
  Page,
  SharedNavFooterStaticProps,
} from '../types/blog'
import { BlockResponse } from '../types/notion'

const specialPages = Object.values(CONFIG.DEFAULT_SPECIAL_PAGES)

export const getStaticPaths = async () => {
  const pages = await getPages()
  const formattedPages = formatPages(pages)
  
  // 🟢 核心优化：只在构建阶段预先渲染前 20 篇文章
  // 这样部署时间将缩短 90% 以上。剩下的文章会在用户访问时自动生成并缓存。
  const paths = formattedPages
    .slice(0, 20) 
    .map((page) => ({
      params: { page: page.slug },
    }))
    .filter((page) => !specialPages.includes(page.params?.page as string))

  return { 
    paths, 
    // 🟢 关键：blocking 模式会确保未预生成的页面在初次访问时自动同步生成
    fallback: 'blocking' 
  }
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (
    context: GetStaticPropsContext,
    sharedPageStaticProps: SharedNavFooterStaticProps
  ) => {
    const slug = context.params?.page as string
    addSubTitle(sharedPageStaticProps.props, slug)
    const page =
      sharedPageStaticProps.props.navPages.find((page) => page.slug === slug) ??
      null

    if (!page) {
      return {
        props: {
          ...sharedPageStaticProps.props,
          page: null,
          blocks: [],
        },
        revalidate: 10,
      }
    }

    const blocks = await getAllBlocks(page?.id ?? '')
    const formattedBlocks = await formatBlocks(blocks)

    return {
      props: {
        ...sharedPageStaticProps.props,
        page: page,
        blocks: formattedBlocks,
      },
      // 🟢 核心优化：开启 ISR，每 10 秒可以在后台静默刷新一次内容
      // 以后你在 Notion 改了文章正文，不用点部署，几秒后刷新网页就能看到。
      revalidate: 10,
    }
  }
)

const Page: NextPage<{
  page: Page
  blocks: BlockResponse[]
}> = ({ page, blocks }) => {
  if (!page) return <Section404 />

  const { title } = page

  return (
    <>
      <ContainerLayout>
        <LargeTitle className="mb-4" title={title} />
        {blocks.length > 0 ? (
          <div className="px-8 py-4 break-words bg-white rounded-2xl dark:bg-neutral-900">
            <BlockRender blocks={blocks} />
          </div>
        ) : (
          <Empty />
        )}
      </ContainerLayout>
    </>
  )
}

;(Page as NextPageWithLayout).getLayout = (page) => {
  return <BlogLayoutPure>{page}</BlogLayoutPure>
}

export default withNavFooter(Page)
