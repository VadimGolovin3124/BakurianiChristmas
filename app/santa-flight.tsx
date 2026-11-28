import { useEffect, useRef, useState } from 'react';

const FLIGHT_DURATION = 9000;
const TRAIL_DURATION = 3400;
const FLIGHT_INTERVAL = 35000;
type Flake = {
  x: number; y: number; vx: number; vy: number; rotation: number; spin: number;
  size: number; born: number; life: number; phase: number; kind: 'flake' | 'spark' | 'dot';
};

/** A small, decorative flight. It never intercepts the booking controls. */
export default function SantaFlight() {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const hero = container.current?.parentElement;
    if (!hero) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    let lastFlight: number | null = null;
    const clear = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
    function schedule() {
      clear();
      if (!visible || document.hidden || reduce.matches) return;
      // Start-to-start cadence: a nine-second flight and its trail are part of
      // the 35-second interval, rather than adding to it.
      const delay = lastFlight === null ? 3800 : Math.max(1000, FLIGHT_INTERVAL - (performance.now() - lastFlight));
      timer = setTimeout(() => {
        if (!visible || document.hidden || reduce.matches) return;
        lastFlight = performance.now();
        setFlying(true);
        timer = setTimeout(() => { setFlying(false); schedule(); }, FLIGHT_DURATION + TRAIL_DURATION);
      }, delay);
    }
    const observer = new IntersectionObserver(([entry]) => {
      const next = entry.isIntersecting && entry.intersectionRatio >= 0.12;
      if (visible === next) return;
      visible = next;
      clear();
      setFlying(false);
      if (visible) schedule();
    }, { threshold: 0.12 });
    observer.observe(hero);
    const visibilityChanged = () => { clear(); setFlying(false); schedule(); };
    document.addEventListener('visibilitychange', visibilityChanged);
    reduce.addEventListener('change', visibilityChanged);
    return () => {
      clear();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged);
      reduce.removeEventListener('change', visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (!flying) return;
    const surface = canvas.current;
    const stage = container.current;
    const sprite = flyer.current;
    const ctx = surface?.getContext('2d');
    if (!surface || !stage || !sprite || !ctx) return;
    const particles: Flake[] = [];
    const start = performance.now();
    let previous = start;
    let emitted = start;
    let frame = 0;
    let width = 0, height = 0;
    function resize() {
      const bounds = stage!.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      surface!.width = Math.round(width * scale);
      surface!.height = Math.round(height * scale);
      ctx!.setTransform(scale, 0, 0, scale, 0, 0);
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    const random = (min: number, max: number) => min + Math.random() * (max-min);
    function emit(now: number) {
      const bounds = stage!.getBoundingClientRect();
      const icon = sprite!.getBoundingClientRect();
      // Emit from the back of the actual SVG sleigh, in stage coordinates.
      const x = icon.left - bounds.left + icon.width * .105;
      const y = icon.top - bounds.top + icon.height * .68;
      if (x < -20 || x > width + 5) return;
      const density = width < 650 ? 2 : 3;
      for (let i = 0; i < density; i++) {
        const kind = Math.random() < .64 ? 'flake' : Math.random() < .6 ? 'spark' : 'dot';
        particles.push({
          x: x + random(-10, 4), y: y + random(-7, 7),
          vx: random(-43,-12), vy: random(12,40), rotation: random(0,Math.PI*2),
          spin: random(-1.5,1.5), size: kind === 'flake' ? random(3,7.3) : random(1.4,3.7),
          born: now, life: random(1900,3150), phase: random(0,Math.PI*2), kind,
        });
      }
      if (particles.length > 145) particles.splice(0, particles.length - 145);
    }
    function drawSnow(p: Flake) {
      ctx!.strokeStyle = '#fff9ea';
      ctx!.lineWidth = .85;
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      for (let branch = 0; branch < 6; branch++) {
        const a = branch * Math.PI / 3;
        const dx = Math.cos(a), dy = Math.sin(a);
        ctx!.moveTo(0,0); ctx!.lineTo(dx*p.size,dy*p.size);
        const mx=dx*p.size*.62,my=dy*p.size*.62;
        for (const direction of [-1,1]) {
          const twig = a + direction*Math.PI/3;
          ctx!.moveTo(mx,my);ctx!.lineTo(mx+Math.cos(twig)*p.size*.32,my+Math.sin(twig)*p.size*.32);
        }
      }
      ctx!.stroke();
    }
    function animate(now: number) {
      const dt = Math.min((now-previous)/1000, .045);
      previous = now;
      const elapsed = now-start;
      ctx!.clearRect(0,0,width,height);
      if (elapsed < FLIGHT_DURATION && now-emitted > (width < 650 ? 75 : 53)) {
        emit(now); emitted = now;
      }
      for (let i=particles.length-1; i>=0; i--) {
        const p = particles[i], age = now-p.born;
        if (age >= p.life || p.y > height+10 || p.x < -20) { particles.splice(i,1); continue; }
        p.vx *= Math.pow(.77,dt);
        p.vy += dt*11;
        p.x += (p.vx+Math.sin(age/290+p.phase)*8)*dt;
        p.y += p.vy*dt;
        p.rotation += p.spin*dt;
        const progress=age/p.life;
        ctx!.save();
        ctx!.globalAlpha=Math.min(1,age/100)*(1-progress*progress);
        ctx!.translate(p.x,p.y); ctx!.rotate(p.rotation);
        if(p.kind==='flake') drawSnow(p);
        else if(p.kind==='spark') {
          ctx!.fillStyle='#ffe4a3';
          ctx!.beginPath();ctx!.moveTo(0,-p.size*1.7);ctx!.quadraticCurveTo(p.size*.2,-p.size*.2,p.size,0);ctx!.quadraticCurveTo(p.size*.2,p.size*.2,0,p.size*1.7);ctx!.quadraticCurveTo(-p.size*.2,p.size*.2,-p.size,0);ctx!.quadraticCurveTo(-p.size*.2,-p.size*.2,0,-p.size*1.7);ctx!.fill();
        } else {
          ctx!.fillStyle='#fff9ef';ctx!.beginPath();ctx!.arc(0,0,p.size*.55,0,Math.PI*2);ctx!.fill();
        }
        ctx!.restore();
      }
      if(elapsed < FLIGHT_DURATION+TRAIL_DURATION && (elapsed < FLIGHT_DURATION || particles.length))frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); ctx.clearRect(0,0,width,height); };
  }, [flying]);

  return <div className="santa-sky" ref={container} aria-hidden="true">
    <canvas className="santa-snow-trail" ref={canvas} />
    {flying && <div className="santa-flight-path">
      <div className="santa-flyer" ref={flyer}>
        <svg className="santa-art" viewBox="0 0 390 126" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="santa-red" x1="0" y1="0" x2="0.7" y2="1">
              <stop stopColor="#e16b5d"/><stop offset=".45" stopColor="#aa2831"/><stop offset="1" stopColor="#6f1f25"/>
            </linearGradient>
            <linearGradient id="santa-gold" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#fff0c1"/><stop offset="1" stopColor="#bd8a45"/>
            </linearGradient>
            <linearGradient id="santa-deer" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#c7a278"/><stop offset="1" stopColor="#795135"/>
            </linearGradient>
            <g id="santa-star" stroke="#ffe7aa" strokeLinecap="round">
              <path d="M0 -5V5M-5 0H5" strokeWidth="1.4"/>
              <path d="M-2.6 -2.6 2.6 2.6M-2.6 2.6 2.6-2.6" strokeWidth=".7"/>
            </g>
            <g id="santa-reindeer" stroke="#553a29" strokeWidth="1.15" strokeLinejoin="round">
              <path className="santa-deer-tail" d="M4 48Q-9 45-6 35Q-1 40 10 40" fill="#ab8a63"/>
              <g className="santa-deer-legs santa-deer-back">
                <path d="M19 58Q16 69 8 74L1 81 8 85 19 77 29 66 29 58Z" fill="#91704e"/>
                <path d="m1 81 7 4 3-5-7-4Z" fill="#3f3029"/>
                <path d="M31 59 39 71 48 67 52 71 40 80 27 68 23 59Z" fill="#ac8a60"/>
                <path d="m48 67 4 4-4 4-5-5Z" fill="#3f3029"/>
              </g>
              <g className="santa-deer-legs santa-deer-front">
                <path d="M58 57 65 70 74 73 78 78 69 80 57 76 48 60Z" fill="#98704d"/>
                <path d="m74 73 4 5-9 2-2-5Z" fill="#3f3029"/>
                <path d="M68 55 81 64 89 58 94 61 85 72 72 70 61 60Z" fill="#bd986f"/>
                <path d="m88 58 6 3-3 5-6-3Z" fill="#3f3029"/>
              </g>
              <path d="M9 40Q25 33 46 38Q56 42 62 35L69 21Q72 17 79 19L89 25 100 27Q106 30 102 34L89 36 84 34 77 51Q72 64 55 65L19 64Q6 61 5 51Q4 45 9 40Z" fill="url(#santa-deer)"/>
              <path d="M64 44Q74 35 78 26L84 34 76 50Q71 58 64 59" fill="#e0c1a0" stroke="none"/>
              <path className="santa-deer-ear" d="M72 23 64 14Q65 9 75 18" fill="#b8946d"/>
              <path d="M82 21Q76 15 78 10M78 10 71 7 67 0M78 10 84 4 85-3M78 10 77 1M88 24 88 14 97 7 99 0M88 14 89 4 86 0" stroke="#d7b77a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <path d="M82 22Q83 19 87 23L85 27Z" fill="#cbb08d" stroke="none"/>
              <circle cx="92" cy="28" r="1.9" fill="#292029" stroke="none"/>
              <circle cx="102" cy="31" r="2" fill="#492f25" stroke="none"/>
              <path d="M65 37 77 43 73 49 61 43Z" fill="#9d2d31" stroke="#e2bb73" strokeWidth=".9"/>
              <g className="santa-harness-bell"><path d="M69 43v3" stroke="#ecd09b" strokeWidth="1.2"/><circle cx="69" cy="47" r="2.9" fill="#f5d18c" stroke="#8e6538" strokeWidth=".65"/></g>
              <path d="M8 45Q35 49 61 45" stroke="#e0bd84" strokeWidth="1.4" fill="none"/>
            </g>
          </defs>
          {/* Sparkles trail behind the sleigh. */}
          <g className="santa-trail" fill="#f5d493">
            <use href="#santa-star" x="9" y="72"/><use href="#santa-star" x="32" y="34"/>
            <use href="#santa-star" x="7" y="98" transform="rotate(15 7 98)"/>
            <use href="#santa-star" x="45" y="104"/>
            <circle cx="20" cy="85" r="2"/><circle cx="26" cy="59" r="1.6"/><circle cx="39" cy="81" r="1.5"/>
          </g>
          {/* Two deer and reins. */}
          <g transform="translate(160 27) scale(.94)"><g className="santa-deer-bob deer-one"><use href="#santa-reindeer"/></g></g>
          <g transform="translate(282 9) scale(.98)"><g className="santa-deer-bob deer-two"><use href="#santa-reindeer"/><circle className="santa-rudolph-nose" cx="102" cy="31" r="2.9" fill="#f65446"/></g></g>
          <path className="santa-reins" d="M103 43Q127 44 160 71M103 45Q194 54 291 54" fill="none" stroke="#e0be89" strokeWidth="1.8" strokeLinecap="round"/>
          {/* Sleigh sack, Santa and the red carved sleigh. */}
          <g className="santa-sleigh-rock">
          <g className="santa-sack">
          <path d="M58 72Q33 62 38 44Q41 33 55 32L51 25 62 27 66 34Q82 41 82 61L71 75Z" fill="#b69057" stroke="#735136" strokeWidth="1.2"/>
          <path d="M48 36Q57 40 67 35" fill="none" stroke="#fff0be" strokeWidth="1.8"/>
          <path d="M49 43Q53 60 48 68M63 42Q72 53 71 66" fill="none" stroke="#785839" strokeWidth="1" opacity=".65"/>
          </g>
          <path d="M72 73Q65 55 76 43Q92 37 101 53L103 72Z" fill="url(#santa-red)" stroke="#5c2527" strokeWidth="1.2"/>
          <path d="M83 55Q96 57 101 64L104 70 94 74 84 61Z" fill="#e35f51" stroke="#7a252a" strokeWidth="1.3"/>
          <path d="M96 51Q104 46 110 43" stroke="#eac6a0" strokeWidth="5.4" strokeLinecap="round" fill="none"/>
          <path d="M98 51 104 46" stroke="#fff6e6" strokeWidth="6.4" strokeLinecap="round"/>
          <circle cx="112" cy="41" r="3.6" fill="#ffd8b2" stroke="#8f5b42" strokeWidth=".7"/>
          <path d="M77 62 99 65" stroke="#4b3027" strokeWidth="5.5"/><rect x="88" y="61" width="7" height="7" rx="1" fill="none" stroke="#f0c87e" strokeWidth="1.7"/>
          <g className="santa-wave">
            <path d="M91 49Q105 48 109 38L112 26" fill="none" stroke="#79262c" strokeWidth="10" strokeLinecap="round"/>
            <path d="M91 48Q105 47 109 37L112 26" fill="none" stroke="#cf4c43" strokeWidth="7" strokeLinecap="round"/>
            <path d="M110 29 112 25" stroke="#fff5e2" strokeWidth="8" strokeLinecap="round"/>
            <path d="M110 23Q106 20 108 17L111 18 112 13Q116 11 118 15L118 21Q116 26 111 24Z" fill="#f9e6c3" stroke="#b98a64" strokeWidth=".8"/>
          </g>
          <path d="M77 42Q72 31 79 23Q90 16 99 23L101 34 106 38 100 43Q93 48 85 45Z" fill="#f7d7b9" stroke="#986a4e" strokeWidth="1"/>
          <path d="M81 35Q83 33 87 34 87 38 92 40Q97 37 100 39L101 43Q96 55 84 50Q76 48 77 37Z" fill="#fff9ed" stroke="#d4c7b6" strokeWidth=".7"/>
          <circle cx="96" cy="32" r="1.3" fill="#3f2923"/>
          <path d="M75 26Q77 11 90 13Q101 13 104 23L90 23 80 30Z" fill="url(#santa-red)" stroke="#79282f"/>
          <path d="M74 27Q86 21 101 24" stroke="#fff9eb" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <circle className="santa-hat-pom" cx="103" cy="19" r="4.8" fill="#faf6e9" stroke="#e6ddcb" strokeWidth=".8"/>
          <path d="M42 62Q64 72 97 70Q114 69 122 56L130 59Q131 83 114 92Q83 106 48 91L38 76Q34 68 42 62Z" fill="url(#santa-red)" stroke="#753430" strokeWidth="1.7"/>
          <path d="M43 64Q69 77 98 72Q119 68 123 58" stroke="url(#santa-gold)" strokeWidth="3.4" strokeLinecap="round" fill="none"/>
          <path d="M47 80Q75 95 108 81" stroke="#e6ba72" strokeWidth="1.7" fill="none"/>
          <path d="m57 91 1 13m43-10 5 10M37 105Q68 111 112 105Q126 103 131 95Q135 88 128 88" stroke="url(#santa-gold)" strokeWidth="4.3" strokeLinecap="round" fill="none"/>
          <path d="M52 82Q68 85 77 90" stroke="#f2bd89" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
          </g>
        </svg>
      </div>
    </div>}
  </div>;
}
