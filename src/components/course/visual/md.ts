import { marked } from 'marked';

/** lesson Markdown → HTML; external links open in a new tab */
export function mdToHtml(text: string): string {
  return (marked.parse(text, { async: false }) as string).replace(
    /<a href="(https?:\/\/(?!softwaredevelopment\.hu)[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  );
}
