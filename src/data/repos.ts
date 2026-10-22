// GitHub 组织与仓库
// 手工维护，不调用 GitHub API：未认证接口限速 60 次/小时，
// 构建时失败会导致整站无法部署，而这里的内容更新频率极低。

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
    description: '联合公社官网的源代码，基于 Astro 构建',
    language: 'Astro',
    topics: ['website', 'astro', 'github-pages'],
  },
];
