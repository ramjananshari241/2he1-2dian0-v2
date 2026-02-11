import { getCachedNavFooter } from '../notion/getCachedMem'

// 🟢 彻底转为实时模式包装器
export function withNavFooterStaticProps(
  getPropsFunc?: (
    context: any,
    sharedPageStaticProps: any
  ) => Promise<any>
) {
  return async (context: any): Promise<any> => {
    // 每次用户访问，这里都会重新运行
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