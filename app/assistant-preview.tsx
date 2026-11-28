import { useEffect, useRef, useState } from 'react';
import { ArrowUp, MessageCircle, X, Sparkles } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { previewAvailability } from '@/lib/firebase-client';
import './assistant-preview.css';

const text = {
  ru: { help:'Помощь', title:'Ваш помощник', sub:'MTA · BAKURIANI', hello:'Здравствуйте! Я помогу разобраться с вопросами о квартире и бронировании.', placeholder:'Спросите о квартире…', send:'Отправить', close:'Закрыть чат', demo:'Тестовый режим · ответы-примеры', chips:['Сколько гостей?','Какие спальные места?','Можно с животными?'], guests:'В квартире могут разместиться до 4 гостей.', beds:'В квартире есть одна двуспальная кровать, две односпальные и раскладной диван.', unknown:'Эту информацию пока нужно уточнить у хозяйки. Я не буду её предполагать.', other:'Извините, я помогаю только с вопросами о квартире MTA в Бакуриани и её аренде.' },
  en: { help:'Help', title:'Your assistant', sub:'MTA · BAKURIANI', hello:'Hello! I can help with questions about the apartment and your stay.', placeholder:'Ask about the apartment…', send:'Send', close:'Close chat', demo:'Preview · example answers', chips:['How many guests?','What beds are there?','Are pets allowed?'], guests:'The apartment accommodates up to 4 guests.', beds:'There is one double bed, two single beds and a sofa bed.', unknown:'Please check this detail with the host; it has not been confirmed yet.', other:'Sorry, I can only help with questions about the MTA apartment in Bakuriani and renting it.' },
  ka: { help:'დახმარება', title:'თქვენი ასისტენტი', sub:'MTA · BAKURIANI', hello:'გამარჯობა! დაგეხმარებით ბინისა და დაჯავშნის შესახებ კითხვებზე.', placeholder:'იკითხეთ ბინის შესახებ…', send:'გაგზავნა', close:'ჩატის დახურვა', demo:'სატესტო რეჟიმი · პასუხების მაგალითები', chips:['რამდენი სტუმარი?','როგორი საწოლებია?','შეიძლება ცხოველები?'], guests:'ბინაში შესაძლებელია 4 სტუმრის განთავსება.', beds:'ბინაში არის ერთი ორადგილიანი საწოლი, ორი ერთადგილიანი საწოლი და გასაშლელი დივანი.', unknown:'ეს ინფორმაცია ჯერ მასპინძელთან უნდა დაზუსტდეს.', other:'უკაცრავად, მე მხოლოდ ბაკურიანში MTA ბინისა და მისი დაჯავშნის შესახებ კითხვებზე ვპასუხობ.' },
};
type Citation = {end:number;url:string;title:string};
type Message = { role:'user'|'assistant'; content:string; citations?:Citation[] };
function renderInline(text:string):React.ReactNode[] {
  const nodes:React.ReactNode[]=[]; const pattern=/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*/g; let last=0; let match:RegExpExecArray|null;
  while((match=pattern.exec(text))){nodes.push(text.slice(last,match.index)); if(match[1]) nodes.push(<a className="assistant-source" key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>); else nodes.push(<strong key={match.index}>{match[3]}</strong>);last=pattern.lastIndex;} nodes.push(text.slice(last));return nodes;
}
function answerWithCitations(message:Message) {
  const links=(message.citations||[]).filter(c=>Number.isInteger(c.end)&&c.end>=0&&c.end<=message.content.length&&/^https?:\/\//i.test(c.url)).sort((a,b)=>a.end-b.end);
  let at=0; const nodes:React.ReactNode[]=[];
  links.forEach((c,i)=>{nodes.push(<span key={`text${i}`}>{renderInline(message.content.slice(at,c.end))}</span>); nodes.push(<a className="assistant-source" key={i} href={c.url} target="_blank" rel="noopener noreferrer" title={c.title}>[{i+1}]</a>); at=c.end;});
  nodes.push(<span key="tail">{renderInline(message.content.slice(at))}</span>); return nodes;
}
export default function AssistantPreview({lang}:{lang:Lang}) {
  const t=text[lang];
  const [visible,setVisible]=useState(false), [open,setOpen]=useState(false), [value,setValue]=useState(''), [messages,setMessages]=useState<Message[]>([]), [sending,setSending]=useState(false), [error,setError]=useState('');
  const end=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const show=()=>setVisible(window.scrollY>2); window.addEventListener('scroll',show,{passive:true}); show(); return()=>window.removeEventListener('scroll',show); },[]);
  useEffect(()=>{if(open) end.current?.scrollIntoView({block:'nearest'});},[messages,open]);
  async function send(input:string) {
    const q=input.trim(); if(!q || sending)return;
    const next:Message[]=[...messages,{role:'user',content:q}]; setMessages(next); setValue(''); setError(''); setSending(true);
    try {
      const {settings,dates}=previewAvailability();
      const question=q.toLowerCase();
      let answer=t.unknown;
      if (/гост|человек|guest|people|სტუმარ|ადამიან/i.test(question)) answer=({ru:`Вместимость: до ${settings.maxGuests} гостей.`,en:`Up to ${settings.maxGuests} guests.`,ka:`მაქსიმუმ ${settings.maxGuests} სტუმარი.`})[lang];
      else if (/кроват|спаль|диван|bed|sofa|საწოლ|დივან/i.test(question)) answer=t.beds;
      else if (/цен|стоим|доллар|price|cost|nightly|ფას|ღირ/i.test(question)) answer=({ru:`Стоимость проживания — $${settings.nightlyPriceUsd} за ночь. Выберите даты в календаре для расчёта общей суммы.`,en:`The rate is $${settings.nightlyPriceUsd} per night. Choose dates in the calendar to calculate the total.`,ka:`ღამის ფასი $${settings.nightlyPriceUsd} არის. ჯამის გამოსათვლელად აირჩიეთ თარიღები კალენდარში.`})[lang];
      else if (/дат|свобод|занят|брон|date|availab|book|ჯავშ|თარიღ|თავისუფალ/i.test(question)) answer=({ru:dates.length?`В тестовом календаре заняты: ${dates.join(', ')}. Остальные даты проверьте в календаре.`:'В тестовом календаре нет занятых дат. Вы можете выбрать заезд и выезд.',en:dates.length?`Demo calendar booked nights: ${dates.join(', ')}. Check the calendar for other dates.`:'The demo calendar has no occupied dates. Choose your check-in and check-out.',ka:dates.length?`სატესტო კალენდარში დაკავებულია: ${dates.join(', ')}.`:'სატესტო კალენდარში დაკავებული თარიღები არ არის.'})[lang];
      else if (/адрес|наход|address|location|მისამართ|მდებარე/i.test(question)) answer=settings.address;
      else if (/питом|животн|собак|кошк|pet|animal|ცხოველ|ძაღლ|კატ/i.test(question)) answer=t.unknown;
      else if (/баку|квартир|дом|apartment|bakuriani|house|ბინა|ბაკურიან/i.test(question)) answer=t.unknown;
      else answer=t.other;
      setMessages(m=>[...m,{role:'assistant',content:answer}]);
    } catch(e) {
      setMessages(messages); setValue(q);
      const missing=e instanceof Error && e.message==='not_configured';
      const limited=e instanceof Error && e.message==='rate_limit';
      setError(({ru:missing?'Помощник временно недоступен.':limited?'Слишком много запросов. Попробуйте позже.':'Не удалось получить ответ. Попробуйте ещё раз.',en:missing?'The assistant is temporarily unavailable.':limited?'Too many requests. Please try later.':'Could not get a response. Please try again.',ka:missing?'ასისტენტი დროებით მიუწვდომელია.':limited?'ძალიან ბევრი მოთხოვნაა. სცადეთ მოგვიანებით.':'პასუხის მიღება ვერ მოხერხდა. სცადეთ ხელახლა.'})[lang]);
    } finally {setSending(false)}
  }
  return <div className={'assistant-widget '+(visible?'is-visible':'')} aria-hidden={!visible} inert={!visible}>
    {open && <section className="assistant-panel" aria-label={t.title}>
      <header className="assistant-header"><span className="assistant-mark"><Sparkles size={19}/></span><div><small>{t.sub}</small><strong>{t.title}</strong></div><button className="assistant-close" onClick={()=>setOpen(false)} aria-label={t.close}><X size={19}/></button></header>
      <div className="assistant-body" aria-live="polite"><div className="assistant-bubble bot">{t.hello}</div>{messages.length===0 && <div className="assistant-chips">{[...t.chips,({ru:'Какие даты свободны?',en:'Which dates are available?',ka:'რომელი თარიღებია თავისუფალი?'})[lang]].map(c=><button key={c} disabled={sending} onClick={()=>void send(c)}>{c}</button>)}</div>}{messages.map((m,i)=><div key={i} className={'assistant-bubble '+(m.role==='user'?'user':'bot')}>{answerWithCitations(m)}</div>)}{sending&&<div className="assistant-bubble bot">…</div>}{error&&<div className="assistant-error" role="alert">{error}</div>}<div ref={end}/></div>
      <form className="assistant-compose" onSubmit={e=>{e.preventDefault();void send(value)}}><input value={value} onChange={e=>setValue(e.target.value)} placeholder={t.placeholder} maxLength={500} aria-label={t.placeholder} disabled={sending}/><button aria-label={t.send} disabled={!value.trim()||sending}><ArrowUp size={18}/></button></form><div className="assistant-disclaimer">{t.demo}</div>
    </section>}
    <button className="assistant-launch" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={open?t.close:t.help}>{open?<X size={20}/>:<MessageCircle size={20}/>}<span>{t.help}</span></button>
  </div>;
}
