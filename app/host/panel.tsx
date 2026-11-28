'use client';
import {apiFetch,signInGoogle} from '@/lib/firebase-client';
import { winterCopy } from '../winter-copy';
import ClearHistory from './clear-history';
import Integrations from './integrations';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  LoaderCircle,
  Check,
  LockKeyhole,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { todayInGeorgia } from '@/lib/dates';
const winterBeta = import.meta.env.DEV || import.meta.env.MODE === 'beta';
const words = {
  ru: {
    back: 'На сайт',
    title: 'Ваше место. Ваш календарь.',
    sub: 'Заявки, занятые даты и информация о квартире.',
    requests: 'Заявки',
    calendar: 'Закрыть даты',
    settings: 'Настройки',
    empty: 'Заявок пока нет.',
    refresh: 'Обновить',
    confirm: 'Подтвердить',
    cancel: 'Отменить',
    pending: 'Ожидает ответа',
    confirmed: 'Подтверждена',
    cancelled: 'Отменена',
    blocked: 'Даты закрыты',
    guests: 'Гостей',
    contact: 'Контакт',
    notes: 'Пожелания',
    start: 'Заезд',
    end: 'Выезд',
    block: 'Закрыть даты',
    blockHelp:
      'Укажите первую занятую ночь и день выезда. День выезда доступен для следующего заезда.',
    note: 'Заметка для себя',
    name: 'Название квартиры',
    hostContact: 'Контакт хозяйки для гостей',
    address: 'Адрес',
    max: 'Максимум гостей',
    ready: 'Открыть календарь для заявок',
    readyHelp:
      'Перед открытием укажите число гостей и закройте все уже занятые даты.',
    save: 'Сохранить',
    saved: 'Сохранено',
    setup: 'Доступ хозяйки',
    setupHelp:
      'Для первого входа введите код из файла «Доступ хозяйки». После настройки вы сможете добавить email хозяйки.',
    token: 'Код настройки',
    activate: 'Активировать доступ',
    forbidden: 'Доступ ещё не настроен либо этот аккаунт не добавлен хозяйкой.',
    error:
      'Не удалось выполнить действие. Проверьте данные и попробуйте снова.',
    conflict: 'Эти даты уже заняты. Подтверждение невозможно.',
    owner: 'Добавить управляющего',
    ownerHelp:
      'Укажите email аккаунта Google человека, который будет управлять квартирой. Он получит полный доступ к заявкам и настройкам.',
    add: 'Добавить доступ',
    signout: 'Выйти',
    cancelTitle: 'Отменить эту запись?',
    cancelText:
      'Подтверждённые или закрытые даты снова станут доступны. Гостю нужно сообщить об отмене лично.',
    keep: 'Оставить',
    confirmTitle: 'Подтвердить заявку?',
    confirmText:
      'Выбранные ночи станут занятыми в календаре. Гость увидит подтверждение в своём профиле.',
    all: 'Все',
    loading: 'Загружаем…',
    signed: 'Вы вошли как',
    requestNote:
      'Новые заявки сами по себе не занимают даты. Сначала свяжитесь с гостем, затем подтвердите бронь. Сообщения гостям отправляйте лично.',
    limit: 'Показаны последние 500 записей.',
    setupUsed: 'Доступ уже настроен. Попросите владельца добавить ваш email.',
    blockTitle: 'Занятые даты',
    blockSub:
      'Добавляйте сюда брони, полученные по телефону или на других сайтах.',
    email: 'Email',
    language: 'Язык',
  },
  en: {
    back: 'Back to the site',
    title: 'Your place. Your calendar.',
    sub: 'Requests, occupied dates and apartment details.',
    requests: 'Requests',
    calendar: 'Block dates',
    settings: 'Settings',
    empty: 'No requests yet.',
    refresh: 'Refresh',
    confirm: 'Confirm',
    cancel: 'Cancel',
    pending: 'Awaiting response',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    blocked: 'Blocked dates',
    guests: 'Guests',
    contact: 'Contact',
    notes: 'Requests',
    start: 'Arrival',
    end: 'Departure',
    block: 'Block dates',
    blockHelp:
      'Select the first occupied night and the departure day. The departure day stays available for another arrival.',
    note: 'Private note',
    name: 'Apartment name',
    hostContact: 'Host contact shown to guests',
    address: 'Address',
    max: 'Maximum guests',
    ready: 'Open the calendar for requests',
    readyHelp:
      'Set the guest limit and block all existing reservations before opening.',
    save: 'Save',
    saved: 'Saved',
    setup: 'Host access',
    setupHelp:
      'For the first login, enter the code from the host access file. You can then add the host’s email.',
    token: 'Setup code',
    activate: 'Activate access',
    forbidden: 'Access is not set up, or the host has not added this account.',
    error: 'Could not complete the action. Check your details and try again.',
    conflict: 'These dates are already occupied and cannot be confirmed.',
    owner: 'Add a manager',
    ownerHelp:
      'Enter the email of the manager’s Google account. They will have full access to requests and settings.',
    add: 'Grant access',
    signout: 'Sign out',
    cancelTitle: 'Cancel this entry?',
    cancelText:
      'Confirmed or blocked nights will become available. Contact the guest personally to let them know.',
    keep: 'Keep entry',
    confirmTitle: 'Confirm this request?',
    confirmText:
      'These nights will become occupied. The guest will see confirmation in their profile.',
    all: 'All',
    loading: 'Loading…',
    signed: 'Signed in as',
    requestNote:
      'New requests do not block dates. Contact the guest first, then confirm the booking. Send messages to guests personally.',
    limit: 'Showing the latest 500 entries.',
    setupUsed:
      'Access has already been configured. Ask an owner to add your email.',
    blockTitle: 'Occupied dates',
    blockSub: 'Add reservations received by phone or through other sites.',
    email: 'Email',
    language: 'Language',
  },
  ka: {
    back: 'საიტზე დაბრუნება',
    title: 'თქვენი ბინა. თქვენი კალენდარი.',
    sub: 'მოთხოვნები, დაკავებული თარიღები და ბინის ინფორმაცია.',
    requests: 'მოთხოვნები',
    calendar: 'თარიღების დახურვა',
    settings: 'პარამეტრები',
    empty: 'მოთხოვნები ჯერ არ არის.',
    refresh: 'განახლება',
    confirm: 'დადასტურება',
    cancel: 'გაუქმება',
    pending: 'პასუხის მოლოდინში',
    confirmed: 'დადასტურებულია',
    cancelled: 'გაუქმებულია',
    blocked: 'დახურული თარიღები',
    guests: 'სტუმრები',
    contact: 'კონტაქტი',
    notes: 'სურვილები',
    start: 'ჩასვლა',
    end: 'გასვლა',
    block: 'თარიღების დახურვა',
    blockHelp:
      'აირჩიეთ პირველი დაკავებული ღამე და გასვლის დღე. გასვლის დღე თავისუფალი რჩება შემდეგი სტუმრისთვის.',
    note: 'პირადი ჩანაწერი',
    name: 'ბინის სახელი',
    hostContact: 'მასპინძლის კონტაქტი სტუმრებისთვის',
    address: 'მისამართი',
    max: 'სტუმრების მაქსიმალური რაოდენობა',
    ready: 'კალენდრის გახსნა მოთხოვნებისთვის',
    readyHelp:
      'გახსნამდე მიუთითეთ სტუმრების რაოდენობა და დახურეთ უკვე დაკავებული თარიღები.',
    save: 'შენახვა',
    saved: 'შენახულია',
    setup: 'მასპინძლის წვდომა',
    setupHelp:
      'პირველი შესვლისთვის შეიყვანეთ კოდი მასპინძლის წვდომის ფაილიდან. შემდეგ შეგიძლიათ მასპინძლის ელფოსტის დამატება.',
    token: 'წვდომის კოდი',
    activate: 'წვდომის გააქტიურება',
    forbidden:
      'წვდომა ჯერ არ არის დაყენებული ან ეს ანგარიში არ არის დამატებული.',
    error: 'მოქმედება ვერ შესრულდა. შეამოწმეთ მონაცემები და სცადეთ ხელახლა.',
    conflict: 'ეს თარიღები უკვე დაკავებულია.',
    owner: 'მმართველის დამატება',
    ownerHelp:
      'შეიყვანეთ მმართველის Google ანგარიშის ელფოსტა. მას ექნება სრული წვდომა მოთხოვნებსა და პარამეტრებზე.',
    add: 'წვდომის მინიჭება',
    signout: 'გასვლა',
    cancelTitle: 'გაუქმდეს ჩანაწერი?',
    cancelText:
      'დაკავებული თარიღები ისევ ხელმისაწვდომი გახდება. სტუმარს პირადად აცნობეთ გაუქმების შესახებ.',
    keep: 'შენარჩუნება',
    confirmTitle: 'დადასტურდეს მოთხოვნა?',
    confirmText:
      'არჩეული ღამეები დაიკავება. სტუმარი დადასტურებას თავის პროფილში ნახავს.',
    all: 'ყველა',
    loading: 'იტვირთება…',
    signed: 'შესული ხართ როგორც',
    requestNote:
      'ახალი მოთხოვნები თარიღებს არ იკავებს. ჯერ დაუკავშირდით სტუმარს, შემდეგ დაადასტურეთ ჯავშანი. შეტყობინებები სტუმრებს პირადად გაუგზავნეთ.',
    limit: 'ნაჩვენებია ბოლო 500 ჩანაწერი.',
    setupUsed:
      'წვდომა უკვე დაყენებულია. სთხოვეთ მფლობელს თქვენი ელფოსტის დამატება.',
    blockTitle: 'დაკავებული თარიღები',
    blockSub: 'დაამატეთ ტელეფონით ან სხვა საიტებით მიღებული ჯავშნები.',
    email: 'ელფოსტა',
    language: 'ენა',
  },
};
type Booking = {
  email: string | null;
  id: string;
  start: string;
  end: string;
  name: string;
  contact: string;
  guests: number;
  note: string;
  locale: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'blocked';
  created: string;
};
type Data = {
  bookings: Booking[];
  settings: {
    name: string;
    contact: string;
    address: string;
    maxGuests: number;
    nightlyPriceUsd: number;
    winterTheme: boolean;
    calendarReady: boolean;
  };
  owners: { email: string }[];
};
export default function Host({ email }: { email: string }) {
  const [lang, setLang] = useState<'ru' | 'en' | 'ka'>('ru'),
    [data, setData] = useState<Data | null>(null),
    [unauthorized, setUnauthorized] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [loadError, setLoadError] = useState(false),
    [filter, setFilter] = useState('all'),
    [confirmation, setConfirmation] = useState<{
      id: string;
      action: string;
    } | null>(null),
    [ready, setReady] = useState(false),
    [winter, setWinter] = useState(false);
  const t = words[lang];
  const load = useCallback(async () => {
    try {
      setLoadError(false);
      const r = await apiFetch('/api/admin', { cache: 'no-store' });
      if (r.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!r.ok) throw Error();
      const d = (await r.json()) as Data;
      setData(d);
      setReady(d.settings.calendarReady);
      setWinter(!!d.settings.winterTheme);
      setUnauthorized(false);
    } catch {
      setLoadError(true);
    }
  }, []);
  useEffect(() => {
    const l = localStorage.getItem('mta-language');
    if (l === 'ru' || l === 'en' || l === 'ka') setLang(l);
    void load();
  }, [load]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  async function action(p: Record<string, unknown>) {
    setBusy(true);
    setNotice('');
    try {
      const r = await apiFetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      const result = (await r.json()) as { error?: string };
      if (!r.ok) throw Error(result.error);
      await load();
      setNotice('saved');
      setConfirmation(null);
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'error');
      return false;
    } finally {
      setBusy(false);
    }
  }
  function formValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget));
  }
  return (
    <main className="host-page">
      <div className="preview-mode-notice">{winterCopy[lang].previewNotice}</div>
      <header className="host-header">
        <a href="/BakurianiChristmas/">
          <ArrowLeft size={16} />
          {t.back}
        </a>
        <div>
          <Select
            value={lang}
            onValueChange={(v) => {
              if (v) {
                setLang(v as typeof lang);
                localStorage.setItem('mta-language', v);
              }
            }}
          >
            <SelectTrigger aria-label={t.language}>
              <SelectValue>{lang === 'ka' ? 'GE' : lang.toUpperCase()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">RU</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ka">GE</SelectItem>
            </SelectContent>
          </Select>
          <a href="#" onClick={e=>{e.preventDefault();void apiFetch('/api/auth/logout',{method:'POST'}).then(()=>location.assign('/BakurianiChristmas/'))}} target="_top">
            {t.signout}
          </a>
        </div>
      </header>
      <div className="host-title">
        <span className="eyebrow">MTA · BAKURIANI</span>
        <h1>{t.title}</h1>
        <p>{t.sub}</p>
        <small>
          {t.signed}: {email}
        </small>
      </div>
      {notice && (
        <p
          role="status"
          className={notice === 'saved' ? 'host-notice' : 'form-error'}
        >
          {notice === 'saved'
            ? t.saved
            : notice === 'unavailable'
              ? t.conflict
              : notice === 'already_setup'
                ? t.setupUsed
                : notice === 'forbidden'
                  ? t.forbidden
                  : t.error}
        </p>
      )}
      {loadError ? (
        <div className="host-box">
          <p>{t.error}</p>
          <button className="button" onClick={load}>
            {t.refresh}
          </button>
        </div>
      ) : unauthorized ? (
        <section className="host-box setup-box">
          <LockKeyhole size={32} />
          <h2>{t.setup}</h2>
          <p>{t.forbidden}</p>
        </section>
      ) : !data ? (
        <p>{t.loading}</p>
      ) : (
        <Tabs defaultValue="requests">
          <TabsList className="host-tabs">
            <TabsTrigger value="requests">
              {t.requests} ·{' '}
              {data.bookings.filter((b) => b.status === 'pending').length}
            </TabsTrigger>
            <TabsTrigger value="calendar">{t.calendar}</TabsTrigger>
            <TabsTrigger value="settings">{t.settings}</TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            <div className="host-toolbar">
              <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
                <SelectTrigger aria-label={t.requests}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['all', 'pending', 'confirmed', 'blocked', 'cancelled'].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {t[s as keyof typeof t]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <button className="text-button" onClick={load}>
                {t.refresh}
              </button>
            <ClearHistory lang={lang} kind="bookings" onCleared={load} />
            </div>
            <p className="host-hint">{t.requestNote}</p>
            <div className="request-list">
              {data.bookings.filter(
                (b) => filter === 'all' || b.status === filter,
              ).length === 0 && (
                <div className="host-box empty-bookings">
                  <Check size={30} />
                  <p>{t.empty}</p>
                </div>
              )}
              {data.bookings
                .filter((b) => filter === 'all' || b.status === filter)
                .map((b) => (
                  <article className="host-box reservation" key={b.id}>
                    <div className="reservation-top">
                      <span className={'status status-' + b.status}>
                        {t[b.status]}
                      </span>
                      <small>
                        {b.id.slice(0, 8).toUpperCase()} ·{' '}
                        {b.locale === 'ka' ? 'GE' : b.locale.toUpperCase()}
                      </small>
                    </div>
                    <h3>
                      {b.start} <span>→</span> {b.end}
                    </h3>
                    {b.name && (
                      <p>
                        <strong>{b.name}</strong> · {t.guests}: {b.guests}
                      </p>
                    )}
                    {b.email && <p>Email: <a href={`mailto:${b.email}`}>{b.email}</a></p>}
                    {b.contact && (
                      <p>
                        {t.contact}: {b.contact}
                      </p>
                    )}
                    {b.note && <p className="reservation-note">{b.note}</p>}
                    <div className="reservation-actions">
                      {b.status === 'pending' && (
                        <button
                          className="button"
                          disabled={busy}
                          onClick={() =>
                            setConfirmation({ id: b.id, action: 'confirm' })
                          }
                        >
                          {t.confirm}
                          <Check size={16} />
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          className="text-button"
                          disabled={busy}
                          onClick={() =>
                            setConfirmation({ id: b.id, action: 'cancel' })
                          }
                        >
                          {t.cancel}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
            </div>
            {data.bookings.length === 500 && <p>{t.limit}</p>}
          </TabsContent>
          <TabsContent value="calendar">
            <section className="host-box">
              <h2>{t.blockTitle}</h2>
              <p>{t.blockSub}</p>
              <form
                onSubmit={(e) => {
                  const f = e.currentTarget;
                  void action({ action: 'block', ...formValues(e) }).then(
                    (ok) => {
                      if (ok) f.reset();
                    },
                  );
                }}
              >
                <div className="host-columns">
                  <label>
                    {t.start}
                    <input
                      type="date"
                      name="start"
                      min={todayInGeorgia()}
                      required
                    />
                  </label>
                  <label>
                    {t.end}
                    <input
                      type="date"
                      name="end"
                      min={todayInGeorgia()}
                      required
                    />
                  </label>
                </div>
                <label>
                  {t.note}
                  <input name="note" maxLength={1000} />
                </label>
                <p className="host-hint">{t.blockHelp}</p>
                <button className="button" disabled={busy}>
                  {t.block}
                  <LockKeyhole size={16} />
                </button>
              </form>
            </section>
          </TabsContent>
          <TabsContent value="settings">
            <Integrations lang={lang} />
            <section className="host-box">
              <h2>{t.settings}</h2>
              <form
                key={JSON.stringify(data.settings)}
                onSubmit={(e) =>
                  void action({
                    action: 'settings',
                    ...formValues(e),
                    calendarReady: ready,
                    ...(winterBeta ? { winterTheme: winter } : {}),
                  })
                }
              >
                <label>
                  {t.name}
                  <input
                    name="name"
                    defaultValue={data.settings.name}
                    maxLength={80}
                    required
                  />
                </label>
                <label>
                  {t.hostContact}
                  <input
                    name="contact"
                    defaultValue={data.settings.contact}
                    maxLength={160}
                  />
                </label>
                <label>
                  {t.address}
                  <input
                    name="address"
                    defaultValue={data.settings.address}
                    maxLength={240}
                  />
                </label>
                <label>
                  {t.max}
                  <input
                    type="number"
                    name="maxGuests"
                    min={1}
                    max={30}
                    defaultValue={data.settings.maxGuests || ''}
                    required
                  />
                </label>
                <label>
                  {({ru:'Цена за ночь (USD)',en:'Price per night (USD)',ka:'ფასი ღამეში (USD)'})[lang]}
                  <input type="number" name="nightlyPriceUsd" min={1} max={100000} step={1} defaultValue={data.settings.nightlyPriceUsd} required />
                </label>
                {winterBeta && <>
                  <label className="ready-switch">
                    <Switch checked={winter} onCheckedChange={setWinter} />
                    {({ru:'Зимняя тема',en:'Winter theme',ka:'ზამთრის თემა'})[lang]}
                  </label>
                  <p className="host-hint">{({ru:'После сохранения тема изменится только в этой локальной копии.',en:'Saving changes the theme in this local preview only.',ka:'თემა მხოლოდ ამ სატესტო ვერსიაში შეიცვლება.'})[lang]}</p>
                </>}
                <label className="ready-switch">
                  <Switch checked={ready} onCheckedChange={setReady} />
                  {t.ready}
                </label>
                <p className="host-hint">{t.readyHelp}</p>
                <button className="button" disabled={busy}>
                  {t.save}
                  <Check size={16} />
                </button>
              </form>
            </section>
            <section className="host-box">
              <h2>{t.owner}</h2>
              <p>{t.ownerHelp}</p>
              <ul className="owner-list">
                {data.owners.map((o) => (
                  <li key={o.email}>{o.email}</li>
                ))}
              </ul>
              <form
                onSubmit={(e) => {
                  const f = e.currentTarget;
                  void action({ action: 'owner', ...formValues(e) }).then(
                    (ok) => {
                      if (ok) f.reset();
                    },
                  );
                }}
              >
                <label>
                  {t.email}
                  <input name="email" type="email" maxLength={160} required />
                </label>
                <button className="button" disabled={busy}>
                  {t.add}
                  <ArrowUpRight size={18} />
                </button>
              </form>
            </section>
          </TabsContent>
        </Tabs>
      )}
      <AlertDialog
        open={!!confirmation}
        onOpenChange={(v) => !v && !busy && setConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmation?.action === 'cancel'
                ? t.cancelTitle
                : t.confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation?.action === 'cancel' ? t.cancelText : t.confirmText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t.keep}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                if (confirmation) void action(confirmation);
              }}
            >
              {busy ? (
                <LoaderCircle size={16} className="spinner" />
              ) : confirmation?.action === 'cancel' ? (
                t.cancel
              ) : (
                t.confirm
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
