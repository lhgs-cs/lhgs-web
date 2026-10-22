import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lianhegongshe.cn',
  build: {
    // 'file' 产出 foo.html 而非 foo/index.html，
    // 这样 /about/about.html 这类带扩展名的旧链接才能原样保留；
    // 而 */index.astro 仍会产出 */index.html，/members/ 等目录式 URL 不受影响。
    format: 'file',
  },
  trailingSlash: 'ignore',
});
