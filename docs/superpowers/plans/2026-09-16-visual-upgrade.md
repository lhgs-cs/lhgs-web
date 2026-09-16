# 联合公社官网视觉升级 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在零结构改动的前提下，把官网的设计语言从蓝紫 SaaS 风升级为呼应社徽的「徽章」质感（深靛 + 金 + 暖白），并精修全部交互动效。

**Architecture:** 纯 CSS 令牌替换 + 局部重写。保留 `css/common.css` 中现有的变量名只换取值，使大部分引用点自动生效；各页面内联 CSS 中残留的硬编码色值按统一映射表替换；卡片悬停从「色条铺满」改为「描边亮起」。

**Tech Stack:** 纯静态 HTML/CSS/JS，无构建步骤，无测试框架。验收通过 PowerShell 静态扫描 + 浏览器目视完成。

## Global Constraints

以下约束适用于每一个任务，逐字取自设计规格 `docs/superpowers/specs/2026-09-16-visual-upgrade-design.md`：

- **HTML 结构与文字内容零改动**：只允许修改 `<style>` 块内容。HTML 标签、属性、文本节点与升级前逐字节一致。
- **金色 `#b08d4f` 禁止用作文字色**（浅底对比度仅 2.8:1）。金色只能出现在装饰细线、角标、图标、描边、分隔线。金色系文字一律使用 `--gold-text: #7d6231`（5.2:1）。
- **所有可读文字在各自实际背景上的对比度 ≥ 4.5:1**。
- **所有 `transition` 必须使用 `var(--ease)`**，不得出现裸 `ease` 或 `linear`。
- **每个可交互元素必须同时具备 hover、active、`:focus-visible` 三种可见状态**，`:focus-visible` 统一为 `outline: 2px solid var(--primary); outline-offset: 2px;`。
- **`prefers-reduced-motion: reduce` 下不得有动画**。
- 临时文件 `_design-preview.html`、`_card-motion.html`、`_verify-design.ps1` 不得进入最终交付。

## 通用替换基准

所有任务共用下表。**批量替换时按下表顺序执行**（先长后短，避免 `rgba(79,110,247,` 被 `#4f6ef7` 的规则误伤）。

### 表 A — 精确色值替换

| 旧值 | 新值 |
| --- | --- |
| `#4f6ef7` | `#1d5578` |
| `#3b5de7` | `#143f5c` |
| `#eef1fe` | `#e7eef3` |
| `#4f9cf7` | `#2c6b8f` |
| `#f06449` | `#a83a2e` |
| `#f5a623` | `#b08d4f` |
| `#eef4ff` | `#e7eef3` |
| `#fff0ee` | `#f7ece9` |
| `#fff8ed` | `#f6f1e6` |
| `#ff8a65` | `#c25a4a` |
| `#ffcc02` | `#c9a961` |
| `#f5f7fb` | `#f5f3ee` |
| `#ffffff` | `#fffefb` |
| `#1e293b` | `#16324a` |
| `#5a6a85` | `#4a5b6b` |
| `#94a3b8` | `#5c6b7a` |
| `#e8ecf4` | `rgba(22,50,74,.10)` |
| `#f0f4ff` | `#f2f0ea` |
| `#fef6f0` | `#f7f2e8` |
| `#fef9f0` | `#fdf9f1` |
| `#fff7e6` | `#fbf5e9` |
| `#f5d89a` | `rgba(176,141,79,.35)` |
| `#8b6914` | `#6b5528` |
| `#6b4c12` | `#5a4520` |
| `#9a7d3a` | `#7d6231` |
| `#c0392b` | `#a83a2e` |
| `#c9a94e` | `#8a7448` |
| `rgba(180,130,30,0.12)` | `rgba(125,98,49,.14)` |
| `rgba(0,0,0,0.05)` | `rgba(22,50,74,.05)` |
| `#2563eb` | `#1d5578` |
| `#1d4ed8` | `#143f5c` |
| `#f8fafc` | `#f5f3ee` |
| `#475569` | `#4a5b6b` |

### 表 B — 前缀替换（保留 alpha 数值）

| 旧前缀 | 新前缀 |
| --- | --- |
| `rgba(79,110,247,` | `rgba(29,85,120,` |
| `rgba(59,93,231,` | `rgba(20,63,92,` |
| `rgba(79,156,247,` | `rgba(44,107,143,` |
| `rgba(240,100,73,` | `rgba(168,58,46,` |
| `rgba(245,166,35,` | `rgba(176,141,79,` |

### 表 C — 逐文件验证命令

每个任务结束时运行，`<files>` 替换为该任务涉及的文件列表：

```powershell
$old = '#4f6ef7','#3b5de7','#eef1fe','#4f9cf7','#f06449','#f5a623','#eef4ff','#fff0ee','#fff8ed','#ff8a65','#ffcc02',
       '#f5f7fb','#1e293b','#5a6a85','#94a3b8','#e8ecf4','#f0f4ff','#fef6f0','#fef9f0','#fff7e6','#f5d89a',
       '#8b6914','#6b4c12','#9a7d3a','#c0392b','#c9a94e','#2563eb','#1d4ed8','#f8fafc','#475569',
       'rgba(79,110,247,','rgba(59,93,231,','rgba(79,156,247,','rgba(240,100,73,','rgba(245,166,35,','rgba(180,130,30,'
$bad = 0
foreach ($f in <files>) {
    $c = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $f))
    foreach ($o in $old) {
        $n = ([regex]::Matches($c, [regex]::Escape($o))).Count
        if ($n -gt 0) { "  残留 $f : $o ×$n"; $script:bad++ }
    }
}
if ($bad -eq 0) { "  PASS 无残留旧色值" } else { "  FAIL 共 $bad 处残留" }
```

### 表 D — 结构零改动验证

在 **Task 1 开始前**运行一次生成基准，**Task 9** 再运行一次对比：

```powershell
# 生成基准（剥离 <style> 块后取哈希）
$base = Join-Path $env:TEMP 'lhgs-html-baseline'
New-Item -ItemType Directory -Force -Path $base | Out-Null
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.Name -notlike '_*' } | ForEach-Object {
    $rel = $_.FullName.Replace((Get-Location).Path + '\', '')
    $c = [System.IO.File]::ReadAllText($_.FullName)
    $stripped = [regex]::Replace($c, '(?s)<style>.*?</style>', '')
    [System.IO.File]::WriteAllText((Join-Path $base ($rel -replace '[\\]','_')), $stripped)
}
```

## File Structure

| 文件 | 职责 | 本计划中的改动 |
| --- | --- | --- |
| `css/common.css` | 全站设计令牌与公共组件样式 | 令牌全量替换、导航/菜单/页脚、focus-visible |
| `index.html` | 首页，含最大的内联样式块 | hero、卡片、社员、社训、公告、装饰 |
| `members/index.html` | 全部社员页 | 标题、统计条、社员网格、侧边装饰 |
| `about/about.html` | 关于页 | 信息卡、联系卡 |
| `join.html` | 加入页 | 加入卡片、表单控件 |
| `subgroups/cs/index.html` | 计算机科学社 | `--accent` 系列 + 内联样式 |
| `subgroups/langsong/index.html` | 朗诵社 | `--accent` 系列 + 内联样式 |
| `subgroups/yingsuan/index.html` | 硬算社 | `--accent` 系列 + 内联样式 |
| `404.html` | 错误页（不引用 common.css） | 独立样式块整体改色 |
| `js/particles.js` | 粒子背景 | 颜色数组与连线色 |

不涉及：`js/site.js`、`js/subgroup-members.js`、`js/members-data.js`、`css/effects.css`、任何图片。

---

### Task 1: 建立验收基准

**Files:**
- Create: `_verify-design.ps1`（临时，Task 9 删除）
- Create: `%TEMP%\lhgs-html-baseline\`（临时基准目录）

**Interfaces:**
- Produces: `_verify-design.ps1` 供 Task 2–9 每次改动后调用；基准目录供 Task 9 比对。

- [ ] **Step 1: 写验收脚本**

创建 `_verify-design.ps1`，内容如下：

```powershell
# 视觉升级验收脚本（临时）
param([string[]]$Files)

$root = (Get-Location).Path
$old = '#4f6ef7','#3b5de7','#eef1fe','#4f9cf7','#f06449','#f5a623','#eef4ff','#fff0ee','#fff8ed','#ff8a65','#ffcc02',
       '#f5f7fb','#1e293b','#5a6a85','#94a3b8','#e8ecf4','#f0f4ff','#fef6f0','#fef9f0','#fff7e6','#f5d89a',
       '#8b6914','#6b4c12','#9a7d3a','#c0392b','#c9a94e','#2563eb','#1d4ed8','#f8fafc','#475569',
       'rgba(79,110,247,','rgba(59,93,231,','rgba(79,156,247,','rgba(240,100,73,','rgba(245,166,35,','rgba(180,130,30,'

if (-not $Files) {
    $Files = Get-ChildItem -Recurse -Include *.html,*.css,*.js |
             Where-Object { $_.Name -notlike '_*' } |
             ForEach-Object { $_.FullName.Replace($root + '\', '') }
}

$bad = 0
foreach ($f in $Files) {
    $c = [System.IO.File]::ReadAllText((Join-Path $root $f))
    foreach ($o in $old) {
        $n = ([regex]::Matches($c, [regex]::Escape($o))).Count
        if ($n -gt 0) { "  残留 $f : $o x$n"; $bad++ }
    }
}
if ($bad -eq 0) { "PASS 无残留旧色值" } else { "FAIL 共 $bad 处残留" }
exit $bad
```

- [ ] **Step 2: 运行，确认它当前"失败"**

Run: `pwsh -File _verify-design.ps1`
Expected: 输出大量 `残留 ...` 行，最后为 `FAIL 共 N 处残留`，N > 30。这是升级前的基线。

- [ ] **Step 3: 生成 HTML 结构基准**

Run:

```powershell
$base = Join-Path $env:TEMP 'lhgs-html-baseline'
New-Item -ItemType Directory -Force -Path $base | Out-Null
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.Name -notlike '_*' } | ForEach-Object {
    $rel = $_.FullName.Replace((Get-Location).Path + '\', '')
    $c = [System.IO.File]::ReadAllText($_.FullName)
    $stripped = [regex]::Replace($c, '(?s)<style>.*?</style>', '')
    [System.IO.File]::WriteAllText((Join-Path $base ($rel -replace '[\\]','_')), $stripped)
}
(Get-ChildItem $base).Count
```

Expected: 输出 `8`（8 个页面）。

---

### Task 2: css/common.css — 设计令牌与公共组件

**Files:**
- Modify: `css/common.css`

**Interfaces:**
- Produces: 全部设计令牌（`--primary`、`--gold`、`--radius-lg`、`--ease` 等），供 Task 3–8 的所有内联样式引用。

- [ ] **Step 1: 整体替换 `:root` 令牌块**

将 `css/common.css` 中现有的 `:root { ... }` 整块替换为：

```css
/* 设计变量 */
:root {
    /* 主色：深靛蓝，呼应社徽底纹 */
    --primary: #1d5578;
    --primary-dark: #143f5c;
    --primary-light: #e7eef3;
    /* 分社强调色 */
    --accent-red: #a83a2e;      /* 朱红 */
    --accent-orange: #b08d4f;   /* 金色 —— 仅装饰，文字请用 --gold-text */
    --accent-blue: #2c6b8f;     /* 靛蓝亮 */
    /* 中性色 */
    --bg: #f5f3ee;
    --card-bg: #fffefb;
    --surface-hover: #fbf9f5;
    --text: #16324a;
    --text-secondary: #4a5b6b;
    --text-muted: #5c6b7a;
    --border: rgba(22, 50, 74, .10);
    /* 金色 */
    --gold: #b08d4f;
    --gold-text: #7d6231;
    --gold-line: rgba(176, 141, 79, .55);
    --gold-soft: rgba(176, 141, 79, .18);
    /* 圆角 */
    --radius-lg: 14px;
    --radius-md: 11px;
    --radius-sm: 8px;
    /* 阴影：墨色低透明度，双层 */
    --shadow-sm: 0 1px 2px rgba(22, 50, 74, .04), 0 2px 8px -2px rgba(22, 50, 74, .07);
    --shadow-md: 0 2px 4px rgba(22, 50, 74, .045), 0 10px 24px -8px rgba(22, 50, 74, .13);
    --shadow-lg: 0 2px 4px rgba(22, 50, 74, .045), 0 16px 34px -10px rgba(22, 50, 74, .20);
    /* 统一缓动 */
    --ease: cubic-bezier(.22, 1, .36, 1);
}
```

- [ ] **Step 2: 替换公共组件中的硬编码值**

在 `css/common.css` 中逐项替换：

| 查找 | 替换为 |
| --- | --- |
| `.top-bar` 的 `background: rgba(255,255,255,0.85);` | `background: rgba(255, 254, 251, 0.85);` |
| `.top-bar.scrolled` 的 `box-shadow: 0 4px 20px rgba(79,110,247,0.08);` | `box-shadow: var(--shadow-md);` |
| `.top-bar` 的 `transition: box-shadow 0.3s;` | `transition: box-shadow 0.4s var(--ease);` |
| `.logo-icon` 的 `border-radius: 8px;` | `border-radius: 6px;` |
| `.back-btn` 的 `border-radius: 10px;` | `border-radius: var(--radius-sm);` |
| `.back-btn` 的 `transition: background 0.2s;` | `transition: background 0.25s var(--ease);` |
| `.menu-btn` 的 `border-radius: 10px;` | `border-radius: var(--radius-sm);` |
| `.menu-btn` 的 `transition: background 0.2s;` | `transition: background 0.25s var(--ease);` |
| `.dropdown-menu` 的 `background-color: white;` | `background-color: var(--card-bg);` |
| `.dropdown-menu` 的 `border-radius: 16px;` | `border-radius: 12px;` |
| `.dropdown-item` 的 `border-bottom: 1px solid #f5f7fb;` | `border-bottom: 1px solid rgba(22, 50, 74, .06);` |
| `.dropdown-item` 的 `transition: all 0.15s;` | `transition: background 0.2s var(--ease), color 0.2s var(--ease);` |
| `footer` 的 `margin-top: 2rem;` | `margin-top: 2rem;`（不变，仅确认无其他旧色） |

- [ ] **Step 3: 追加全局交互状态**

在 `css/common.css` 末尾追加：

```css
/* ===== 键盘焦点：与鼠标操作区分，只在键盘导航时出现 ===== */
:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 2px;
}

/* ===== 按钮通用交互（按下反馈） ===== */
.btn-all:active,
.card-btn:active,
.join-page-btn:active {
    transform: translateY(0) scale(.985);
}
```

- [ ] **Step 4: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files css/common.css`
Expected: `PASS 无残留旧色值`

- [ ] **Step 5: 目视检查**

打开 `index.html`，确认：导航栏底色为暖白、菜单文字为深靛、页脚文字为深灰蓝、页面底色为暖白。用 Tab 键导航，确认每个控件都有清晰的描边轮廓。

---

### Task 3: index.html — 首页内联样式

**Files:**
- Modify: `index.html`（仅 `<style>` 块）

**Interfaces:**
- Consumes: Task 2 的全部令牌。
- Produces: 卡片「描边亮起」这一签名动效的最终实现，Task 6 的分社页卡片沿用同一套 hover 逻辑。

- [ ] **Step 1: 应用通用替换**

对 `index.html` 的 `<style>` 块应用表 A 与表 B。

- [ ] **Step 2: 重写卡片样式（签名动效）**

将现有的 `.card`、`.card::before`、`.card:hover::before`、`.card:hover`、`.card-red`、`.card-red::before`、`.card-red:hover`、`.card-orange`、`.card-orange::before`、`.card-orange:hover`、`.card-blue`、`.card-blue::before`、`.card-blue:hover` 这一整段规则替换为：

```css
        .card {
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            padding: 1.8rem 1.5rem;
            text-align: center;
            border: 1px solid var(--border);
            box-shadow: var(--shadow-sm);
            transition: transform 0.45s var(--ease), box-shadow 0.45s var(--ease),
                        border-color 0.45s var(--ease);
            position: relative;
            overflow: hidden;
        }
        /* 签名元素：悬停时右上角浮现金色直角标记，呼应社徽的烫金描边 */
        .card::before {
            content: '';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 19px;
            height: 19px;
            border-top: 1.5px solid var(--gold);
            border-right: 1.5px solid var(--gold);
            border-top-right-radius: 3px;
            opacity: 0;
            transform: translate(-4px, 4px);
            transition: opacity 0.45s var(--ease), transform 0.45s var(--ease);
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--gold-line);
        }
        .card:hover::before {
            opacity: 1;
            transform: translate(0, 0);
        }
        .card:hover .card-icon {
            transform: scale(1.05);
        }
```

- [ ] **Step 3: 给图标加过渡，给按钮加完整交互态**

将 `.card-icon` 规则改为：

```css
        .card-icon {
            font-size: 2.2rem;
            margin-bottom: 0.8rem;
            position: relative;
            z-index: 1;
            transition: transform 0.45s var(--ease);
        }
```

将 `.card-btn` 与 `.card-btn:hover` 替换为：

```css
        .card-btn {
            background: none;
            border: 1.5px solid var(--border);
            padding: 0.5rem 1.2rem;
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--primary);
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            transition: background 0.32s var(--ease), color 0.32s var(--ease),
                        border-color 0.32s var(--ease), transform 0.32s var(--ease),
                        box-shadow 0.32s var(--ease);
            position: relative;
            z-index: 1;
        }
        .card-btn:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            transform: translateY(-1.5px);
            box-shadow: 0 6px 16px -6px rgba(29, 85, 120, .55);
        }
```

- [ ] **Step 4: 重写「查看全部社员」按钮**

将 `.btn-all` 与 `.btn-all:hover` 替换为：

```css
        .btn-all {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: var(--card-bg);
            border: 1px solid var(--border);
            padding: 0.65rem 1.8rem;
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--primary);
            text-decoration: none;
            transition: background 0.32s var(--ease), color 0.32s var(--ease),
                        border-color 0.32s var(--ease), transform 0.32s var(--ease),
                        box-shadow 0.32s var(--ease);
            margin-top: 1.5rem;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
        }
        .btn-all:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            transform: translateY(-1.5px);
            box-shadow: 0 6px 16px -6px rgba(29, 85, 120, .55);
        }
```

- [ ] **Step 5: 重写社员条目样式**

将 `.member-card`、`.member-card:hover`、`.member-avatar`、`.member-avatar:hover`（或 `.member-card:hover .member-avatar`）替换为：

```css
        .member-card {
            display: flex;
            align-items: center;
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            padding: 1rem 1.4rem;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border);
            transition: transform 0.32s var(--ease), box-shadow 0.32s var(--ease),
                        border-color 0.32s var(--ease);
            cursor: default;
        }
        .member-card:hover {
            transform: translateX(5px);
            box-shadow: var(--shadow-md);
            border-color: var(--primary);
        }
        .member-avatar {
            width: 52px;
            height: 52px;
            border-radius: var(--radius-md);
            object-fit: cover;
            background-color: var(--surface-hover);
            margin-right: 1rem;
            flex-shrink: 0;
            transition: transform 0.32s var(--ease), border-radius 0.32s var(--ease);
        }
        .member-card:hover .member-avatar {
            transform: scale(1.08);
            border-radius: 50%;
        }
```

- [ ] **Step 6: 社训块加金色签名短线**

在 `.motto-box` 规则内，将 `background` 一行替换为：

```css
            background: var(--card-bg);
```

并在 `.motto-box` 规则**之后**追加：

```css
        /* 金色短线：签名元素在静态状态下的呼应 */
        .motto-box::after {
            content: '';
            position: absolute;
            top: 1.1rem;
            left: 50%;
            transform: translateX(-50%);
            width: 46px;
            height: 2px;
            border-radius: 2px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
```

同时把 `.motto-box::before`（引号装饰）的 `color: var(--primary);` 改为 `color: var(--gold);`，`opacity: 0.04;` 改为 `opacity: 0.16;`。

- [ ] **Step 7: 公告栏圆角与过渡**

将 `.announcement-bar` 的 `border-radius: 16px;` 改为 `border-radius: 12px;`，`transition` 一行改为：

```css
            transition: opacity 0.3s var(--ease), transform 0.3s var(--ease), margin 0.3s var(--ease),
                        padding 0.3s var(--ease), max-height 0.4s var(--ease);
```

- [ ] **Step 8: 浮动条与侧边装饰**

将 `.float-strip` 的 `background: rgba(255,255,255,0.72);` 改为 `background: rgba(255, 254, 251, 0.72);`，圆角 `14px` 改为 `var(--radius-lg)`。

将 `.float-strip.strip-accent-orange .float-strip-text` 的 `color: var(--accent-orange);` 改为 `color: var(--gold-text);`（**这是 Global Constraints 中金色不可作文字的具体落点**）。

- [ ] **Step 9: 替换各处过渡曲线**

将 `<style>` 块内所有剩余的 `cubic-bezier(0.4,0,0.2,1)` 替换为 `var(--ease)`。

- [ ] **Step 10: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files index.html`
Expected: `PASS 无残留旧色值`

- [ ] **Step 11: 目视检查**

打开 `index.html`：
1. 悬停任意分社卡片 —— 应看到卡片抬起、描边转淡金、右上角浮现金色直角标记，**不再有色条铺满背景**。
2. 悬停"了解更多" —— 按钮填深靛并轻微抬起。
3. 悬停社员条目 —— 向右滑动 5px，头像变圆。
4. 社训块顶部应有一条金色短线。
5. 按 Tab 键 —— 每个按钮都有描边轮廓。

---

### Task 4: members/index.html 与 about/about.html

**Files:**
- Modify: `members/index.html`
- Modify: `about/about.html`

**Interfaces:**
- Consumes: Task 2 的令牌。
- Produces: 无下游依赖。

- [ ] **Step 1: 对两个文件应用通用替换**

对两个文件的 `<style>` 块应用表 A 与表 B。

- [ ] **Step 2: members — 社员网格卡片**

将 `.member-card`、`.member-card:hover`、`.member-avatar`、`.member-avatar:hover` 替换为：

```css
        .member-card {
            background: var(--card-bg);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease),
                        border-color 0.35s var(--ease);
            cursor: default;
            opacity: 0;
            transform: translateY(20px);
        }
        .member-card.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .member-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary);
        }
        .member-avatar {
            width: 56px;
            height: 56px;
            border-radius: var(--radius-md);
            object-fit: cover;
            background-color: var(--surface-hover);
            flex-shrink: 0;
            transition: transform 0.3s var(--ease), border-radius 0.3s var(--ease);
        }
        .member-card:hover .member-avatar {
            transform: scale(1.08);
            border-radius: 50%;
        }
```

- [ ] **Step 3: members — 统计条与页面标题**

将 `.stat-item` 的 `border-radius: 16px;` 改为 `var(--radius-lg)`，`transition: transform 0.3s, box-shadow 0.3s;` 改为 `transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);`。

将 `.join-page-btn` 的 `border-radius: 40px;` 改为 `var(--radius-sm)`，`transition: transform 0.25s, box-shadow 0.25s;` 改为 `transition: transform 0.32s var(--ease), box-shadow 0.32s var(--ease);`，`:hover` 的 `box-shadow: 0 8px 28px rgba(79,110,247,0.4);` 改为 `box-shadow: 0 6px 16px -6px rgba(29, 85, 120, .55);`。

- [ ] **Step 4: about — 联系卡片**

将 `.info-value` 的 `border-radius: 16px;` 改为 `var(--radius-lg)`，`.contact-card` 的 `border-radius: 20px;` 改为 `var(--radius-lg)`。

给 `.contact-card` 追加金色短线（与首页社训块一致）：

```css
        .contact-card::before {
            content: '';
            display: block;
            width: 46px;
            height: 2px;
            margin: 0 auto 1rem;
            border-radius: 2px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
```

- [ ] **Step 5: 两个文件替换过渡曲线**

将所有 `cubic-bezier(0.4,0,0.2,1)` 替换为 `var(--ease)`。

- [ ] **Step 6: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files members\index.html,about\about.html`
Expected: `PASS 无残留旧色值`

- [ ] **Step 7: 目视检查**

打开 `members/`：社员网格卡片为 14px 圆角，悬停抬起并染主色描边。打开关于页：联系卡片顶部有金色短线。

---

### Task 5: join.html

**Files:**
- Modify: `join.html`

**Interfaces:**
- Consumes: Task 2 的令牌。
- Produces: 无下游依赖。

- [ ] **Step 1: 应用通用替换**

对 `join.html` 的 `<style>` 块应用表 A 与表 B（该页主要为 `var(--primary)` 渐变，多数自动生效；`rgba(0,0,0,0.45)` 在全局约束下替换为 `rgba(22, 50, 74, .45)`）。

- [ ] **Step 2: 收敛圆角与过渡**

| 查找 | 替换为 |
| --- | --- |
| `.join-card` 的 `border-radius: 24px;` | `border-radius: var(--radius-lg);` |
| `.form-input, .form-textarea` 的 `border-radius: 12px;` | `border-radius: var(--radius-sm);` |
| `.join-submit-btn` 的 `border-radius: 40px;` | `border-radius: var(--radius-sm);` |
| 所有 `cubic-bezier(0.4,0,0.2,1)` | `var(--ease)` |
| `.join-card` 的 `transition` | 若存在，改为 `var(--ease)` 版本 |

- [ ] **Step 3: 表单控件焦点态**

在 `.form-input:focus, .form-textarea:focus` 规则中，将 `border-color: rgba(255,255,255,0.5);` 改为 `border-color: rgba(255, 254, 251, 0.75);`。

- [ ] **Step 4: 响应式断点内的圆角**

在 `@media (max-width: 768px)` 内，`.join-card` 的 `border-radius: 20px;` 改为 `var(--radius-lg);`；在 `@media (max-width: 480px)` 内改为 `var(--radius-lg);`。

- [ ] **Step 5: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files join.html`
Expected: `PASS 无残留旧色值`

- [ ] **Step 6: 目视检查**

打开 `join.html`：加入卡片为深靛渐变配 14px 圆角，表单控件为 8px 圆角，禁用按钮仍呈现"未开放"的灰度外观。

---

### Task 6: 三个分社页

**Files:**
- Modify: `subgroups/cs/index.html`
- Modify: `subgroups/langsong/index.html`
- Modify: `subgroups/yingsuan/index.html`

**Interfaces:**
- Consumes: Task 2 的令牌。
- Produces: 无下游依赖。

- [ ] **Step 1: 替换各页的 `--accent` 三件套**

三个文件的 `<style>` 开头都有：

```css
        :root {
            --accent: <旧值>;
            --accent-light: <旧值>;
            --accent-gradient: linear-gradient(135deg, <旧值>, <旧值>);
        }
```

逐页替换为：

`subgroups/cs/index.html`：

```css
        :root {
            --accent: #2c6b8f;
            --accent-light: #e7eef3;
            --accent-gradient: linear-gradient(135deg, #2c6b8f, #1d5578);
        }
```

`subgroups/langsong/index.html`：

```css
        :root {
            --accent: #b08d4f;
            --accent-light: #f6f1e6;
            --accent-gradient: linear-gradient(135deg, #b08d4f, #c9a961);
        }
```

`subgroups/yingsuan/index.html`：

```css
        :root {
            --accent: #a83a2e;
            --accent-light: #f7ece9;
            --accent-gradient: linear-gradient(135deg, #a83a2e, #c25a4a);
        }
```

- [ ] **Step 2: 对三个文件应用通用替换**

应用表 A 与表 B。注意 `subgroups/cs/index.html` 的 `.page-hero-icon` 有一处硬编码 `box-shadow: 0 8px 24px rgba(79,156,247,0.2);`，由表 B 覆盖；`langsong` 与 `yingsuan` 同理。

- [ ] **Step 3: 角色标签改为达标配色**

三个页面都有：

```css
        .member-tag {
            display: inline-block; font-size: 0.7rem; font-weight: 600;
            padding: 0.15rem 0.55rem; border-radius: 6px; margin-top: 0.4rem;
            background: var(--accent-light); color: var(--accent);
        }
```

将 `color: var(--accent);` 改为 `color: var(--primary-dark);`（**朗诵社的 `--accent` 是金色，作文字色只有 2.8:1，此为 Global Constraints 的具体落点**）。背景保留 `var(--accent-light)` 以维持分社区分度。

- [ ] **Step 4: 收敛圆角与过渡**

| 查找 | 替换为 |
| --- | --- |
| `.page-hero-icon` 的 `border-radius: 24px;` | `border-radius: var(--radius-lg);` |
| `.info-card` 的 `border-radius: 20px;` | `border-radius: var(--radius-lg);` |
| `.member-card` 的 `border-radius: 18px;` | `border-radius: var(--radius-lg);` |
| `.member-avatar` 的 `border-radius: 14px;` | `border-radius: var(--radius-md);` |
| `.feature-card` 的 `border-radius: 16px;` | `border-radius: var(--radius-lg);` |
| 所有 `cubic-bezier(0.4,0,0.2,1)` | `var(--ease)` |
| 各 `transition: transform 0.3s, box-shadow 0.3s;` | `transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);` |

- [ ] **Step 5: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files subgroups\cs\index.html,subgroups\langsong\index.html,subgroups\yingsuan\index.html`
Expected: `PASS 无残留旧色值`

- [ ] **Step 6: 目视检查**

依次打开三个分社页：各自强调色正确（靛蓝 / 金 / 朱红），角色标签文字为深靛且清晰可读，卡片悬停抬起。

---

### Task 7: 404.html

**Files:**
- Modify: `404.html`

**Interfaces:**
- Consumes: 无（该页不引用 `common.css`，令牌需内联定义）。
- Produces: 无下游依赖。

- [ ] **Step 1: 内联令牌并替换色值**

在 `404.html` 的 `<style>` 块**开头**（`* {` 之前）插入：

```css
        :root {
            --primary: #1d5578;
            --primary-dark: #143f5c;
            --bg: #f5f3ee;
            --text: #16324a;
            --text-secondary: #4a5b6b;
            --ease: cubic-bezier(.22, 1, .36, 1);
        }
```

然后应用表 A 与表 B。

- [ ] **Step 2: 替换该页特有的蓝色系**

| 查找 | 替换为 |
| --- | --- |
| `background-color: #2563eb;` | `background-color: var(--primary);` |
| `background-color: #1d4ed8;` | `background-color: var(--primary-dark);` |
| `color: #2563eb;` | `color: var(--primary);` |
| `background-color: #f8fafc;` | `background-color: var(--bg);` |
| `color: #1e293b;` | `color: var(--text);` |
| `color: #475569;` | `color: var(--text-secondary);` |
| `.home-btn` 的 `border-radius: 40px;` | `border-radius: 8px;` |
| `.home-btn` 的 `transition: background 0.2s, transform 0.1s;` | `transition: background 0.3s var(--ease), transform 0.3s var(--ease), box-shadow 0.3s var(--ease);` |
| `.home-btn:hover` 的 `box-shadow` 若缺失 | 追加 `box-shadow: 0 6px 16px -6px rgba(29, 85, 120, .55);` |

- [ ] **Step 3: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files 404.html`
Expected: `PASS 无残留旧色值`

- [ ] **Step 4: 目视检查**

在浏览器中直接打开 `404.html`：底色暖白、大号 404 数字为深靛、按钮为 8px 圆角深靛填充，粒子为靛蓝/金色调。

---

### Task 8: js/particles.js 配色

**Files:**
- Modify: `js/particles.js`

**Interfaces:**
- Consumes: 无。
- Produces: 无下游依赖。

- [ ] **Step 1: 替换粒子颜色数组**

将 `js/particles.js` 中的：

```js
    const colors = [
        'rgba(79,110,247,',
        'rgba(79,156,247,',
        'rgba(59,93,231,',
        'rgba(240,100,73,',
        'rgba(245,166,35,'
    ];
```

替换为：

```js
    const colors = [
        'rgba(29,85,120,',    // 靛
        'rgba(44,107,143,',   // 靛蓝亮
        'rgba(20,63,92,',     // 靛深
        'rgba(168,58,46,',    // 朱红
        'rgba(176,141,79,'    // 金
    ];
```

- [ ] **Step 2: 替换连线颜色**

在 `drawLines()` 中，将：

```js
                    ctx.strokeStyle = 'rgba(79,110,247,' + alpha.toFixed(3) + ')';
```

替换为：

```js
                    ctx.strokeStyle = 'rgba(29,85,120,' + alpha.toFixed(3) + ')';
```

- [ ] **Step 3: 语法检查**

Run: `node --check js/particles.js`
Expected: 无输出（退出码 0）。

- [ ] **Step 4: 运行验收**

Run: `pwsh -File _verify-design.ps1 -Files js/particles.js`
Expected: `PASS 无残留旧色值`

- [ ] **Step 5: 目视检查**

打开 `index.html`，粒子应呈靛蓝为主、夹杂朱红与金色，连线为靛蓝。

---

### Task 9: 全站验收与清理

**Files:**
- Delete: `_design-preview.html`
- Delete: `_card-motion.html`
- Delete: `_verify-design.ps1`
- Delete: `%TEMP%\lhgs-html-baseline\`

**Interfaces:**
- Consumes: Task 1 生成的结构基准。
- Produces: 可交付的最终状态。

- [ ] **Step 1: 全站残留色扫描**

Run: `pwsh -File _verify-design.ps1`
Expected: `PASS 无残留旧色值`

- [ ] **Step 2: HTML 结构零改动验证**

Run:

```powershell
$base = Join-Path $env:TEMP 'lhgs-html-baseline'
$bad = 0
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.Name -notlike '_*' } | ForEach-Object {
    $rel = $_.FullName.Replace((Get-Location).Path + '\', '')
    $cur = [regex]::Replace([System.IO.File]::ReadAllText($_.FullName), '(?s)<style>.*?</style>', '')
    $old = [System.IO.File]::ReadAllText((Join-Path $base ($rel -replace '[\\]','_')))
    if ($cur -ne $old) { "  结构已变: $rel"; $script:bad++ }
}
if ($bad -eq 0) { "PASS 全部页面 HTML 结构零改动" } else { "FAIL $bad 个页面结构被改动" }
```

Expected: `PASS 全部页面 HTML 结构零改动`

- [ ] **Step 3: 过渡曲线一致性**

Run:

```powershell
$bad = 0
Get-ChildItem -Recurse -Include *.css,*.html | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName)
    $n = ([regex]::Matches($c, 'transition[^;]*(?<!var\(--ease\))\b(ease|linear)\b')).Count
    if ($n -gt 0) { "  裸 easing: $($_.Name) x$n"; $script:bad++ }
}
if ($bad -eq 0) { "PASS 过渡曲线已统一" } else { "FAIL $bad 处仍在用裸 easing" }
```

Expected: `PASS 过渡曲线已统一`。若出现残留，逐条改为 `var(--ease)`。

- [ ] **Step 4: 金色作文字用的扫描**

Run:

```powershell
$bad = 0
Get-ChildItem -Recurse -Include *.css,*.html | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName)
    # 查找把金色直接用于 color 的规则
    foreach ($m in [regex]::Matches($c, 'color:\s*(#b08d4f|var\(--gold\)|var\(--accent-orange\))')) {
        "  金色作文字: $($_.Name) -> $($m.Value)"; $script:bad++
    }
}
if ($bad -eq 0) { "PASS 无金色文字" } else { "FAIL $bad 处金色被用作文字色" }
```

Expected: `PASS 无金色文字`。

- [ ] **Step 5: JS 语法复检**

Run:

```powershell
Get-ChildItem js\*.js | ForEach-Object {
    $null = & node --check $_.FullName 2>&1
    "{0}: {1}" -f $_.Name, $(if ($LASTEXITCODE -eq 0) { 'OK' } else { 'FAIL' })
}
```

Expected: 四个文件全部 `OK`。

- [ ] **Step 6: 浏览器全站走查**

逐页打开并确认（8 页）：

1. `index.html` — 卡片描边亮起动效、金色角标、社训金色短线、公告栏淡金底
2. `members/` — 11 位社员、网格卡片悬停抬起
3. `about/about.html` — 联系卡片金色短线
4. `join.html` — 深靛渐变卡片
5. `subgroups/cs/`、`subgroups/langsong/`、`subgroups/yingsuan/` — 各自强调色正确
6. `404.html` — 深靛配色

每页同时确认：Tab 键导航有清晰焦点轮廓；系统开启"减少动态效果"后无动画。

- [ ] **Step 7: 删除临时文件**

Run:

```powershell
Remove-Item _design-preview.html, _card-motion.html, _verify-design.ps1 -Force
Remove-Item (Join-Path $env:TEMP 'lhgs-html-baseline') -Recurse -Force
git status --short
```

Expected: `git status` 中不再出现 `_` 开头的文件。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: 视觉升级为呼应社徽的徽章风格（方向 B）"
```

---

## Self-Review

**1. Spec coverage**

| 规格章节 | 覆盖任务 |
| --- | --- |
| 2.1 主色与点缀 | Task 2 Step 1 |
| 2.2 中性色 | Task 2 Step 1 |
| 2.3 新增变量 | Task 2 Step 1 |
| 2.4 硬编码替换映射 | 表 A / 表 B，各任务 Step 1 |
| 2.5 金色使用约束 | Task 3 Step 8、Task 6 Step 3、Task 9 Step 4 |
| 3 圆角 | Task 2 Step 2、Task 3 Step 4/5、Task 5 Step 2、Task 6 Step 4、Task 7 Step 2 |
| 4 阴影与描边 | Task 2 Step 1/2 |
| 5.1 分社卡片描边亮起 | Task 3 Step 2 |
| 5.2 按钮 | Task 3 Step 3/4 |
| 5.3 社员条目 | Task 3 Step 5、Task 4 Step 2 |
| 5.4 导航与菜单 | Task 2 Step 2 |
| 5.5 社训块金色短线 | Task 3 Step 6、Task 4 Step 4 |
| 5.6 粒子背景 | Task 8 |
| 5.7 侧边装饰与浮动条 | Task 3 Step 8 |
| 6.1 focus-visible | Task 2 Step 3 |
| 6.2 对比度 | Task 2 Step 1（令牌取值）、Task 6 Step 3、Task 9 Step 4 |
| 6.3 reduced-motion | 既有规则，Task 9 Step 6 走查确认 |
| 6.4 不依赖颜色传达信息 | Task 3 Step 2（分社仍靠图标与文字区分） |
| 8 验收标准 | Task 9 全部步骤 |

无遗漏。

**2. Placeholder scan**

已检查：无 "TBD"、"TODO"、"类似 Task N"、"适当处理" 等表述。每个改动步骤都给出了可直接粘贴的 CSS 或明确的查找—替换对。

**3. Type consistency**

本计划不涉及函数签名。令牌名在 Task 2 定义后，Task 3–8 引用的一致性已逐项核对：`--radius-lg` / `--radius-md` / `--radius-sm` / `--ease` / `--gold` / `--gold-text` / `--gold-line` / `--gold-soft` / `--surface-hover` 在所有任务中拼写一致。

**已发现并修正的两处问题：**

1. 初稿的 Task 3 计划保留 `.card-red/.card-orange/.card-blue` 的静态描边染色，但用户选定的方案 B 明确是「完全不出现色块、描边统一」。已改为移除这三组规则的视觉差异（HTML 上的 class 保留不动，以满足结构零改动约束）。
2. 初稿的 Task 6 计划沿用 `.member-tag` 的 `color: var(--accent)`，但朗诵社的 `--accent` 是金色，对比度 2.8:1 不达标。已改为 `var(--primary-dark)`。
