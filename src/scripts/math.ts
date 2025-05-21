// Assume MathJax will be dynamically loaded

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MathJax: any;
  }
}

// Define MathJax configuration
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
  },
  startup: {
    ready: () => {
      console.log('MathJax is ready.');
      window.MathJax.startup.defaultReady();
    },
  },
};

// Create a reusable promise for loading MathJax
let mathJaxPromise: Promise<void> | null = null;

export function initializeMathJax(): Promise<void> {
  if (!mathJaxPromise) {
    mathJaxPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/tex-chtml-full.js';
      script.async = true;
      script.onload = () => {
        console.log('MathJax script loaded.');
        resolve();
      };
      script.onerror = (err) => {
        console.error('Failed to load MathJax script:', err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  }
  return mathJaxPromise;
}
