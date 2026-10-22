# 联合公社官网

本仓库为联合公社（Union Commune）官方网站的源代码。  
网站地址：[https://lianhegongshe.cn](https://lianhegongshe.cn)

## 项目简介

联合公社是由各学生社团组成的学生团体组织，旨在联合各分社，形成合力，共同进步。  
本网站用于展示公社简介、社训、组成分社、社员风采等信息，并为各分社独立页面提供入口，社员也可以在其上放置自己的个人主页。

站内的学习资源、社内教程与代码仓库统一收录在「计科资源中心」（`/content/cs/`）。

## 技术栈

- **Astro 5** —— 静态站点生成，构建时输出纯 HTML，不向浏览器发送框架运行时
- **Markdown 内容集合** —— 社内教程用 `src/content/tutorials/*.md` 维护，页面自动生成
- **pnpm** —— 包管理与锁文件
- **GitHub Pages** —— push 到 `main` 后由 GitHub Actions 构建并发布

## 本地开发

```bash
pnpm install     # 安装依赖
pnpm dev         # 开发服务器，默认 http://localhost:4321
pnpm build       # 构建到 dist/
pnpm preview     # 预览构建结果
```

## 项目结构

```
.
├── .github/workflows/deploy.yml   GitHub Pages 部署流水线
├── astro.config.mjs               Astro 配置（站点地址、构建格式）
├── package.json / pnpm-lock.yaml  依赖与锁文件
├── public/                        原样输出的静态资源
│   ├── favicon.png
│   ├── images/                    社徽与社员头像
│   ├── js/                        原生脚本（粒子背景、全站公共脚本）
│   ├── about/about.html           /about/about.html 的跳转页（兼容旧链接）
│   └── join.html                  /join.html 的跳转页（兼容旧链接）
├── src/
│   ├── layouts/Base.astro         统一 <head>：meta / OG / canonical / favicon
│   ├── components/                导航栏、页脚、侧边装饰、分社卡片、社员卡片
│   ├── styles/global.css          全局设计令牌与基础样式
│   ├── data/
│   │   ├── members.ts             社员数据（唯一数据源）
│   │   ├── resources.ts           推荐学习资源
│   │   └── repos.ts               GitHub 仓库列表
│   ├── content/
│   │   ├── config.ts              教程集合的字段校验规则
│   │   └── tutorials/*.md         社内教程正文
│   └── pages/                     路由
│       ├── index.astro            首页
│       ├── join.astro             加入我们
│       ├── 404.astro              404
│       ├── about/index.astro      关于我们
│       ├── members/index.astro    全部社员
│       ├── subgroups/{cs,langsong,yingsuan}/index.astro
│       └── content/
│           ├── index.astro                 内容板块索引
│           └── cs/
│               ├── index.astro             计科资源中心（三板块聚合）
│               ├── resources/index.astro   全部学习资源
│               ├── tutorials/index.astro   全部社内内容（标签筛选）
│               ├── tutorials/[slug].astro  单篇教程（由 Markdown 生成）
│               └── repos/index.astro       全部仓库
├── announcement/
│   └── announcement.md            首页公告内容（Markdown）
└── docs/superpowers/              设计规格与实施计划（不部署到线上）
```

## 常见维护操作

| 想做什么 | 改哪里 |
| --- | --- |
| 新增 / 修改社员 | 只改 `src/data/members.ts`。首页预览、全部社员页、各分社页都会自动更新 |
| **新增一篇教程** | 在 `src/content/tutorials/` 下新建 `.md`（见下方格式） |
| 新增学习资源 | 在 `src/data/resources.ts` 的数组里追加一个对象 |
| 新增 GitHub 仓库 | 在 `src/data/repos.ts` 的数组里追加一个对象 |
| 更新首页公告 | 改 `announcement/announcement.md`。内容一变，之前点过「关闭」的访客会重新看到 |
| 更新分社简介 | 首页卡片在 `src/pages/index.astro`，分社详情在 `src/pages/subgroups/<分社>/index.astro` |
| 更换社员头像 | 放入 `public/images/members/`，保持正方形，建议边长不超过 400px、体积不超过 30 KB |
| 调整粒子效果 | 只改 `public/js/particles.js` |
| 新增一个分社 | 新建 `src/pages/subgroups/<id>/index.astro`，并在 `src/data/members.ts` 中使用相同的 `<id>` |

### 新增一篇教程

1. 在 `src/content/tutorials/` 下新建 `.md` 文件，文件名就是 URL：`git-basics.md` → `/content/cs/tutorials/git-basics/`
2. 文件开头写 frontmatter：

```markdown
---
title: 教程标题
description: 一句话简介，会显示在列表和搜索结果里
publishDate: 2026-10-22
tags: [git, 协作]
author: 你的名字
draft: false
---
```

3. 正文用 Markdown 写，**代码块会自动高亮**（构建时由 Shiki 处理，不增加访客负担）
4. 提交后自动出现在教程列表页、标签筛选和计科资源中心

字段校验是强制的：写错字段名或类型，`pnpm build` 会直接报错并指出哪一篇。

### 社员数据格式

```ts
{
    name: "老魏",                          // 显示名
    avatar: "/images/members/wei.jpeg",    // 头像路径
    bio: "公社社长、硬算社社长",              // 简介，可为空字符串
    subgroups: [
        { id: "yingsuan", role: "社长" },   // id 对应 subgroups/<id>/ 目录
        { id: "cs", role: "社员" }
    ]
}
```

`role` 为 `"社长"` 的成员会在对应分社页排在最前面。

## 部署

网站通过 GitHub Pages 发布，源为 `main` 分支，流水线在 `.github/workflows/deploy.yml`：

```yaml
pnpm install --frozen-lockfile
pnpm build          # 产出 dist/
# 上传 dist/ 并部署
```

- push 到 `main` 即自动部署，也可以在 Actions 页面手动触发
- **构建产物 `dist/` 才是发布内容**，仓库源码本身不会被直接暴露
- 自定义域名 `lianhegongshe.cn` 配置在仓库的 **Settings → Pages → Custom domain**，不通过 `CNAME` 文件（GitHub Actions 部署模式下该文件会被忽略）

## 维护与贡献

本网站由联合公社技术小组维护。  
**主要搭建与维护者：**

- 光明与尘埃（GitHub: @gmyca）
- C0（GitHub: @imxilin）

欢迎通过 Pull Request 或 Issue 提出建议。

如有疑问或需要协助，请联系上述维护者。
