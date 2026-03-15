import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastNotification';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <App />
        </AppProvider>
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
