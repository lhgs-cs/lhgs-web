---
title: 欢迎来到计科资源中心
description: 这个板块怎么用、内容怎么写。想投稿的话，看完这篇就够了。
publishDate: 2026-10-22
tags: [公告]
author: 联合公社技术小组
pinned: true
---

## 这里是什么

计科资源中心分两块：

- **推荐学习资源** —— 你用过觉得好的东西，写清楚"为什么值得看"，推荐给其他社员
- **社内自创内容** —— 自己写的教程、笔记、踩坑记录

两块都用 Markdown 写，提交后会自动出现在列表里。

## 怎么新增一篇

在对应目录下新建一个 `.md` 文件，**文件名就是网址**：

| 想发到哪 | 文件放哪 | 举例 |
| --- | --- | --- |
| 社内自创内容 | `src/content/tutorials/` | `git-basics.md` → `/content/cs/tutorials/git-basics/` |
| 推荐学习资源 | `src/content/resources/` | `mdn.md` → `/content/cs/resources/mdn/` |

文件名建议用英文小写加短横线，别用中文和空格 —— 它会出现在链接里。

## 开头那段"frontmatter"怎么写

每个文件最上面要有这两条 `---` 夹起来的一段，这是**必填格式**，少字段或写错类型，构建会直接报错并告诉你是哪一篇。

### 社内自创内容（tutorials）

```markdown
---
title: 你的标题
description: 一句话简介，列表页会显示它
publishDate: 2026-10-22
tags: [git, 协作]
author: 你的名字
pinned: false
---
```

### 推荐学习资源（resources）

比教程多一个可选的 `link` 字段：

```markdown
---
title: 书名或资源名
description: 一句话说明这是什么东西
publishDate: 2026-10-22
tags: [算法, 书籍]
author: 你的名字
link: https://example.com   # 可选，实体书可以整行删掉
pinned: false
---
```

### 每个字段的意思

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题，会显示在列表和详情页顶部 |
| `description` | 是 | 一句话简介，列表页显示 |
| `publishDate` | 是 | 格式必须是 `年-月-日`，用来排序 |
| `tags` | 否 | 数组，用中括号包起来，逗号分隔，如 `[前端, 文档]`。列表页可以按它筛选 |
| `author` | 否 | 署名，不写就不显示 |
| `link` | 否 | 仅 resources 有，外部链接。实体书可以删掉这行 |
| `pinned` | 否 | 填 `true` 会置顶到列表最前面，默认 `false` |
| `draft` | 否 | 填 `true` 表示草稿，不会出现在线上 |

## 正文怎么写

正文就是普通 Markdown：

```markdown
## 这是二级标题（推荐从二级开始，一级留给页面标题）

正文段落。

- 列表项
- 列表项

**加粗**、*斜体*、`行内代码`

> 引用块
```

代码块记得标语言，会自动高亮：

```js
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
```

```powershell
Get-ChildItem -Recurse -Filter *.md
```

## 写推荐资源时，多写这几件事

不要只贴一个链接和一句"这个很好"。别人需要知道的是：

1. **这东西是干什么的** —— 一句话说清
2. **你为什么推荐** —— 它好在哪，和同类比强在哪
3. **适合谁 / 不适合谁** —— 这比推荐理由更有用
4. **怎么用最有效** —— 你自己的使用经验

## 提交

```bash
git add src/content/tutorials/你的文件名.md
git commit -m "docs: 新增教程：xxx"
```

推到 `main` 后，GitHub Actions 会自动构建并部署，几分钟后就能在网站上看到。
