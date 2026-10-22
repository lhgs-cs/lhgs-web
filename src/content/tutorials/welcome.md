---
title: 欢迎来到计科资源中心
description: 这个板块用来放置社内自制的教程、笔记与经验总结。
publishDate: 2026-10-22
tags: [公告]
author: 联合公社技术小组
---

## 这是什么

这里是计科社成员共同维护的教程区。你可以把学习笔记、踩坑记录、工具配置说明放进来。

## 怎么新增一篇

在 `src/content/tutorials/` 下新建一个 `.md` 文件，开头写上 title、description、publishDate 和 tags，正文用 Markdown 写即可。

```bash
git add src/content/tutorials/你的教程.md
git commit -m "docs: 新增教程"
```

## 代码块会自动高亮

```js
// 支持的语法由 Shiki 在构建时处理，不额外加载客户端 JS
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
```

```powershell
# PowerShell 同样支持
Get-ChildItem -Recurse -Filter *.md
```

## 写作建议

- 标题层级从 `##` 开始，`#` 留给页面标题
- 每个代码块标注语言，高亮才准确
- 长教程可以在开头写一段"读这篇你需要先知道什么"
