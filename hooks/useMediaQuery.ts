import { useEffect, useState } from 'react';

/**
 * A custom hook that listens for changes to a media query and returns whether it matches.
 * @param query - The media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a MediaQueryList object
    const media = window.matchMedia(query);

    // Set the initial value
    setMatches(media.matches);

    // Define a listener function to update state when the query changes
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Add the listener to the media query
    media.addEventListener('change', listener);

    // Clean up: remove the listener when the component unmounts or query changes
    return () => media.removeEventListener('change', listener);
  }, [query]); // Re-run effect if query changes

  return matches;
}