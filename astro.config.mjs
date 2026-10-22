import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lianhegongshe.cn',
  build: {
    // 保留 Astro 默认的 'directory'：*/index.astro 产出 */index.html，
    // 这样 /members/、/subgroups/cs/ 这些已分享的目录式 URL 不受影响。
    format: 'directory',
  },
  trailingSlash: 'ignore',
});
