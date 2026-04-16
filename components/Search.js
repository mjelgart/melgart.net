import { useEffect, useRef, useState } from 'react';
import styles from './Search.module.css';

export default function Search() {
  const searchRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPagefind() {
      try {
        // Dynamically import Pagefind only on the client side and in production builds
        if (typeof window !== 'undefined') {
          // Use dynamic script injection to avoid Next.js compile-time module resolution
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/pagefind/pagefind-ui.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/pagefind/pagefind-ui.css';
          document.head.appendChild(link);

          // Create search interface
          if (searchRef.current && window.PagefindUI) {
            new window.PagefindUI({
              element: searchRef.current,
              showImages: false,
              showSubResults: true,
              translations: {
                placeholder: "Search blog posts...",
                clear_search: "Clear",
                load_more: "Load more results",
                search_label: "Search this site",
                filters_label: "Filters",
                zero_results: "No results for [SEARCH_TERM]",
                many_results: "[COUNT] results for [SEARCH_TERM]",
                one_result: "[COUNT] result for [SEARCH_TERM]",
                alt_search: "No results for [SEARCH_TERM]. Showing results for [DIFFERENT_TERM] instead",
                search_suggestion: "No results for [SEARCH_TERM]. Try one of the following searches:",
                searching: "Searching..."
              }
            });
            setIsLoaded(true);
          }
        }
      } catch (err) {
        // In development mode, Pagefind won't be available
        setError('Search functionality is available only in production builds.');
        console.log('Pagefind not available:', err.message);
      }
    }

    loadPagefind();
  }, []);

  return (
    <div className={styles.searchContainer}>
      <div ref={searchRef} className={styles.searchWidget}>
        {!isLoaded && !error && (
          <div className={styles.searchPlaceholder}>
            <input
              type="text"
              placeholder="Search blog posts..."
              disabled
              className={styles.placeholderInput}
            />
            <small className={styles.loadingText}>Loading search...</small>
          </div>
        )}
        {error && (
          <div className={styles.searchPlaceholder}>
            <input
              type="text"
              placeholder="Search blog posts..."
              disabled
              className={styles.placeholderInput}
            />
            <small className={styles.errorText}>{error}</small>
          </div>
        )}
      </div>
    </div>
  );
}