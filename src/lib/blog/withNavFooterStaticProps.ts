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
      revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }

    if (!getStaticPropsFunc) {
      return sharedProps
    }

    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 强制透传 revalidate。如果页面没写，就用 config 里的默认值（10秒）
    return {
      ...result,
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
}