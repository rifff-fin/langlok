import { Helmet } from 'react-helmet-async';

/** Per-route <title> and description. Copy comes from `meta` in content/copy.ts. */
export function PageMeta({ title, description }: { title: string; description?: string }) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  );
}
