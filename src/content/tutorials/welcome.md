---
title: 社内自创内容投稿指南
description: 这个板块收什么、怎么投、格式怎么写。看完这篇就能发第一篇。
publishDate: 2026-10-22
tags: [公告, 投稿指南]
author: 联合公社技术小组
pinned: true
---

## 这个板块收什么

你自己写的东西：

- 技术教程、学习笔记
- 踩坑记录、问题排查过程
- 工具配置、环境搭建步骤
- 读书笔记、课程总结

简单说：**只要是你自己整理出来、对别人有用的文字，都欢迎**。

想推荐别人写的东西或现成的资源，请投到「推荐学习资源」板块。

## 怎么投

在 `src/content/tutorials/` 下新建一个 `.md` 文件，**文件名就是网址**：

```
src/content/tutorials/git-basics.md
        ↓
https://lianhegongshe.cn/content/cs/tutorials/git-basics/
```

文件名用英文小写加短横线，别用中文和空格 —— 它会原样出现在链接里。

## 开头的 frontmatter

每个文件最上面要有被两条 `---` 夹起来的一段：

```markdown
---
title: Git 入门：从 clone 到 push
description: 给完全没用过 Git 的社员的实操路线。
publishDate: 2026-10-22
tags: [git, 入门]
author: 你的名字
pinned: false
---

正文从这里开始……
```

### 字段说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 标题，列表页和详情页顶部显示 |
| `description` | ✅ | 一句话简介，列表页显示 |
| `publishDate` | ✅ | **必须 `年-月-日` 格式**（用斜杠会报错），用来排序 |
| `tags` | ❌ | 数组，中括号逗号分隔，如 `[前端, 文档]`。列表页可按它筛选 |
| `author` | ❌ | 署名，不写就不显示 |
| `pinned` | ❌ | 填 `true` 会置顶到列表最前面 |
| `draft` | ❌ | 填 `true` 变草稿，不会出现在线上 |

字段写错不会静默忽略 —— `pnpm build` 会直接报错，并指出是哪一篇、哪个字段。

## 正文怎么写

正文就是普通 Markdown，不需要额外语法。

```markdown
## 这是二级标题

正文段落。

- 列表项
- 列表项

**加粗**、*斜体*、`行内代码`

> 引用块
```

**标题层级从 `##` 开始**，`#` 留给页面标题（系统已经用了，重复会出现两个一级标题）。

### 代码块

代码块记得标语言，构建时会自动高亮，访客不需要下载任何东西：

````markdown
```js
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
```
````

支持的语言很多：`js`、`ts`、`python`、`bash`、`powershell`、`html`、`css`、`json`、`yaml` 等。

### 图片

暂时还没有图片上传流程，如果教程必须配图，先把图片放进 `public/images/tutorials/`，然后这样引用：

```markdown
![图片说明](/images/tutorials/你的图片.png)
```

## 提交

```bash
git add src/content/tutorials/你的文件名.md
git commit -m "docs: 新增教程：xxx"
```

推到 `main` 后 GitHub Actions 会自动构建部署，几分钟后线上可见。
