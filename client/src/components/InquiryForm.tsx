import { useEffect, useId, type ReactNode } from 'react';
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStore } from 'zustand';
import { configurator, inquiryForm } from '../content/copy';
import { inquirySchema, productFor, type Inquiry, type InquiryType } from '../lib/inquiry';
import { configStore } from '../store/configurator';
import { Button } from './ui/Button';

/**
 * Inquiry form (fields from master plan §8.2), validated with the shared zod schema as the
 * visitor goes. On /custom-branding it is the quote form: it shows the configurator's
 * design (the saved preview, the logo or brand name, the vessel), which will be attached,
 * and takes its product from the vessel chosen there. Sending arrives with the API in
 * Phase 6 (POST /api/inquiries with the logo and preview); until then submit stays off.
 */
export function InquiryForm({
  type,
  heading,
  anchor,
}: {
  type: InquiryType;
  heading?: string;
  /** Element id, for links straight to the form (e.g. #quote). */
  anchor?: string;
}) {
  const id = useId();
  const f = inquiryForm.fields;
  const config = useStore(configStore);
  const design = type === 'branding' && config.touched ? config : null;

  const {
    register,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm<Inquiry>({
    resolver: zodResolver(inquirySchema),
    mode: 'onTouched',
    defaultValues: {
      type,
      name: '',
      company: '',
      email: '',
      phone: '',
      country: '',
      businessType: 'hotel',
      product: type === 'branding' ? productFor(config.vessel) : 'can500',
      quantityEstimate: '',
      message: '',
      consent: false,
    },
  });

  // follow the configurator's vessel until the visitor picks a product here
  useEffect(() => {
    if (type === 'branding' && !getFieldState('product').isDirty) {
      setValue('product', productFor(config.vessel));
    }
  }, [type, config.vessel, getFieldState, setValue]);

  // TODO(Phase 6): POST /api/inquiries (multipart, with design?.logo.file and the preview)
  const send = () => undefined;

  const field = (name: string) => `${id}-${name}`;

  return (
    <form
      id={anchor}
      aria-labelledby={`${id}-heading`}
      className="grid scroll-mt-[calc(var(--header-h)+1.5rem)] gap-x-6 gap-y-6 sm:grid-cols-2"
      onSubmit={handleSubmit(send)}
      noValidate
      data-inquiry-type={type}
    >
      <h2 id={`${id}-heading`} className="text-[length:var(--text-h3)] sm:col-span-2">
        {heading ?? inquiryForm.heading}
      </h2>

      {design && (
        <div className="flex flex-col gap-5 border border-aluminium bg-paper p-5 sm:col-span-2 sm:flex-row sm:items-start">
          {design.preview && (
            <img
              src={design.preview.url}
              alt={inquiryForm.design.previewAlt}
              className="h-36 w-auto self-start border border-aluminium/60 object-contain"
            />
          )}
          <div className="min-w-0">
            <p className="eyebrow text-ink">{inquiryForm.design.heading}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {design.logo ? (
                <Row term={inquiryForm.design.logo}>{design.logo.file.name}</Row>
              ) : design.brandName.trim() ? (
                <Row term={inquiryForm.design.brandName}>{design.brandName}</Row>
              ) : null}
              <Row term={inquiryForm.design.vessel}>
                {configurator.vessel.options[design.vessel]}
              </Row>
            </dl>
            <p className="mt-3 text-sm text-slate">{inquiryForm.design.note}</p>
            <a
              href="#configurator"
              className="mt-2 inline-block text-sm text-rain-deep underline-offset-4 hover:underline"
            >
              {inquiryForm.design.edit}
            </a>
          </div>
        </div>
      )}

      <Text
        id={field('name')}
        label={f.name}
        autoComplete="name"
        required
        error={errors.name}
        {...register('name')}
      />
      <Text
        id={field('company')}
        label={f.company}
        autoComplete="organization"
        required
        error={errors.company}
        {...register('company')}
      />
      <Text
        id={field('email')}
        label={f.email}
        type="email"
        autoComplete="email"
        required
        error={errors.email}
        {...register('email')}
      />
      <Text
        id={field('phone')}
        label={f.phone}
        type="tel"
        autoComplete="tel"
        error={errors.phone}
        {...register('phone')}
      />
      <Text
        id={field('country')}
        label={f.country}
        autoComplete="country-name"
        required
        error={errors.country}
        {...register('country')}
      />

      <div>
        <label htmlFor={field('business')} className="eyebrow block text-ink">
          {f.businessType}
        </label>
        <select id={field('business')} className="field mt-2" {...register('businessType')}>
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
        <select id={field('product')} className="field mt-2" {...register('product')}>
          {Object.entries(inquiryForm.products).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Text
        id={field('qty')}
        label={f.quantityEstimate}
        placeholder={f.quantityPlaceholder}
        error={errors.quantityEstimate}
        {...register('quantityEstimate')}
      />

      <div className="sm:col-span-2">
        <label htmlFor={field('message')} className="eyebrow block text-ink">
          {f.message}
        </label>
        <textarea
          id={field('message')}
          rows={5}
          className="field mt-2 resize-y"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${field('message')}-error` : undefined}
          {...register('message')}
        />
        <FieldMessage id={`${field('message')}-error`} error={errors.message} />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-slate">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-ink"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${field('consent')}-error` : undefined}
            {...register('consent')}
          />
          {f.consent}
        </label>
        <FieldMessage id={`${field('consent')}-error`} error={errors.consent} />
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Button type="submit" disabled>
          {inquiryForm.submit}
        </Button>
        <p className="text-sm text-slate">{inquiryForm.pendingNote}</p>
      </div>
    </form>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-slate">{term}</dt>
      <dd className="min-w-0 truncate text-ink">{children}</dd>
    </>
  );
}

function FieldMessage({ id, error }: { id: string; error?: FieldError }) {
  if (!error?.message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-ink">
      {error.message}
    </p>
  );
}

function Text({
  id,
  label,
  type = 'text',
  error,
  ...rest
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  error?: FieldError;
} & UseFormRegisterReturn) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="field mt-2"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      <FieldMessage id={`${id}-error`} error={error} />
    </div>
  );
}
