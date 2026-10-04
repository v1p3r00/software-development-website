import fs from 'node:fs';
import type { Plugin } from 'vite';
import { parseArticle, readingMinutes } from '../src/content/frontmatter.ts';

/**
 * `import x from './en.md?meta'` → { meta, minutes }: just the frontmatter and the
 * reading time, so the article list and search ship without every article's text
 * (the text is loaded on demand with `?raw`, see src/data/articles.ts).
 */
export function articleMeta(): Plugin {
  return {
    name: 'article-meta',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith('.md?meta')) return null;
      const file = id.slice(0, -'?meta'.length);
      this.addWatchFile(file);
      const { meta, body } = parseArticle(fs.readFileSync(file, 'utf8'));
      return `export default ${JSON.stringify({ meta, minutes: readingMinutes(body) })};`;
    },
  };
}
