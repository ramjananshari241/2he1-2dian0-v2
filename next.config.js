/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})

const nextConfig = {
    reactStrictMode: true,
    
    // 1. 超时时间：给足 5 分钟，防止 Notion 响应慢
    staticPageGenerationTimeout: 300,

    // 2.【关键新增】试图限制构建时的并发数
    // 这能减少同时下载图片的数量，降低 "VipsJpeg" 报错的概率
    experimental: {
        appDir: true,
        workerThreads: false, // 禁用工作线程，降低并行度
        cpus: 1, // 强制只使用 1 个 CPU 核心（让它排队一个一个处理，而不是一窝蜂下载）
    },

    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        })
        return config
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        domains: ['001.blogimage.top', 'x1file.top', '003.blogimage.top', '004.blogimage.top', '005.blogimage.top', 'qpic.ws', 'upload.cc', 'x1image.top', 'www.imgccc.com', 'static.anzifan.com', 'cdn.sspai.com', 'cdn.dribbble.com', 'image.freepik.com', 'avatars.githubusercontent.com', 'cdn.jsdelivr.net', 'images.unsplash.com',
                 'img.notionusercontent.com',
                'gravatar.com',
                'www.notion.so',
                'source.unsplash.com',
                'p1.qhimg.com',
                'webmention.io',
                'ko-fi.com',
                'e.hiphotos.baidu.com',
                'fuss10.elemecdn.com',
                'file.notion.so'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.amazonaws.com',
            },
        ],
        unoptimized: true,
    },
    output: 'export',
    trailingSlash: true,
}

module.exports = withPWA(nextConfig);
