import { meta, notFound } from '../content/copy';
import { PageMeta } from '../components/PageMeta';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Eyebrow } from '../components/ui/Eyebrow';

export function NotFound() {
  return (
    <>
      <PageMeta {...meta.notFound} />
      <Container className="flex min-h-svh flex-col justify-center pt-[var(--header-h)]">
        <Eyebrow className="text-slate">{notFound.eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-[14ch] text-[length:var(--text-h2)]">{notFound.title}</h1>
        <p className="mt-6 text-slate">{notFound.body}</p>
        <Button href={notFound.back.href} className="mt-10 self-start">
          {notFound.back.label}
        </Button>
      </Container>
    </>
  );
}
