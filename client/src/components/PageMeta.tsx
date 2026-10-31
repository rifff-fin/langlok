import { useEffect } from 'react';

/** Update a <meta> in <head>, or add it: there is only ever one of each. */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.content = content;
}

/**
 * Per-route <title> and description (copy from `meta` in content/copy.ts). index.html
 * carries the home page's, for link previews that don't run scripts; each route updates
 * those same tags rather than adding a second set.
 */
export function PageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title;
    setMeta('property', 'og:title', title);
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
  }, [title, description]);
  return null;
}
