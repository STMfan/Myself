import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './styles.css';
import './visuals.css';
import './cinematic.css';
import App from './App';

const root = document.getElementById('root')!;
const app = <React.StrictMode><App /></React.StrictMode>;
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app);
else ReactDOM.createRoot(root).render(app);
