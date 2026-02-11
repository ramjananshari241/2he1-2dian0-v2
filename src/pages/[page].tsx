import { NextPage } from 'next'
import { BlockRender } from '../components/blocks/BlockRender'
import { LargeTitle } from '../components/LargeTitle'
import ContainerLayout from '../components/post/ContainerLayout'
import withNavFooter from '../components/withNavFooter'
import { formatBlocks } from '../lib/blog/format/block'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '../lib/notion/getBlocks'
import { getPageBySlug } from '../lib/notion/getBlogData'

const PostPage: NextPage<{ blocks: any, title: string }> = ({ blocks, title }) => {
  return (
    <ContainerLayout>
      <LargeTitle className="mb-8" title={title} />
      <div className="break-words rounded-2xl bg-white px-8 py-4 dark:bg-neutral-900">
        <BlockRender blocks={blocks} />
      </div>
    </ContainerLayout>
  )
}

// 🟢 核心改动：使用 getServerSideProps 实现 100% 实时抓取
export const getServerSideProps = withNavFooterStaticProps(
  async (context: any) => {
    const slug = context.params?.page as string // 这里的 page 对应网址里的 slug
    const page = await getPageBySlug(slug)

    if (!page) {
      return { notFound: true }
    }

    // 现场抓取 Notion 里的最新块
    const blocks = await getAllBlocks(page.id)
    const formattedBlocks = await formatBlocks(blocks)

    return {
      props: {
        blocks: formattedBlocks,
        title: (page.properties.title as any).title[0].plain_text,
      },
    }
  }
)

// 🟢 彻底删掉原来的 getStaticPaths，SSR 模式不需要它

const withNavPage = withNavFooter(PostPage)
export default withNavPage