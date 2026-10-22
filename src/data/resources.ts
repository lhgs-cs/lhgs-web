// 推荐学习资源
// 新增一条：在数组里追加一个对象即可，页面会按 category 自动分组。

export interface Resource {
  name: string;
  url: string;
  description: string;
  category: string;
  level?: string;
}

export const resources: Resource[] = [
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/zh-CN/',
    description: 'Web 标准最权威的参考文档，HTML / CSS / JavaScript 都能查',
    category: '前端',
    level: '入门到进阶',
  },
  {
    name: 'Hello 算法',
    url: 'https://www.hello-algo.com/',
    description: '开源免费的数据结构与算法教程，图文并茂，有动画演示',
    category: '算法与数据结构',
    level: '入门',
  },
  {
    name: 'CS50',
    url: 'https://cs50.harvard.edu/x/',
    description: '哈佛大学的计算机科学导论公开课，从零建立编程思维',
    category: '计算机基础',
    level: '入门',
  },
  {
    name: 'GitHub Skills',
    url: 'https://skills.github.com/',
    description: '在真实仓库里动手练习 Git 与 GitHub 的交互式课程',
    category: '工具与协作',
    level: '入门',
  },
  {
    name: 'Pro Git',
    url: 'https://git-scm.com/book/zh/v2',
    description: 'Git 官方推荐的书，中文版免费在线读，从基础到内部原理',
    category: '工具与协作',
    level: '进阶',
  },
];
