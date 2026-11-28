import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Box, X } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { tourCopy } from './tour-copy';
import WinterScene from './winter-scenes';
import './tour.css';

export default function ApartmentTour({ lang, winter = false }: { lang: Lang; winter?: boolean }) {
  const t = tourCopy[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const send = (data: object) => frame.current?.contentWindow?.postMessage(data, location.origin);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const overflow = body.style.overflow, padding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    dialog.current?.showModal();
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    send({ type: 'mta3d:locale', locale: lang });
    function onMessage(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'mta3d:close') dialog.current?.close();
      if (event.data?.type === 'mta3d:ready') send({ type: 'mta3d:locale', locale: lang });
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [lang]);

  function launch(event: React.MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget;
    setOpen(true);
  }

  return (
    <>
      <section id="apartment-3d" className="mta-tour-section" aria-labelledby="mta-tour-heading" lang={lang}>
        <div className="tour-wrap">
          <div className="tour-copy">
            <p className="tour-eyebrow">{t.eyebrow}</p>
            <h2 id="mta-tour-heading">{t.heading}<em>{t.headingEm}</em></h2>
            <p className="tour-intro">{t.intro}</p>
            <button type="button" className="tour-open" onClick={launch}>
              <span>{t.open}</span><ArrowUpRight size={21} aria-hidden="true" />
            </button>
            <p className="tour-caption">{t.tag}</p>
            {winter && <WinterScene kind="penguin" className="tour-companion"/>}
          </div>
          <div className="tour-art">
            <button type="button" className="tour-preview" aria-label={t.open} onClick={launch}>
              <img src="/BakurianiChristmas/3d/poster.ade1c4c5d41f.webp" width={1200} height={950} loading="lazy" decoding="async" alt={t.previewAlt} />
              <span className="tour-badge"><Box size={26} strokeWidth={1.25} aria-hidden="true" /></span>
            </button>
            <p className="tour-corner">{t.previewHint}</p>
          </div>
        </div>
      </section>
      <dialog ref={dialog} className="mta-tour-dialog" aria-labelledby="mta-tour-dialog-title" lang={lang}
        onClose={() => setOpen(false)}
        onCancel={event => { event.preventDefault(); dialog.current?.close(); }}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
        }}>
        <header className="tour-dialog-head">
          <h2 className="tour-dialog-title" id="mta-tour-dialog-title"><Box size={23} aria-hidden="true" /><span>{t.dialogTitle}</span></h2>
          <button type="button" className="tour-close" aria-label={t.close} onClick={() => dialog.current?.close()}><X size={21} aria-hidden="true" /></button>
        </header>
        {open && <iframe ref={frame} src={`/BakurianiChristmas/3d/index.html?lang=${lang}`} title={t.dialogTitle} allow="fullscreen" onLoad={() => send({ type: 'mta3d:locale', locale: lang })} />}
      </dialog>
    </>
  );
}
