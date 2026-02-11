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
    // 每次 ISR 触发时，这里都会重新执行
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

    // 🟢 核心：强制合并 revalidate。如果页面没写，就用全局的 10 秒。
    return {
      ...result,
      props: {
        ...sharedProps.props,
        ...(result.props || {}),
      },
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
}