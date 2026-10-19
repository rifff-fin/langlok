import {
  lazy,
  Suspense,
  useId,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLenis } from 'lenis/react';
import { useStore } from 'zustand';
import { configurator } from '../content/copy';
import { Button } from '../components/ui/Button';
import { ChapterHead } from '../components/ui/ChapterHead';
import { Container } from '../components/ui/Container';
import { Emph } from '../components/ui/Emph';
import { VesselPlate } from '../components/VesselPlate';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { hasWebGL } from '../lib/webgl';
import {
  capture,
  configStore,
  configView,
  normaliseHex,
  resetDesign,
  resetView,
  setDesign,
  setPreview,
  setVesselChoice,
  showsVessel,
  turnView,
  type Background,
  type BrandFont,
  type VesselChoice,
} from '../store/configurator';
import spec from '../three/vesselSpec.json';

// Without WebGL the preview is the flat printed label (its own chunk).
const FlatPreview = lazy(() => import('../configurator/FlatPreview'));

type Group = keyof typeof configurator.groups;
const GROUPS = Object.keys(configurator.groups) as Group[];

const SWATCHES: Record<Background, string> = {
  silver: 'var(--aluminium)',
  white: 'var(--paper)',
  navy: 'var(--ink)',
  custom: 'conic-gradient(var(--rain), var(--leaf), var(--sun), var(--monsoon), var(--rain))',
};

/** Degrees the preview is turned, -180..180 (positive: the front turned to the right). */
const yawDegrees = () => {
  const deg = Math.round((configView.yaw * 180) / Math.PI);
  return ((((deg + 180) % 360) + 360) % 360) - 180;
};

const valueText = (deg: number) =>
  deg === 0
    ? configurator.rotate.front
    : (deg > 0 ? configurator.rotate.right : configurator.rotate.left).replace(
        '{deg}',
        String(Math.abs(deg)),
      );

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 05 Configurator. The visitor's logo (or brand name) on the live 3D can and bottle: the
 * vessel glides in from section 04 and stands in the stage, wearing the design as it is
 * edited (store/configurator.ts → three/labels.ts). Drag or use the arrow keys to turn it.
 * "Save preview" exports the 3D view as a PNG; "Request a quote" takes the design to the
 * inquiry form on /custom-branding. Phones get the controls as tabs under the stage, so the
 * vessel stays in view while they change it. Without WebGL the stage shows the flat label.
 */
export function Configurator({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const id = useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const s = useStore(configStore);
  const compact = useMediaQuery('(max-width: 767.98px)');
  const touch = useMediaQuery('(pointer: coarse)');
  const [tab, setTab] = useState<Group>('logo');
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [hexText, setHexText] = useState(s.hex);
  const [yaw, setYaw] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const webgl = hasWebGL();
  const lenis = useLenis();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const u = configurator.upload;

  /* ---------------------------------------------------------------- logo */

  const readFile = async (picked: File | undefined) => {
    if (!picked) return;
    setError(null);
    setReading(true);
    setStatus(u.reading);
    try {
      const { readLogo } = await import('../configurator/upload');
      setDesign({ logo: await readLogo(picked) });
      setStatus('');
    } catch (e) {
      const code = (e as { code?: string }).code as keyof typeof u.errors | undefined;
      setError(u.errors[code && code in u.errors ? code : 'read']);
      setStatus('');
    } finally {
      setReading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropping(false);
    void readFile(e.dataTransfer.files[0]);
  };

  /* ---------------------------------------------------------------- the stage */

  const syncYaw = () => setYaw(yawDegrees());

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    turnView((e.clientX - d.x) * 0.012, (e.clientY - d.y) * 0.004);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    syncYaw();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = Math.PI / 12;
    switch (e.key) {
      case 'ArrowLeft':
        turnView(-step, 0);
        break;
      case 'ArrowRight':
        turnView(step, 0);
        break;
      case 'ArrowUp':
        turnView(0, -0.08);
        break;
      case 'ArrowDown':
        turnView(0, 0.08);
        break;
      case '+':
      case '=':
        setDesign({ size: Math.min(100, s.size + 5) });
        break;
      case '-':
      case '_':
        setDesign({ size: Math.max(20, s.size - 5) });
        break;
      case '0':
      case 'Home':
        resetView();
        break;
      default:
        return;
    }
    e.preventDefault();
    syncYaw();
  };

  /** Scroll the stage fully into view (the 3D only draws inside the viewport). */
  const showStage = async (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const header =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    if (r.top >= header && r.bottom <= window.innerHeight) return;
    const y = r.top + window.scrollY + r.height / 2 - window.innerHeight / 2 - header / 2;
    if (lenis) lenis.scrollTo(y, { duration: 0.8 });
    else window.scrollTo({ top: y });
    await new Promise((done) => setTimeout(done, lenis ? 1100 : 450));
  };

  const savePreview = async (keep: boolean) => {
    setSaving(true);
    setStatus(configurator.saving);
    try {
      let blob: Blob | null = null;
      const ready = document.documentElement.dataset.webgl === 'ready';
      if (webgl && ready && capture.fn && stage.current) {
        await showStage(stage.current);
        blob = await capture.fn(stage.current.getBoundingClientRect());
      } else {
        const { flatPng } = await import('../configurator/flat');
        blob = await flatPng(s.vessel === 'bottle' ? 'bottle' : 'can');
      }
      if (!blob) throw new Error('no preview');
      setPreview(blob);
      if (keep) download(blob, configurator.previewFile);
      setStatus(keep ? configurator.saved : '');
    } catch {
      setStatus('');
    } finally {
      setSaving(false);
    }
  };

  const requestQuote = async () => {
    if (s.touched && !configStore.getState().preview) await savePreview(false);
    if (pathname === '/custom-branding') {
      const form = document.getElementById('quote');
      if (form && lenis) lenis.scrollTo(form, { offset: -96 });
      else form?.scrollIntoView();
    } else {
      navigate('/custom-branding#quote');
    }
  };

  const startOver = () => {
    resetDesign();
    setHexText(configStore.getState().hex);
    setError(null);
    setStatus('');
    syncYaw();
  };

  /* ---------------------------------------------------------------- layout */

  // Both vessels share one scale (the bottle sets it), so they stand at true relative size.
  const plateH = 'calc(var(--stage-h) * 0.88)';
  const canH =
    s.vessel === 'both'
      ? `calc(var(--stage-h) * 0.88 * ${spec.can.frame.h / spec.bottle.frame.h})`
      : plateH;
  const shown = (['can', 'bottle'] as const).filter((v) => showsVessel(s.vessel, v));

  const groups: Record<Group, ReactNode> = {
    logo: (
      <div className="space-y-5">
        <div>
          <label htmlFor={`${id}-logo`} className="eyebrow block text-ink">
            {u.label}
          </label>
          <label
            htmlFor={`${id}-logo`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={onDrop}
            className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed bg-paper px-6 py-7 text-center transition-colors focus-within:border-rain-deep hover:border-rain-deep md:py-9 ${
              dropping ? 'border-rain-deep' : 'border-slate/60'
            }`}
          >
            <span className="font-display text-2xl leading-none" aria-hidden="true">
              +
            </span>
            <span className="text-sm text-slate">{dropping ? u.drop : u.hint}</span>
            <input
              ref={file}
              id={`${id}-logo`}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              className="sr-only"
              disabled={reading}
              onChange={(e) => {
                void readFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-ink">
              {error}
            </p>
          )}
          {s.logo && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate">
              <span className="min-w-0 truncate">
                {u.current} <span className="text-ink">{s.logo.file.name}</span>
              </span>
              <button
                type="button"
                className="text-rain-deep underline-offset-4 hover:underline"
                onClick={() => file.current?.click()}
              >
                {u.replace}
              </button>
              <button
                type="button"
                className="text-rain-deep underline-offset-4 hover:underline"
                onClick={() => setDesign({ logo: null })}
              >
                {u.remove}
              </button>
              {s.logo.keyed && <p className="w-full">{u.keyed}</p>}
            </div>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-brand`} className="block text-sm text-slate">
            {u.orType}
          </label>
          <input
            id={`${id}-brand`}
            data-brand-name
            type="text"
            maxLength={40}
            autoComplete="organization"
            value={s.brandName}
            onChange={(e) => setDesign({ brandName: e.target.value })}
            placeholder={configurator.brandNamePlaceholder}
            aria-label={configurator.brandNameLabel}
            aria-describedby={s.logo && s.brandName ? `${id}-using-logo` : undefined}
            className="field mt-2"
          />
          {s.logo && s.brandName && (
            <p id={`${id}-using-logo`} className="mt-2 text-sm text-slate">
              {u.usingLogo}
            </p>
          )}
        </div>

        <fieldset disabled={!!s.logo}>
          <legend className="eyebrow text-ink">{configurator.font.label}</legend>
          <Segmented
            name={`${id}-font`}
            value={s.font}
            options={configurator.font.options}
            onChange={(font) => setDesign({ font: font as BrandFont })}
            fontFor={(v) => (v === 'serif' ? 'font-display italic' : 'font-sans')}
          />
        </fieldset>
      </div>
    ),
    vessel: (
      <fieldset>
        <legend className="eyebrow text-ink">{configurator.vessel.label}</legend>
        <Segmented
          name={`${id}-vessel`}
          value={s.vessel}
          options={configurator.vessel.options}
          onChange={(v) => setVesselChoice(v as VesselChoice)}
        />
      </fieldset>
    ),
    colour: (
      <fieldset>
        <legend className="eyebrow text-ink">{configurator.background.label}</legend>
        <div className="mt-3 flex flex-wrap gap-5">
          {(Object.keys(configurator.background.options) as Background[]).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer flex-col items-center gap-2 text-sm text-slate"
            >
              <input
                type="radio"
                name={`${id}-bg`}
                value={value}
                checked={s.background === value}
                onChange={() => setDesign({ background: value })}
                className="peer sr-only"
              />
              <span
                className="h-11 w-11 rounded-full border border-aluminium ring-offset-2 ring-offset-mist peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-rain-deep"
                style={{
                  background:
                    value === 'custom' && s.background === 'custom' ? s.hex : SWATCHES[value],
                }}
              />
              {configurator.background.options[value]}
            </label>
          ))}
        </div>
        {s.background === 'custom' && (
          <div className="mt-5 flex items-end gap-3">
            <div className="max-w-[12rem] flex-1">
              <label htmlFor={`${id}-hex`} className="block text-sm text-slate">
                {configurator.customHexLabel}
              </label>
              <input
                id={`${id}-hex`}
                type="text"
                spellCheck={false}
                value={hexText}
                onChange={(e) => {
                  setHexText(e.target.value);
                  const hex = normaliseHex(e.target.value);
                  if (hex) setDesign({ hex });
                }}
                placeholder="#2F7FC1"
                className="field mt-2 uppercase"
              />
            </div>
            <input
              type="color"
              aria-label={configurator.customPickerLabel}
              value={s.hex}
              onChange={(e) => {
                setHexText(e.target.value);
                setDesign({ hex: e.target.value });
              }}
              className="h-12 w-12 cursor-pointer border border-aluminium bg-paper p-1"
            />
          </div>
        )}
      </fieldset>
    ),
    size: (
      <div className="grid gap-6 sm:grid-cols-2">
        <Range
          id={`${id}-size`}
          label={configurator.logoSize}
          min={20}
          max={100}
          value={s.size}
          onChange={(size) => setDesign({ size })}
        />
        <Range
          id={`${id}-pos`}
          label={configurator.logoPosition}
          min={-50}
          max={50}
          value={s.position}
          onChange={(position) => setDesign({ position })}
        />
      </div>
    ),
  };

  return (
    <section
      id="configurator"
      data-nav="/custom-branding"
      aria-labelledby={`${id}-title`}
      className="scroll-mt-[var(--header-h)] py-[var(--section-y)]"
    >
      <Container>
        <ChapterHead n={configurator.chapter} label={configurator.eyebrow} />

        <div className="mt-12 grid grid-cols-4 gap-x-[var(--grid-gap)] gap-y-10 md:grid-cols-12 md:gap-y-12">
          <div className="col-span-4 md:col-span-5 md:row-start-1">
            <Heading id={`${id}-title`} className="text-[length:var(--text-h2)]">
              <Emph text={configurator.title} />
            </Heading>
            <p data-reveal="fade" className="mt-6 max-w-[44ch] text-slate">
              {configurator.intro}
            </p>
          </div>

          {/* The stage: the live vessels stand here (sticky on wide screens). */}
          <div className="@container col-span-4 md:col-span-6 md:col-start-7 md:row-span-3 md:row-start-1">
            <div className="[--stage-h:min(46svh,125cqw)] md:sticky md:top-[calc(50svh-var(--stage-h)/2)] md:[--stage-h:min(76svh,740px,125cqw)]">
              {webgl ? (
                <>
                  <div
                    ref={stage}
                    data-config-stage
                    role="slider"
                    tabIndex={0}
                    aria-label={configurator.rotate.label}
                    aria-valuemin={-180}
                    aria-valuemax={180}
                    aria-valuenow={yaw}
                    aria-valuetext={valueText(yaw)}
                    aria-describedby={`${id}-shows ${id}-keys`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerEnd}
                    onPointerCancel={onPointerEnd}
                    onDoubleClick={() => {
                      resetView();
                      syncYaw();
                    }}
                    onKeyDown={onKeyDown}
                    className="relative flex h-[var(--stage-h)] cursor-grab touch-pan-y items-center justify-center gap-[var(--grid-gap)] border border-aluminium/70 outline-none select-none focus-visible:border-rain-deep active:cursor-grabbing"
                  >
                    {shown.map((v) => (
                      <VesselPlate
                        key={v}
                        vessel={v}
                        anchor={v === 'can' ? 'config-can' : 'config-bottle'}
                        label="yourlogo"
                        alt=""
                        height={v === 'can' ? canH : plateH}
                      />
                    ))}
                  </div>
                  <p className="eyebrow mt-4 text-center text-slate" aria-hidden="true">
                    {touch ? configurator.rotateHintTouch : configurator.rotateHint}
                  </p>
                  <p id={`${id}-shows`} className="sr-only">
                    {shown.map((v) => configurator.previewAlt[v]).join('. ')}
                  </p>
                  <p id={`${id}-keys`} className="sr-only">
                    {configurator.rotate.keys}
                  </p>
                </>
              ) : (
                <div
                  ref={stage}
                  data-config-stage
                  className="h-[var(--stage-h)] border border-aluminium/70"
                >
                  <Suspense fallback={null}>
                    <FlatPreview />
                  </Suspense>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-4 md:col-span-5 md:row-start-2">
            {compact && (
              <div
                role="tablist"
                aria-label={configurator.groupsLabel}
                className="mb-6 grid grid-cols-4 border-b border-aluminium"
                onKeyDown={(e) => {
                  const i = GROUPS.indexOf(tab);
                  const next =
                    e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
                  if (next === null) return;
                  const g = GROUPS[(next + GROUPS.length) % GROUPS.length];
                  setTab(g);
                  document.getElementById(`${id}-tab-${g}`)?.focus();
                }}
              >
                {GROUPS.map((g) => (
                  <button
                    key={g}
                    id={`${id}-tab-${g}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === g}
                    aria-controls={`${id}-panel-${g}`}
                    tabIndex={tab === g ? 0 : -1}
                    onClick={() => setTab(g)}
                    className={`eyebrow -mb-px min-h-12 border-b-2 text-[0.7rem] transition-colors ${
                      tab === g ? 'border-ink text-ink' : 'border-transparent text-slate'
                    }`}
                  >
                    {configurator.groups[g]}
                  </button>
                ))}
              </div>
            )}
            <form
              aria-labelledby={`${id}-title`}
              className="space-y-9"
              onSubmit={(e) => e.preventDefault()}
            >
              {GROUPS.map((g) => (
                <div
                  key={g}
                  id={`${id}-panel-${g}`}
                  role={compact ? 'tabpanel' : undefined}
                  aria-labelledby={compact ? `${id}-tab-${g}` : undefined}
                  hidden={compact && tab !== g}
                >
                  {groups[g]}
                </div>
              ))}
            </form>
          </div>

          <div className="col-span-4 md:col-span-5 md:row-start-3">
            <div className="flex flex-wrap items-center gap-4 border-t border-aluminium pt-8">
              <Button variant="secondary" onClick={() => void savePreview(true)} disabled={saving}>
                {configurator.savePreview}
              </Button>
              <Button onClick={() => void requestQuote()} disabled={saving}>
                {configurator.requestQuote}
              </Button>
              {s.touched && (
                <Button variant="quiet" onClick={startOver}>
                  {configurator.reset}
                </Button>
              )}
            </div>
            <p role="status" className="mt-4 min-h-6 text-sm text-slate">
              {status}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** A row of radio buttons drawn as one segmented control. */
function Segmented({
  name,
  value,
  options,
  onChange,
  fontFor,
}: {
  name: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
  fontFor?: (value: string) => string;
}) {
  const entries = Object.entries(options);
  return (
    <div
      className="mt-3 grid border border-ink"
      style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}
    >
      {entries.map(([v, label], i) => (
        <label
          key={v}
          className={`flex min-h-12 cursor-pointer items-center justify-center px-2 text-center text-sm transition-colors has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-rain-deep has-disabled:cursor-not-allowed has-disabled:opacity-50 ${
            i > 0 ? 'border-l border-ink' : ''
          } ${fontFor?.(v) ?? ''}`}
        >
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </div>
  );
}

function Range({
  id,
  label,
  min,
  max,
  value,
  onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-ink">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full accent-ink"
      />
    </div>
  );
}
