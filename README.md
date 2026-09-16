# 联合公社官网

本仓库为联合公社（Union Commune）官方网站的源代码。  
网站地址：[https://lianhegongshe.cn](https://lianhegongshe.cn)

## 项目简介

联合公社是由各学生社团组成的学生团体组织，旨在联合各分社，形成合力，共同进步。  
本网站用于展示公社简介、社训、组成分社、社员风采等信息，并为各分社独立页面提供入口，社员也可以在其上放置自己的个人主页。

## 技术栈

- 纯静态 HTML/CSS/JS，无构建步骤，克隆后直接打开 `index.html` 即可预览
- 部署于阿里云 ESA Pages
- 版本控制：Git + GitHub

## 项目结构

```
.
├── index.html                 首页（简介、社训、分社、社员预览、公告栏）
├── join.html                  加入我们
├── 404.html                   404 页面
├── favicon.png                站点图标
├── about/about.html           关于我们
├── members/index.html         全部社员
├── subgroups/                 各分社独立页面
│   ├── cs/                    计算机科学社
│   ├── langsong/              朗诵社
│   └── yingsuan/              硬算社
├── announcement/
│   └── announcement.md        首页公告内容（Markdown）
├── css/
│   ├── common.css             全站公共样式（变量、导航栏、菜单、页脚）
│   └── effects.css            粒子背景容器样式
├── js/
│   ├── members-data.js        社员数据（唯一数据源）
│   ├── particles.js           全站共用的粒子背景效果
│   ├── subgroup-members.js    分社页的社员列表渲染
│   └── site.js                全站公共脚本（页脚年份、导航栏、滚动淡入）
└── images/                    社徽与社员头像
```

## 常见维护操作

| 想做什么 | 改哪里 |
| --- | --- |
| 新增 / 修改社员 | 只改 `js/members-data.js`。首页预览、全部社员页、各分社页都会自动更新 |
| 更新首页公告 | 改 `announcement/announcement.md`。内容一变，之前点过「关闭」的访客会重新看到 |
| 更新分社简介 | 首页卡片文案在 `index.html`，分社页详情在 `subgroups/<分社>/index.html` |
| 更换社员头像 | 放入 `images/members/`，保持正方形，建议边长不超过 400px、体积不超过 30 KB |
| 调整粒子效果 | 只改 `js/particles.js`，全站页面同步生效 |
| 新增一个分社 | 新建 `subgroups/<id>/index.html`（可复制现有分社页），并在 `js/members-data.js` 中使用相同的 `<id>` |

### 社员数据格式

```js
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

## 维护与贡献

本网站由联合公社技术小组维护。  
**主要搭建与维护者：**

- 光明与尘埃（GitHub: @gmyca）
- C0（GitHub: @imxilin）

欢迎通过 Pull Request 或 Issue 提出建议。

如有疑问或需要协助，请联系上述维护者。
