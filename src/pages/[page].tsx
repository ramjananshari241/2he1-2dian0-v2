import CONFIG from '@/blog.config'
import { GetStaticProps, GetStaticPropsContext, NextPage } from 'next'
import { BlockRender } from '../components/blocks/BlockRender'
import { LargeTitle } from '../components/LargeTitle'
import ContainerLayout from '../components/post/ContainerLayout'
import withNavFooter from '../components/withNavFooter'
import { formatBlocks } from '../lib/blog/format/block'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '../lib/notion/getBlocks'
import { getPageBySlug, getPosts } from '../lib/notion/getBlogData'
import { ApiScope } from '../types/notion'

const Post: NextPage<{
  blocks: any
  title: string
}> = ({ blocks, title }) => {
  return (
    <ContainerLayout>
      <LargeTitle className="mb-8" title={title} />
      <div className="break-words rounded-2xl bg-white px-8 py-4 dark:bg-neutral-900">
        <BlockRender blocks={blocks} />
      </div>
    </ContainerLayout>
  )
}

export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (context: GetStaticPropsContext) => {
    const slug = context.params?.page as string
    const page = await getPageBySlug(slug)

    if (!page) {
      return { notFound: true }
    }

    const blocks = await getAllBlocks(page.id)
    const formattedBlocks = await formatBlocks(blocks)

    return {
      props: {
        blocks: formattedBlocks,
        title: (page.properties.title as any).title[0].plain_text,
      },
      // 🟢 开启实时抓取
      revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
)

export async function getStaticPaths() {
  const posts = await getPosts(ApiScope.Archive)
  const paths = posts.map((post: any) => ({
    params: { page: post.properties.slug.rich_text[0].plain_text },
  }))

  return {
    paths,
    // 🟢 核心修复：改为 'blocking'。
    // 这样新发布的文章，Vercel 会在有人访问时自动去抓取，而不需要重部署！
    fallback: 'blocking', 
  }
}

export default withNavFooter(Post)