# 联合公社官网 · 视觉升级设计规格

**日期**：2026-09-16
**状态**：待用户审阅
**选定方向**：方向 B「徽章」 + 卡片悬停方案「描边亮起」

---

## 1. 目标

在不改动**布局结构、区块顺序、信息架构和任何文字内容**的前提下，把网站的设计语言从通用蓝紫 SaaS 风，升级为呼应社徽的徽章质感，并精修交互动效。

判断"高级"的标准是执行精度，不是加装饰：圆角收敛、阴影分层、描边半透明、过渡统一到一条缓动曲线、交互状态完整（hover / active / focus-visible）。

### 范围

| 改动 | 不改动 |
| --- | --- |
| 设计令牌（颜色 / 圆角 / 阴影 / 缓动） | HTML 结构与区块顺序 |
| 交互动效与状态 | 信息架构 |
| 装饰元素的形态 | 任何文字内容 |
| 粒子背景与装饰的配色 | 图片资源 |

---

## 2. 颜色令牌

保留 `css/common.css` 中**现有的变量名**，只替换取值 —— 这样绝大多数引用点无需修改即可生效。

### 2.1 主色与点缀

| 变量 | 新值 | 旧值 | 用途 |
| --- | --- | --- | --- |
| `--primary` | `#1d5578` | `#4f6ef7` | 主色·深靛蓝，呼应社徽底纹 |
| `--primary-dark` | `#143f5c` | `#3b5de7` | 主色加深（按下态、强调） |
| `--primary-light` | `#e7eef3` | `#eef1fe` | 主色浅底（悬停背景） |
| `--accent-red` | `#a83a2e` | `#f06449` | 朱红（硬算社强调色） |
| `--accent-orange` | `#b08d4f` | `#f5a623` | 金（朗诵社强调色） |
| `--accent-blue` | `#2c6b8f` | `#4f9cf7` | 靛蓝亮（计算机科学社强调色） |

`--accent-orange` 的取值改为金色后语义已不符，**在变量声明处补注释说明它现在代表金色**，避免后续误用。不重命名变量，以免引入跨文件的大范围改动。

### 2.2 中性色

| 变量 | 新值 | 旧值 | 说明 |
| --- | --- | --- | --- |
| `--bg` | `#f5f3ee` | `#f5f7fb` | 页面底色，暖白（纸张感） |
| `--card-bg` | `#fffefb` | `#ffffff` | 卡片底色，比页面底色更亮一档 |
| `--text` | `#16324a` | `#1e293b` | 正文墨色 |
| `--text-secondary` | `#4a5b6b` | `#5a6a85` | 次级文字 |
| `--text-muted` | `#5c6b7a` | `#94a3b8` | 弱化文字 |
| `--border` | `rgba(22,50,74,.10)` | `#e8ecf4` | 描边改为半透明 |

`--text-muted` 从 `#94a3b8` 加深到 `#5c6b7a` 是**必需**的：原值在本项目浅底上的对比度仅约 2.6:1，远低于无障碍 AA 标准。新值实测对比度 4.93:1。

### 2.3 新增变量

```css
--gold: #b08d4f;                        /* 金色，仅用于装饰（浅底对比度 2.8:1，不可作文字） */
--gold-text: #7d6231;                   /* 深金：金色系中唯一可安全用作文字的值（5.2:1） */
--gold-line: rgba(176,141,79,.55);      /* 金色描边（悬停态） */
--gold-soft: rgba(176,141,79,.18);      /* 金色淡底 */
--surface-hover: #fbf9f5;               /* 卡片悬停底色 */
--radius-lg: 14px;
--radius-md: 11px;
--radius-sm: 8px;
--ease: cubic-bezier(.22, 1, .36, 1);   /* 统一缓动 */
```

### 2.4 硬编码色值的替换映射

各页面内联 CSS 中存在大量硬编码 rgba，需系统替换：

| 旧值 | 新值 | 说明 |
| --- | --- | --- |
| `rgba(79,110,247,` | `rgba(29,85,120,` | 主色 |
| `rgba(59,93,231,` | `rgba(20,63,92,` | 主色深 |
| `rgba(79,156,247,` | `rgba(44,107,143,` | 靛蓝亮 |
| `rgba(240,100,73,` | `rgba(168,58,46,` | 朱红 |
| `rgba(245,166,35,` | `rgba(176,141,79,` | 金 |
| `#e8ecf4`（用作描边/占位底） | `rgba(22,50,74,.10)` / `#fbf9f5` | 按语境区分 |
| `#f5f7fb` 系（分隔线、悬停底） | `#fbf9f5` | |
| 公告栏底色 `#fef9f0` / `#fff7e6` / `#fef6f0` | `#fdf9f1` / `#fbf5e9` / `#fdf9f1` | 暖黄底 → 淡金底 |
| 公告栏描边 `#f5d89a` | `rgba(176,141,79,.35)` | |
| 公告栏正文 `#8b6914` | `#6b5528`（6.6:1） | |
| 公告栏强调 `#c0392b` | `#a83a2e`（5.7:1） | |
| 公告栏标题 `#6b4c12` | `#5a4520`（8.5:1） | |
| 公告栏斜体 `#9a7d3a` | `#7d6231`（5.2:1） | |
| 关闭按钮 `#c9a94e` | `#8a7448`（4.2:1；该处只有 ✕ 字形，按图标 3:1 标准即可） | |

### 2.5 颜色使用约束

> **金色（`#b08d4f`）在浅底上的对比度只有 2.8:1，禁止用于正文字号以下的可读文字。**
> 金色只允许出现在：装饰细线、角标、图标、描边、分隔线。

可读文字只使用 `--text`、`--text-secondary`、`--text-muted`、`--primary`、`--accent-red`、`--accent-blue`（对比度分别为 12.0:1 / 6.3:1 / 4.9:1 / 7.2:1 / 5.7:1 / 5.3:1，均达标）。

**必须一并改造的三处「金色当文字用」**（现有代码已如此，换色后会不达标）：

| 位置 | 现状 | 改为 |
| --- | --- | --- |
| `index.html` 浮动条 `.strip-accent-orange .float-strip-text` | `color: var(--accent-orange)` | `color: var(--gold-text)` |
| 各分社页 `.member-tag` | `color: var(--accent)`（朗诵社即金色） | 文字统一改为 `--primary-dark`，背景保留该分社 accent 的淡色版以维持区分度 |
| `index.html` 公告栏正文与标题 | 暖黄文字（`#8b6914` 等） | 见 2.4 的映射表 |

---

## 3. 圆角

从"大圆角 + 胶囊"收敛为克制的矩形圆角。这是提升"高级感"最有效的一步 —— 20px 以上的圆角是移动端 App 的语言，印刷品与徽章不用它。

| 元素 | 旧值 | 新值 |
| --- | --- | --- |
| 卡片（`.card`、`.member-card`） | 20px / 18px | `--radius-lg` (14px) |
| 头像（`.member-avatar`） | 14px | `--radius-md` (11px) |
| 按钮（`.card-btn`、`.btn-all`、`.join-page-btn`、`.join-submit-btn`） | 40px 胶囊 | `--radius-sm` (8px) |
| 下拉菜单、公告栏、社训块、信息卡 | 16px / 20px | 12px |
| logo 标记 | 8px | 6px |
| 输入框 | 12px | 8px |

---

## 4. 阴影与描边

阴影从单层改为**双层**：近距离一层收住边缘、远距离一层提供扩散。颜色改用墨色的低透明度，而不是主色 —— 主色阴影会让整个页面泛蓝。

```css
--shadow-sm: 0 1px 2px rgba(22,50,74,.04), 0 2px 8px -2px rgba(22,50,74,.07);
--shadow-md: 0 2px 4px rgba(22,50,74,.045), 0 10px 24px -8px rgba(22,50,74,.13);
--shadow-lg: 0 2px 4px rgba(22,50,74,.045), 0 16px 34px -10px rgba(22,50,74,.20);
```

描边统一改为 `--border`（半透明墨色），悬停时转为 `--gold-line`。

---

## 5. 动效规格

所有过渡统一使用 `--ease`（`cubic-bezier(.22,1,.36,1)`），时长区间 320–550ms。禁止使用 `ease` 或 `linear`。

### 5.1 分社卡片（选定：描边亮起）

替换现有的"顶部色条撑满整块卡片"效果。现版本除观感粗暴外还有一个实现缺陷：`opacity` 未写入 `transition`，悬停瞬间色块会先跳变为淡色再展开。

```
默认态   描边 --border，阴影 --shadow-sm
悬停态   transform: translateY(-4px)
         border-color: --gold-line
         box-shadow: --shadow-lg
         图标 transform: scale(1.05)
         右上角浮现 19px 金色直角标记（border-top + border-right，1.5px）
             opacity 0 → 1，transform translate(-4px, 4px) → translate(0, 0)
             时长 450ms
```

金色角标是本方案的**签名元素**，呼应社徽的烫金描边。它只出现在悬停态，不参与静态布局。

### 5.2 按钮

应用于 `.card-btn`、`.btn-all`、`.join-page-btn`。

```
默认态   描边 var(--border)，文字 --primary，阴影 --shadow-sm
悬停态   background: --primary，color: #fff，border-color: --primary
         transform: translateY(-1.5px)
         box-shadow: 0 6px 16px -6px rgba(29,85,120,.55)
         内部箭头（`.btn-all-arrow`、`.card-btn span`）transform: translateX(3px)
按下态   transform: translateY(0) scale(.985)，阴影回到 --shadow-sm
```

### 5.3 社员条目（`.member-card`）

```
悬停态   transform: translateX(5px)      /* 保持现有方向 */
         border-color: --primary
         box-shadow: --shadow-md
         头像 transform: scale(1.08)，border-radius 转为圆形（保持现有行为）
```

### 5.4 导航与菜单

- 下拉菜单项悬停：背景 `--primary-light`，文字 `--primary`
- 下拉菜单容器：圆角 12px，阴影 `--shadow-lg`
- 顶栏滚动后的阴影改用 `--shadow-md`

### 5.5 社训块（签名元素的静态版本）

社训块顶部加入一条 46×2px 的金色渐变短线（`linear-gradient(90deg, transparent, var(--gold), transparent)`），作为签名元素在静态状态下的呼应。引号装饰的透明度提高到 `.16`，颜色转为金色。

### 5.6 粒子背景

`js/particles.js` 中的颜色数组与连线颜色同步替换：

```js
const colors = [
    'rgba(29,85,120,',    // 靛
    'rgba(44,107,143,',   // 靛蓝亮
    'rgba(20,63,92,',     // 靛深
    'rgba(168,58,46,',    // 朱红
    'rgba(176,141,79,'    // 金
];
```

`drawLines()` 中的连线颜色 `rgba(79,110,247,` 改为 `rgba(29,85,120,`。

### 5.7 侧边装饰与浮动条

- 侧边装饰的圆/菱形/点/十字：颜色从蓝紫系改为靛蓝与金
- 浮动条：背景改为 `rgba(255,254,251,.72)`，文字色对应各分社的新强调色

---

## 6. 无障碍

本次升级必须同时补齐以下状态，不能只有视觉变化：

1. **`:focus-visible`** — 所有可交互元素（`.card-btn`、`.btn-all`、`.menu-btn`、`.dropdown-item`、`.member-card-ellipsis`、`.announcement-close`、`.home-btn`）统一为：
   ```css
   outline: 2px solid var(--primary);
   outline-offset: 2px;
   ```
   使用 `:focus-visible` 而非 `:focus`，鼠标操作时不显示轮廓。

2. **对比度** — 正文与次要文字在各自背景上的对比度均需 ≥ 4.5:1（第 2.2 节已针对性调整）。

3. **`prefers-reduced-motion`** — 现有规则已覆盖全局动画与过渡时长，保持不动；粒子背景的 JS 层判断已在 `particles.js` 中实现。

4. **不依赖颜色传达信息** — 分社区分仍保留图标与文字名称，颜色只是辅助。

---

## 7. 影响文件

| 文件 | 改动内容 |
| --- | --- |
| `css/common.css` | 令牌全量替换、导航栏、菜单、页脚、按钮、无 JS 回退 |
| `css/effects.css` | 粒子容器（如需配合新底色微调） |
| `index.html` | 内联 CSS：hero、分社卡片、社员条目、社训块、公告栏、浮动条、侧边装饰 |
| `members/index.html` | 内联 CSS：页面标题、统计条、社员网格、侧边装饰 |
| `join.html` | 内联 CSS：加入卡片、表单控件 |
| `about/about.html` | 内联 CSS：信息卡、联系卡片 |
| `subgroups/cs/index.html` | `--accent` 与内联 CSS |
| `subgroups/langsong/index.html` | `--accent` 与内联 CSS |
| `subgroups/yingsuan/index.html` | `--accent` 与内联 CSS |
| `404.html` | 独立内联 CSS（该页不引用 common.css） |
| `js/particles.js` | 粒子配色 |

`js/site.js`、`js/subgroup-members.js`、`js/members-data.js` 无改动。HTML 结构无改动。

---

## 8. 验收标准

1. **无残留旧色**：全站不再出现 `#4f6ef7`、`#3b5de7`、`#eef1fe`、`rgba(79,110,247,`、`rgba(240,100,73,`、`rgba(245,166,35,`、`rgba(79,156,247,`、`rgba(59,93,231,`。
2. **结构零改动**：所有 HTML 的标签结构与文字内容与升级前逐字节一致（仅 `<style>` 块与已存在元素的 class 属性可变化）。
3. **交互状态完整**：全站每个可交互元素都具备 hover、active、focus-visible 三种可见状态。
4. **对比度**：正文、次要文字、弱化文字在各自实际背景上的对比度 ≥ 4.5:1。
5. **动效统一**：所有 `transition` 使用 `--ease`，不再出现裸 `ease` / `linear`。
6. **`prefers-reduced-motion: reduce` 下无动画**，粒子背景不启动渲染循环。
7. **响应式不回归**：768px 与 480px 两个断点下布局与升级前一致。

---

## 9. 不做的事

- 不引入 Web 字体。中文 Web 字体体积大，且 Google Fonts 在国内不稳定；改为精修现有系统字体栈。
- 不替换 emoji 图标。用户要求文字内容不变，emoji 属于内容；仅在 CSS 层优化其尺寸与对齐。
- 不改动 `about` 的 URL 形式（`/about/about.html`）。
- 不重构 HTML 结构或抽取内联 CSS。
