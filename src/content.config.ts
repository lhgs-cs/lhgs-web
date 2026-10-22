import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 社内教程：src/content/tutorials/*.md
// 新增一篇教程只需放一个 .md 文件进来，列表页与详情页会自动生成。
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
