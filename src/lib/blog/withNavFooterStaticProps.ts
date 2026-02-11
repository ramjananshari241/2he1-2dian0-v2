import { getCachedNavFooter } from '../notion/getCachedMem'

// 🟢 彻底转为 SSR 模式包装器
// 删除了所有与 revalidate 相关的逻辑，因为它现在是 100% 实时
export function withNavFooterStaticProps(
  getPropsFunc?: (
    context: any,
    sharedPageStaticProps: any
  ) => Promise<any>
) {
  return async (context: any): Promise<any> => {
    // 每次用户打开网页，这里都会重新运行
    const sharedData = await getCachedNavFooter()

    const sharedProps = {
      props: {
        ...sharedData,
        siteSubtitle: null,
      },
    }

    if (!getPropsFunc) {
      return sharedProps
    }

    const result = await getPropsFunc(context, sharedProps)

    return {
      ...result,
      props: {
        ...sharedProps.props,
        ...(result.props || {}),
      },
    }
  }
}