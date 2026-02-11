import CONFIG from '@/blog.config'
import { GetStaticPropsContext } from 'next'
import { getCachedNavFooter } from '../notion/getCachedMem'

export function withNavFooterStaticProps(
  getStaticPropsFunc?: (
    context: GetStaticPropsContext,
    sharedPageStaticProps: any
  ) => Promise<any>
) {
  return async (context: GetStaticPropsContext): Promise<any> => {
    const { navPages, siteTitle, logo } = await getCachedNavFooter()

    const sharedProps = {
      props: {
        navPages,
        siteTitle,
        siteSubtitle: null,
        logo,
      },
    }

    if (!getStaticPropsFunc) {
      return {
        ...sharedProps,
        revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
      }
    }

    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 核心修复：强制在最终返回对象中注入 revalidate 信号
    // 如果没有这一行，Vercel 永远收不到“定期更新”的指令
    return {
      ...result,
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
}