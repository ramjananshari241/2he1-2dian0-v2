import { GetStaticProps, NextPage } from 'next'
import { BlockRender } from '../components/blocks/BlockRender'
import { LargeTitle } from '../components/LargeTitle'
import ContainerLayout from '../components/post/ContainerLayout'
import withNavFooter from '../components/withNavFooter'
import { formatBlocks } from '../lib/blog/format/block'
import { withNavFooterStaticProps } from '../lib/blog/withNavFooterStaticProps'
import { getAllBlocks } from '../lib/notion/getBlocks'
import { getPageBySlug, getPosts } from '../lib/notion/getBlogData'
import { ApiScope } from '../types/notion'

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

// 🟢 改回 getStaticProps，稳定性提升
export const getStaticProps: GetStaticProps = withNavFooterStaticProps(
  async (context) => {
    const slug = context.params?.page as string
    const page = await getPageBySlug(slug)

    if (!page) return { notFound: true }

    const blocks = await getAllBlocks(page.id)
    const formattedBlocks = await formatBlocks(blocks)

    return {
      props: {
        blocks: formattedBlocks,
        title: (page.properties.title as any).title[0].plain_text,
      },
      revalidate: 1, // 🟢 1秒刷新一次
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
    fallback: 'blocking', 
  }
}

const withNavPage = withNavFooter(PostPage)
export default withNavPage