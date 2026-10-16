import { useId } from 'react';
import { inquiryForm } from '../content/copy';
import { Button } from './ui/Button';

type InquiryType = 'branding' | 'samples' | 'recan' | 'contact';

/**
 * Inquiry form layout (fields from master plan §8.2). Phase 1: static, submit disabled.
 * Phase 4/6: react-hook-form + shared zod schema, honeypot, Turnstile, POST /api/inquiries.
 */
export function InquiryForm({ type, heading }: { type: InquiryType; heading?: string }) {
  const id = useId();
  const f = inquiryForm.fields;
  const field = (name: string) => `${id}-${name}`;

  return (
    <form
      aria-labelledby={`${id}-heading`}
      className="grid gap-x-6 gap-y-6 sm:grid-cols-2"
      onSubmit={(e) => e.preventDefault()}
      data-inquiry-type={type}
    >
      <h2 id={`${id}-heading`} className="text-[length:var(--text-h3)] sm:col-span-2">
        {heading ?? inquiryForm.heading}
      </h2>

      <Text id={field('name')} label={f.name} autoComplete="name" required />
      <Text id={field('company')} label={f.company} autoComplete="organization" required />
      <Text id={field('email')} label={f.email} type="email" autoComplete="email" required />
      <Text id={field('phone')} label={f.phone} type="tel" autoComplete="tel" />
      <Text id={field('country')} label={f.country} autoComplete="country-name" required />

      <div>
        <label htmlFor={field('business')} className="eyebrow block text-ink">
          {f.businessType}
        </label>
        <select id={field('business')} className="field mt-2" defaultValue="hotel">
          {Object.entries(inquiryForm.businessTypes).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={field('product')} className="eyebrow block text-ink">
          {f.product}
        </label>
        <select id={field('product')} className="field mt-2" defaultValue="can500">
          {Object.entries(inquiryForm.products).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Text id={field('qty')} label={f.quantityEstimate} placeholder={f.quantityPlaceholder} />

      <div className="sm:col-span-2">
        <label htmlFor={field('message')} className="eyebrow block text-ink">
          {f.message}
        </label>
        <textarea id={field('message')} rows={5} className="field mt-2 resize-y" />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate sm:col-span-2">
        <input type="checkbox" required className="mt-1 h-4 w-4 accent-ink" />
        {f.consent}
      </label>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Button type="submit" disabled>
          {inquiryForm.submit}
        </Button>
        <p className="text-sm text-slate">{inquiryForm.pendingNote}</p>
      </div>
    </form>
  );
}

function Text({
  id,
  label,
  type = 'text',
  ...rest
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-ink">
        {label}
      </label>
      <input id={id} type={type} className="field mt-2" {...rest} />
    </div>
  );
}
