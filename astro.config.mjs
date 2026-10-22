import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lianhegongshe.cn',
  build: {
    format: 'directory',
  },
  trailingSlash: 'ignore',
});
