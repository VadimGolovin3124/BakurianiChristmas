'use client';
import ApartmentTour from './apartment-tour';
import AssistantPreview from './assistant-preview';
import SantaFlight from './santa-flight';
import WinterScene from './winter-scenes';
import { tourCopy } from './tour-copy';
import {apiFetch,signInGoogle} from '@/lib/firebase-client';
import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react';
import {
  Mountain,
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Leaf,
  BedDouble,
  Sun,
  Check,
  CalendarDays,
  MapPin,
  LoaderCircle,
  X,
  UserRound,
  Snowflake,
  Sparkles,
  Coffee,
  Trees,
  House,
  Menu,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ru, enUS, ka } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { copy, type Lang } from '@/lib/i18n';
import { profileCopy } from '@/lib/profile-copy';
import { dateKey, localDate, stayNights, todayInGeorgia } from '@/lib/dates';
import { languageFromPath, localizedPath, updateSeoMetadata } from '@/lib/seo';
import { winterCopy } from './winter-copy';
const winterBeta = import.meta.env.DEV || import.meta.env.MODE === 'beta';
const WinterDecor = winterBeta ? lazy(() => import('./winter-decor')) : null;
const photos = ['kitchen', 'lounge', 'bedroom', 'bunk', 'desk'];
type Availability = {
  dates: string[];
  today: string;
  settings: {
    name: string;
    contact: string;
    address: string;
    maxGuests: number;
    nightlyPriceUsd: number;
    winterTheme?: boolean;
    calendarReady: boolean;
  };
};
export default function Stay() {
  const [profile, setProfile] = useState<{
    user: { name: string; phone: string } | null;
    googleReady: boolean;
  } | null>(null);
  const [lang, setLang] = useState<Lang>(() => {
      const pathLang = languageFromPath(window.location.pathname);
      if (window.location.pathname === '/') {
        try {
          const saved = localStorage.getItem('mta-language');
          if (saved === 'ru' || saved === 'en' || saved === 'ka') return saved;
        } catch {}
      }
      return pathLang;
    }),
    [photo, setPhoto] = useState(0),
    [depth, setDepth] = useState(true),
    [lightbox, setLightbox] = useState(false),
    [form, setForm] = useState(false),
    [data, setData] = useState<Availability | null>(null),
    [loadError, setLoadError] = useState(false),
    [range, setRange] = useState<DateRange>(),
    [guests, setGuests] = useState('1'),
    [message, setMessage] = useState(''),
    [sending, setSending] = useState(false),
    [success, setSuccess] = useState(''),
    [months, setMonths] = useState(1),
    [month, setMonth] = useState(localDate(todayInGeorgia()));
  const t = copy[lang],
    w = winterCopy[lang],
    pt = profileCopy[lang],
    locale = { ru, en: enUS, ka }[lang],
    hero = useRef<HTMLImageElement>(null),
    drag = useRef<{ x: number; y: number } | null>(null),
    moved = useRef(false);
  const refresh = useCallback(async () => {
    setLoadError(false);
    try {
      const r = await apiFetch('/api/availability', { cache: 'no-store' });
      if (!r.ok) throw Error();
      setData(await r.json());
    } catch {
      setLoadError(true);
    }
  }, []);
  useEffect(() => {
    void apiFetch('/api/profile', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => setProfile(v as typeof profile))
      .catch(() => {});
    try {
      const saved = JSON.parse(
        localStorage.getItem('mta-booking-draft') || 'null',
      );
      if (saved) {
        stayNights(saved.start, saved.end);
        setRange({ from: localDate(saved.start), to: localDate(saved.end) });
        setMonth(localDate(saved.start));
        if (saved.guests) setGuests(saved.guests);
      }
    } catch {}
    const initialPath = window.location.pathname;
    if (initialPath === '/' && localizedPath(lang) !== '/') {
      window.history.replaceState(
        null,
        '',
        `${localizedPath(lang)}${window.location.search}${window.location.hash}`,
      );
    }
    const syncLanguageWithPath = () => {
      const next = languageFromPath(window.location.pathname);
      setLang(next);
      try {
        localStorage.setItem('mta-language', next);
      } catch {}
    };
    window.addEventListener('popstate', syncLanguageWithPath);
    void refresh();
    const timer = setInterval(refresh, 60000);
    const resize = () => setMonths(window.innerWidth >= 1050 ? 2 : 1);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('popstate', syncLanguageWithPath);
    };
  }, [refresh]);
  useEffect(() => {
    updateSeoMetadata(lang, data?.settings.nightlyPriceUsd);
  }, [lang, data?.settings.nightlyPriceUsd]);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (hero.current && window.scrollY < 1100)
          hero.current.style.transform = `scale(1.04) translateY(${window.scrollY * 0.13}px)`;
      });
    };
    window.addEventListener('scroll', scroll, { passive: true });
    const obs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal').forEach((e) => obs.observe(e));
    return () => {
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
      obs.disconnect();
    };
  }, []);
  const blocked = new Set(data?.dates || []),
    today = data?.today || todayInGeorgia(),
    ready = !!data?.settings.calendarReady && !loadError;
  const nights =
    range?.from && range?.to
      ? Math.round(
          (Date.parse(dateKey(range.to)) - Date.parse(dateKey(range.from))) /
            86400000,
        )
      : 0;
  const rangeAvailable = !!(
    nights &&
    range?.from &&
    range?.to &&
    (() => {
      try {
        return stayNights(dateKey(range.from), dateKey(range.to), today).every(
          (d) => !blocked.has(d),
        );
      } catch {
        return false;
      }
    })()
  );
  const format = (d?: Date) =>
    d
      ? d.toLocaleDateString(
          lang === 'ka' ? 'ka-GE' : lang === 'en' ? 'en-GB' : 'ru-RU',
          { day: 'numeric', month: 'short' },
        )
      : t.pick;
  function disabled(d: Date) {
    const key = dateKey(d);
    if (
      !ready ||
      key < today ||
      Date.parse(key) > Date.parse(today) + 730 * 86400000
    )
      return true;
    if (!blocked.has(key)) return false;
    if (range?.from && !range.to && d > range.from) {
      try {
        return stayNights(dateKey(range.from), key, today).some((x) =>
          blocked.has(x),
        );
      } catch {
        return true;
      }
    }
    return true;
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!range?.from || !range.to || !rangeAvailable) return;
    setSending(true);
    setMessage('');
    const fields = new FormData(e.currentTarget);
    try {
      const r = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: dateKey(range.from),
          end: dateKey(range.to),
          name: fields.get('name'),
          contact: fields.get('contact'),
          note: fields.get('note'),
          website: fields.get('website'),
          guests: Number(guests),
          locale: lang,
        }),
      });
      const result = (await r.json()) as { id: string; error?: string };
      if (!r.ok) throw Error(result.error);
      setSuccess(result.id);
      localStorage.removeItem('mta-booking-draft');
      setRange(undefined);
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'server_error');
      void refresh();
    } finally {
      setSending(false);
    }
  }
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'get_apartment_availability',
            description:
              'Read current available-calendar status and occupied nights for the apartment. Does not make a reservation.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            async execute(input: unknown) {
              if (
                !input ||
                typeof input !== 'object' ||
                Object.keys(input).length
              )
                throw Error('Expected an empty object');
              const r = await apiFetch('/api/availability', { cache: 'no-store' });
              if (!r.ok) throw Error('Availability unavailable');
              const value = (await r.json()) as Availability;
              setData(value);
              return value;
            },
          },
          { signal: life.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => life.abort();
  }, []);
  const errorText =
    t.errors[message as keyof typeof t.errors] || t.errors.server_error;
  const turn = (n: number) => setPhoto((x) => (x + n + 5) % 5);
  const winter = winterBeta && (data?.settings.winterTheme ?? true);
  const displayPrice = data?.settings.nightlyPriceUsd ?? 150;
  const displayGuests = data?.settings.maxGuests ?? 4;
  return (
    <main
      className={`${lang === 'ka' ? 'lang-ka' : lang === 'en' ? 'lang-en' : ''} ${winter ? 'winter-theme' : ''}`}
    >
      {winter && WinterDecor && <Suspense fallback={null}><WinterDecor /></Suspense>}
      {winter && <div className="winter-header-wrap"><div className="winter-ribbon"><Snowflake size={13}/><span>{w.ribbon}</span><Snowflake size={13}/></div></div>}
      <header className="site-header">
        <a href="#" className="brand" aria-label="Mta Bakuriani">
          <Mountain size={34} strokeWidth={1.3} />
          <span>
            mta<span className="brand-sub">BAKURIANI</span>
          </span>
        </a>
        <nav aria-label={t.space}>
          <a href="#space">{t.space}</a>
          <a href="#gallery">{t.photos}</a>
          <a href="#apartment-3d">{tourCopy[lang].nav}</a>
          {winter && <a className="winter-nav-link" href="#winter-experiences"><Snowflake size={14}/>{w.winterNav}</a>}
          <a href="#booking">{t.dates}</a>
        </nav>
        <div className="header-actions">
          <a className="profile-nav" href="/BakurianiChristmas/profile" aria-label={pt.profile}>
            <UserRound size={18} />
            <span>{pt.profile}</span>
          </a>
          <Select
            value={lang}
            onValueChange={(v) => {
              if (v) {
                const next = v as Lang;
                const nextUrl = `${localizedPath(next)}${window.location.search}${window.location.hash}`;
                if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
                  window.history.pushState(null, '', nextUrl);
                }
                setLang(next);
                try {
                  localStorage.setItem('mta-language', next);
                } catch {}
              }
            }}
          >
            <SelectTrigger
              className="language"
              aria-label="Language / Язык / ენა"
            >
              <SelectValue>{lang === 'ka' ? 'GE' : lang.toUpperCase()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">RU</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ka">GE</SelectItem>
            </SelectContent>
          </Select>
          <a className="header-book" href="#booking">
            {t.choose} <ArrowUpRight size={17} />
          </a>
          {winter && <details className="winter-mobile-menu">
            <summary aria-label={lang==='ru'?'Меню':lang==='en'?'Menu':'მენიუ'}><Menu size={23}/></summary>
            <div onClick={e=>{if((e.target as Element).closest('a'))e.currentTarget.closest('details')?.removeAttribute('open')}}>
              <a href="#space">{t.space}</a><a href="#gallery">{t.photos}</a><a href="#apartment-3d">{tourCopy[lang].nav}</a><a href="#winter-experiences">{w.winterNav}</a><a href="#booking">{t.dates}</a><a href="#location">{t.location}</a>
            </div>
          </details>}
        </div>
      </header>
      <section className="hero">
        {winter && <SantaFlight />}
        <img
          ref={hero}
          className="hero-img"
          src="/BakurianiChristmas/images/kitchen.webp"
          alt={t.photoDesc[0]}
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow">{winter ? <span className="winter-season"><Snowflake size={15}/>{w.season} <i/> {t.where}</span> : t.where}</div>
          <h1>
            {winter ? w.hero1 : t.hero1}
            <br />
            <em>{winter ? w.hero2 : t.hero2}</em>
          </h1>
          <p>{winter ? w.heroText : t.heroText}</p>
          <a href="#booking" className="button light">
            {winter ? w.book : t.find}
            <ArrowUpRight size={20} />
          </a>
          {winter && <div className="winter-hero-details"><span><House size={16}/>{w.stay}</span><span><UserRound size={16}/>{t.capacity.replace('{count}',String(displayGuests))}</span></div>}
        </div>
        {winter && <aside className="winter-quick-book" aria-label={w.stay}>
          <div className="winter-book-top"><span><Sparkles size={16}/>{w.stay}</span><span className="winter-badge">{w.season}</span></div>
          <div className="winter-book-price"><strong>${displayPrice}</strong><span>{w.from}</span></div>
          <div className="winter-book-meta"><UserRound size={17}/>{t.capacity.replace('{count}', String(displayGuests))}</div>
          <a href="#booking" className="button winter-book-button"><CalendarDays size={18}/>{w.book}<ArrowUpRight size={18}/></a>
          <small>{w.summary}</small>
        </aside>}
        <div className="hero-bottom">
          <span>{t.smallWorld}</span>
          <a href="#space">
            <ArrowDown size={18} />
            {t.feel}
          </a>
        </div>
        {!winter && <div className="hero-index">
          01 <span>/ 05</span>
        </div>}
      </section>
      <section className="intro section reveal" id="space">
        <div className="eyebrow">{t.meaning}</div>
        <div className="intro-grid">
          {winter && <div className="winter-intro-photos">
            <figure className="winter-feature-photo"><img src="/BakurianiChristmas/images/bedroom.webp" loading="lazy" alt={t.photoNames[2]}/><figcaption>{t.photoNames[2]}</figcaption></figure>
            <figure><img src="/BakurianiChristmas/images/lounge.webp" loading="lazy" alt={t.photoNames[1]}/><figcaption>{t.photoNames[1]}</figcaption></figure>
            <figure><img src="/BakurianiChristmas/images/bunk.webp" loading="lazy" alt={t.photoNames[3]}/><figcaption>{t.photoNames[3]}</figcaption></figure>
          </div>}
          <div className={winter ? 'winter-intro-copy' : 'intro-title'}>
          <h2>
            {t.intro1}
            <br />
            <em>{t.intro2}</em>
          </h2>
          {winter && <p>{t.intro}</p>}
          </div>
          <div>
            {!winter && <p>{t.intro}</p>}
            {winter && <div className="winter-fact-head"><BedDouble size={22}/><span>{w.facts}</span></div>}
            <p><strong>{t.sleepingTitle}</strong><br />{t.sleeping}</p>
            <p>
              <strong>{t.capacityTitle}</strong><br />
              {t.capacity.replace('{count}', String(data?.settings.maxGuests ?? 4))}
            </p>
            {data && (data.settings.nightlyPriceUsd ?? 0) > 0 && <p><strong>{t.nightlyPrice}</strong><br />${data.settings.nightlyPriceUsd}</p>}
            <div className="feature-row">
              {[Leaf, BedDouble, Sun].map((Icon, i) => (
                <div key={i}>
                  <Icon size={23} strokeWidth={1.2} />
                  <span>{t.details[i]}</span>
                </div>
              ))}
            </div>
            {winter && <WinterScene kind="window-cat" className="intro-companion"/>}
          </div>
        </div>
      </section>
      <section className="gallery-section" id="gallery">
        <div className="gallery-heading section reveal">
          <div>
            <div className="eyebrow">{t.galleryLabel}</div>
            <h2>
              {t.gallery1} <em>{t.gallery2}</em>
            </h2>
          </div>
          <div className="gallery-tools">
            <span>{t.galleryText}</span>
            <label className="depth-toggle">
              <Switch checked={depth} onCheckedChange={setDepth} />
              {t.depth}
            </label>
          </div>
        </div>
        <div
          className={`photo-stage ${depth ? 'is-3d' : 'is-flat'}`}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY };
            moved.current = false;
          }}
          onPointerUp={(e) => {
            if (drag.current) {
              const dx = e.clientX - drag.current.x,
                dy = e.clientY - drag.current.y;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
                moved.current = true;
                turn(dx < 0 ? 1 : -1);
              }
              drag.current = null;
            }
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          aria-label={t.photos}
        >
          {photos.map((p, i) => {
            let offset = (i - photo + 5) % 5;
            if (offset > 2) offset -= 5;
            return (
              <button
                key={p}
                className={`photo-card ${offset === 0 ? 'active' : ''}`}
                style={
                  {
                    '--offset': offset,
                    '--abs': Math.abs(offset),
                  } as React.CSSProperties
                }
                tabIndex={offset === 0 ? 0 : -1}
                aria-label={`${t.full}: ${t.photoNames[i]}`}
                aria-hidden={Math.abs(offset) > 1}
                onClick={() => {
                  if (moved.current) {
                    moved.current = false;
                    return;
                  }
                  if (offset === 0) setLightbox(true);
                  else setPhoto(i);
                }}
              >
                <img
                  src={`/BakurianiChristmas/images/${p}.webp`}
                  loading="lazy"
                  draggable={false}
                  alt={t.photoNames[i]}
                />
                <span className="photo-card-overlay">
                  <span>0{i + 1} / 05</span>
                  <ArrowUpRight size={24} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="gallery-caption">
          <div>
            <span className="eyebrow">0{photo + 1} / 05</span>
            <h3>{t.photoNames[photo]}</h3>
            <p>{t.photoDesc[photo]}</p>
          </div>
          <div className="gallery-arrows">
            <button
              className="circle-button"
              onClick={() => turn(-1)}
              aria-label={t.prev}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              className="circle-button"
              onClick={() => turn(1)}
              aria-label={t.next}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="gallery-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setPhoto(i)}
              aria-label={t.photoNames[i]}
              aria-current={photo === i ? 'true' : undefined}
            />
          ))}
        </div>
        <p className="drag-hint">{t.drag}</p>
        {winter && <WinterScene kind="gift" className="gallery-surprise"/>}
      </section>
      {winter && <section className="winter-experiences section" id="winter-experiences">
        <div className="winter-exp-heading"><div className="eyebrow"><Snowflake size={16}/>{w.winterLabel}</div><h2>{w.winterTitle}</h2><p>{w.winterSubtitle}</p></div>
        <div className="winter-experience-grid">{[Mountain,Coffee,Trees].map((Icon,i)=><article key={i}><span className="winter-experience-icon"><Icon size={30} strokeWidth={1.4}/></span><span className="winter-exp-num">0{i+1}</span><h3>{w.experiences[i].title}</h3><p>{w.experiences[i].description}</p><WinterScene kind={(['globe','cocoa','tree'] as const)[i]}/></article>)}</div>
      </section>}
      <section className="booking-section" id="booking">
        <div className="booking-wrap section">
          <div className="booking-heading reveal">
            <div className="eyebrow">{t.bookingLabel}</div>
            <h2>
              {t.booking1}
              <br />
              <em>{t.booking2}</em>
            </h2>
            <p>{t.bookingText}</p>
            <p className="winter-demo-notice">{w.previewNotice}</p>
            <div className="booking-benefits">
              <span>
                <Check size={16} />
                {t.noPayment}
              </span>
              <span>
                <Check size={16} />
                {t.direct}
              </span>
            </div>
            {data?.settings.contact && (
              <p className="host-contact">{data.settings.contact}</p>
            )}
            {winter && <WinterScene kind="gingerbread" className="booking-companion"/>}
          </div>
          <div className="booking-card">
            <div className="date-fields">
              <div>
                <span>{t.checkin}</span>
                <strong>{format(range?.from)}</strong>
              </div>
              <ArrowRight size={20} />
              <div>
                <span>{t.checkout}</span>
                <strong>{format(range?.to)}</strong>
              </div>
            </div>
            {!data && !loadError ? (
              <div className="calendar-state">
                <LoaderCircle className="spinner" size={24} />
                {t.loading}
              </div>
            ) : loadError ? (
              <div className="calendar-state" role="alert">
                <p>{t.error}</p>
                <button className="text-button" onClick={refresh}>
                  {t.retry}
                </button>
              </div>
            ) : (
              <>
                <Calendar
                  className="stay-calendar"
                  mode="range"
                  selected={range}
                  onSelect={(next) => {
                    setMessage('');
                    if (next?.from && next.to && dateKey(next.from) !== dateKey(next.to)) {
                      try {
                        if (stayNights(dateKey(next.from), dateKey(next.to), today).some(d => blocked.has(d))) throw Error('unavailable');
                      } catch { setMessage('unavailable'); return; }
                    }
                    setRange(next?.from && next.to && dateKey(next.from) === dateKey(next.to) ? { from: next.from, to: undefined } : next);
                  }}
                  month={month}
                  onMonthChange={setMonth}
                  numberOfMonths={months}
                  locale={locale}
                  weekStartsOn={1}
                  showOutsideDays={false}
                  disabled={disabled}
                  startMonth={localDate(today)}
                  endMonth={new Date(Date.parse(today) + 730 * 86400000)}
                  modifiers={{ booked: (d) => blocked.has(dateKey(d)), holiday: (d) => winter && ['12-25','12-31','01-01','01-07'].includes(dateKey(d).slice(5)) }}
                  modifiersClassNames={{ booked: 'booked-day', holiday: 'holiday-day' }}
                  labels={{
                    labelPrevious: () => t.calendarPrev,
                    labelNext: () => t.calendarNext,
                  }}
                />
                <div className="calendar-legend">
                  <span>
                    <i />
                    {t.available}
                  </span>
                  <span>
                    <i className="busy" />
                    {t.busy}
                  </span>
                  <span>
                    <i className="chosen" />
                    {t.selected}
                  </span>
                  {winter && <span><i className="holiday-mark"/>{({ru:'Праздники',en:'Holidays',ka:'დღესასწაულები'})[lang]}</span>}
                  {range?.from && (
                    <button
                      onClick={() => {
                        setRange(undefined);
                        setMessage('');
                      }}
                    >
                      {t.clear}
                    </button>
                  )}
                </div>
                {(!ready || !data?.settings.maxGuests) && <p className="calendar-notice">{t.notReady}</p>}
              </>
            )}
            {data && data.settings.nightlyPriceUsd > 0 && <div className="price-summary"><strong>${data.settings.nightlyPriceUsd}</strong> <span>{({ru:'за ночь',en:'per night',ka:'ღამეში'})[lang]}</span>{nights > 0 && <p>{nights} × ${data.settings.nightlyPriceUsd} = <strong>${nights * data.settings.nightlyPriceUsd}</strong> · {({ru:'предварительно',en:'estimated total',ka:'სავარაუდო ჯამი'})[lang]}</p>}</div>}
            <div className="booking-summary">
              <div>
                <label htmlFor="guest-select">{t.guests}</label>
                <Select
                  value={guests}
                  onValueChange={(v) => v && setGuests(v)}
                  disabled={!ready}
                >
                  <SelectTrigger id="guest-select" className="guest-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: Math.max(1, data?.settings.maxGuests || 1) },
                      (_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          {String(i + 1)}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="night-total">
                {nights > 0 ? (
                  <>
                    <strong>{nights}</strong>
                    <span>{t.nights}</span>
                  </>
                ) : (
                  <CalendarDays size={26} strokeWidth={1.2} />
                )}
              </div>
            </div>
            {message && !form && (
              <p className="form-error" role="alert">
                {errorText}
              </p>
            )}
            <button
              className="button request-button"
              disabled={!ready || !data?.settings.maxGuests || !rangeAvailable}
              onClick={() => {
                setSuccess('');
                setMessage('');
                if (range?.from && range.to)
                  localStorage.setItem(
                    'mta-booking-draft',
                    JSON.stringify({
                      start: dateKey(range.from),
                      end: dateKey(range.to),
                      guests,
                    }),
                  );
                setForm(true);
              }}
            >
              {t.request}
              <ArrowUpRight size={19} />
            </button>
            <p className="range-hint">{t.rangeHint}</p>
          </div>
        </div>
      </section>
      <ApartmentTour lang={lang} winter={winter} />
      <section className="location-section section reveal" id="location">
        <div className="location-image">
          <img src="/BakurianiChristmas/images/desk.webp" loading="lazy" alt={t.photoNames[4]} />
          <span>
            <MapPin size={16} />
            {t.location}
          </span>
        </div>
        <div className="location-copy">
          <div className="eyebrow">{t.location}</div>
          <h2>
            {t.location1}
            <br />
            <em>{t.location2}</em>
          </h2>
          <p>{t.locationText}</p>
          {data?.settings.address && <p>{data.settings.address}</p>}
          <a
            className="text-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data?.settings.address || 'Bakuriani, Georgia')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.map}
            <ArrowUpRight size={18} />
          </a>
          {winter && <WinterScene kind="reindeer" className="location-companion"/>}
        </div>
      </section>
      {winter && <div className="winter-farewell"><div className="winter-hills" aria-hidden="true"/><WinterScene kind="snowman" className="farewell-companion"/><div className="winter-holiday"><Snowflake size={23}/><h2>{w.holiday}</h2><p>{w.holidayText}</p></div></div>}
      <footer>
        <div>
          <a className="footer-brand" href="#">
            mta.
          </a>
          <p>{t.footer}</p>
          <small className="winter-preview-label">{w.preview}</small>
        </div>
        {winter && <div className="winter-footer-links"><a href="#space">{t.space}</a><a href="#gallery">{t.photos}</a><a href="#apartment-3d">{tourCopy[lang].nav}</a><a href="#booking">{t.dates}</a></div>}
        {winter && <div className="winter-footer-contact"><span>{t.location}</span><p>{data?.settings.address}</p><span>{data?.settings.contact}</span></div>}
        <div className="footer-right">
          <a href="/BakurianiChristmas/privacy">
            {lang === 'ru'
              ? 'Конфиденциальность'
              : lang === 'ka'
                ? 'კონფიდენციალურობა'
                : 'Privacy'}
          </a>
          <span>
            © {new Date().getFullYear()}{' '}
            {data?.settings.name || 'Mta · Bakuriani'}
          </span>
          <a href="/BakurianiChristmas/host">
            {t.host}
            <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="photo-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">{t.photoNames[photo]}</DialogTitle>
          <DialogDescription className="sr-only">
            {t.photoDesc[photo]}
          </DialogDescription>
          <DialogClose
            className="photo-close circle-button"
            aria-label={t.close}
          >
            <X size={22} />
          </DialogClose>
          <img
            src={`/BakurianiChristmas/images/${photos[photo]}.webp`}
            alt={t.photoNames[photo]}
          />
          <div className="lightbox-caption">
            <button
              className="circle-button"
              onClick={() => turn(-1)}
              aria-label={t.prev}
            >
              <ArrowLeft size={20} />
            </button>
            <span>
              {t.photoNames[photo]} · {photo + 1}/5
            </span>
            <button
              className="circle-button"
              onClick={() => turn(1)}
              aria-label={t.next}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={form}
        onOpenChange={(v) => {
          if (!sending) setForm(v);
        }}
      >
        <DialogContent className="booking-dialog" showCloseButton={false}>
          <DialogClose
            className="form-close circle-button"
            disabled={sending}
            aria-label={t.close}
          >
            <X size={20} />
          </DialogClose>
          <DialogTitle className="form-heading">
            {success ? t.success : t.formTitle}
          </DialogTitle>
          <DialogDescription>
            {success ? t.successText : t.formText}
          </DialogDescription>
          {success ? (
            <div className="success-content">
              <span className="success-icon">
                <Check size={36} />
              </span>
              <p>{t.reference}</p>
              <code>{success.slice(0, 8).toUpperCase()}</code>
              <a className="text-link" href="/BakurianiChristmas/profile">
                {pt.viewBookings}
                <ArrowUpRight size={16} />
              </a>
              <button className="button" onClick={() => setForm(false)}>
                {t.done}
              </button>
            </div>
          ) : !profile?.user ? (
            <div className="booking-login">
              <p>{pt.signInBook}</p>
              {profile?.googleReady ? (
                <a
                  href="#" onClick={e=>{e.preventDefault();void signInGoogle()}}
                  target="_top"
                  className="button google-signin"
                >
                  <span className="google-letter" aria-hidden="true">
                    G
                  </span>
                  {w.profileDemo}
                  <ArrowUpRight size={18} />
                </a>
              ) : (
                <p className="calendar-notice">
                  {profile ? pt.notReady : pt.loading}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-stay">
                <CalendarDays size={20} />
                {format(range?.from)} — {format(range?.to)}
                <span>
                  {guests} · {t.guests}
                </span>
              </div>
              <label>
                {t.name}
                <input
                  name="name"
                  autoComplete="name"
                  defaultValue={profile.user.name}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>
              <label>
                {pt.phone}
                <input
                  name="contact"
                  autoComplete="tel"
                  type="tel"
                  inputMode="tel"
                  defaultValue={profile.user.phone}
                  placeholder="+972…"
                  minLength={5}
                  maxLength={160}
                  required
                />
              </label>
              <label>
                {t.note} <span>({t.optional})</span>
                <textarea name="note" rows={3} maxLength={1000} />
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <p className="consent">{t.consent}</p>
              {message && (
                <p role="alert" className="form-error">
                  {errorText}
                </p>
              )}
              <button
                className="button request-button"
                disabled={sending || !rangeAvailable}
              >
                {sending ? (
                  <>
                    <LoaderCircle size={18} className="spinner" />
                    {t.sending}
                  </>
                ) : (
                  <>
                    {t.request}
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AssistantPreview lang={lang} />
    </main>
  );
}
