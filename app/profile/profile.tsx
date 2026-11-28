'use client';
import {apiFetch,signInGoogle} from '@/lib/firebase-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MessageCircle,
  LogOut,
  Check,
  UserRound,
  X,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { profileCopy } from '@/lib/profile-copy';
import type { Lang } from '@/lib/i18n';
import { todayInGeorgia } from '@/lib/dates';
import { winterCopy } from '../winter-copy';
type Booking = {
  id: string;
  start: string;
  end: string;
  name: string;
  contact: string;
  guests: number;
  note: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};
type Data = {
  user: { name: string; email: string; phone: string } | null;
  bookings?: Booking[];
  googleReady: boolean;
  hostWhatsApp?: string;
};
export default function Profile() {
  const [lang, setLang] = useState<Lang>('ru'),
    [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [phone, setPhone] = useState(''),
    [cancel, setCancel] = useState<Booking | null>(null),
    [chat, setChat] = useState<Booking | null>(null),
    [authError, setAuthError] = useState(false);
  const t = profileCopy[lang];
  const phoneDirty = useRef(false);
  const load = useCallback(async () => {
    try {
      setError(false);
      const r = await apiFetch('/api/profile', { cache: 'no-store' });
      if (!r.ok) throw Error();
      const d = (await r.json()) as Data;
      setData(d);
      if (!phoneDirty.current) setPhone(d.user?.phone || '');
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    const l = localStorage.getItem('mta-language');
    if (l === 'ru' || l === 'ka' || l === 'en') setLang(l);
    setAuthError(new URLSearchParams(location.search).get('auth') === 'failed');
    void load();
    const timer = setInterval(load, 60000);
    window.addEventListener('focus', load);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [load]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  async function mutate(path: string, body: unknown) {
    setBusy(true);
    setNotice('');
    try {
      const r = await apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        setNotice(
          path === '/api/profile' && r.status === 400 ? 'phoneError' : 'error',
        );
        return false;
      }
      if (path === '/api/profile') phoneDirty.current = false;
      await load();
      return true;
    } catch {
      setNotice('error');
      return false;
    } finally {
      setBusy(false);
    }
  }
  const fmt = (date: string) =>
    new Date(date + 'T12:00:00').toLocaleDateString(
      lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-GB',
      { day: 'numeric', month: 'short', year: 'numeric' },
    );
  return (
    <main className={'profile-page ' + (lang === 'ka' ? 'lang-ka' : '')}>
      <header className="profile-header">
        <a href="/BakurianiChristmas/" className="profile-back">
          <ArrowLeft size={17} />
          {t.back}
        </a>
        <a href="/BakurianiChristmas/" className="profile-brand">
          mta.
        </a>
        <Select
          value={lang}
          onValueChange={(v) => {
            if (v) {
              setLang(v as Lang);
              localStorage.setItem('mta-language', v);
            }
          }}
        >
          <SelectTrigger aria-label="Language / Язык / ენა">
            <SelectValue>{lang === 'ka' ? 'GE' : lang.toUpperCase()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">RU</SelectItem>
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="ka">GE</SelectItem>
          </SelectContent>
        </Select>
      </header>
      <section className="profile-intro">
        <span className="eyebrow">BAKURIANI · YOUR STAY</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <div className="preview-mode-notice">{winterCopy[lang].previewNotice}</div>
      </section>
      {error ? (
        <div className="host-box">
          <p role="alert">{t.error}</p>
          <button className="text-button" onClick={load}>
            {t.retry}
          </button>
        </div>
      ) : !data ? (
        <p role="status">{t.loading}</p>
      ) : !data.user ? (
        <section className="profile-login">
          <div className="profile-login-photo">
            <img src="/BakurianiChristmas/images/bedroom.webp" alt="" />
          </div>
          <div>
            <UserRound size={32} strokeWidth={1.3} />
            <h2>{t.profile}</h2>
            <p>{t.loginText}</p>
            {authError && <p className="form-error">{t.loginFailed}</p>}
            {data.googleReady ? (
              <a
                className="button google-signin"
                href="#" onClick={e=>{e.preventDefault();void signInGoogle()}}
                target="_top"
              >
                <span className="google-letter" aria-hidden="true">
                  G
                </span>
                {winterCopy[lang].profileDemo}
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <p className="calendar-notice">{t.notReady}</p>
            )}
            <small>
              {t.privacy}{' '}
              <a href="/BakurianiChristmas/privacy">
                {lang === 'ru'
                  ? 'Конфиденциальность'
                  : lang === 'ka'
                    ? 'კონფიდენციალურობა'
                    : 'Privacy'}
              </a>
            </small>
          </div>
        </section>
      ) : (
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="guest-avatar">
              {data.user.name.slice(0, 1).toUpperCase()}
            </div>
            <h2>{data.user.name}</h2>
            <p>{data.user.email}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void mutate('/api/profile', { phone }).then(
                  (ok) => ok && setNotice('saved'),
                );
              }}
            >
              <label>
                {t.phone}
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    phoneDirty.current = true;
                    setPhone(e.target.value);
                  }}
                  placeholder="+972…"
                  required
                />
              </label>
              <button className="button" disabled={busy}>
                {t.save}
                <Check size={17} />
              </button>
            </form>
            {notice && (
              <p
                role="status"
                className={
                  notice === 'error' || notice === 'phoneError'
                    ? 'form-error'
                    : 'host-notice'
                }
              >
                {notice === 'error'
                  ? t.error
                  : notice === 'phoneError'
                    ? t.phoneError
                    : t.saved}
              </p>
            )}
            <button
              className="profile-logout"
              disabled={busy}
              onClick={() => void mutate('/api/auth/logout', {})}
            >
              <LogOut size={16} />
              {t.logout}
            </button>
          </aside>
          <section className="profile-bookings">
            <div className="profile-bookings-heading">
              <h2>{t.myBookings}</h2>
              <a href="/BakurianiChristmas/#booking" className="text-link">
                {t.book}
                <ArrowUpRight size={16} />
              </a>
            </div>
            {!data.bookings?.length ? (
              <div className="profile-empty">
                <CalendarDays size={45} strokeWidth={1} />
                <h3>{t.empty}</h3>
                <p>{t.emptyText}</p>
                <a className="button" href="/BakurianiChristmas/#booking">
                  {t.book}
                  <ArrowUpRight size={18} />
                </a>
              </div>
            ) : (
              data.bookings.map((b) => (
                <article key={b.id} className="profile-booking">
                  <img src="/BakurianiChristmas/images/lounge.webp" alt="" loading="lazy" />
                  <div className="profile-booking-body">
                    <div className="reservation-top">
                      <span className={'status status-' + b.status}>
                        {t[b.status]}
                      </span>
                      <small>#{b.id.slice(0, 8).toUpperCase()}</small>
                    </div>
                    <h3>
                      {fmt(b.start)} — {fmt(b.end)}
                    </h3>
                    <p>
                      {t.guests}: {b.guests}
                    </p>
                    <p>{b.contact}</p>
                    {b.note && <p className="guest-note">{b.note}</p>}
                    <div className="reservation-actions">
                      {b.status === 'confirmed' && (
                        <button
                          className="button whatsapp-button"
                          onClick={() => setChat(b)}
                        >
                          <MessageCircle size={18} />
                          {t.chat}
                        </button>
                      )}
                      {b.status !== 'cancelled' &&
                        b.start >= todayInGeorgia() && (
                          <button
                            className="text-button"
                            disabled={busy}
                            onClick={() => setCancel(b)}
                          >
                            {t.cancel}
                          </button>
                        )}
                    </div>
                    {b.end < todayInGeorgia() && <small>{t.past}</small>}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      )}
      <AlertDialog
        open={!!cancel}
        onOpenChange={(v) => !v && !busy && setCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.cancelTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.cancelText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t.keep}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={() => {
                if (cancel)
                  void mutate('/api/bookings/cancel', { id: cancel.id }).then(
                    (ok) => ok && setCancel(null),
                  );
              }}
            >
              {t.cancel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!chat} onOpenChange={(v) => !v && setChat(null)}>
        <DialogContent className="whatsapp-dialog" showCloseButton={false}>
          <DialogClose
            className="form-close circle-button"
            aria-label={t.close}
          >
            <X size={20} />
          </DialogClose>
          <div className="whatsapp-avatar">
            <MessageCircle size={28} />
          </div>
          <DialogTitle>{t.chatTitle}</DialogTitle>
          <DialogDescription>{t.chatText}</DialogDescription>
          <div className="chat-bubble">
            {t.message} #{chat?.id.slice(0, 8).toUpperCase()}.<br />
            {t.messageDates}: {chat?.start} — {chat?.end}.
          </div>
          <p className="chat-phone">+972 54-792-7001</p>
          <a
            className="button whatsapp-button"
            href="#"
            onClick={e=>{e.preventDefault();setChat(null)}}
          >
            {({ru:'Закрыть демонстрацию WhatsApp',en:'Close WhatsApp preview',ka:'WhatsApp-ის სატესტო ფანჯრის დახურვა'})[lang]}
            <ArrowUpRight size={18} />
          </a>
        </DialogContent>
      </Dialog>
    </main>
  );
}
