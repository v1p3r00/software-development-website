// Code lab for the course sandbox: React 19 + a JSX/TypeScript compiler (Sucrase).
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import { transform } from 'sucrase';

window.React = React;
window.ReactDOM = { ...ReactDOM, ...ReactDOMClient };
/** strips TypeScript and turns JSX into React.createElement calls */
window.compileCode = (code, kind) =>
  transform(code, {
    transforms: kind === 'react' ? ['typescript', 'jsx'] : ['typescript'],
    jsxRuntime: 'classic',
    production: true,
    disableESTransforms: true,
  }).code;
