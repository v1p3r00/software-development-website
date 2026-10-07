import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './i18n';
import { applyInitialLang } from './i18n/initialUrl';
import { ThemeProvider } from './hooks/useTheme';
import '@fontsource-variable/archivo';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/caveat/500.css';
import './index.css';

const moved = applyInitialLang();

const app = (
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

// pages are prerendered at build time (scripts/prerender.ts): pick up that HTML
// instead of rebuilding it — unless the address just changed (a returning
// Hungarian visitor sent from / to /hu/), when the markup no longer matches
const root = document.getElementById('root')!;
if (root.firstElementChild && !moved) hydrateRoot(root, app);
else {
  root.textContent = '';
  createRoot(root).render(app);
}
