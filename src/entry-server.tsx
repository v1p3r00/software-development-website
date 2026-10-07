/**
 * Build-time renderer: scripts/prerender.mjs calls render() for every page and
 * writes the HTML into dist, so the first paint needs no JavaScript.
 * prerender() waits for lazy routes and data, unlike renderToString.
 */
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App';
import { LanguageProvider } from './i18n';
import { ThemeProvider } from './hooks/useTheme';

export async function render(url: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <ThemeProvider>
        <StaticRouter location={url}>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </StaticRouter>
      </ThemeProvider>
    </StrictMode>,
  );
  let html = '';
  for await (const chunk of prelude as unknown as AsyncIterable<string | Uint8Array>) html += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
  return html;
}
