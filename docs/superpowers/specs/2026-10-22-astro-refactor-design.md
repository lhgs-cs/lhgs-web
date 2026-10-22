# 联合公社官网 · 重构为 Astro 站点 设计规格

**日期**：2026-10-22
**状态**：待用户审阅
**选型**：Astro 5 + Content Collections，纯静态输出，部署于 GitHub Pages

---

## 1. 目标与范围

### 1.1 目标

把当前 8 个手写的纯静态 HTML 页面重构为 Astro 站点，在**保持现有视觉与 URL 不变**的前提下获得：

1. 导航栏 / 页脚 / 布局从 7 份重复收敛为各 1 份组件
2. 内联 CSS（合计 70.5 KB）自动提取为可缓存的外部样式
3. 一套基于 Markdown 的教程系统（Content Collections）
4. 计科资源中心：学习资源 / 社内内容 / GitHub 仓库 三个板块
5. 成员列表改为构建时渲染，解决"无 JS 时空白"问题

### 1.2 范围

| 改动 | 不改动 |
| --- | --- |
| 站点架构（HTML → Astro 组件 + 内容集合） | 现有视觉风格（徽章配色、圆角、动效） |
| 目录结构与构建流程 | 任何面向访客的文字内容 |
| 部署流水线（纯上传 → 构建后上传） | 已有的 8 个 URL 路径 |
| 新增 `/content/**` 页面 | 粒子背景、菜单、公告栏的交互行为 |

### 1.3 非目标（YAGNI）

以下均**不在本次范围**，将来有需要再做：

- 全文搜索（先用标签筛选替代）
- GitHub API 自动同步仓库数据（先用静态数据文件）
- 分级目录 / 侧边栏（已确认采用平铺 + 标签）
- 成员个人主页
- 多语言

---

## 2. 信息架构

```
汉堡菜单（新增「内容」一项，共 5 项）
├─ 分社
├─ 社员
├─ 内容          → /content/
├─ 关于我们
└─ 加入我们

/content/                          板块索引页
└─ 计科资源中心                     → /content/cs/

/content/cs/                       计科资源中心（三板块聚合）
├─ 推荐学习资源   预览 4 条   →  全部 → /content/cs/resources/
├─ 社内自创内容   预览 4 篇   →  全部 → /content/cs/tutorials/
└─ GitHub 仓库    预览 4 个   →  全部 → /content/cs/repos/
```

### 2.1 路由表

| 路由 | 源文件 | 说明 |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | 首页 |
| `/join.html` | `src/pages/join.astro` | 加入我们 |
| `/404.html` | `src/pages/404.astro` | 404 页 |
| `/about/about.html` | `src/pages/about/about.astro` | 关于我们（**保持 .html 后缀**） |
| `/members/` | `src/pages/members/index.astro` | 全部社员 |
| `/subgroups/cs/` | `src/pages/subgroups/cs/index.astro` | 计算机科学社 |
| `/subgroups/langsong/` | `src/pages/subgroups/langsong/index.astro` | 朗诵社 |
| `/subgroups/yingsuan/` | `src/pages/subgroups/yingsuan/index.astro` | 硬算社 |
| `/content/` | `src/pages/content/index.astro` | 板块索引（新增） |
| `/content/cs/` | `src/pages/content/cs/index.astro` | 计科资源中心（新增） |
| `/content/cs/resources/` | `src/pages/content/cs/resources/index.astro` | 全部学习资源（新增） |
| `/content/cs/tutorials/` | `src/pages/content/cs/tutorials/index.astro` | 全部社内内容（新增） |
| `/content/cs/tutorials/<slug>/` | `src/pages/content/cs/tutorials/[slug].astro` | 单篇教程（由 Markdown 生成） |
| `/content/cs/repos/` | `src/pages/content/cs/repos/index.astro` | 全部仓库（新增） |

**URL 不变是硬约束**：已分享出去的 `/members/`、`/subgroups/cs/`、`/about/about.html` 必须原样可用。

`/about/about.html` 的 `.html` 后缀是历史遗留，但已分享出去，必须保住。

**已实测确定的做法：`build.format: 'file'`。**

在 `build.format: 'directory'`（Astro 默认）下，`about.astro` 会输出 `/about/about/index.html`，`about.html.astro` 会输出 `/about/about.html/index.html` —— 两者都拿不到 `/about/about.html` 这个精确路径。

改用 `build.format: 'file'` 后：

| 源文件 | 产物 | URL |
| --- | --- | --- |
| `index.astro` | `index.html` | `/` |
| `join.astro` | `join.html` | `/join.html` |
| `404.astro` | `404.html` | `/404.html` |
| `about/about.astro` | `about/about.html` | `/about/about.html` |
| `members/index.astro` | `members/index.html` | `/members/` |
| `subgroups/cs/index.astro` | `subgroups/cs/index.html` | `/subgroups/cs/` |

即：以 `index` 命名的文件仍输出 `index.html`（保住目录式 URL），普通命名输出 `<name>.html`（保住带扩展名的旧 URL）。一套配置同时满足两种形态。

阶段 1 已用 `pnpm build` 实测验证 `dist/about/about.html` 是文件而非目录。

### 2.2 导航交互

「内容」作为汉堡菜单第 3 项，点击后进入 `/content/`（不是二级菜单）。板块索引页当前只列一项「计科资源中心」，未来增加其他分社资源中心时只需加数据项。

### 2.3 计科社页的资源中心入口

在 `/subgroups/cs/` 页面加入一个指向 `/content/cs/` 的入口区块，位置放在「社团特色」之后、「社员」之前。

- 标题：「计科资源中心」
- 说明：一句概括，如「学习资源、社内教程与代码仓库」
- 操作：一个明确按钮，如「进入资源中心 →」
- 视觉沿用现有 `.info-card` / `.card-btn` 的样式语言，不新增设计元素

这是**单向入口**（计科社页 → 资源中心）。资源中心页不需要反向链接回计科社页。

---

## 3. 架构方案

### 3.1 选定方案：B「模板化 + CSS 原样搬运」

对比过的三个方案：

| | A 彻底重构 | **B 模板化 + CSS 外置（选定）** | C 最小迁移 |
| --- | --- | --- | --- |
| HTML | 模板化 | 模板化 | 部分 |
| 内联 CSS | 按组件重写为 scoped style | **原样搬进 `.astro` 的 `<style>` 块** | 保留在页面内 |
| 视觉 | 需重新调校，有回归风险 | **零变化** | 零变化 |
| 工作量 | 大 | 中 | 小 |

选 B 的三条理由：

1. **不改视觉**。现有徽章风格是用户上一轮确认过的成果。把现有内联 CSS 原样搬入 `.astro` 文件，Astro 会自动加作用域并抽取成外部 CSS，等于免费获得"外置 + 内容哈希缓存"，但一个像素都不改。
2. **不重写内容**。现有页面的 HTML 结构直接搬进模板，只把重复的头部/导航/页脚提成组件。
3. **不一次到位**。分 4 个阶段，每阶段结束站点都能正常部署。

### 3.2 目录结构

```
.
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── public/                         # 原样输出的静态资源
│   ├── favicon.png
│   ├── images/                     # 社徽与社员头像
│   └── js/                         # 保留的原生脚本
│       ├── particles.js
│       └── site.js
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   └── tutorials/              # 教程 Markdown
│   │       └── hello-world.md      # 示例教程
│   ├── data/
│   │   ├── members.ts              # 成员（由 js/members-data.js 迁移）
│   │   ├── resources.ts            # 学习资源
│   │   └── repos.ts                # GitHub 仓库
│   ├── layouts/
│   │   └── Base.astro              # <head> 统一
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── SideDecor.astro
│   │   ├── Card.astro
│   │   ├── MemberCard.astro
│   │   └── TagFilter.astro
│   ├── styles/
│   │   └── global.css              # 原 css/common.css 的令牌与全局规则
│   └── pages/
│       ├── index.astro
│       ├── join.astro
│       ├── 404.astro
│       ├── about/about.astro
│       ├── members/index.astro
│       ├── subgroups/{cs,langsong,yingsuan}/index.astro
│       └── content/
│           ├── index.astro
│           └── cs/
│               ├── index.astro
│               ├── resources/index.astro
│               ├── tutorials/index.astro
│               ├── tutorials/[slug].astro
│               └── repos/index.astro
└── .github/workflows/deploy.yml    # 改为构建后上传
```

### 3.3 脚本保留策略

| 现有 JS | 处理方式 |
| --- | --- |
| `js/particles.js` | 保留为静态脚本，放到 `public/js/particles.js`，仅在首页/成员页/关于页/404 用 `<script is:inline src="/js/particles.js">` 引入 |
| `js/site.js` | 同上（页脚年份、导航滚动、reveal 动画） |
| `js/members-data.js` | **删除**，数据迁到 `src/data/members.ts`，改为构建时渲染 |
| `js/subgroup-members.js` | **删除**，分社页改用 `MemberCard.astro` + `members.ts` 过滤 |
| 标签筛选 | 新增约 20 行原生 JS，内联在教程列表页 |

**不引入任何前端框架**（Vue/React）：现有交互是 DOM 操作级别，用框架是负收益。

---

## 4. 数据模型

### 4.1 教程（Content Collection）

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { tutorials };
```

正文由 Markdown 提供，代码块经 Astro 内置 Shiki 在构建时高亮（零客户端 JS）。

### 4.2 成员

```ts
// src/data/members.ts
export interface Member {
  name: string;
  avatar: string;                       // "/images/members/xxx.jpeg"
  bio: string;
  subgroups: { id: string; role: string }[];
}
export const members: Member[] = [ /* 由 js/members-data.js 的 11 位成员迁移 */ ];
```

### 4.3 学习资源

```ts
// src/data/resources.ts
export interface Resource {
  name: string;
  url: string;
  description: string;
  category: string;       // 如 "编程语言" / "算法与数据结构" / "工具与配置"
  level?: string;         // "入门" | "进阶"
}
export const resources: Resource[] = [];
```

### 4.4 GitHub 仓库

```ts
// src/data/repos.ts
export interface Repo {
  name: string;
  url: string;
  description: string;
  language?: string;
  topics?: string[];
}
export const githubOrgUrl = 'https://github.com/lhgs-cs';
export const repos: Repo[] = [];
```

仓库数据**手工维护**，不调 GitHub API。理由：未认证 API 限速 60 次/小时，构建时失败会导致整站无法部署；手工更新成本极低。

---

## 5. 组件契约

| 组件 | 输入 | 职责 |
| --- | --- | --- |
| `Base.astro` | `title`, `description`, `canonical?`, `robots?`, `loadParticles?` | 渲染 `<head>`（charset/viewport/meta/OG/canonical/favicon/theme-color）、全局 CSS、`<slot />`、按需引入 particles 与 site 脚本 |
| `Nav.astro` | `active?`（当前项高亮） | 顶栏 + logo + 汉堡菜单（分社/社员/内容/关于/加入），含 `aria-expanded` 与 Esc 关闭逻辑 |
| `Footer.astro` | 无 | 页脚，动态年份 |
| `Card.astro` | `icon`, `name`, `desc`, `href`, `variant`（red/orange/blue） | 分社卡片，含金色角标动效 |
| `MemberCard.astro` | `member`（Member） | 社员条目，含头像与角色标签 |
| `SideDecor.astro` | 无 | 侧边装饰（首页/成员页用） |

---

## 6. 阶段划分

每个阶段结束都必须可部署、可访问、可回退。

### 阶段 1 — 骨架与流水线
- 初始化 Astro 工程（`pnpm create astro`，最小模板）
- `astro.config.mjs`：`site: 'https://lianhegongshe.cn'`、`build.format: 'directory'`
- `Base.astro`、`Nav.astro`、`Footer.astro`
- 仅迁移「关于我们」一页作为样板验证
- `deploy.yml` 改为 `pnpm install --frozen-lockfile` → `pnpm build` → 上传 `dist`

**验收**：Actions 绿，`/about/about.html` 可访问且样式与线上一致。

### 阶段 2 — 迁移其余 7 页
- index / join / 404 / members / subgroups×3
- 内联 CSS 原样搬入各 `.astro` 的 `<style>` 块
- 成员数据迁到 `src/data/members.ts`，成员页与分社页改构建时渲染
- URL 逐条核对

**验收**：8 个旧 URL 全部 200，与重构前逐页视觉对比一致。

### 阶段 3 — 内容系统
- `content.config.ts` + 1 篇示例教程
- `/content/`、`/content/cs/`、`resources/`、`tutorials/`、`[slug]`、`repos/`
- 标签筛选（原生 JS）
- 「全部」按钮跳转

**验收**：新增 `.md` 自动出现在列表与详情；代码块有高亮；三板块预览 + 全部可跳转。

### 阶段 4 — 收尾
- 删除根目录旧 HTML、`css/`、`js/`（除需保留的 `public/js/*`）
- **更新 `/about/about.html` 的「网站构建」章节**：技术栈由「纯静态 HTML/CSS/JS」改为「Astro（内容集合 + 静态输出）」，部署方式仍为 GitHub Pages，并补充资源中心与教程系统的说明
- **更新 README**：技术栈、目录结构、如何新增一篇教程、本地开发与构建命令
- 清理临时文件

**验收**：仓库只剩 Astro 工程；`pnpm build` 干净通过。

---

## 7. 部署改动

```yaml
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
  with: { version: 9 }
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: 'pnpm' }
- run: pnpm install --frozen-lockfile
- run: pnpm build
- uses: actions/configure-pages@v5
- uses: actions/upload-pages-artifact@v3
  with: { path: './dist' }
- uses: actions/deploy-pages@v4
```

原先的 `Strip non-site files` 步骤**删除** —— `dist/` 里只有网站文件。

---

## 8. 验收标准

1. 8 个旧 URL（`/`、`/join.html`、`/404.html`、`/about/about.html`、`/members/`、3 个 `/subgroups/*/`）全部可访问
2. 上述页面的视觉与重构前一致（颜色、圆角、间距、动效）
3. 5 个新增 `/content/**` 页面可访问
4. 往 `src/content/tutorials/` 放一篇 `.md`，自动出现在列表页、详情页可访问、代码块有语法高亮
5. `/content/cs/` 三个板块各显示 4 条预览，「全部」跳转到对应列表页
6. 教程列表的标签筛选可用
7. **禁用 JavaScript 时**：教程正文、成员列表、资源列表、仓库列表仍然可见
8. `prefers-reduced-motion: reduce` 时粒子背景不渲染
9. GitHub Actions 部署成功，`lianhegongshe.cn` 与 `www` 均正常
10. `pnpm build` 无错误、无未使用依赖
11. `/subgroups/cs/` 页面存在指向 `/content/cs/` 的入口，点击可到达
12. `/about/about.html` 与 `README.md` 中的技术栈描述已更新为 Astro，且与实际实现一致

---

## 9. 风险与回退

| 风险 | 应对 |
| --- | --- |
| Astro 无法产出 `/about/about.html` 这个精确路径 | 阶段 1 即验证；若不可行，改名为 `/about/` 并在 `public/about/about.html` 留一个重定向页 |
| 内联 CSS 搬运后出现作用域冲突（`.card` 等选择器跨页面重名） | Astro 的 scoped style 自动加哈希，天然隔离；若仍冲突则改用 `:global()` 局部处理 |
| 迁移期间新旧文件并存导致构建把旧 HTML 也复制 | 旧 HTML 一律放在仓库根目录，Astro 只处理 `src/` 与 `public/`，不会互相干扰；阶段 4 统一删除 |
| 粒子脚本路径失效 | 脚本放 `public/js/`，引用路径保持 `/js/particles.js` |
| 迁移后样式回归 | 每个阶段做视觉对比；保留 git 提交粒度，任何阶段可单独 revert |

---

## 10. 不做的事

- 不改动任何面向访客的文字内容
- 不改动现有视觉样式（颜色、圆角、阴影、动效）
- 不引入 Vue/React/Svelte
- 不接入 GitHub API 自动同步
- 不加全文搜索
- 不改自定义域名与 DNS 配置
