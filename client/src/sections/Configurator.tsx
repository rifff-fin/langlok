import { useId } from 'react';
import { configurator } from '../content/copy';
import { Button } from '../components/ui/Button';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { SlottedVessel } from '../components/SlottedVessel';
import { LOGO_SLOTS } from '../components/logoSlots';

const SWATCHES = {
  silver: 'var(--aluminium)',
  white: 'var(--paper)',
  navy: 'var(--ink)',
  custom: 'conic-gradient(var(--rain), var(--leaf), var(--sun), var(--monsoon), var(--rain))',
} as const;

/**
 * 05 Configurator. Phase 1: the full control layout as real, labelled form controls
 * with no behaviour. Phase 4 adds upload validation, the live CanvasTexture on the 3D
 * vessels, preview capture and the quote form.
 */
export function Configurator({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const id = useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <section
      id="configurator"
      aria-labelledby={`${id}-title`}
      className="scroll-mt-[var(--header-h)] py-[var(--section-y)]"
    >
      <Container>
        <ChapterHead n={configurator.chapter} label={configurator.eyebrow} />

        <div className="mt-12 grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-12 md:grid-cols-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <Heading id={`${id}-title`} className="text-[length:var(--text-h2)]">
              {configurator.title}
            </Heading>
            <p data-reveal="fade" className="mt-6 max-w-[44ch] text-slate">
              {configurator.intro}
            </p>

            <div className="mt-10 bg-cloud p-[clamp(16px,3vw,48px)]">
              <div className="mx-auto max-w-[340px]">
                <SlottedVessel
                  src="/img/mockups/can-front.jpeg"
                  alt={configurator.previewAlt}
                  width={579}
                  height={1024}
                  slot={LOGO_SLOTS.can}
                />
              </div>
              <p className="eyebrow mt-6 text-center text-slate">{configurator.rotateHint}</p>
            </div>
          </div>

          <form
            data-reveal="fade"
            className="col-span-4 space-y-9 md:col-span-6 lg:col-span-5"
            onSubmit={(e) => e.preventDefault()}
            aria-labelledby={`${id}-title`}
          >
            {/* Upload */}
            <div>
              <label htmlFor={`${id}-logo`} className="eyebrow block text-ink">
                {configurator.upload.label}
              </label>
              <label
                htmlFor={`${id}-logo`}
                className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-slate/60 bg-paper px-6 py-10 text-center transition-colors hover:border-rain-deep focus-within:border-rain-deep"
              >
                <span className="font-display text-2xl">+</span>
                <span className="text-sm text-slate">{configurator.upload.hint}</span>
                <input
                  id={`${id}-logo`}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  className="sr-only"
                />
              </label>
              <label htmlFor={`${id}-brand`} className="mt-5 block text-sm text-slate">
                {configurator.upload.orType}
              </label>
              <input
                id={`${id}-brand`}
                type="text"
                placeholder={configurator.brandNamePlaceholder}
                aria-label={configurator.brandNameLabel}
                className="field mt-2"
              />
            </div>

            {/* Vessel */}
            <fieldset>
              <legend className="eyebrow text-ink">{configurator.vessel.label}</legend>
              <div className="mt-3 grid grid-cols-3 border border-ink">
                {Object.entries(configurator.vessel.options).map(([value, label], i) => (
                  <label
                    key={value}
                    className={`flex min-h-12 cursor-pointer items-center justify-center px-2 text-center text-sm transition-colors has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-rain-deep ${
                      i > 0 ? 'border-l border-ink' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${id}-vessel`}
                      value={value}
                      defaultChecked={value === 'can'}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Background */}
            <fieldset>
              <legend className="eyebrow text-ink">{configurator.background.label}</legend>
              <div className="mt-3 flex flex-wrap gap-5">
                {Object.entries(configurator.background.options).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer flex-col items-center gap-2 text-sm text-slate"
                  >
                    <input
                      type="radio"
                      name={`${id}-bg`}
                      value={value}
                      defaultChecked={value === 'silver'}
                      className="peer sr-only"
                    />
                    <span
                      className="h-11 w-11 rounded-full border border-aluminium ring-offset-2 ring-offset-mist peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-rain-deep"
                      style={{ background: SWATCHES[value as keyof typeof SWATCHES] }}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <label htmlFor={`${id}-hex`} className="mt-5 block text-sm text-slate">
                {configurator.customHexLabel}
              </label>
              <input
                id={`${id}-hex`}
                type="text"
                inputMode="text"
                placeholder="#16233F"
                className="field mt-2 max-w-[12rem]"
              />
            </fieldset>

            {/* Size + position */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor={`${id}-size`} className="eyebrow block text-ink">
                  {configurator.logoSize}
                </label>
                <input
                  id={`${id}-size`}
                  type="range"
                  min={20}
                  max={100}
                  defaultValue={70}
                  className="mt-4 w-full accent-ink"
                />
              </div>
              <div>
                <label htmlFor={`${id}-pos`} className="eyebrow block text-ink">
                  {configurator.logoPosition}
                </label>
                <input
                  id={`${id}-pos`}
                  type="range"
                  min={-50}
                  max={50}
                  defaultValue={0}
                  className="mt-4 w-full accent-ink"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-aluminium pt-8">
              <Button variant="secondary">{configurator.savePreview}</Button>
              <Button href="/contact">{configurator.requestQuote}</Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
