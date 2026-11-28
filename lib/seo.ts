import type { Lang } from './i18n';

export const SITE_ORIGIN = 'https://bakurianimta.web.app';

export const seoCopy: Record<
  Lang,
  { title: (price: number) => string; description: (price: number) => string }
> = {
  ru: {
    title: (price) => `Аренда квартиры в Бакуриани от $${price} за ночь | Mta`,
    description: (price) =>
      `Апартаменты в Бакуриани до 4 гостей: $${price} за ночь, календарь свободных дат и спальные места для семьи. Одна двуспальная кровать, две односпальные и раскладной диван. Заявка без онлайн-оплаты.`,
  },
  en: {
    title: (price) => `Bakuriani apartment rental — $${price} per night | Mta`,
    description: (price) =>
      `Apartment in Bakuriani for up to 4 guests, $${price} per night. Check the availability calendar. One double bed, two single beds and a sofa bed. Send a booking request with no online payment.`,
  },
  ka: {
    title: (price) => `ბინის ქირაობა ბაკურიანში — $${price} ღამეში | Mta`,
    description: (price) =>
      `ბინა ბაკურიანში მაქსიმუმ 4 სტუმრისთვის — $${price} ღამეში. შეამოწმეთ თავისუფალი თარიღების კალენდარი. ერთი ორადგილიანი საწოლი, ორი ერთადგილიანი საწოლი და გასაშლელი დივანი. ჯავშნის მოთხოვნა ონლაინ გადახდის გარეშე.`,
  },
};

export const localizedPath = (lang: Lang) => (lang === 'ru' ? '/BakurianiChristmas/' : `/BakurianiChristmas/${lang}/`);

export function languageFromPath(pathname: string): Lang {
  pathname = pathname.replace(/^\/BakurianiChristmas/, '') || '/';
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
  if (pathname === '/ka' || pathname.startsWith('/ka/')) return 'ka';
  return 'ru';
}

const htmlLang: Record<Lang, string> = { ru: 'ru-RU', en: 'en', ka: 'ka-GE' };
const ogLocale: Record<Lang, string> = { ru: 'ru_RU', en: 'en_GB', ka: 'ka_GE' };

function setMeta(selector: string, attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function updateSeoMetadata(lang: Lang, nightlyPriceUsd = 150) {
  const copy = seoCopy[lang];
  const price = Number.isFinite(nightlyPriceUsd) && nightlyPriceUsd > 0 ? nightlyPriceUsd : 150;
  const title = copy.title(price);
  const description = copy.description(price);
  const pageUrl = `${SITE_ORIGIN}${localizedPath(lang)}`;

  document.documentElement.lang = htmlLang[lang];
  document.title = title + ' · Winter Preview';
  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="robots"]', 'name', 'robots', 'noindex,nofollow');
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Mta · Bakuriani');
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', pageUrl);
  setMeta('meta[property="og:image"]', 'property', 'og:image', `${SITE_ORIGIN}/BakurianiChristmas/images/lounge.jpg`);
  setMeta('meta[property="og:locale"]', 'property', 'og:locale', ogLocale[lang]);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setLink('canonical', pageUrl);

  const languageUrls: Record<Lang, string> = {
    ru: SITE_ORIGIN,
    en: `${SITE_ORIGIN}/en/`,
    ka: `${SITE_ORIGIN}/ka/`,
  };
  for (const alternate of Object.keys(languageUrls) as Lang[]) {
    setLink('alternate', languageUrls[alternate], alternate);
  }
  setLink('alternate', SITE_ORIGIN, 'x-default');
}
