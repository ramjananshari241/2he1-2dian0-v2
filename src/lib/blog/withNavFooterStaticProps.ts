import CONFIG from '@/blog.config'
import { GetStaticPropsContext } from 'next'
import { getCachedNavFooter } from '../notion/getCachedMem'

// 这里的类型改为 any 以绕过复杂的嵌套类型检查，确保逻辑能跑通
export function withNavFooterStaticProps(
  getStaticPropsFunc?: (
    context: GetStaticPropsContext,
    sharedPageStaticProps: any
  ) => Promise<any>
) {
  return async (context: GetStaticPropsContext): Promise<any> => {
    // 1. 获取导航栏数据
    const { navPages, siteTitle, logo } = await getCachedNavFooter()

    const sharedProps = {
      props: {
        navPages,
        siteTitle,
        siteSubtitle: null,
        logo,
      },
    }

    // 2. 如果没有传入具体的 getStaticProps 函数
    if (!getStaticPropsFunc) {
      return {
        ...sharedProps,
        revalidate: CONFIG.NEXT_REVALIDATE_SECONDS,
      }
    }

    // 3. 执行具体的页面逻辑 (例如 index.tsx 或 [tag].tsx)
    const result = await getStaticPropsFunc(context, sharedProps)

    // 🟢 核心修复：这里是关键！
    // 无论 getStaticPropsFunc 返回什么，我们都强行合并 revalidate
    // 如果 result 里有 revalidate，就用它的；否则用 config 里的默认值
    return {
      ...result,
      props: {
        ...sharedProps.props,
        ...result.props,
      },
      revalidate: result.revalidate || CONFIG.NEXT_REVALIDATE_SECONDS,
    }
  }
}