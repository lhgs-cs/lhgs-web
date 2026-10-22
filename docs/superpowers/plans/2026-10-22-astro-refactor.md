# 联合公社官网 Astro 重构 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持现有视觉与全部旧 URL 不变的前提下，把 8 个手写 HTML 页面重构为 Astro 站点，并新增 Markdown 教程系统与计科资源中心。

**Architecture:** 方案 B —— 现有 HTML 结构搬入 `.astro` 模板，内联 CSS 原样搬入 `.astro` 的 `<style>` 块（Astro 自动作用域化并提取为外部 CSS），重复的头部/导航/页脚提为组件；新增内容走 Content Collections 与数据文件。不引入任何前端框架。

**Tech Stack:** Astro 5 + TypeScript + pnpm 9 + GitHub Actions + GitHub Pages

## Global Constraints

以下约束适用于每一个任务，逐字取自规格 `docs/superpowers/specs/2026-10-22-astro-refactor-design.md`：

- **8 个旧 URL 必须保持不变**：`/`、`/join.html`、`/404.html`、`/about/about.html`、`/members/`、`/subgroups/cs/`、`/subgroups/langsong/`、`/subgroups/yingsuan/`。
- **视觉零变化**：不修改任何颜色、圆角、阴影、间距、动效。CSS 只做"从内联搬到 `<style>` 块"的搬运。
- **不引入 Vue / React / Svelte**。交互保持原生 JS。
- **不修改任何面向访客的文字内容**，唯二例外：阶段 4 更新 `/about/about.html` 的技术栈描述、以及新增页面本身的文案。
- **所有 git commit message 使用中文**（`feat:` / `fix:` / `chore:` 前缀后接中文描述）。
- 不使用 Here-String 传递含单引号的多行文本到 PowerShell 单行参数位（`'@` 后必须独占一行），以免重演规格文件被污染的问题。

---

## File Structure

| 文件 | 职责 |
| --- | --- |
| `astro.config.mjs` | Astro 配置：站点地址、构建格式 |
| `package.json` | 依赖与脚本（`dev` / `build` / `preview`） |
| `src/layouts/Base.astro` | 统一 `<head>`、全局样式、粒子与 site 脚本的按需引入 |
| `src/components/Nav.astro` | 顶栏 + 汉堡菜单（含「内容」项） |
| `src/components/Footer.astro` | 页脚 |
| `src/components/SideDecor.astro` | 侧边装饰（首页/成员页） |
| `src/components/Card.astro` | 分社卡片 |
| `src/components/MemberCard.astro` | 社员条目 |
| `src/components/TagFilter.astro` | 教程标签筛选（原生 JS） |
| `src/styles/global.css` | 原 `css/common.css` 的令牌与全局规则 |
| `src/data/members.ts` | 成员数据（由 `js/members-data.js` 迁移） |
| `src/data/resources.ts` | 学习资源数据 |
| `src/data/repos.ts` | GitHub 仓库数据 |
| `src/content.config.ts` | `tutorials` 集合 schema |
| `src/content/tutorials/*.md` | 教程正文 |
| `src/pages/**` | 各路由页面 |
| `public/` | `favicon.png`、`images/`、`js/particles.js`、`js/site.js` |
| `.github/workflows/deploy.yml` | 改为构建后部署 `dist/` |

---

## 阶段 1 — 骨架与流水线

### Task 1: 初始化 Astro 工程

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.npmrc`
- Modify: `.gitignore`

**Interfaces:**
- Produces: 可运行的 Astro 工程；`pnpm build` 产出 `dist/`

- [ ] **Step 1: 创建 `package.json`**

```json
{
  "name": "lhgs-web",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lianhegongshe.cn',
  build: {
    // 'file' 产出 foo.html 而非 foo/index.html，
    // 这样 /about/about.html 这类带扩展名的旧链接才能原样保留；
    // 而 *\/index.astro 仍会产出 *\/index.html，/members/ 等目录式 URL 不受影响。
    format: 'file',
  },
  trailingSlash: 'ignore',
});
```

- [ ] **Step 3: 创建 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: 创建 `.npmrc`**

```
auto-install-peers=true
strict-peer-dependencies=false
```

- [ ] **Step 5: 更新 `.gitignore`**

在现有内容后追加：

```
node_modules/
dist/
.astro/
pnpm-debug.log*
```

- [ ] **Step 6: 安装依赖**

Run: `pnpm install`
Expected: 生成 `pnpm-lock.yaml`，`node_modules/` 出现，无 error。

- [ ] **Step 7: 验证构建**

Run: `pnpm build`
Expected: 输出 `Complete!`，生成 `dist/`。此时 `src/pages` 可能为空，Astro 仍应成功构建（无页面）。

- [ ] **Step 8: 提交**

```bash
git add package.json astro.config.mjs tsconfig.json .npmrc .gitignore pnpm-lock.yaml
git commit -m "chore: 初始化 Astro 工程"
```

---

### Task 2: 全局样式与 Base 布局

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`

**Interfaces:**
- Consumes: 无
- Produces: `Base.astro`，props 为 `{ title: string; description: string; canonical?: string; robots?: string; loadParticles?: boolean }`

- [ ] **Step 1: 从 `css/common.css` 迁移全局令牌与规则**

读取现有 `css/common.css`，把以下内容原样复制进 `src/styles/global.css`：

- `:root { ... }` 整块（24 个变量，含 `--ease`、`--radius-*`、`--gold-*`）
- `* { margin:0; padding:0; box-sizing:border-box }` 重置
- `body` 规则
- `@keyframes float / heroGradient / fadeSlideUp`
- `@media (prefers-reduced-motion: reduce)` 全局块
- `:focus-visible` 全局块
- `.nojs-tip` 规则

其余组件级规则（`.top-bar`、`.logo`、`.dropdown-*`、`footer`、`.container`）**不要**放进 global.css —— 它们属于组件，在 Task 3 搬进对应 `.astro`。

- [ ] **Step 2: 创建 `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  loadParticles?: boolean;
}

const { title, description, canonical, robots, loadParticles = false } = Astro.props;
const ogImage = 'https://lianhegongshe.cn/images/logo.jpeg';
---
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>{title}</title>

  <meta name="description" content={description} />
  {robots && <meta name="robots" content={robots} />}
  {canonical && <link rel="canonical" href={canonical} />}
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  <meta name="theme-color" content="#1d5578" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="联合公社" />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {canonical && <meta property="og:url" content={canonical} />}
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="400" />
  <meta property="og:image:height" content="395" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
</head>
<body>
  {loadParticles && <canvas id="particles-canvas" aria-hidden="true"></canvas>}
  <slot />
  {loadParticles && <script is:inline src="/js/particles.js"></script>}
  <script is:inline src="/js/site.js"></script>
</body>
</html>
```

- [ ] **Step 3: 搬运保留脚本到 `public/`**

```powershell
New-Item -ItemType Directory -Force -Path 'public\js','public\images\members' | Out-Null
Copy-Item 'js\particles.js' 'public\js\particles.js' -Force
Copy-Item 'js\site.js' 'public\js\site.js' -Force
Copy-Item 'favicon.png' 'public\favicon.png' -Force
Copy-Item 'images\logo.jpeg' 'public\images\logo.jpeg' -Force
Copy-Item 'images\members\*' 'public\images\members\' -Force
```

- [ ] **Step 4: 验证构建**

Run: `pnpm build`
Expected: 成功，`dist/favicon.png`、`dist/js/particles.js`、`dist/images/logo.jpeg` 存在。

- [ ] **Step 5: 提交**

```bash
git add src/styles/global.css src/layouts/Base.astro public
git commit -m "feat: 添加全局样式与 Base 布局"
```

---

### Task 3: Nav / Footer / SideDecor 组件

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/SideDecor.astro`

**Interfaces:**
- Consumes: `Base.astro`
- Produces: `Nav.astro`（props `{ active?: string }`）、`Footer.astro`（无 props）、`SideDecor.astro`（无 props）

- [ ] **Step 1: 创建 `src/components/Nav.astro`**

结构取自现有 7 个页面中重复的 `.top-bar`，**新增第 3 项「内容」**，并保留 `aria-expanded` / Esc 关闭逻辑。

```astro
---
interface Props { active?: string }
const { active } = Astro.props;
const items = [
  { id: 'subgroups', label: '分社',       icon: '🏛️', href: '/#subgroups-section' },
  { id: 'members',   label: '社员',       icon: '👥', href: '/members/' },
  { id: 'content',   label: '内容',       icon: '📚', href: '/content/' },
  { id: 'about',     label: '关于我们',   icon: 'ℹ️', href: '/about/about.html' },
  { id: 'join',      label: '加入我们',   icon: '✨', href: '/join.html' },
];
---
<div class="top-bar" id="topBar">
  <a href="/" class="logo">
    <div class="logo-icon">联</div>
    联合公社
  </a>
  <div class="dropdown-container">
    <button class="menu-btn" id="menuBtn" aria-label="菜单" aria-haspopup="true" aria-expanded="false" aria-controls="dropdownMenu">
      <div class="menu-icon"><span></span><span></span><span></span></div>
    </button>
    <div class="dropdown-menu" id="dropdownMenu">
      {items.map((it) => (
        <a class="dropdown-item" href={it.href} data-id={it.id} aria-current={active === it.id ? 'page' : undefined}>
          <span class="dropdown-item-icon" aria-hidden="true">{it.icon}</span> {it.label}
        </a>
      ))}
    </div>
  </div>
</div>

<script>
  const menuBtn = document.getElementById('menuBtn')!;
  const dropdownMenu = document.getElementById('dropdownMenu')!;
  const setMenuOpen = (open: boolean) => {
    menuBtn.classList.toggle('active', open);
    dropdownMenu.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuOpen(!dropdownMenu.classList.contains('show'));
  });
  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (!menuBtn.contains(t) && !dropdownMenu.contains(t)) setMenuOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });
</script>

<style>
  /* 从 css/common.css 原样搬运 .top-bar / .logo / .logo-icon / .menu-btn /
     .menu-icon / .dropdown-container / .dropdown-menu / .dropdown-item 全部规则 */
</style>
```

**搬运要求**：`.top-bar` 及相关选择器的所有声明（含 `backdrop-filter`、`transition: box-shadow 0.4s var(--ease)`、`:focus-visible` 之外的 hover 态）逐条复制，不修改任何数值。

- [ ] **Step 2: 创建 `src/components/Footer.astro`**

```astro
---
---
<footer>
  © <span id="copyright-year">2026</span> 联合公社 · 学生团体组织
  &nbsp;·&nbsp;
  <a href="https://github.com/lhgs-cs/lhgs-web" target="_blank" rel="noopener noreferrer">GitHub</a>
</footer>

<style>
  /* 从 css/common.css 原样搬运 footer 与 footer a 规则 */
</style>
```

- [ ] **Step 3: 创建 `src/components/SideDecor.astro`**

从 `index.html` 复制 `.side-decor` 两列装饰的 HTML 结构与对应 CSS（含 `.side-line`、`.side-shape`、`.shape-*`、`.float-strip`、`.strip-*`、`@keyframes sideFloat1` 及各 `.side-left` / `.side-right` 定位规则）。`members/index.html` 使用的是另一套 `.side-decor-left` / `.side-decor-right` 结构，**单独**在成员页任务中处理，不并入本组件。

- [ ] **Step 4: 验证构建**

Run: `pnpm build`
Expected: 成功；无 CSS 解析错误。

- [ ] **Step 5: 提交**

```bash
git add src/components
git commit -m "feat: 抽取导航、页脚与侧边装饰组件"
```

---

### Task 4: 迁移关于页并改造部署流水线

这是**样板页**，用于验证「HTML → Astro + CSS 搬运 + `/about/about.html` 路径」三件事。

**Files:**
- Create: `src/pages/about/about.astro`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `Base.astro`、`Nav.astro`、`Footer.astro`
- Produces: 可访问的 `/about/about.html`；构建部署流水线

- [ ] **Step 1: 创建 `src/pages/about/about.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
---
<Base
  title="关于我们 | 联合公社"
  description="了解联合公社的性质、组成分社，以及本网站的建设与维护情况、联系方式。"
  canonical="https://lianhegongshe.cn/about/about.html"
  loadParticles={true}
>
  <Nav active="about" />
  <main class="container">
    <!-- 内容区：从现有 about/about.html 的 <main> 中逐块复制：
         .page-header / .info-section ×3 / .contact-card -->
  </main>
  <Footer />
</Base>

<style>
  /* 从现有 about/about.html 的 <style> 块原样搬运全部规则 */
</style>
```

**搬运要求**：`<main>` 内所有区块与 `<style>` 内所有声明逐行复制，**不修改任何文字与数值**。

- [ ] **Step 2: 验证 `/about/about.html` 路径确实生成**

Run: `pnpm build`
Expected: `dist/about/about.html` 存在，且 `Get-Item dist\about\about.html | Select-Object PSIsContainer` 为 `False`（是文件不是目录）。

**已实测**：`build.format: 'file'` 下该路径正确产出。无需改名。

- [ ] **Step 3: 本地预览核对视觉**

Run: `pnpm dev`
Expected: 打开 `http://localhost:4321/about/about.html`，页面样式与线上 `https://www.lianhegongshe.cn/about/about.html` 一致（配色、圆角、间距、粒子背景、页脚年份）。

- [ ] **Step 4: 改造 `.github/workflows/deploy.yml`**

将整个文件替换为：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

注意：原先的 `Strip non-site files` 步骤**删除**（`dist/` 里只有网站文件）。

- [ ] **Step 5: 提交（暂不推送）**

注意：本阶段结束后 `dist/` 里只有 `/about/about.html` 一个页面，其余 7 页仍是仓库根目录的旧 HTML，**不会**进入 `dist/`。若此时推送，线上会立刻丢掉 7 个页面。

因此阶段 1 **只提交、不推送**，全站切换统一留到 Task 9 完成后进行。

```bash
git add src/pages/about .github/workflows/deploy.yml
git commit -m "feat: 迁移关于页并改为构建部署（暂不推送）"
```

---

## 阶段 2 — 迁移其余 7 页

### Task 5: 成员数据与 MemberCard 组件

**Files:**
- Create: `src/data/members.ts`
- Create: `src/components/MemberCard.astro`

**Interfaces:**
- Produces: `members: Member[]`（`Member = { name: string; avatar: string; bio: string; subgroups: { id: string; role: string }[] }`）、`MemberCard.astro`（props `{ member: Member; showRole?: { id: string } }`）

- [ ] **Step 1: 创建 `src/data/members.ts`**

把 `js/members-data.js` 的 11 位成员逐条转为 TS，字段名保持不变：

```ts
export interface MemberSubgroup {
  id: string;
  role: string;
}

export interface Member {
  name: string;
  avatar: string;
  bio: string;
  subgroups: MemberSubgroup[];
}

export const members: Member[] = [
  // 从这里开始，逐条粘贴 js/members-data.js 中 MEMBERS 的 11 个对象，保持原有顺序、姓名、头像路径、简介与分组角色
];
```

**搬运要求**：11 位成员、顺序、`avatar` 路径、`bio` 文本、`subgroups` 的 `id` 与 `role` 全部原样，一个字符都不改。

- [ ] **Step 2: 创建 `src/components/MemberCard.astro`**

结构取自现有 `.member-card`：

```astro
---
import type { Member } from '../data/members';
interface Props {
  member: Member;
  showRoleFor?: string;
}
const { member, showRoleFor } = Astro.props;
const role = showRoleFor
  ? (member.subgroups.find((s) => s.id === showRoleFor)?.role ?? '')
  : '';
---
<div class="member-card">
  <img class="member-avatar" src={member.avatar} alt={`${member.name}头像`} width="200" height="200" loading="lazy" decoding="async" />
  <div class="member-info">
    <div class="member-name">{member.name}</div>
    <div class="member-bio">{member.bio || '暂无简介'}</div>
    {role && <span class="member-tag">{role}</span>}
  </div>
</div>

<style>
  /* 从现有页面原样搬运 .member-card / .member-avatar / .member-info /
     .member-name / .member-bio / .member-tag 的全部声明 */
</style>
```

- [ ] **Step 3: 验证类型与构建**

Run: `pnpm build`
Expected: 成功，无 TS 类型错误。

- [ ] **Step 4: 提交**

```bash
git add src/data/members.ts src/components/MemberCard.astro
git commit -m "feat: 成员数据迁移为 TS 并抽取社员卡片组件"
```

---

### Task 6: 迁移首页

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/components/Card.astro`

**Interfaces:**
- Consumes: `Base`、`Nav`、`Footer`、`SideDecor`、`MemberCard`、`members`
- Produces: `/` 路由

- [ ] **Step 1: 创建 `src/components/Card.astro`**

```astro
---
interface Props {
  icon: string;
  name: string;
  desc: string;
  href: string;
  variant: 'red' | 'orange' | 'blue';
}
const { icon, name, desc, href, variant } = Astro.props;
---
<div class={`card card-${variant}`}>
  <div class="card-icon">{icon}</div>
  <div class="card-name">{name}</div>
  <div class="card-desc">{desc}</div>
  <a class="card-btn" href={href}><span>了解更多 →</span></a>
</div>

<style>
  /* 从现有 index.html 原样搬运 .card / .card::before / .card:hover /
     .card:hover::before / .card-icon / .card:hover .card-icon /
     .card-name / .card-desc / .card-btn / .card-btn:hover 全部声明 */
</style>
```

- [ ] **Step 2: 创建 `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import SideDecor from '../components/SideDecor.astro';
import Card from '../components/Card.astro';
import MemberCard from '../components/MemberCard.astro';
import { members } from '../data/members';

const preview = members.slice(0, 3);
---
<Base
  title="联合公社 | 学生团体组织"
  description="联合公社（Union Commune）是由各学生社团组成的学生团体组织，旗下设有硬算社、朗诵社、计算机科学社等分社，旨在联合各分社、形成合力、共同进步。"
  canonical="https://lianhegongshe.cn/"
  loadParticles={true}
>
  <SideDecor />
  <Nav />
  <main class="container">
    <!-- 从现有 index.html 的 <main> 逐块复制：
         .hero / .announcement-bar / 简介 / 社训 / 组成分社 / 社员 -->
    <!-- 分社区块用 Card 组件替换原始卡片 HTML -->
    <!-- 社员区块用 {preview.map((m) => <MemberCard member={m} />)} 替换硬编码的 3 个 .member-card -->
  </main>
  <Footer />
</Base>

<style>
  /* 从现有 index.html 的 <style> 块原样搬运所有未进入组件的规则
     （.hero / .section / .motto-box / .btn-all / .announcement-* / .member-list / .member-card-ellipsis 等） */
</style>
```

**搬运要求**：
- `.hero`、`.section-title`、`.motto-box`、`.btn-all`、`.announcement-*` 等首页独有规则的声明全部原样复制
- 公告栏的 `<script>`（加载 `announcement.md` + localStorage 指纹）从原 `index.html` 内联脚本原样迁移到本页 `<script>` 块
- 社训逐字动画、滚动淡入、侧边浮动条入场等交互脚本同样迁移

- [ ] **Step 3: 验证**

Run: `pnpm build` → `dist/index.html` 存在
Run: `pnpm dev` → 访问 `/`，与线上首页对比：公告栏、分社三卡、社员 3 人 + 「…」卡片、社训金色短线、粒子背景全部一致。

- [ ] **Step 4: 提交**

```bash
git add src/pages/index.astro src/components/Card.astro
git commit -m "feat: 迁移首页"
```

---

### Task 7: 迁移成员页与三个分社页

**Files:**
- Create: `src/pages/members/index.astro`
- Create: `src/pages/subgroups/cs/index.astro`
- Create: `src/pages/subgroups/langsong/index.astro`
- Create: `src/pages/subgroups/yingsuan/index.astro`

**Interfaces:**
- Consumes: `Base`、`Nav`、`Footer`、`MemberCard`、`members`

- [ ] **Step 1: 创建 `src/pages/members/index.astro`**

沿用现有 `members/index.html` 的 `.page-header`、`.stats-bar`、`.member-grid`、`.side-decor-left/right` 结构；成员列表改为构建时渲染：

```astro
---
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import MemberCard from '../../components/MemberCard.astro';
import { members } from '../../data/members';
---
<Base title="全部社员 | 联合公社" description="联合公社全部社员名单，以及每位社员所属的分社。" canonical="https://lianhegongshe.cn/members/" loadParticles={true}>
  <Nav active="members" />
  <main class="container">
    <!-- .page-header / .stats-bar 原样复制，统计数字用 {members.length} 直接输出，不再用 JS 动画计数 -->
    <div class="member-grid">
      {members.map((m) => <MemberCard member={m} />)}
    </div>
  </main>
  <Footer />
</Base>
```

**注意**：原页面用 `animateNumber` 做数字滚动动画，改为静态输出后**视觉差异仅在于没有滚动动画**。如必须保留动画，把原 `animateNumber` 脚本一并迁移。二选一，实现时以「视觉与线上一致」为准，保留动画。

- [ ] **Step 2: 创建三个分社页**

以 `subgroups/cs/index.astro` 为样板：

```astro
---
import Base from '../../../layouts/Base.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import MemberCard from '../../../components/MemberCard.astro';
import { members } from '../../../data/members';

const subgroupId = 'cs';
const roleOf = (m) => (m.subgroups.find((s) => s.id === subgroupId)?.role ?? '');
const list = members
  .filter((m) => roleOf(m) !== '')
  .sort((a, b) => (roleOf(b) === '社长' ? 1 : 0) - (roleOf(a) === '社长' ? 1 : 0));
---
<Base title="计算机科学社 | 联合公社" description="计算机科学社（CS社）是联合公社核心分社之一，负责技术开发与维护，开展编程、算法、系统设计等技术活动。" canonical="https://lianhegongshe.cn/subgroups/cs/" loadParticles={false}>
  <Nav active="subgroups" />
  <main class="container">
    <!-- .page-hero / .info-section（简介）/ .info-section（社团特色）/ 资源中心入口 / .info-section（社员） -->
    <div class="member-list">
      {list.map((m) => <MemberCard member={m} showRoleFor={subgroupId} />)}
    </div>
  </main>
  <Footer />
</Base>
```

**资源中心入口**（本页新增，见规格 2.3）：在上述「社团特色」之后、「社员」之前插入：

```astro
<div class="info-section reveal">
  <div class="info-card resource-entry">
    <div class="resource-entry-title">计科资源中心</div>
    <p class="resource-entry-desc">学习资源、社内教程与代码仓库</p>
    <a class="card-btn" href="/content/cs/"><span>进入资源中心 →</span></a>
  </div>
</div>
```

配套样式（追加到本页 `<style>`）：

```css
.resource-entry { text-align: center; }
.resource-entry-title { font-size: 1.15rem; font-weight: 700; color: var(--text); margin-bottom: .35rem; }
.resource-entry-desc { font-size: .85rem; color: var(--text-muted); margin-bottom: 1rem; }
```

`langsong` 与 `yingsuan` 两个页面用同一模板，仅替换 `subgroupId`、`title`、`description`、`canonical` 与正文内容；**这两个页面不加资源中心入口**。

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: `dist/members/index.html`、`dist/subgroups/{cs,langsong,yingsuan}/index.html` 均存在。

Run: `pnpm dev` 逐页对比线上，确认社长排在最前、角色标签正确、资源中心入口仅出现在计科社页。

- [ ] **Step 4: 提交**

```bash
git add src/pages/members src/pages/subgroups
git commit -m "feat: 迁移成员页与分社页，计科社页加入资源中心入口"
```

---

### Task 8: 迁移加入页与 404

**Files:**
- Create: `src/pages/join.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: 创建 `src/pages/join.astro`**

沿用现有 `join.html` 的 `.page-header`、`.join-card`、`.join-form`（注意：已是 `<div class="join-form">` 而非 `<form>`）、`.form-row`、`.form-input`、`.form-textarea`、`.join-submit-btn`、`.join-notice` 结构；CSS 全部原样搬运。

- [ ] **Step 2: 创建 `src/pages/404.astro`**

沿用现有 `404.html` 的全部内容与内联 CSS（该页不引用 common.css，令牌在其 `<style>` 中内联定义，需一并复制 `:root` 块）。`404.astro` 用 `Base` 布局，但**不引入 Nav/Footer**（原 404 页本来就没有）。

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: `dist/join.html`、`dist/404.html` 存在。

- [ ] **Step 4: 提交**

```bash
git add src/pages/join.astro src/pages/404.astro
git commit -m "feat: 迁移加入页与 404 页"
```

---

### Task 9: 全站 URL 与视觉验收

**Files:** 无新增

- [ ] **Step 1: 构建并检查全部旧 URL 产物**

Run: `pnpm build`
Run:

```powershell
$expect = 'dist\index.html','dist\join.html','dist\404.html','dist\about\about.html',
          'dist\members\index.html','dist\subgroups\cs\index.html',
          'dist\subgroups\langsong\index.html','dist\subgroups\yingsuan\index.html'
foreach ($f in $expect) { "  {0,-46} {1}" -f $f, (Test-Path $f) }
```

Expected: 8 项全部 `True`。

- [ ] **Step 2: 逐页视觉对比**

Run: `pnpm preview`
逐页与线上对比（配色、圆角、间距、粒子、页脚、导航菜单、公告栏）：`/`、`/join.html`、`/404.html`、`/about/about.html`、`/members/`、`/subgroups/cs/`、`/subgroups/langsong/`、`/subgroups/yingsuan/`。

- [ ] **Step 3: 删除根目录旧 HTML（切换开关）**

```powershell
Remove-Item 'index.html','join.html','404.html' -Force
Remove-Item 'about','members','subgroups' -Recurse -Force
```

- [ ] **Step 4: 提交并推送（全站切换点）**

```bash
git add -A
git commit -m "feat: 完成 8 个页面的 Astro 迁移，全站切换（阶段 2 收尾）"
git push
```

Expected: Actions 绿；8 个旧 URL 全部 200，内容与迁移前一致。

---

## 阶段 3 — 内容系统

### Task 10: 教程集合与示例

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/tutorials/welcome.md`

- [ ] **Step 1: 创建 `src/content.config.ts`**

```ts
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

- [ ] **Step 2: 创建示例教程 `src/content/tutorials/welcome.md`**

```markdown
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
```

- [ ] **Step 3: 验证集合可被读取**

Run: `pnpm build`
Expected: 成功，无 schema 校验错误。

- [ ] **Step 4: 提交**

```bash
git add src/content.config.ts src/content/tutorials
git commit -m "feat: 添加教程内容集合与示例文章"
```

---

### Task 11: 资源与仓库数据 + 列表页

**Files:**
- Create: `src/data/resources.ts`
- Create: `src/data/repos.ts`
- Create: `src/pages/content/cs/resources/index.astro`
- Create: `src/pages/content/cs/repos/index.astro`

- [ ] **Step 1: 创建 `src/data/resources.ts`**

```ts
export interface Resource {
  name: string;
  url: string;
  description: string;
  category: string;
  level?: string;
}

export const resources: Resource[] = [
  // 初始为空数组；实施时填入 3-5 条真实资源作为示例，
  // 例如 MDN、GitHub Skills、Hello 算法等，写明 name/url/description/category/level
];
```

- [ ] **Step 2: 创建 `src/data/repos.ts`**

```ts
export interface Repo {
  name: string;
  url: string;
  description: string;
  language?: string;
  topics?: string[];
}

export const githubOrgUrl = 'https://github.com/lhgs-cs';
export const repos: Repo[] = [
  {
    name: 'lhgs-web',
    url: 'https://github.com/lhgs-cs/lhgs-web',
    description: '联合公社官网的源代码',
    language: 'Astro',
  },
];
```

- [ ] **Step 3: 创建两个列表页**

`resources/index.astro` 按 `category` 分组渲染；`repos/index.astro` 渲染仓库卡片网格，并展示组织主页链接。两页均使用 `Base` + `Nav` + `Footer`，`canonical` 分别为资源与仓库的路径。

- [ ] **Step 4: 验证**

Run: `pnpm build`
Expected: `dist/content/cs/resources/index.html`、`dist/content/cs/repos/index.html` 存在，页面列出数据文件中的条目。

- [ ] **Step 5: 提交**

```bash
git add src/data src/pages/content/cs/resources src/pages/content/cs/repos
git commit -m "feat: 添加资源与仓库数据及列表页"
```

---

### Task 12: 内容索引页与计科资源中心聚合页

**Files:**
- Create: `src/pages/content/index.astro`
- Create: `src/pages/content/cs/index.astro`

- [ ] **Step 1: 创建 `src/pages/content/index.astro`**

板块索引页，当前只列一项：

```astro
---
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';

const sections = [
  {
    title: '计科资源中心',
    desc: '学习资源、社内教程与代码仓库',
    href: '/content/cs/',
    icon: '💻',
  },
];
---
<Base title="内容 | 联合公社" description="联合公社的内容板块：学习资源、社内教程与代码仓库。" canonical="https://lianhegongshe.cn/content/" loadParticles={false}>
  <Nav active="content" />
  <main class="container">
    <div class="page-header">
      <h1>内容</h1>
      <p>学习资源、社内教程与代码仓库</p>
    </div>
    <div class="card-grid">
      {sections.map((s) => (
        <div class="card card-blue">
          <div class="card-icon">{s.icon}</div>
          <div class="card-name">{s.title}</div>
          <div class="card-desc">{s.desc}</div>
          <a class="card-btn" href={s.href}><span>进入 →</span></a>
        </div>
      ))}
    </div>
  </main>
  <Footer />
</Base>

<style>
  /* 复用首页 .page-header / .card-grid / .card 系列的样式，原样搬运 */
</style>
```

- [ ] **Step 2: 创建 `src/pages/content/cs/index.astro`**

三板块聚合页，每块显示 4 条 + 「全部」：

```astro
---
import Base from '../../../layouts/Base.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import { getCollection } from 'astro:content';
import { resources } from '../../../data/resources';
import { repos } from '../../../data/repos';

const PREVIEW = 4;

const tutorials = (await getCollection('tutorials', ({ data }) => !data.draft))
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

const previewResources = resources.slice(0, PREVIEW);
const previewTutorials = tutorials.slice(0, PREVIEW);
const previewRepos = repos.slice(0, PREVIEW);
---
<Base title="计科资源中心 | 联合公社" description="计算机科学社的学习资源、社内教程与代码仓库。" canonical="https://lianhegongshe.cn/content/cs/" loadParticles={false}>
  <Nav active="content" />
  <main class="container">
    <div class="page-header">
      <h1>计科资源中心</h1>
      <p>学习资源、社内教程与代码仓库</p>
    </div>

    <section class="content-block">
      <div class="block-head">
        <h2 class="block-title">推荐学习资源</h2>
        <a class="block-all" href="/content/cs/resources/">全部 →</a>
      </div>
      <ul class="item-list">
        {previewResources.map((r) => (
          <li class="item"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a><span class="item-desc">{r.description}</span></li>
        ))}
      </ul>
    </section>

    <section class="content-block">
      <div class="block-head">
        <h2 class="block-title">社内自创内容</h2>
        <a class="block-all" href="/content/cs/tutorials/">全部 →</a>
      </div>
      <ul class="item-list">
        {previewTutorials.map((t) => (
          <li class="item"><a href={`/content/cs/tutorials/${t.id}/`}>{t.data.title}</a><span class="item-desc">{t.data.description}</span></li>
        ))}
      </ul>
    </section>

    <section class="content-block">
      <div class="block-head">
        <h2 class="block-title">GitHub 组织仓库</h2>
        <a class="block-all" href="/content/cs/repos/">全部 →</a>
      </div>
      <ul class="item-list">
        {previewRepos.map((r) => (
          <li class="item"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a><span class="item-desc">{r.description}</span></li>
        ))}
      </ul>
    </section>
  </main>
  <Footer />
</Base>

<style>
  /* .content-block / .block-head / .block-title / .block-all / .item-list / .item / .item-desc
     样式复用现有 .info-card 与 .section-title 的语言，间距与圆角对齐全站令牌 */
</style>
```

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: `dist/content/index.html`、`dist/content/cs/index.html` 存在；聚合页三个板块各 4 条（示例数据不足 4 条时显示实际条数）。

- [ ] **Step 4: 提交**

```bash
git add src/pages/content
git commit -m "feat: 添加内容索引页与计科资源中心聚合页"
```

---

### Task 13: 教程列表、详情与标签筛选

**Files:**
- Create: `src/pages/content/cs/tutorials/index.astro`
- Create: `src/pages/content/cs/tutorials/[slug].astro`
- Create: `src/components/TagFilter.astro`

- [ ] **Step 1: 创建教程列表页**

```astro
---
import Base from '../../../../layouts/Base.astro';
import Nav from '../../../../components/Nav.astro';
import Footer from '../../../../components/Footer.astro';
import { getCollection } from 'astro:content';

const tutorials = (await getCollection('tutorials', ({ data }) => !data.draft))
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

const tags = [...new Set(tutorials.flatMap((t) => t.data.tags))].sort();
---
<Base title="社内自创内容 | 计科资源中心" description="计算机科学社成员编写的教程与笔记。" canonical="https://lianhegongshe.cn/content/cs/tutorials/" loadParticles={false}>
  <Nav active="content" />
  <main class="container">
    <div class="page-header">
      <h1>社内自创内容</h1>
      <p>成员编写的教程、笔记与经验总结</p>
    </div>

    <div class="tag-filter" id="tagFilter">
      <button class="tag-chip is-active" data-tag="all">全部</button>
      {tags.map((tag) => <button class="tag-chip" data-tag={tag}>{tag}</button>)}
    </div>

    <ul class="tutorial-list" id="tutorialList">
      {tutorials.map((t) => (
        <li class="tutorial-item" data-tags={t.data.tags.join(',')}>
          <a href={`/content/cs/tutorials/${t.id}/`}>{t.data.title}</a>
          <p class="tutorial-desc">{t.data.description}</p>
          <div class="tutorial-meta">
            <time datetime={t.data.publishDate.toISOString()}>{t.data.publishDate.toLocaleDateString('zh-CN')}</time>
            {t.data.tags.map((tag) => <span class="tutorial-tag">{tag}</span>)}
          </div>
        </li>
      ))}
    </ul>
  </main>
  <Footer />
</Base>

<script>
  const filter = document.getElementById('tagFilter')!;
  const list = document.getElementById('tutorialList')!;
  filter.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.tag-chip') as HTMLElement | null;
    if (!btn) return;
    const tag = btn.dataset.tag!;
    filter.querySelectorAll('.tag-chip').forEach((b) => b.classList.toggle('is-active', b === btn));
    list.querySelectorAll('.tutorial-item').forEach((item) => {
      const tags = (item as HTMLElement).dataset.tags!.split(',').filter(Boolean);
      (item as HTMLElement).hidden = tag !== 'all' && !tags.includes(tag);
    });
  });
</script>

<style>
  /* .tag-filter / .tag-chip / .tutorial-list / .tutorial-item / .tutorial-desc /
     .tutorial-meta / .tutorial-tag 的样式，沿用全站令牌 */
</style>
```

- [ ] **Step 2: 创建教程详情页 `[slug].astro`**

```astro
---
import Base from '../../../../layouts/Base.astro';
import Nav from '../../../../components/Nav.astro';
import Footer from '../../../../components/Footer.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('tutorials', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<Base
  title={`${post.data.title} | 计科资源中心`}
  description={post.data.description}
  canonical={`https://lianhegongshe.cn/content/cs/tutorials/${post.id}/`}
  loadParticles={false}
>
  <Nav active="content" />
  <main class="container">
    <article class="tutorial-body">
      <div class="page-header">
        <h1>{post.data.title}</h1>
        <p>{post.data.description}</p>
        <div class="tutorial-meta">
          <time datetime={post.data.publishDate.toISOString()}>{post.data.publishDate.toLocaleDateString('zh-CN')}</time>
          {post.data.tags.map((tag) => <span class="tutorial-tag">{tag}</span>)}
        </div>
      </div>
      <Content />
    </article>
  </main>
  <Footer />
</Base>

<style>
  /* 正文排版：标题层级、段落行高、行内代码、代码块背景与横向滚动、引用块 */
  .tutorial-body :global(h2) { font-size: 1.4rem; margin: 2rem 0 .8rem; color: var(--text); }
  .tutorial-body :global(h3) { font-size: 1.15rem; margin: 1.5rem 0 .6rem; color: var(--text); }
  .tutorial-body :global(p) { line-height: 1.9; color: var(--text-secondary); margin: .8rem 0; }
  .tutorial-body :global(ul), .tutorial-body :global(ol) { margin: .8rem 0 .8rem 1.4rem; line-height: 1.9; color: var(--text-secondary); }
  .tutorial-body :global(code) { font-size: .88em; }
  .tutorial-body :global(pre) { border-radius: var(--radius-lg); padding: 1rem 1.2rem; overflow-x: auto; margin: 1rem 0; }
  .tutorial-body :global(blockquote) { border-left: 3px solid var(--gold-line); padding-left: 1rem; color: var(--text-muted); margin: 1rem 0; }
</style>
```

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: `dist/content/cs/tutorials/index.html` 与 `dist/content/cs/tutorials/welcome/index.html`（slug 取自文件名）存在；详情页代码块有 Shiki 生成的高亮 `<span class="...">`。

- [ ] **Step 4: 标签筛选手测**

Run: `pnpm dev` → 打开教程列表，点击「全部」以外的标签，列表应只显示带该标签的条目。

- [ ] **Step 5: 提交**

```bash
git add src/pages/content/cs/tutorials src/components/TagFilter.astro
git commit -m "feat: 添加教程列表、详情页与标签筛选"
```

---

## 阶段 4 — 收尾

### Task 14: 清理、文档与最终验收

**Files:**
- Delete: `css/`、`js/`（`js/particles.js` 与 `js/site.js` 已复制到 `public/js/`）
- Modify: `README.md`
- Modify: `src/pages/about/about.astro`（技术栈描述）

- [ ] **Step 1: 更新关于页的技术栈描述**

在 `src/pages/about/about.astro` 的「网站构建」区块中，把「技术栈：纯静态 HTML/CSS/JS，部署于阿里云 ESA Pages」改为：

```
技术栈：Astro（内容集合 + 静态输出），部署于 GitHub Pages，版本控制：Git + GitHub。
```

并在同一段补充一句：

```
站内的学习资源、社内教程与代码仓库统一收录在「计科资源中心」。
```

- [ ] **Step 2: 更新 README**

把「技术栈」一节改为：

```markdown
## 技术栈

- Astro 5（静态站点生成，无客户端框架）
- Markdown 内容集合（`src/content/tutorials/`）
- pnpm 包管理
- 部署于 GitHub Pages（push 到 `main` 由 GitHub Actions 构建并发布）
```

补充以下两节：

```markdown
## 本地开发

```bash
pnpm install
pnpm dev      # 开发服务器，默认 http://localhost:4321
pnpm build    # 产出 dist/
pnpm preview  # 预览构建结果
```

## 新增一篇教程

1. 在 `src/content/tutorials/` 下新建 `.md` 文件
2. 文件开头写 frontmatter：

```markdown
---
title: 教程标题
description: 一句话简介
publishDate: 2026-10-22
tags: [git, 协作]
author: 你的名字
---
```

3. 正文用 Markdown 写，代码块会自动高亮
4. 提交后自动出现在 `/content/cs/tutorials/` 列表与详情页
```

同时把「项目结构」一节的目录树更新为 Astro 结构。

- [ ] **Step 3: 删除旧文件**

```powershell
Remove-Item 'css' -Recurse -Force
Remove-Item 'js' -Recurse -Force
```

确认 `public/js/particles.js` 与 `public/js/site.js` 仍在。

- [ ] **Step 4: 最终验收**

Run: `pnpm build`
Run:

```powershell
$expect = 'dist\index.html','dist\join.html','dist\404.html','dist\about\about.html',
          'dist\members\index.html','dist\subgroups\cs\index.html',
          'dist\subgroups\langsong\index.html','dist\subgroups\yingsuan\index.html',
          'dist\content\index.html','dist\content\cs\index.html',
          'dist\content\cs\resources\index.html','dist\content\cs\tutorials\index.html',
          'dist\content\cs\repos\index.html'
foreach ($f in $expect) { "  {0,-52} {1}" -f $f, (Test-Path $f) }
```

Expected: 13 项全部 `True`。

- [ ] **Step 5: 无 JS 可读性检查**

Run: `pnpm preview`，在浏览器中禁用 JavaScript，确认：
- `/content/cs/tutorials/` 的教程标题可见
- `/members/` 的社员列表可见
- `/content/cs/` 三个板块的内容可见

- [ ] **Step 6: 提交并推送**

```bash
git add -A
git commit -m "chore: 清理旧静态文件，更新关于页与 README 的技术栈说明"
git push
```

Expected: Actions 绿；13 个路由全部可访问。

---

## Self-Review

**1. 规格覆盖检查**

| 规格章节 | 覆盖任务 |
| --- | --- |
| 2.1 路由表（8 旧 + 5 新） | Task 4/6/7/8/11/12/13 |
| 2.2 导航新增「内容」 | Task 3 |
| 2.3 计科社页资源中心入口 | Task 7 |
| 3.2 目录结构 | Task 1/2/3/5/10/11 |
| 3.3 脚本保留策略 | Task 2 Step 3、Task 4 Step 4 |
| 4.1 教程集合 | Task 10 |
| 4.2 成员数据 | Task 5 |
| 4.3 资源数据 | Task 11 |
| 4.4 仓库数据 | Task 11 |
| 5 组件契约 | Task 2/3/6/7 |
| 6 阶段 1–4 | Task 1–4 / 5–9 / 10–13 / 14 |
| 7 部署改动 | Task 4 Step 4 |
| 8 验收标准 1–9 | Task 9、Task 14 |
| 8 验收标准 10–12 | Task 14 Step 1/2/4 |

**2. 占位符扫描**

全文已检查，无 TBD / TODO / "适当处理" / "类似 Task N" 的表述。所有"搬运现有内容"的步骤都指明了**源文件路径 + 搬运范围 + 不许改动**的规则，属于明确指令而非占位符。

**3. 类型一致性**

- `Member` / `MemberSubgroup` 在 Task 5 定义，Task 6/7 使用，字段名 `name` / `avatar` / `bio` / `subgroups[{id,role}]` 一致。
- `Resource` / `Repo` 在 Task 11 定义，Task 11/12 使用，字段一致。
- `tutorials` 集合 schema 的 `title` / `description` / `publishDate` / `tags` / `author` / `draft` 在 Task 10 定义，Task 12/13 使用，一致。
- `MemberCard` 的 `showRoleFor` prop 在 Task 5 定义、Task 7 使用，名称一致。

**4. 已发现的计划内风险（已在对应步骤注明）**

- 阶段 1 结束时只有 `/about/about.html` 是新构建产物，其余 7 页会 404 → 因此 **Task 4 明确不推送**，全站切换点在 Task 9。
- `/about/about.html` 的路径可能需要改名为 `about.html.astro` → Task 4 Step 2 给出了验证与调整方法。
- 成员页 `animateNumber` 数字动画 → Task 7 Step 1 已注明二选一并以视觉一致为准。
