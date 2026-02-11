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

    // 如果页面没有额外的数据抓取逻辑
    if (!getStaticPropsFunc) {
      return {
        ...sharedProps,
        revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
      }
    }

    // 执行具体页面的逻辑
    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 核心修复：强制确保信号穿透给 Vercel
    return {
      ...result,
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
}