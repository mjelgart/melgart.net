import '../styles/global.css';

// Import Pagefind CSS (only available after build)
if (typeof window !== 'undefined') {
  import('pagefind/pagefind-ui.css').catch(() => {
    // Silently fail in development mode where Pagefind isn't available
  });
}

export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
  }