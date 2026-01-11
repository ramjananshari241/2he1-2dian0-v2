/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

const { withPlaiceholder } = require("@plaiceholder/next");
const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})
const nextConfig = {
    reactStrictMode: true,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        })
        return config
    },
    images: {
        // 图片压缩
        formats: ['image/avif', 'image/webp'],
        // 允许next/image加载的图片 域名
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
        unoptimized: true, // 禁用图片优化（静态导出需要）
    },
    output: 'export', // 启用静态导出模式
    trailingSlash: true, // 确保路径兼容性（可选）
}


module.exports =
    withPWA(
        withPlaiceholder(
            nextConfig
        )
    );
