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
    const sharedData = await getCachedNavFooter()

    const sharedProps = {
      props: {
        ...sharedData,
        siteSubtitle: null,
      },
    }

    if (!getStaticPropsFunc) {
      return {
        ...sharedProps,
        revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
      }
    }

    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 关键：强制透传 revalidate，否则 Vercel 收不到更新指令
    return {
      ...result,
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
}