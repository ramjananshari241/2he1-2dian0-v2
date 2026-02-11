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
    // 每次更新时重新获取基础数据
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
        revalidate: 1, // 🟢 强制设为 1 秒，实现最高频率更新
      }
    }

    const result = await getStaticPropsFunc(context, sharedProps)

    return {
      ...result,
      props: {
        ...sharedProps.props,
        ...(result.props || {}),
      },
      // 🟢 核心修复：确保 revalidate 信号能被 Vercel 捕获
      revalidate: 1, 
    }
  }
}