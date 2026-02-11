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
    // 每次更新请求时，这里都会重新执行一次
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
        revalidate: 1, // 🟢 1秒刷新
      }
    }

    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 核心：强制透传 revalidate。
    // 如果 result 里面没写，我们也强制给它加上 1 秒的开关。
    return {
      ...result,
      props: {
        ...sharedProps.props,
        ...(result.props || {}),
      },
      revalidate: 1, 
    }
  }
}