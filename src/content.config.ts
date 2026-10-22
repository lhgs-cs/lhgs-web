import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 社内教程：src/content/tutorials/*.md
// 成员自己写的教程、笔记、经验总结
const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    draft: z.boolean().default(false),
    // 置顶：true 时排在列表最前
    pinned: z.boolean().default(false),
  }),
});

// 推荐学习资源：src/content/resources/*.md
// 和教程一样是成文的推荐理由，不是单纯的链接列表
const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    // 可选的外部链接（实体书、线下资源可以留空）
    link: z.string().optional(),
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
  }),
});

export const collections = { tutorials, resources };
