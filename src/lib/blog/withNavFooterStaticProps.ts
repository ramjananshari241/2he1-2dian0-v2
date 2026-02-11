import CONFIG from '@/blog.config'
import { GetStaticPropsContext } from 'next'
import { getCachedNavFooter } from '../notion/getCachedMem'

export function withNavFooterStaticProps(
  getStaticPropsFunc?: (
    context: GetStaticPropsContext,
    sharedPageStaticProps: any
  ) => Promise<any>
) {
  // 🟢 将返回类型改为 Promise<any> 以修复红字报错
  return async (
    context: GetStaticPropsContext
  ): Promise<any> => {
    const { navPages, siteTitle, logo } = await getCachedNavFooter()

    const sharedProps = {
      props: {
        navPages,
        siteTitle: siteTitle,
        siteSubtitle: null,
        logo: logo,
      },
      // 🟢 开启信号：10秒检查一次更新
      revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
    }

    if (getStaticPropsFunc == null) {
      return sharedProps
    }

    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 核心修复：确保最终返回的对象包含 revalidate 并且格式正确
    return {
      ...result,
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS
    }
  }
}