import { stayNights, todayInGeorgia } from './dates';

// Local prototype. No Firebase, Worker, Google or Telegram network calls.
const prefix = 'mta-winter-redesign-v1:';
const defaults = {
  name: 'Mta · Bakuriani', contact: '+972 54-792-7001',
  address: 'Raymond (Guram) Gogoladze Street 42, Bakuriani, Georgia',
  maxGuests: 4, nightlyPriceUsd: 150, winterTheme: true, calendarReady: true,
};
type Booking = {
  id: string; email: string | null; start: string; end: string; name: string;
  contact: string; guests: number; note: string; status: 'pending'|'confirmed'|'cancelled'|'blocked';
  locale: string; created: string;
};
const guest = { name: 'Demo Guest', email: 'guest@example.test', phone: '' };
function read<T>(key:string, fallback:T):T {
  try { const item=localStorage.getItem(prefix+key); return item===null?fallback:JSON.parse(item); }
  catch { return fallback; }
}
function write(key:string,value:unknown) {localStorage.setItem(prefix+key,JSON.stringify(value));}
export function previewSettings() {return {...defaults,...read('settings',{})};}
const bookings = () => read<Booking[]>('bookings', []);
export function previewAvailability() {
  const today=todayInGeorgia();
  const dates=new Set<string>();
  for(const b of bookings()) if(b.status==='confirmed'||b.status==='blocked') {
    try {stayNights(b.start,b.end,b.start).filter(d=>d>=today).forEach(d=>dates.add(d));} catch {}
  }
  return {today, dates:[...dates].sort(), settings:previewSettings()};
}
export async function signInGoogle() {
  write('signed-in',true);
  location.assign(location.pathname.startsWith('/host')?'/host':'/profile');
}
export async function apiFetch(path:string,init:RequestInit={}) {
  const method=(init.method||'GET').toUpperCase();
  const settings=previewSettings();
  const all=bookings();
  const user=read('signed-in',true)?{...guest,phone:read('phone','')}:null;
  const ok=(value:unknown)=>Response.json(value);
  const fail=(error:string,status=400)=>Response.json({error},{status});
  let input:Record<string,any>={};
  try {if(init.body)input=JSON.parse(String(init.body));}catch{return fail('invalid_input');}
  if(path==='/api/availability')return ok(previewAvailability());
  if(path==='/api/auth/logout'){write('signed-in',false);return ok({ok:true});}
  if(path==='/api/profile') {
    if(method==='POST'){if(!user)return fail('unauthorized',403);write('phone',String(input.phone||''));return ok({ok:true});}
    return ok({user,googleReady:true,bookings:all.filter(b=>b.email===guest.email),hostWhatsApp:'972547927001'});
  }
  if(path==='/api/admin/notifications')return ok(method==='POST'?{ok:true}:{googleReady:false,telegramReady:false,accounts:[],notifications:[]});
  if(path==='/api/bookings' && method==='POST') {
    if (!user||!settings.calendarReady)return fail('not_ready',403);
    if(!Number.isInteger(input.guests)||input.guests<1||input.guests>settings.maxGuests)return fail('invalid_guests');
    try {
      if(stayNights(input.start,input.end).some(d=>previewAvailability().dates.includes(d)))return fail('unavailable',409);
    }catch{return fail('invalid_dates');}
    const b:Booking={id:crypto.randomUUID(),email:guest.email,start:input.start,end:input.end,guests:input.guests,name:String(input.name||guest.name),contact:String(input.contact||''),note:String(input.note||''),status:'pending',locale:input.locale||'ru',created:new Date().toISOString()};
    write('bookings',[b,...all]);return ok({id:b.id});
  }
  if(path==='/api/bookings/cancel'&&method==='POST') {
    write('bookings',all.map(b=>b.id===input.id&&b.email===guest.email?{...b,status:'cancelled'}:b));return ok({ok:true});
  }
  if(path==='/api/admin'){
    if(method==='GET')return ok({settings,bookings:all,owners:read('owners',[])});
    if(input.action==='settings'){
      const {name,contact,address,maxGuests,nightlyPriceUsd,calendarReady,winterTheme}=input;
      write('settings',{name,contact,address,maxGuests:Number(maxGuests),nightlyPriceUsd:Number(nightlyPriceUsd),calendarReady:!!calendarReady,winterTheme:!!winterTheme});return ok({ok:true});
    }
    if(input.action==='clear_history'){write('bookings',all.filter(b=>b.status==='confirmed'||b.status==='blocked'));return ok({ok:true});}
    if(input.action==='owner'){write('owners',[...read<object[]>('owners',[]),{email:input.email}]);return ok({ok:true});}
    if(input.action==='block'){
      try{if(stayNights(input.start,input.end).some(d=>previewAvailability().dates.includes(d)))return fail('unavailable',409);}catch{return fail('invalid_dates');}
      const b:Booking={id:crypto.randomUUID(),email:null,start:input.start,end:input.end,guests:0,name:'Demo · Blocked',contact:'',note:String(input.note||''),status:'blocked',locale:'ru',created:new Date().toISOString()};
      write('bookings',[b,...all]);return ok({ok:true});
    }
    if(input.action==='confirm'||input.action==='cancel'){
      if(input.action==='confirm'){
        const b=all.find(b=>b.id===input.id);
        if(!b)return fail('not_found',404);
        try{if(stayNights(b.start,b.end).some(d=>previewAvailability().dates.includes(d)))return fail('unavailable',409);}catch{return fail('invalid_dates');}
      }
      write('bookings',all.map(b=>b.id===input.id?{...b,status:input.action==='confirm'?'confirmed':'cancelled'}:b));return ok({ok:true});
    }
  }
  return fail('preview_only',403);
}
