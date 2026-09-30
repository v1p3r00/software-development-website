import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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

applyInitialLang();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
