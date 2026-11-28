import { useEffect, useId, useRef, useState } from 'react';

export type SceneKind = 'globe' | 'cocoa' | 'tree' | 'gift' | 'gingerbread' | 'reindeer' | 'snowman' | 'window-cat' | 'penguin';
const red='#a82e35', ruby='#c74b45', pine='#315f4f', dark='#1e4037', gold='#e8bf7e', snow='#fff7e9', brown='#99714c';
const outline='#5f422c';

function Star({x,y,s=1,delay=0}:{x:number;y:number;s?:number;delay?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><g className="ws-star" style={{animationDelay:`${delay}s`}}>
    <path d="M0-7Q1-1 6 0Q1 1 0 7Q-1 1-6 0Q-1-1 0-7Z" fill={gold}/><path d="M-3-3 3 3M3-3-3 3" stroke={snow} strokeWidth=".6" strokeLinecap="round"/>
  </g></g>;
}
function Flurries({count=10,wide=false}:{count?:number;wide?:boolean}) {
  return <g>{Array.from({length:count},(_,i)=>{
    const x=wide?13+(i*37)%234:34+(i*29)%194, y=6+(i*17)%102;
    const r=1.2+(i%4)*.45;
    return <g key={i} transform={`translate(${x} ${y})`}><g className="ws-flurry" style={{animationDelay:`${-(i*.43)}s`,animationDuration:`${3.5+i%4*.65}s`}}>
      {i%3===0?<path d="M-3 0H3M-1.5-2.6 1.5 2.6M-1.5 2.6 1.5-2.6" stroke={snow} strokeWidth=".75" strokeLinecap="round"/>:<circle r={r} fill={snow}/>}
    </g></g>;
  })}</g>;
}
function Pine({x,y,s=1,decorated=false}:{x:number;y:number;s?:number;decorated?:boolean}) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-4" y="35" width="8" height="17" rx="2" fill={brown}/>
    <g className="ws-pine-sway">
      <path d="M0-50 23-13 11-15 34 17 21 14 43 43Q0 51-43 43L-21 14-34 17-11-15-23-13Z" fill={dark} stroke="#244a3f" strokeWidth="1.2"/>
      <path d="M0-50 0 45Q-21 46-40 42L-19 15-33 16-11-15-22-13Z" fill={pine}/>
      <path d="M-23-13Q-11-19 0-49L8-35 0-29-7-17ZM-33 17-21 4Q-6 15 16 3L34 17Q18 23 5 17-11 26-33 17ZM-41 43-29 29Q-9 42 21 29L43 43Q11 52-7 44-24 50-41 43Z" fill="#e0e7d8" opacity=".96"/>
      {decorated&&<><path d="M-14-9Q-2 3 17 1M-29 24Q0 35 29 24" fill="none" stroke={gold} strokeWidth="1.9" strokeDasharray="2 3"/>
        {[[-9,-6],[11,3],[-24,23],[-4,26],[20,26],[2,1]].map(([cx,cy],i)=><circle key={i} className="ws-light" style={{animationDelay:`${-i*.31}s`}} cx={cx} cy={cy} r="3.2" fill={i%2?gold:ruby} stroke={snow} strokeWidth=".5"/>)}
        <Star x={0} y={-55} s={1.2}/>
      </>}
    </g>
  </g>;
}

function Grass({x,y,s=1}:{x:number;y:number;s?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><g className="ws-grass">
    <path d="M0 1Q-6-4-10-4M0 1Q-3-7-3-10M0 1Q2-7 7-10M0 1Q5-3 11-4" fill="none" stroke="#71866c" strokeWidth="1.55" strokeLinecap="round"/>
    <path d="M-9 3Q0 6 10 2" stroke="#f8f7e9" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
  </g></g>;
}
function ForestFloor() {
  return <>
    <path d="M12 112Q9 76 35 45Q59 13 105 18Q147 0 185 30Q230 33 246 76L248 121Q137 147 12 112Z" fill="#e3e8da"/>
    <circle cx="204" cy="31" r="15" fill="#f1d89d" opacity=".89"/>
    <path d="M10 100 47 38 74 67 107 42 143 85 173 57 247 110Z" fill="#b9cbb9"/>
    <path d="M47 38 61 56 49 53 44 58 36 56ZM107 42 121 59 110 57 105 62 96 57Z" fill="#faf7eb"/>
    <Pine x={27} y={92} s={.91}/><Pine x={59} y={82} s={.58}/><Pine x={238} y={93} s={.66}/>
    <path d="M7 129Q28 112 65 117Q117 109 156 122Q207 111 251 125L254 142Q134 157 8 143Z" fill="#becdb0"/>
    <path d="M7 127Q40 112 75 123Q95 132 121 125Q144 115 183 124Q215 121 251 128L249 136Q218 128 187 138Q153 147 121 138Q76 133 52 141Q17 145 8 139Z" fill="#faf8ef"/>
    <path d="M34 137Q91 130 130 143Q175 148 222 136" stroke="#8fa486" strokeWidth="1.4" fill="none" opacity=".7"/>
    <g opacity=".96"><Grass x={32} y={132}/><Grass x={59} y={144} s={.75}/><Grass x={224} y={137} s={.9}/><Grass x={194} y={144} s={.65}/></g>
    <g transform="translate(24 141) rotate(-15)"><path d="M0 0Q5-10 12 0Q10 5 0 0Z" fill="#a57a4e"/><path d="M2-2 9 1M4-5 9-2" stroke="#765534" strokeWidth=".9"/></g>
    <g fill="#e7ecdc"><circle cx="49" cy="128" r="1.3"/><circle cx="68" cy="136" r="1.6"/><circle cx="214" cy="143" r="1.1"/></g>
  </>;
}
function BakingTable() {
  return <>
    <path d="M39 126V57Q39 18 78 13H183Q224 15 224 57V126Z" fill="#f0e1c9" opacity=".75"/>
    <path d="M39 56H224M39 87H224M63 18V126M94 13V126M125 13V126M156 13V126M187 13V126" stroke="#e0cdb0" strokeWidth=".8" opacity=".75"/>
    <g className="ws-kitchen-garland"><path d="M54 29Q99 48 132 30Q169 45 209 27" stroke="#78906d" strokeWidth="4.8" fill="none" strokeLinecap="round"/>{[68,94,133,168,196].map((x,i)=><circle key={i} className="ws-light" cx={x} cy={i%2?39:31} r="2.8" fill={i%2?red:gold} style={{animationDelay:`${-.3*i}s`}}/>)}</g>
    <path d="M10 137Q27 121 66 121H196Q237 122 251 138L246 147Q130 155 15 146Z" fill="#c7a172" stroke="#ae845a" strokeWidth="1"/>
    <path d="M15 138Q57 132 92 138M151 134Q194 129 242 140M62 145Q105 140 138 145" stroke="#ad8158" strokeWidth=".85" opacity=".75" fill="none" strokeLinecap="round"/>
    <ellipse cx="125" cy="137" rx="74" ry="7" fill="#805e41" opacity=".17"/>
    <path d="M56 137Q62 128 96 129L176 129Q197 130 205 137L193 145Q127 150 60 143Z" fill="#e0b981" stroke="#b58e61" strokeWidth=".9"/>
    <g transform="translate(35 117) rotate(-18)"><rect x="-3" y="-4" width="41" height="9" rx="4.5" fill="#b78651" stroke="#94683e"/><rect x="5" y="-7" width="24" height="15" rx="5" fill="#d9ac72"/><path d="M9-4H25" stroke="#f0cc95" strokeWidth="1.1"/></g>
    <g className="ws-mixing-bowl"><ellipse cx="219" cy="118" rx="18" ry="6" fill="#c49769"/><path d="M201 118Q205 139 219 139Q233 138 237 118Z" fill="#a74d3e" stroke="#814332" strokeWidth="1"/><ellipse cx="219" cy="118" rx="17" ry="5" fill="#e6cfad"/><path d="M214 118 224 97" stroke="#9b733f" strokeWidth="3.5" strokeLinecap="round"/><path d="M219 135Q228 134 231 127" stroke="#e49472" fill="none" strokeWidth="1.5"/></g>
    <g fill="#fff0d5" opacity=".9">{[[57,135],[68,132],[77,140],[193,137],[182,142],[49,141],[200,130],[93,143]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%2?1.5:2}/>)}</g>
    <g transform="translate(190 131) scale(.55)"><path d="M0-8 3-3 9-2 5 3 6 9 0 6-6 9-5 3-9-2-3-3Z" fill="#b27647" stroke="#845237" strokeWidth="1.3"/><path d="M0-5 2-1 5 0 3 2 3 5 0 3-3 5-3 2-5 0-2-1Z" fill="none" stroke="#f7dcc0" strokeWidth=".9"/></g>
  </>;
}
function CozyTable() {
  return <>
    <path d="M17 132Q40 109 82 113H177Q218 113 243 132L237 145Q132 154 23 145Z" fill="#a17b58" stroke="#795b40" strokeWidth=".8"/>
    <path d="M25 133Q66 127 104 134M135 139Q189 132 240 138M40 145Q70 140 96 145" fill="none" stroke="#c9a277" strokeWidth="1.1" opacity=".7"/>
    <path d="M73 119 175 112 205 134 107 143 55 134Z" fill="#c99786" opacity=".9"/>
    <path d="M62 131 111 138 198 131" stroke="#f3dbc2" strokeWidth="1.3" fill="none" strokeDasharray="3 3"/>
    <g transform="translate(42 126) rotate(-9)"><rect x="-12" y="-6" width="34" height="14" rx="1.5" fill="#467464" stroke="#2f5144" strokeWidth=".9"/><path d="M-10 5H20" stroke="#e4d6b4" strokeWidth="2.5"/><path d="M-5-3H14" stroke="#d1b785" strokeWidth="1.3"/></g>
  </>;
}

function Globe({id}:{id:string}) {
  return <>
    <defs><clipPath id={id}><circle cx="130" cy="62" r="53"/></clipPath></defs>
    <ellipse cx="130" cy="137" rx="80" ry="7" fill="#132b22" opacity=".24"/>
    <g className="ws-globe-rock">
      <circle cx="130" cy="62" r="57" fill="#496f65" stroke={gold} strokeWidth="2"/>
      <g clipPath={`url(#${id})`}>
        <circle cx="130" cy="62" r="53" fill="#789b94"/>
        <circle cx="150" cy="26" r="13" fill="#f6db9c" opacity=".85"/>
        <path d="M74 67 95 27 119 61 136 37 184 82 185 121H70Z" fill="#345e56"/>
        <path d="M95 27 106 45 96 41 89 46 83 50Z M136 37 151 52 139 48 131 50 126 51Z" fill="#f3eee4"/>
        <path d="M70 99Q110 78 145 96T192 88V122H70Z" fill="#f3efe5"/>
        <Pine x={93} y={79} s={.45}/><Pine x={168} y={78} s={.56}/>
        <g transform="translate(109 70)">
          <path d="M0 7 22-10 44 7V35H0Z" fill="#b3825d" stroke="#63442f" strokeWidth="1"/>
          <path d="M-5 8 22-15 49 8 44 13 22-5 0 13Z" fill="#8e342f"/><path d="M-5 7 22-15 49 8 39 6 22-7 5 7Z" fill={snow}/>
          <rect x="18" y="20" width="9" height="15" fill="#714a35" rx="1"/>
          <rect className="ws-window" x="6" y="14" width="8" height="9" rx="1" fill="#ffe0a2"/><rect className="ws-window" x="32" y="14" width="8" height="9" rx="1" fill="#f9d996" style={{animationDelay:'-.8s'}}/>
          <rect x="31" y="-6" width="6" height="13" fill="#6f4c39"/>
          <g className="ws-chimney-smoke"><circle cx="34" cy="-12" r="4" fill="#f4f0df" opacity=".5"/><circle cx="39" cy="-19" r="5" fill="#f4f0df" opacity=".35"/></g>
        </g>
        <Flurries count={16}/>
      </g>
      <path d="M91 38Q99 20 120 15" stroke="#fff9e3" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".73"/>
      <path d="M103 28Q108 23 117 21" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".8"/>
      <path d="M83 111H177L185 131Q131 144 75 131Z" fill="#75462e" stroke="#523729" strokeWidth="1.2"/>
      <path d="M80 118Q130 126 180 118" stroke={gold} strokeWidth="1.8" fill="none"/>
      <rect x="109" y="122" width="42" height="9" rx="4.5" fill={gold}/><path d="M121 127H139" stroke="#855a36" strokeWidth="1"/>
    </g><Star x={63} y={34} delay={-.7}/><Star x={198} y={50} s={.75}/><Star x={193} y={105} s={.55} delay={-1.1}/>
  </>;
}
function Cocoa() {
  return <>
    <CozyTable/>
    <ellipse cx="130" cy="135" rx="91" ry="8" fill="#122b24" opacity=".25"/>
    <g className="ws-cup">
      <ellipse cx="130" cy="125" rx="72" ry="10" fill="#c8b68c"/><ellipse cx="130" cy="124" rx="55" ry="5" fill="#ead2a7"/>
      <path d="M172 74Q206 67 210 88Q214 111 175 110L174 102Q200 102 200 89Q200 78 175 82Z" fill="#8a2a2d" stroke={gold} strokeWidth="1.4"/>
      <path d="M79 68H180L174 113Q169 130 130 130Q93 130 86 112Z" fill={red} stroke="#722725" strokeWidth="1.7"/>
      <path d="M83 78Q90 108 104 120Q89 119 86 105Z" fill="#db6b57" opacity=".65"/>
      <ellipse cx="129" cy="69" rx="51" ry="13" fill="#f1d1a0" stroke={gold} strokeWidth="1.5"/>
      <ellipse cx="129" cy="69" rx="44" ry="9" fill="#67432f"/>
      <g className="ws-marshmallow"><rect x="104" y="60" width="17" height="12" rx="4" fill="#fff6e5" transform="rotate(-10 112 66)"/><rect x="129" y="63" width="17" height="11" rx="4" fill="#ffe8d4" transform="rotate(7 137 68)"/></g>
      <g className="ws-candy"><path d="M150 68 160 43Q164 33 171 36 180 38 177 47" fill="none" stroke="#fff6e6" strokeWidth="7" strokeLinecap="round"/><path d="M150 68 160 43Q164 33 171 36 180 38 177 47" fill="none" stroke={red} strokeWidth="5" strokeDasharray="4 7"/></g>
      <g transform="translate(130 101)" stroke="#f9e2b7" strokeWidth="1.5" strokeLinecap="round"><path d="M0-14V14M-12-7 12 7M-12 7 12-7M-4-10 0-6 4-10M-4 10 0 6 4 10M-10-5-6-4-8 0M10 5 6 4 8 0" fill="none"/></g>
      <g className="ws-steam" style={{animationDelay:'-1s'}}><path d="M112 55Q98 42 110 30T108 10" fill="none" stroke="#f8eee1" strokeWidth="2.7" strokeLinecap="round"/></g>
      <g className="ws-steam" style={{animationDelay:'-2s'}}><path d="M130 53Q119 42 134 27T130 5" fill="none" stroke="#f8eee1" strokeWidth="2.1" strokeLinecap="round"/></g>
      <g className="ws-steam"><path d="M146 58Q140 44 149 35T147 15" fill="none" stroke="#f8eee1" strokeWidth="2.2" strokeLinecap="round"/></g>
    </g>
    <Star x={68} y={47} s={.8}/><Star x={205} y={47} delay={-.7}/><Star x={48} y={91} s={.55} delay={-1.1}/>
    <g className="ws-cinnamon" transform="translate(190 117)"><path d="M0 7 22-6M4 12 26-1" stroke="#9f693e" strokeWidth="6" strokeLinecap="round"/><path d="M5 5 22-5M8 10 24 0" stroke="#d0a16b" strokeWidth="1.1" strokeLinecap="round"/></g>
  </>;
}
function Tree() {
  return <>
    <path d="M14 129Q40 104 71 115Q104 99 147 118Q194 105 247 128L250 142Q128 157 12 142Z" fill="#e1e8db" opacity=".82"/>
    <path d="M16 134Q64 125 101 136Q154 145 202 132Q230 132 246 139" stroke="#a9bfab" strokeWidth="1.3" fill="none" opacity=".8"/>
    <path d="M27 129Q68 120 110 131T226 128" stroke="#d8dec9" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7"/>
    <Pine x={77} y={89} s={.61}/><Pine x={134} y={80} s={1.09} decorated/><Pine x={194} y={96} s={.66}/>
    <g className="ws-bird" transform="translate(190 38)"><g className="ws-bird-hop">
      <path d="M-10 4Q-8-7 2-5Q10-2 13 5L20 2 17 10 8 13Q-7 14-10 4Z" fill="#a95a44" stroke="#684435" strokeWidth=".8"/>
      <ellipse className="ws-bird-wing" cx="0" cy="5" rx="7" ry="4.5" fill="#d0a173" transform="rotate(-14)"/>
      <circle cx="7" cy="-1.5" r="1.5" fill="#392c2a"/><path d="m10 0 7 2-7 2Z" fill={gold}/><path d="M2 12 1 17M7 12 8 17" stroke={gold} strokeWidth="1.2"/>
    </g></g>
    <g className="ws-gift-small" transform="translate(97 123)"><rect x="-14" y="-8" width="28" height="17" rx="2" fill={red}/><path d="M0-8V9M-14-3H14" stroke={gold} strokeWidth="2.7"/><path d="M0-8Q-13-18-9-8M0-8Q13-18 9-8" stroke={gold} fill="none" strokeWidth="1.7"/></g>
    <Flurries count={11} wide/><Star x={37} y={44} s={.8}/><Star x={224} y={57} s={.65} delay={-.8}/>
  </>;
}
function Gift() {
  return <>
    <path d="M15 139Q36 119 69 127Q105 117 131 127Q174 117 204 126L245 138 238 149H19Z" fill="#e1e7d8" stroke="#cdd9c8" strokeWidth="1"/>
    <path d="M23 143Q65 132 108 142T237 142" stroke="#faf7ed" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <g transform="translate(42 133) rotate(-28)"><path d="M-15 0H19M-9 0-16-9M-7 0-13 8M3 0-5-11M3 0-5 10M12 0 7-9M12 0 7 8" stroke="#66866d" strokeWidth="2.4" strokeLinecap="round"/><circle cx="-8" cy="4" r="2" fill={red}/><circle cx="2" cy="-2" r="2" fill={red}/></g>
    <ellipse cx="130" cy="138" rx="72" ry="6" fill="#8d6b47" opacity=".14"/>
    <g className="ws-gift-body">
      <rect x="75" y="70" width="110" height="64" rx="8" fill={red} stroke="#79262f" strokeWidth="1.4"/>
      <path d="M80 82H180V91H80Z" fill="#7e2830" opacity=".34"/>
      <path d="M80 80V125Q91 130 100 131V80Z" fill="#d05d4f" opacity=".52"/>
      <path d="M123 75H138V134H123Z" fill={gold}/><path d="M127 76V134" stroke="#f8dfb3" strokeWidth="2"/>
      <g className="ws-gift-lid">
        <rect x="69" y="59" width="122" height="22" rx="6" fill="#bf4342" stroke="#8b2b2b" strokeWidth="1.2"/>
        <rect x="122" y="59" width="16" height="22" rx="2" fill={gold}/>
        <g className="ws-bow"><path d="M130 59Q110 31 97 42Q84 55 130 59Q150 31 163 42Q176 55 130 59Z" fill="#e7be80" stroke="#bd935a" strokeWidth="1.3"/><path d="M130 58Q110 47 101 46M130 58Q150 47 159 46" stroke="#fff0c8" strokeWidth="1.2" fill="none"/><circle cx="130" cy="59" r="5.5" fill="#f8d698"/></g>
      </g>
    </g>
    <g className="ws-gift-confetti">
      {[[-35,-12],[-17,-36],[13,-42],[32,-22],[48,-8]].map(([x,y],i)=><g key={i} transform={`translate(${130+x} ${49+y})`}><g className="ws-pop" style={{animationDelay:`${i*.09}s`}}><path d="M-5 0 0-5 5 0 0 5Z" fill={i%2?pine:gold}/></g></g>)}
      <Star x={72} y={36} s={.8}/><Star x={188} y={36} s={.7} delay={-.7}/>
    </g>
    <Star x={50} y={98} s={.62} delay={-1}/><Star x={207} y={85} s={.8} delay={-.3}/>
  </>;
}
function Gingerbread() {
  return <>
    <BakingTable/>
    <ellipse cx="131" cy="143" rx="66" ry="7" fill="#8a6140" opacity=".12"/>
    <g className="ws-cookie-hop">
      <g className="ws-cookie-leg ws-cookie-left"><path d="M111 106Q102 118 94 133" stroke="#8a5336" strokeWidth="22" strokeLinecap="round"/><path d="M111 106Q102 118 94 133" stroke="#c08b54" strokeWidth="18" strokeLinecap="round"/><path d="M88 129Q97 133 101 137" stroke={snow} strokeWidth="2.7" fill="none" strokeLinecap="round"/></g>
      <g className="ws-cookie-leg ws-cookie-right"><path d="M146 107Q156 121 167 132" stroke="#8a5336" strokeWidth="22" strokeLinecap="round"/><path d="M146 107Q156 121 167 132" stroke="#c08b54" strokeWidth="18" strokeLinecap="round"/><path d="M160 138Q165 131 172 127" stroke={snow} strokeWidth="2.7" fill="none" strokeLinecap="round"/></g>
      <g className="ws-cookie-wave"><path d="M111 74Q87 75 73 53" stroke="#885438" strokeWidth="23" strokeLinecap="round"/><path d="M111 74Q87 75 73 53" stroke="#c38a52" strokeWidth="19" strokeLinecap="round"/><path d="M68 55Q75 48 80 48" fill="none" stroke={snow} strokeWidth="2.6" strokeLinecap="round"/></g>
      <g className="ws-cookie-arm"><path d="M146 77Q166 94 181 82" stroke="#885438" strokeWidth="22" strokeLinecap="round"/><path d="M146 77Q166 94 181 82" stroke="#c38a52" strokeWidth="18" strokeLinecap="round"/><path d="M177 76Q181 82 184 86" fill="none" stroke={snow} strokeWidth="2.6" strokeLinecap="round"/></g>
      <path d="M105 65Q128 57 150 67L159 101Q152 117 128 119Q105 117 99 101Z" fill="#bd834e" stroke="#8a5438" strokeWidth="2"/>
      <path d="M106 79Q102 95 109 107" fill="none" stroke="#dda66e" strokeWidth="3" strokeLinecap="round"/>
      <g className="ws-cookie-head">
        <circle cx="128" cy="42" r="27" fill="#cb945d" stroke="#8a5438" strokeWidth="2"/>
        <path d="M109 30Q121 15 139 23" stroke="#e6b282" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <g className="ws-blink"><circle cx="119" cy="42" r="3.3" fill="#fff5db"/><circle cx="138" cy="42" r="3.3" fill="#fff5db"/><circle cx="119" cy="42" r="1.6" fill="#4c342b"/><circle cx="138" cy="42" r="1.6" fill="#4c342b"/></g>
        <path d="M120 51Q128 60 137 51" stroke={snow} strokeWidth="2.7" fill="none" strokeLinecap="round"/><circle cx="112" cy="49" r="3.5" fill="#dd7d65" opacity=".8"/><circle cx="145" cy="49" r="3.5" fill="#dd7d65" opacity=".8"/>
      </g>
      <path d="M119 67 128 73 137 67V80L128 75 119 80Z" fill={red} stroke="#8d2b30" strokeWidth=".8"/><circle cx="128" cy="74" r="2.3" fill={gold}/>
      <circle className="ws-cookie-button" cx="128" cy="90" r="3.5" fill={snow}/><circle className="ws-cookie-button" cx="128" cy="103" r="3.5" fill="#9e3035" style={{animationDelay:'-.65s'}}/>
    </g>
    <Star x={58} y={35} s={.75}/><Star x={203} y={55} s={.8} delay={-.6}/><Star x={198} y={116} s={.55} delay={-1.2}/>
  </>;
}
function Reindeer() {
  return <>
    <ForestFloor/>
    <ellipse cx="131" cy="143" rx="93" ry="7" fill="#876b4f" opacity=".14"/>
    <g className="ws-deer-tail"><path d="M82 91Q61 95 52 76Q69 74 83 82Z" fill="#a87f55" stroke={outline} strokeWidth="1.3"/><path d="M52 76Q64 73 70 85" fill="#e4c59f"/></g>
    <g className="ws-deer-body"><path d="M77 89Q96 73 132 83Q154 80 160 62L176 68Q180 108 154 120H92Q73 118 73 101Z" fill="#a77c52" stroke={outline} strokeWidth="1.8"/>
      <path d="M82 96Q102 116 149 113Q143 121 127 123H91Q79 116 82 96Z" fill="#caa780"/><path d="M99 117 94 139H85L87 117M151 115 162 138H153L140 120" fill="#815a3a" stroke={outline} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M85 135H94L93 141H83ZM153 136H162L165 141H154Z" fill="#48332a"/><path d="M92 86Q115 90 137 85" stroke="#e1c19b" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    </g>
    <g className="ws-deer-chew-head">
      <g className="ws-antler"><path d="M150 45 143 28 134 21 129 10M143 28 152 16 153 7M160 42 164 24 175 16 177 7M164 24 161 13 158 6" fill="none" stroke="#956f3f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M143 28 152 16M164 24 175 16" stroke="#dab583" strokeWidth="1.2" fill="none" strokeLinecap="round"/></g>
      <g className="ws-deer-ear2"><path d="M149 48Q131 44 128 35Q144 31 154 43Z" fill="#ba8c63" stroke={outline} strokeWidth="1.3"/><path d="M134 37Q144 36 150 43" fill="none" stroke="#edb6a2" strokeWidth="2.2" strokeLinecap="round"/></g>
      <path d="M144 48Q154 31 174 36Q190 41 189 54L202 65Q205 77 191 82L168 80Q151 79 145 69Z" fill="#b98e63" stroke={outline} strokeWidth="1.5"/>
      <path d="M165 69Q181 63 193 69L202 66Q206 77 191 82L169 80Z" fill="#e2c09b"/>
      <path d="M158 49Q163 43 169 44" stroke="#e2b789" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <g className="ws-blink"><ellipse cx="177" cy="55" rx="3.1" ry="4.2" fill="#423029"/><circle cx="178" cy="53.4" r="1" fill={snow}/></g>
      <circle cx="201" cy="67" r="4.8" fill="#a72e37"/><circle className="ws-nose-shine" cx="200.2" cy="65.7" r="1.6" fill="#ffd0b9"/>
      <g className="ws-jaw"><path d="M183 77Q191 79 196 75" stroke="#64442f" strokeWidth="1.5" fill="none" strokeLinecap="round"/></g>
      <path d="M147 73Q158 81 167 78L174 88Q159 95 144 82Z" fill={red} stroke="#7b2930" strokeWidth="1.2"/>
      <g className="ws-scarf-tail"><path d="M150 83Q148 101 134 110L146 115 154 109Q163 96 162 89Z" fill={ruby} stroke="#8d3033" strokeWidth="1.3"/><path d="M135 109 146 116M139 108 150 113" stroke={gold} strokeWidth="1.3"/></g>
      <g className="ws-feed-carrot">
        <g className="ws-carrot-bites"><path d="M197 76Q208 70 224 63Q238 60 233 71Q222 80 197 80Z" fill="#db803b" stroke="#995528" strokeWidth="1.1"/><path d="M207 75 210 77M217 69 220 72M225 67 228 70" stroke="#b6602c" strokeWidth="1.1" strokeLinecap="round"/>
          <g className="ws-carrot-leaves"><path d="M231 65Q237 47 244 49Q248 54 236 65Q251 57 253 62Q251 68 234 69" fill="#63875c" stroke="#355f47" strokeWidth="1.1"/></g>
        </g>
      </g>
      <g className="ws-crumbs">{[0,1,2,3].map(i=><circle key={i} className="ws-crumb" cx={199+i*3} cy="79" r={1.3+i%2*.4} fill="#e2a25e" style={{animationDelay:`${i*.14}s`}}/>)}</g>
    </g>
    <Star x={53} y={45} s={.7}/><Star x={220} y={34} s={.65} delay={-.9}/>
    <Flurries count={8}/>
  </>;
}
function Snowman() {
  return <>
    <path d="M5 138Q51 119 92 132Q123 118 162 133Q214 120 254 139L250 151H8Z" fill="#d7e4d8" opacity=".9"/>
    <path d="M18 139Q63 128 100 139T241 139" stroke="#f7f5e9" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <Pine x={35} y={107} s={.49}/><Pine x={227} y={113} s={.44}/>
    <ellipse cx="132" cy="142" rx="92" ry="8" fill="#9fb2a6" opacity=".33"/>
    <g className="ws-snowman-body">
      <circle cx="131" cy="108" r="36" fill="#e6e8df" stroke="#c4d1c8" strokeWidth="1.5"/><circle cx="127" cy="103" r="31" fill="#fbf8ec"/>
      <path d="M104 103Q99 123 117 131" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <g className="ws-snowman-arm"><path d="M100 101 77 84 64 71M77 84 63 86M69 77 70 64" stroke="#8c6443" strokeWidth="4.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M64 71Q54 67 57 59Q64 53 70 61Q74 67 64 71Z" fill={ruby}/></g>
      <g className="ws-lantern-arm"><path d="M161 96 185 83 193 73M185 83 197 87" stroke="#8c6443" fill="none" strokeWidth="4" strokeLinecap="round"/>
        <g className="ws-lantern" transform="translate(193 73)"><path d="M-6 9V4Q0-4 6 4V9" stroke={gold} strokeWidth="1.7" fill="none"/><rect x="-8" y="9" width="16" height="20" rx="2.5" fill="#b78045" stroke="#6c522f" strokeWidth="1.1"/><rect className="ws-lantern-glow" x="-5" y="12" width="10" height="13" rx="1.5" fill="#fff0a9"/><path d="M0 12V25" stroke="#a87a45" strokeWidth=".7"/></g>
      </g>
      <g className="ws-snowman-head">
        <circle cx="131" cy="57" r="26" fill="#edf0e7" stroke="#cbd7cd" strokeWidth="1.4"/><circle cx="127" cy="54" r="22" fill="#fff9ec"/>
        <g className="ws-blink"><circle cx="122" cy="53" r="3" fill="#35453c"/><circle cx="140" cy="53" r="3" fill="#35453c"/></g>
        <path d="M131 59 152 65 131 67Q127 63 131 59Z" fill="#d88142" stroke="#b96935" strokeWidth=".7"/><path d="M121 70Q131 77 141 70" stroke="#576155" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <circle cx="113" cy="63" r="3.8" fill="#d99587" opacity=".75"/><circle cx="147" cy="64" r="3.8" fill="#d99587" opacity=".65"/>
        <g className="ws-snowman-hat"><path d="M111 35 114 11 144 9 147 36Z" fill="#2c493e" stroke="#244035" strokeWidth="1.1"/><path d="M113 28 146 26 146 33 113 35Z" fill={red}/><path d="M103 36Q128 31 156 35L155 42Q130 46 103 42Z" fill="#27463a"/><path d="M119 15 116 25" stroke="#6e8974" strokeWidth="1.6" strokeLinecap="round"/><path d="M143 28Q149 21 151 24L147 29 153 30 146 32" fill="#789264"/><circle cx="146" cy="30" r="2.4" fill={ruby}/></g>
      </g>
      <path d="M108 80Q130 87 154 80L155 90Q130 97 106 89Z" fill={red} stroke="#8a3030" strokeWidth="1.3"/>
      <g className="ws-snowman-scarf"><path d="M146 88Q163 103 160 119L173 120Q174 99 154 85Z" fill={ruby} stroke="#853237" strokeWidth="1.1"/><path d="M163 116 163 121M167 116 167 122M171 116 171 121" stroke={gold} strokeWidth="1.6" strokeLinecap="round"/></g>
      {[98,111,124].map((cy,i)=><circle key={i} cx="130" cy={cy} r="3.4" fill="#3f5147"/>)}
    </g>
    <Flurries count={14} wide/><Star x={52} y={39} s={.75}/><Star x={214} y={48} delay={-.8}/><Star x={225} y={104} s={.6} delay={-.5}/>
  </>;
}

function WindowCat({id}:{id:string}) {
  return <>
    <defs><clipPath id={id}><rect x="54" y="12" width="152" height="114" rx="12"/></clipPath></defs>
    <path d="M25 130Q18 59 51 22Q91 2 130 5Q184 2 216 35Q240 71 235 130Z" fill="#e9deca"/>
    <g clipPath={`url(#${id})`}>
      <rect x="54" y="12" width="152" height="114" fill="#5c8178"/>
      <circle cx="169" cy="36" r="15" fill="#f4dba4"/>
      <path d="M54 100 81 47 109 72 140 38 206 108V126H50Z" fill="#355f54"/>
      <path d="M81 47 95 62 83 58 76 63 71 61Z M140 38 158 57 143 53 136 60 128 56Z" fill="#f0ece2"/>
      <path d="M54 112Q104 94 148 109Q187 91 206 111V127H54Z" fill="#f3f1e3"/>
      <Pine x={79} y={99} s={.5}/><Pine x={185} y={102} s={.6}/>
      <g transform="translate(140 96) scale(.6)"><rect x="0" y="-9" width="42" height="31" fill="#ad805b"/><path d="M-5-9 21-30 48-9 42-5 21-22 0-5Z" fill="#87392f"/><rect className="ws-window" x="8" y="0" width="9" height="10" rx="1" fill="#ffdf96"/><rect className="ws-window" x="27" y="0" width="8" height="10" rx="1" fill="#ffdf96"/><path d="M-5-9 21-30 48-9" stroke="#faf7ef" strokeWidth="3" fill="none"/></g>
      <Flurries count={18}/>
    </g>
    <rect x="49" y="7" width="162" height="124" rx="14" fill="none" stroke="#a77c52" strokeWidth="7"/>
    <path d="M130 11V127M53 69H207" stroke="#a77c52" strokeWidth="5.4"/><path d="M54 13H205M127 12V127" stroke="#e1ba87" strokeWidth="1.5" opacity=".9"/>
    <path d="M44 132H216L226 141Q134 151 36 141Z" fill="#9a704a" stroke="#6f5038" strokeWidth="1.3"/><path d="M43 132H217" stroke="#e7c28f" strokeWidth="3" strokeLinecap="round"/>
    <g transform="translate(62 15)"><path d="M0 0V19" stroke="#ab8859" strokeWidth="1"/><g className="ws-window-bauble"><circle cy="25" r="7" fill={red} stroke="#783036" strokeWidth=".9"/><path d="M-3 24Q0 20 3 24" stroke="#f9c78f" strokeWidth="1.1" fill="none"/></g></g>
    <g className="ws-cat-tail"><path d="M119 129Q88 145 77 124Q68 105 86 103Q94 102 100 110" stroke="#945e3e" strokeWidth="9" strokeLinecap="round" fill="none"/><path d="M85 103Q94 102 100 110" stroke="#d0a16a" strokeWidth="4" strokeLinecap="round" fill="none"/></g>
    <g className="ws-cat-breath">
      <path d="M112 132Q105 112 116 96Q129 81 149 98Q168 112 160 132Z" fill="#c58c58" stroke="#95683f" strokeWidth="1.4"/>
      <path d="M131 116Q144 112 156 121L158 132H128Z" fill="#e9c69b"/>
      <path d="M121 101 126 110M116 109 120 115" stroke="#a26e43" strokeWidth="2" strokeLinecap="round"/>
      <g className="ws-cat-paw"><path d="M154 113Q165 114 168 99" stroke="#aa7447" strokeWidth="9" strokeLinecap="round" fill="none"/><path d="M167 101V98" stroke="#f0ca9a" strokeWidth="6.7" strokeLinecap="round"/></g>
      <g className="ws-cat-head">
        <path d="M108 92 107 65 125 76Q138 70 150 76L162 62 161 91Q168 106 143 109Q120 111 110 100Z" fill="#c58c58" stroke="#95683f" strokeWidth="1.5"/>
        <path d="M112 70 121 80 112 81ZM158 69 151 79 159 81Z" fill="#e7a68f"/>
        <path d="M131 75 134 83M139 74 141 82M147 76 147 82" stroke="#9d693f" strokeWidth="1.5" strokeLinecap="round"/>
        <g className="ws-blink"><path d="M120 93Q124 90 127 93M147 93Q151 90 154 92" stroke="#594235" strokeWidth="1.7" fill="none" strokeLinecap="round"/></g>
        <path d="M134 96 138 99 142 96Z" fill="#b9685e"/><path d="M138 99Q134 104 131 101M138 99Q141 104 145 101" fill="none" stroke="#6a4837" strokeWidth="1.1" strokeLinecap="round"/>
        <path d="M115 97 104 95M115 101 103 102M157 96 167 94M156 101 167 103" stroke="#f6deba" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
      <path d="M117 108Q135 114 153 107L154 115Q136 122 118 114Z" fill={red}/><circle className="ws-lantern-glow" cx="136" cy="116" r="3" fill={gold}/>
    </g>
    <Star x={29} y={51} s={.7}/><Star x={232} y={65} s={.7} delay={-.8}/>
  </>;
}
function Penguin() {
  return <>
    <path d="M11 126Q17 63 43 43Q81 12 131 26Q190 8 228 58Q246 86 249 129Z" fill="#dce7d9"/>
    <path d="M9 121 60 56 92 88 127 44 165 80 201 55 249 122Z" fill="#b3c8bb"/>
    <path d="M60 56 73 74 61 69 54 74 49 71ZM127 44 142 61 130 58 122 64 115 59ZM201 55 215 72 204 69 198 73 192 69Z" fill="#faf8ed"/>
    <Pine x={31} y={106} s={.48}/><Pine x={230} y={101} s={.57}/>
    <path d="M10 132Q32 113 74 118Q134 106 178 120Q226 116 251 132L243 148H18Z" fill="#f5f4e9"/>
    <ellipse cx="131" cy="134" rx="91" ry="13" fill="#bbcfd0" stroke="#a6bcc0" strokeWidth="1.1"/>
    <path d="M52 134Q105 121 184 134M88 140Q135 132 207 139" stroke="#e7f3ef" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <g transform="translate(131 23)"><g className="ws-penguin-slide">
      <ellipse cx="0" cy="111" rx="25" ry="4.5" fill="#647e82" opacity=".25"/>
      <g className="ws-penguin-rock">
        <g className="ws-skate ws-skate-left"><path d="M-16 97-19 107 2 108" fill="none" stroke="#b17b44" strokeWidth="6" strokeLinecap="round"/><path d="M-22 109Q-12 113 5 109" stroke="#4e6668" strokeWidth="2.1" fill="none" strokeLinecap="round"/></g>
        <g className="ws-skate ws-skate-right"><path d="M14 97 18 106 34 106" fill="none" stroke="#b17b44" strokeWidth="6" strokeLinecap="round"/><path d="M15 110Q28 113 37 108" stroke="#4e6668" strokeWidth="2.1" fill="none" strokeLinecap="round"/></g>
        <g className="ws-penguin-wing ws-penguin-wing-left"><path d="M-20 48Q-43 63-37 78Q-26 80-16 63Z" fill="#324e47" stroke="#233e36" strokeWidth="1.1"/></g>
        <g className="ws-penguin-wing ws-penguin-wing-right"><path d="M20 49Q43 59 41 73Q32 80 18 68Z" fill="#324e47" stroke="#233e36" strokeWidth="1.1"/></g>
        <path d="M-27 67Q-23 31 0 32Q25 33 28 70Q30 102 0 105Q-30 104-27 67Z" fill="#294b40" stroke="#203c33" strokeWidth="1.5"/>
        <ellipse cx="1" cy="77" rx="20" ry="24" fill="#f5f0df"/>
        <g className="ws-penguin-head"><circle cy="36" r="26" fill="#325447" stroke="#234337" strokeWidth="1.4"/><path d="M-19 41Q-21 18-9 21Q0 22 0 29Q11 18 20 28L18 45Q0 54-18 44Z" fill="#fff7e9"/><g className="ws-blink"><circle cx="-9" cy="35" r="2.6" fill="#2f3b32"/><circle cx="10" cy="35" r="2.6" fill="#2f3b32"/></g><path d="M-6 43 8 42 1 49Z" fill="#d89748" stroke="#a66e38" strokeWidth=".7"/><path d="M-16 17Q-4 3 10 12" fill="none" stroke="#547b64" strokeWidth="2"/></g>
        <path d="M-22 52Q2 61 23 52L24 61Q0 70-23 61Z" fill={red}/><g className="ws-penguin-scarf"><path d="M14 61Q35 72 32 88L44 82Q44 66 23 58Z" fill={ruby}/><path d="M34 86 36 91M38 84 40 88M42 81 44 86" stroke={gold} strokeWidth="1.1" strokeLinecap="round"/></g>
      </g>
      <g className="ws-ice-spray">{Array.from({length:6},(_,i)=><circle key={i} cx={-23-i*4} cy={106-i%2*2} r={1.9} className="ws-ice-particle" fill="#fff" style={{animationDelay:`${-i*.16}s`}}/>)}</g>
    </g></g>
    <Flurries count={10}/><Star x={44} y={39} s={.7}/><Star x={214} y={38} s={.65} delay={-.7}/>
  </>;
}

export default function WinterScene({kind,className=''}:{kind:SceneKind;className?:string}) {
  const ref=useRef<HTMLDivElement>(null);
  const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  const [active,setActive]=useState(false);
  useEffect(()=>{
    if (!ref.current) return;
    const observe=new IntersectionObserver(([entry])=>setActive(entry.isIntersecting&&!document.hidden),{threshold:.12});
    observe.observe(ref.current);
    const visibility=()=>{if(document.hidden)setActive(false);else {
      const bounds=ref.current?.getBoundingClientRect();
      setActive(!!bounds && bounds.bottom>0 && bounds.top<innerHeight);
    }};
    document.addEventListener('visibilitychange',visibility);
    return ()=>{observe.disconnect();document.removeEventListener('visibilitychange',visibility)};
  },[]);
  return <div ref={ref} aria-hidden="true" className={`winter-scene ws-${kind} ${active?'scene-active':''} ${className}`}>
    <svg viewBox="0 0 260 154" focusable="false">
      {kind==='globe'?<Globe id={`winter-globe-${id}`}/>:kind==='cocoa'?<Cocoa/>:kind==='tree'?<Tree/>:kind==='gift'?<Gift/>:kind==='gingerbread'?<Gingerbread/>:kind==='reindeer'?<Reindeer/>:kind==='snowman'?<Snowman/>:kind==='window-cat'?<WindowCat id={`winter-window-${id}`}/>:<Penguin/>}
    </svg>
  </div>;
}
