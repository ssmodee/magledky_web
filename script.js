'use strict';
/* ===== KONFIGURACE – produkty a ceny snadno upravíte zde ===== */
const P=[
{id:1,name:'Jméno na míru',cat:'Text',price:79,m:'round',t:'EMA',c:['#93c5fd'],d:'Ukázka magnetky se jménem.'},
{id:2,name:'Srdce',cat:'Tvary',price:79,m:'heart',t:'',c:['#fda4af'],d:'Jemný dárek pro někoho blízkého.'},
{id:3,name:'Hvězda',cat:'Tvary',price:89,m:'star',t:'',c:['#fde68a'],d:'Hravý trojrozměrný motiv.'},
{id:4,name:'Kočička',cat:'Zvířata',price:89,m:'cat',t:'',c:['#c4b5fd'],d:'Originální motiv pro milovníky koček.'},
{id:5,name:'Vlastní vzkaz',cat:'Text',price:79,m:'square',t:'AHOJ!',c:['#86efac'],d:'Malý vzkaz na každý den.'},
{id:6,name:'Vlastní logo',cat:'Na míru',price:79,m:'square',t:'LOGO',c:['#bae6fd'],d:'Ukázka magnetky s vlastním logem.'}
];
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let custom={};try{custom=JSON.parse(localStorage.getItem('magledky_custom'))||{}}catch(e){}
const CATS=['Vše',...new Set(P.map(p=>p.cat))];
const KC=n=>n.toLocaleString('cs-CZ')+' Kč';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

function art(p){
 const shapes={round:'M100 26 A68 68 0 1 1 99.9 26Z',square:'M52 32H148Q168 32 168 52V148Q168 168 148 168H52Q32 168 32 148V52Q32 32 52 32Z',heart:'M100 160L40 100C-2 43 65 10 100 61C135 10 202 43 160 100Z',star:'M100 18L124 70L182 78L140 119L150 177L100 150L50 177L60 119L18 78L76 70Z',cat:'M35 32L70 55Q100 44 130 55L165 32V112Q165 163 100 163Q35 163 35 112Z'};
 const shape=shapes[p.m]||shapes.round, color=/^#[0-9a-f]{6}$/i.test(p.c[0])?p.c[0]:'#93c5fd'; const t=esc(p.t||'');
 const uid='s'+Math.random().toString(36).slice(2); const img=p.img&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(p.img)?`<image href="${p.img}" x="48" y="45" width="104" height="104" preserveAspectRatio="xMidYMid slice" clip-path="url(#${uid})"/>`:'';
 return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(p.name)}"><defs><clipPath id="${uid}"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="#45617e" transform="translate(0 9)" opacity=".8"/><path d="${shape}" fill="${color}" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>${img}${p.m==='cat'?'<circle cx="77" cy="100" r="5" fill="#253c59"/><circle cx="123" cy="100" r="5" fill="#253c59"/><path d="M94 115L106 115L100 122Z" fill="#253c59"/>':''}<text x="100" y="${img?145:108}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${Math.min(28,125/Math.max(4,(p.t||'').length)*1.5)}" fill="#142e50" stroke="white" stroke-width=".3">${t}</text></svg>`;
}
const find=id=>P.find(p=>p.id==id)||custom[id];
/* ===== Košík (localStorage) ===== */
let cart={};
try{cart=JSON.parse(localStorage.getItem('magledky_cart'))||{}}catch(e){}
Object.keys(cart).forEach(k=>{if(!find(k)||!(cart[k]>0))delete cart[k]});
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),1800)}
function add(id,q=1){cart[id]=Math.min(99,(cart[id]||0)+q);cartUI();toast('Přidáno do košíku');const b=$('#cartBtn');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
function setQ(id,q){if(q<=0)delete cart[id];else cart[id]=Math.min(99,q);cartUI()}
const total=()=>Object.entries(cart).reduce((s,[id,n])=>s+find(id).price*n,0);
function cartUI(){
 try{localStorage.setItem('magledky_cart',JSON.stringify(cart))}catch(e){}
 const ids=Object.keys(cart);
 $('#cartCount').textContent=ids.reduce((s,k)=>s+cart[k],0);
 $('#cartList').innerHTML=ids.length?ids.map(id=>{const p=find(id),n=cart[id];return`<li class="ci"><div class="ct">${art(p)}</div><div><b>${esc(p.name)}</b><span class="pr">${KC(p.price)} / ks ${p.id.toString().startsWith('c')?' · '+esc(p.d):''}</span><div class="q"><button data-q="${id}" data-d="-1" aria-label="Méně">−</button><span>${n}</span><button data-q="${id}" data-d="1" aria-label="Více">+</button></div></div><div style="text-align:right"><button class="x" data-rm="${id}" aria-label="Odebrat">×</button><div class="pr" style="font:12px var(--mono);margin-top:6px">${KC(p.price*n)}</div></div></li>`}).join(''):'<li class="empty">Košík je prázdný</li>';
 $('#cartTotal').textContent=KC(total());
 $('#checkoutBtn').disabled=!ids.length;$('#checkoutBtn').style.opacity=ids.length?1:.4;
}
function drawer(on){$('#drawer').classList.toggle('on',on);$('#veil').classList.toggle('on',on);$('#drawer').setAttribute('aria-hidden',!on);document.body.classList.toggle('lock',on)}

/* ===== Katalog ===== */
function renderFilters(){$('#filters').innerHTML=CATS.map((c,i)=>`<button data-f="${c}" class="${i?'':'on'}">${c}</button>`).join('')}
function renderGrid(f='Vše'){
 $('#grid').innerHTML=P.filter(p=>f=='Vše'||p.cat==f).map(p=>`<article class="card rv"><button class="thumb" data-open="${p.id}" aria-label="Detail: ${esc(p.name)}">${art(p)}</button><div class="meta"><span>${esc(p.name)}</span><span>${KC(p.price)}</span></div><p>${esc(p.d)}</p><button class="btn ghost" data-add="${p.id}">Přidat do košíku</button></article>`).join('');
 reveal();
}
function openDetail(id){
 const p=find(id);
 $('#detailBody').innerHTML=`<div class="ar">${art(p)}</div><div class="tx"><span class="note">${p.cat} · Kolekce 01</span><h3>${esc(p.name)}</h3><p>${esc(p.d)}</p><div class="pr">${KC(p.price)}</div><div class="row"><div class="q"><button data-dq="-1" aria-label="Méně">−</button><span id="dq">1</span><button data-dq="1" aria-label="Více">+</button></div><button class="btn" data-addq="${p.id}">Přidat do košíku</button></div></div>`;
 $('#detail').showModal();
}

/* ===== Události ===== */
document.addEventListener('click',e=>{
 const t=e.target;const c=s=>t.closest(s);let b;
 if(b=c('[data-add]'))add(b.dataset.add);
 else if(b=c('[data-addq]')){add(b.dataset.addq,+$('#dq').textContent);$('#detail').close();drawer(true)}
 else if(b=c('[data-dq]')){const el=$('#dq');el.textContent=Math.max(1,Math.min(99,+el.textContent+ +b.dataset.dq))}
 else if(b=c('[data-open]'))openDetail(b.dataset.open);
 else if(b=c('[data-f]')){$$('#filters button').forEach(x=>x.classList.toggle('on',x==b));renderGrid(b.dataset.f)}
 else if(b=c('[data-q]'))setQ(b.dataset.q,cart[b.dataset.q]+ +b.dataset.d);
 else if(b=c('[data-rm]'))setQ(b.dataset.rm,0);
 else if(c('#cartBtn'))drawer(true);
 else if(c('[data-closedrawer]')||t.id=='veil')drawer(false);
 else if(c('#clearBtn')){cart={};cartUI()}
 else if(c('#checkoutBtn')){drawer(false);$('#coTotal').textContent=KC(total());$('#coForm').hidden=false;$('#coDone').hidden=true;$('#orderForm').reset();$('#co').showModal()}
 else if(b=c('[data-close]'))b.closest('dialog').close();
 else if(t.tagName=='DIALOG')t.close();
 else if(c('#burger')){const o=$('#menu').classList.toggle('on');$('#burger').setAttribute('aria-expanded',o)}
 else if(c('#menu a')){$('#menu').classList.remove('on');$('#burger').setAttribute('aria-expanded',false)}
});
document.addEventListener('keydown',e=>{if(e.key=='Escape')drawer(false)});
$('#orderForm').addEventListener('submit',e=>{
 e.preventDefault();
 $('#coRef').textContent='DEMO-'+Math.floor(10000+Math.random()*90000);
 $('#coForm').hidden=true;$('#coDone').hidden=false;
 cart={};cartUI();
});
$('#contactForm').addEventListener('submit',e=>{
 e.preventDefault();const f=e.target;
 if(!f.checkValidity()){f.reportValidity();return}
 f.reset();$('#contactOk').hidden=false;setTimeout(()=>$('#contactOk').hidden=true,5000);
});

/* ===== Animace ===== */
let io;
function reveal(){
 if(!('IntersectionObserver' in window)){$$('.rv').forEach(x=>x.classList.add('in'));return}
 io=io||new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.12});
 $$('.rv:not(.in)').forEach((x,i)=>{x.style.transitionDelay=(i%4)*70+'ms';io.observe(x)});
}
const hs=[P[0],P[1],P[3]];
$$('#stack .m').forEach((el,i)=>el.innerHTML=art(hs[i]));
$('#domu').addEventListener('mousemove',e=>{
 const s=$('#stack').style;s.setProperty('--mx',(e.clientX/innerWidth-.5)*40);s.setProperty('--my',(e.clientY/innerHeight-.5)*40);
 $$('#stack .m').forEach(m=>{m.style.setProperty('--mx',(e.clientX/innerWidth-.5)*40);m.style.setProperty('--my',(e.clientY/innerHeight-.5)*40)});
});
const words=['3D magnetky','Na míru','Vlastní motivy','Tvoje lednice','Magledky'];
$('.mt').innerHTML=Array(4).fill(words.map(w=>`<span>${w}</span><span>✦</span>`).join('')).join('');
$('#yr').textContent=new Date().getFullYear();
renderFilters();renderGrid();cartUI();reveal();

let uploaded='', reading=false, uploadVersion=0;
function draft(){return {name:'Vlastní magnetka: '+($('#customText').value.trim()||'Bez textu'),cat:'Na míru',price:99,m:$('#customShape').value,t:$('#customText').value,c:[$('#customColor').value],d:$('#customSize').value,img:uploaded};}
function preview(){const p=draft();$('#previewArt').innerHTML=art(p);$('#previewSize').textContent='Velikost: '+p.d;}
$('#customForm').addEventListener('input',preview);
$('#customImage').addEventListener('change',()=>{const version=++uploadVersion;reading=false;uploaded='';const f=$('#customImage').files[0];if(!f){preview();return}if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>2*1024*1024){$('#imageStatus').textContent='Vyber platný obrázek do 2 MB.';$('#customImage').value='';preview();return}reading=true;const r=new FileReader();r.onload=()=>{if(version!==uploadVersion)return;uploaded=r.result;reading=false;$('#imageStatus').textContent='Obrázek načten pouze lokálně.';preview()};r.onerror=()=>{if(version!==uploadVersion)return;reading=false;$('#imageStatus').textContent='Obrázek se nepodařilo načíst.'};r.readAsDataURL(f)});
$('#removeImage').onclick=()=>{uploadVersion++;reading=false;uploaded='';$('#customImage').value='';$('#imageStatus').textContent='Obrázek odebrán.';preview()};
$('#customForm').addEventListener('submit',e=>{e.preventDefault();if(reading){toast('Počkej na načtení obrázku');return}const id='c'+Date.now()+Math.random().toString(36).slice(2,7);custom[id]={...draft(),id};try{localStorage.setItem('magledky_custom',JSON.stringify(custom))}catch(e){toast('Návrh zůstane jen v této relaci')}add(id);drawer(true)});preview();
