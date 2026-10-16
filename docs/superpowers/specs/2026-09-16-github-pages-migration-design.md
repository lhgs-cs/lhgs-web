# 从阿里云 ESA 迁移到 GitHub Pages 设计规格

**日期**：2026-09-16
**状态**：已获用户批准（含两处修正）
**目标**：把部署从阿里云 ESA Pages 迁移到 GitHub Pages，保持自定义域名 `lianhegongshe.cn` 不变，**代码零改动**。

---

## 1. 背景与约束

### 1.1 站点现状

| 项 | 值 |
| --- | --- |
| 仓库 | `git@github.com:gmyca/lhgs-web.git` |
| 默认分支 | `main` |
| 技术栈 | 纯静态 HTML/CSS/JS，**无构建步骤** |
| 当前部署 | 阿里云 ESA Pages，由 `esa.jsonc` 描述 |
| 当前域名 | `lianhegongshe.cn` |

### 1.2 决定性约束：全站使用根绝对路径

站点共有 **76 处以 `/` 开头的资源引用**：

- HTML 中 65 处：`/css/common.css`、`/js/*.js`、`/images/*`、`/favicon.png`、`href="/"`、`href="/members/"`、`fetch('/announcement/announcement.md')`
- `js/members-data.js` 中 11 处：`avatar: "/images/members/*.jpeg"`

这意味着部署形态直接决定这批路径是否有效：

| GitHub Pages 形态 | 根绝对路径是否有效 |
| --- | --- |
| 自定义域名 `lianhegongshe.cn` | **有效** |
| 项目站点 `gmyca.github.io/lhgs-web/` | **全部 404**，需把 76 处改为相对路径 |

用户选定**继续使用自定义域名**，因此本次迁移**不改动任何 HTML / CSS / JS**。

---

## 2. 决策记录

### 2.1 部署方式：官方 Pages Actions

采用 `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages` 三段式，而非推送到 `gh-pages` 分支，也非第三方 action。

理由：官方维护、无需额外分支、无构建步骤时配置最简、支持手动触发。

### 2.2 不添加 `CNAME` 文件

[GitHub 官方文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 明确说明：

> If you are publishing from a custom GitHub Actions workflow, no `CNAME` file is created, and any existing `CNAME` file is ignored and is not required.

用 Actions 部署时 `CNAME` 文件被忽略。自定义域名改为在仓库 **Settings → Pages → Custom domain** 中配置。加这个文件只会造成"它在起作用"的误解，故不加。

### 2.3 不添加 `.nojekyll`

Jekyll 仅在 **Source = "Deploy from a branch"** 模式下运行。本项目 Source 为 **"GitHub Actions"**，发布的是 workflow 上传的 artifact，GitHub 不对其做 Jekyll 处理。

因此 `announcement/announcement.md` 会被原样输出，`fetch()` 可正常取到原始 markdown；`.nojekyll` 无必要。

> 此条为初版设计的错误更正：初版曾称 `.nojekyll` "不是可选项"，该判断基于"Deploy from a branch"模式，不适用于本案。

### 2.4 排除非站点文件

`path: '.'` 会把整个仓库打包发布，导致 `README.md`、`docs/superpowers/**` 等可被直接访问。`docs/` 下是本次及上次的设计规格与实施计划，包含内部讨论措辞，不适合公开在社团官网上。

在打包前用一条 `rm` 在 runner 的工作副本中删除它们。**该操作只影响 runner 上的临时副本，不改动仓库内容。**

排除清单：`docs`、`.github`、`README.md`、`.gitignore`。

（`.git` 由 `actions/upload-pages-artifact` 自动排除，无需列出。）

---

## 3. 文件变动

| 操作 | 文件 | 说明 |
| --- | --- | --- |
| **删除** | `esa.jsonc` | ESA Pages 专用配置，迁移后失效 |
| **新增** | `.github/workflows/deploy.yml` | 部署流水线 |
| **更新** | `README.md` | 技术栈与部署说明：ESA Pages → GitHub Pages |
| **不改动** | 全部 HTML / CSS / JS / 图片 | 零代码改动 |

---

## 4. `.github/workflows/deploy.yml` 完整内容

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

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Strip non-site files
        run: rm -rf docs .github README.md .gitignore

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 关键字段说明

| 字段 | 作用 |
| --- | --- |
| `permissions.pages: write` + `id-token: write` | `deploy-pages` 必需；缺任一项会报权限错误 |
| `concurrency.group: pages` | 避免多次 push 触发并发部署互相覆盖 |
| `cancel-in-progress: false` | 让进行中的部署跑完，避免线上出现半成品 |
| `environment.name: github-pages` | 与 Pages 部署环境绑定，使部署 URL 出现在仓库首页 |
| `workflow_dispatch` | 保留手动触发入口，便于不改代码时重新部署 |

---

## 5. `README.md` 更新

「技术栈」一节由：

```markdown
- 部署于阿里云 ESA Pages
```

改为：

```markdown
- 部署于 GitHub Pages（通过 GitHub Actions 自动部署，push 到 `main` 即发布）
```

并在「常见维护操作」表后追加一节「部署」，说明：源为 `main` 分支，工作流文件 `.github/workflows/deploy.yml`，自定义域名在仓库 Settings → Pages 配置。

---

## 6. 代码之外的前置步骤（需用户在 GitHub / DNS 侧完成）

按顺序执行：

1. **仓库 Settings → Pages → Source** 选择 **GitHub Actions**
   （不选此项时 workflow 会在 `configure-pages` 步骤报错）
2. **同一页面的 Custom domain** 填入 `lianhegongshe.cn` 并 Save
3. **DNS 服务商**配置下面的记录，**替换掉指向阿里云 ESA 的原有解析**
4. DNS 生效后（最长 24 小时）回到 Pages 设置勾选 **Enforce HTTPS**

### DNS 记录

| 类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |
| `CNAME` | `www` | `gmyca.github.io` |

记录值取自 GitHub 官方文档，不凭记忆填写。

**不要为 `www` 之外配置通配符记录**（如 `*.lianhegongshe.cn`）—— 官方明确警告这会导致域名接管风险。

---

## 7. 验收标准

1. `esa.jsonc` 已不存在于仓库。
2. `.github/workflows/deploy.yml` 存在，且是合法 YAML、可被 GitHub Actions 解析。
3. push 到 `main` 后 Actions 运行成功，`lianhegongshe.cn` 可访问首页。
4. 站内资源全部加载正常（无 404）：样式、脚本、社徽、成员头像、favicon。
5. 公告栏正常显示（`fetch('/announcement/announcement.md')` 返回原始 markdown，未被 Jekyll 改写）。
6. 任意不存在的路径返回自定义 `404.html`。
7. `https://lianhegongshe.cn/docs/` 与 `https://lianhegongshe.cn/README.md` 返回 404（排除步骤生效）。

---

## 8. 不做的事

- 不改动任何 HTML / CSS / JS / 图片资源（根绝对路径在自定义域名下继续有效）。
- 不添加 `CNAME` 文件（见 2.2）。
- 不添加 `.nojekyll`（见 2.3）。
- 不引入构建步骤（项目是纯静态站点，直接发布源文件）。
- 不删除阿里云 ESA 侧的域名绑定（DNS 改动后自然不再走 ESA，无需额外操作）。
