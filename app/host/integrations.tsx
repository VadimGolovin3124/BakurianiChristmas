'use client';
import ClearHistory from './clear-history';
import {apiFetch,signInGoogle} from '@/lib/firebase-client';
import { useEffect, useState, useCallback } from 'react';
import type { Lang } from '@/lib/i18n';
const labels = {
  ru: {
    title: 'Google и Telegram',
    ready: 'Подключено',
    off: 'Ожидает подключения',
    help: 'Подключите два аккаунта по личным ссылкам: одну откройте вы, другую — хозяйка. Не передавайте ссылки посторонним. Бот принимает команды /dates и /requests только от подключённых аккаунтов.',
    retry: 'Повторить неудачные отправки',
    empty: 'Уведомлений пока нет.',
    pending: 'В очереди',
    sending: 'Отправляется — результат уточняется',
    sent: 'Отправлено в Telegram',
    delivered: 'Доставлено',
    read: 'Прочитано',
    failed: 'Ошибка',
    uncertain: 'Результат неизвестен — проверьте Telegram',
    error: 'Не удалось загрузить уведомления.',
    note: 'При неопределённом результате автоматическая повторная отправка отключена, чтобы не дублировать сообщения.',
    refresh: 'Обновить',
  },
  en: {
    title: 'Google & Telegram',
    ready: 'Connected',
    off: 'Awaiting connection',
    help: 'Connect your account and your host using their separate private links. Do not share these links with others. Only connected accounts can use /dates and /requests.',
    retry: 'Retry failed messages',
    empty: 'No notifications yet.',
    pending: 'Queued',
    sending: 'Sending — result pending',
    sent: 'Sent to Telegram',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Failed',
    uncertain: 'Unknown result — check Telegram',
    error: 'Could not load notifications.',
    note: 'Messages with unknown outcomes are not retried automatically to avoid duplicates.',
    refresh: 'Refresh',
  },
  ka: {
    title: 'Google და Telegram',
    ready: 'დაკავშირებულია',
    off: 'დაკავშირების მოლოდინში',
    help: 'დააკავშირეთ თქვენი და მასპინძლის ანგარიშები ცალკე პირადი ბმულებით. ბმულები სხვებს არ გაუზიაროთ. /dates და /requests მხოლოდ დაკავშირებული ანგარიშებისთვისაა ხელმისაწვდომი.',
    retry: 'წარუმატებელი გაგზავნის გამეორება',
    empty: 'შეტყობინებები ჯერ არ არის.',
    pending: 'რიგშია',
    sending: 'იგზავნება — შედეგი ზუსტდება',
    sent: 'გაგზავნილია Telegram-ში',
    delivered: 'მიწოდებულია',
    read: 'წაკითხულია',
    failed: 'შეცდომა',
    uncertain: 'შედეგი უცნობია — შეამოწმეთ Telegram',
    error: 'შეტყობინებები ვერ ჩაიტვირთა.',
    note: 'დუბლირების თავიდან ასაცილებლად უცნობი შედეგის მქონე შეტყობინებები ავტომატურად არ იგზავნება ხელახლა.',
    refresh: 'განახლება',
  },
};
type Data = {
  googleReady: boolean;
  telegramReady: boolean;
  accounts: { phone: string; connected: boolean; invite: string | null }[];
  notifications: {
    id: string;
    booking_id: string;
    recipient: string;
    status: string;
    error: string;
  }[];
};
export default function Integrations({ lang }: { lang: Lang }) {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  const t = labels[lang];
  const load = useCallback(async () => {
    try {
      setError(false);
      const r = await apiFetch('/api/admin/notifications');
      if (!r.ok) throw Error();
      setData((await r.json()) as Data);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <section className="host-box">
      <h2>{t.title}</h2>
      <p>{t.help}</p>
      {error ? (
        <p className="form-error">{t.error}</p>
      ) : (
        data && (
          <>
            <div className="integrations-status">
              <span className="integration-chip">
                Google: {data.googleReady ? t.ready : t.off}
              </span>
              <span className="integration-chip">
                Telegram: {data.telegramReady ? t.ready : t.off}
              </span>
            </div>
            <div>
              {data.accounts.map((a) => (
                <p key={a.phone}>
                  +{a.phone} · {a.connected ? t.ready : t.off}{' '}
                  {a.invite && (
                    <a
                      href={a.invite}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lang === 'ru'
                        ? 'Подключить этот аккаунт'
                        : lang === 'ka'
                          ? 'ანგარიშის დაკავშირება'
                          : 'Connect this account'}{' '}
                      ↗
                    </a>
                  )}
                </p>
              ))}
            </div>
            <div className="reservation-actions">
              <ClearHistory lang={lang} kind="notifications" onCleared={load} />
              <button
                className="button"
                disabled={busy || !data.telegramReady}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await apiFetch('/api/admin/notifications', {
                      method: 'POST',
                    });
                    if (!r.ok) throw Error();
                    await load();
                  } catch {
                    setError(true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t.retry}
              </button>
              <button className="text-button" onClick={load}>
                {t.refresh}
              </button>
            </div>
            <div className="notification-list">
              {data.notifications.length === 0 ? (
                <p>{t.empty}</p>
              ) : (
                data.notifications.map((n) => (
                  <div className="notification-row" key={n.id}>
                    <span>
                      #{n.booking_id.slice(0, 8).toUpperCase()} · +{n.recipient}
                    </span>
                    <span
                      className={
                        ['failed', 'uncertain'].includes(n.status)
                          ? 'notification-error'
                          : ''
                      }
                    >
                      {t[n.status as keyof typeof t] || n.status}
                    </span>
                    {n.error && <code>{n.error}</code>}
                  </div>
                ))
              )}
            </div>
            <p className="host-hint">{t.note}</p>
          </>
        )
      )}
    </section>
  );
}
