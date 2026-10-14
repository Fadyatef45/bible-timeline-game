const $=s=>document.querySelector(s),app=$('#app');
let S={best:{},snd:1,anim:1},G=null,tm=null,scr='home';
try{Object.assign(S,JSON.parse(localStorage.getItem('rbt1')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('rbt1',JSON.stringify(S))}catch(e){}};
function beep(f,d=.12){if(!S.snd)return;try{const a=beep.c||(beep.c=new(window.AudioContext||window.webkitAudioContext)()),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
const lvBest=i=>L[i].r.reduce((s,_,j)=>s+(S.best[i+'-'+j]||0),0);
const tot=()=>L.reduce((s,_,i)=>s+lvBest(i),0);
const done=i=>L[i].r.filter((_,j)=>S.best[i+'-'+j]!==undefined).length;
function go(s){clearInterval(tm);ask=false;scr=s;render()}
function tog(k){S[k]=S[k]?0:1;save();render()}
let ask=false;
function resetAll(){ask=true;render()}
function cancelReset(){ask=false;render()}
function doReset(){S.best={};save();ask=false;render()}
function shuffle(n){let a;do{a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}}while(a.every((v,i)=>v===i));return a}
function startLevel(i){G={li:i,ri:0,sum:0,cor:0,tot:0};startRound()}
function startRound(){const lv=L[G.li];G.R=lv.r[G.ri];G.n=G.R.e.length;G.o=shuffle(G.n);G.lk=new Set;G.h=0;G.chk=false;G.t0=Date.now();clearInterval(tm);tm=setInterval(tick,500);scr='game';render();scrollTo(0,0)}
function tick(){const e=$('#tm');if(e&&G){const s=Math.floor((Date.now()-G.t0)/1000);e.textContent='⏱ '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}}
function cards(){return G.o.map((id,p)=>{const lk=G.lk.has(id),c=G.chk?(id===p?'ok':'bad'):lk?'lk':'';return `<li class="c ${c}" data-id="${id}"><span class="n">${p+1}</span><span class="tx">${G.R.e[id]}${G.chk&&id!==p?`<small class="wr">الموضع الصحيح: ${id+1}</small>`:''}</span>${G.chk?`<span>${id===p?'✅':'❌'}</span>`:lk?'<span aria-label="مثبّت">🔒</span>':`<span class="ctl"><button data-a="-1" aria-label="تحريك لأعلى">▲</button><button data-a="1" aria-label="تحريك لأسفل">▼</button></span><span class="gr" aria-hidden="true">⠿</span>`}</li>`}).join('')}
function mv(p,d){const q=p+d;if(q<0||q>=G.n||G.lk.has(G.o[p])||G.lk.has(G.o[q]))return;const id=G.o[p];[G.o[p],G.o[q]]=[G.o[q],G.o[p]];$('#ls').innerHTML=cards();beep(330,.06);const b=$(`#ls [data-id="${id}"] [data-a="${d}"]`);if(b)b.focus()}
function hint(){if(!G||G.chk)return;const p=G.o.findIndex((id,i)=>id!==i);if(p<0)return;const q=G.o.indexOf(p);[G.o[p],G.o[q]]=[G.o[q],G.o[p]];G.lk.add(p);G.h++;$('#ls').innerHTML=cards();beep(660);$('#hn').textContent='💡 تم كشف موضع صحيح (−20 نقطة)'}
function check(){clearInterval(tm);const lv=L[G.li],n=G.n,sec=Math.floor((Date.now()-G.t0)/1000),cor=G.o.filter((id,p)=>id===p).length,acc=cor/n,bonus=Math.max(0,50-Math.floor(sec/4)),pts=Math.max(0,Math.round(acc*(100+bonus)*lv.d)-G.h*20),k=G.li+'-'+G.ri;
if(S.best[k]===undefined||pts>S.best[k])S.best[k]=pts;save();G.sum+=pts;G.cor+=cor;G.tot+=n;G.chk=true;
const last=G.ri===lv.r.length-1;
G.pan=`<div class="pan"><h3>${cor===n?'🎉 ترتيب صحيح تمامًا!':'أصبت '+cor+' من '+n}</h3><p>⭐ النقاط: <b>${pts}</b><br><small>دقة ${Math.round(acc*100)}٪ + مكافأة سرعة ${Math.round(acc*bonus)} ← × صعوبة ${lv.d} − تلميحات ${G.h*20}</small></p><h4>الترتيب الصحيح:</h4><ol>${G.R.e.map(x=>`<li>${x}</li>`).join('')}</ol><p>${G.R.x}</p><p class="rf">📖 ${G.R.f}</p><p class="md">${lv.m}</p></div><button class="b gold" onclick="next()">${last?'عرض النتيجة':'الجولة التالية ◀'}</button>`;
beep(cor===n?880:300,.25);render()}
function next(){if(G.ri<L[G.li].r.length-1){G.ri++;startRound()}else go('res')}
app.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&G&&!G.chk&&scr==='game'){const li=b.closest('.c');mv([...$('#ls').children].indexOf(li),+b.dataset.a)}});
app.addEventListener('pointerdown',e=>{const g=e.target.closest('.gr');if(!g||!G||G.chk)return;e.preventDefault();const ls=$('#ls'),li=g.closest('.c'),prev=[...G.o];li.classList.add('drag');
const mf=ev=>{const y=ev.clientY;if(y<80)scrollBy(0,-14);else if(y>innerHeight-80)scrollBy(0,14);const t=[...ls.children].filter(c=>c!==li).find(c=>{const r=c.getBoundingClientRect();return y<r.top+r.height/2});ls.insertBefore(li,t||null)};
const up=()=>{removeEventListener('pointermove',mf);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);const o=[...ls.children].map(c=>+c.dataset.id);G.o=[...G.lk].every(id=>o[id]===id)?o:prev;ls.innerHTML=cards();beep(440,.06)};
addEventListener('pointermove',mf);addEventListener('pointerup',up);addEventListener('pointercancel',up)});
const bar=()=>`<div class="bar">${scr!=='home'?'<button onclick="go(\'home\')" aria-label="الرئيسية">🏠</button>':'<span></span>'}<span><button onclick="tog(\'snd\')" aria-pressed="${!!S.snd}" aria-label="تشغيل أو إيقاف الصوت">${S.snd?'🔊':'🔇'}</button><button onclick="tog(\'anim\')" aria-pressed="${!!S.anim}" aria-label="تشغيل أو إيقاف الحركة">${S.anim?'✨':'⏸'}</button></span></div>`;
const V={
home:()=>`<main class="ctr"><div class="logo">📜</div><h1>رتّب القصة</h1><h2>Bible Timeline</h2><p class="sub">رتّب أحداث قصص الكتاب المقدس بالترتيب الصحيح</p><div class="pts">⭐ مجموع نقاطك: <b>${tot()}</b></div><button class="b gold" onclick="go('levels')">▶ ابدأ اللعب</button><button class="b" onclick="go('inst')">❓ كيف تلعب</button>${ask?'<div class="pan"><p>هل تريد مسح كل التقدم والنقاط؟</p><button class="b" onclick="doReset()">نعم، امسح</button><button class="b gold" onclick="cancelReset()">لا، إلغاء</button></div>':'<button class="b" onclick="resetAll()">🗑 مسح التقدم</button>'}</main>`,
inst:()=>`<main class="ctr"><h1>كيف تلعب؟</h1><div class="inst">١. اختر قصة من القائمة.<br>٢. ستظهر أحداث مختلطة؛ رتّبها من الأول إلى الأخير بسحب ⠿ أو بأزرار ▲ ▼.<br>٣. اضغط «تحقق» لترى الصحيح والخطأ مع الشرح والمراجع.<br>٤. النقاط = الدقة + مكافأة السرعة، مضروبة في صعوبة المستوى.<br>٥. التلميح 💡 يكشف موضعًا صحيحًا ويثبّته لكنه يخصم ٢٠ نقطة.<br>٦. يُحفظ تقدمك وأفضل نتائجك تلقائيًا في جهازك.</div><button class="b gold" onclick="go('levels')">▶ اختر قصة</button></main>`,
levels:()=>`<main class="ctr"><h1>اختر القصة</h1><div class="grid">${L.map((l,i)=>`<button class="lv" onclick="startLevel(${i})"><i>${l.i}</i>${l.t}<small>${'★'.repeat(l.d)}${'☆'.repeat(3-l.d)}<br>${done(i)}/${l.r.length} جولات · ${lvBest(i)} نقطة</small></button>`).join('')}</div></main>`,
game:()=>{const lv=L[G.li],pc=(G.ri+(G.chk?1:0))/lv.r.length*100;return `<main class="gm"><div class="hud"><span>⭐ ${G.sum}</span><span id="tm">⏱ 0:00</span><span>جولة ${G.ri+1}/${lv.r.length}</span></div><div class="pg" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pc)}"><i style="width:${pc}%"></i></div><h2 class="lt">${lv.i} ${lv.t}</h2><p class="hn" id="hn">${G.chk?'':'رتّب الأحداث من الأول إلى الأخير: اسحب ⠿ أو استخدم ▲ ▼'}</p><ol id="ls">${cards()}</ol>${G.chk?G.pan:`<button class="b gold" onclick="check()">✔ تحقق من الإجابة</button><button class="b" onclick="hint()">💡 تلميح (−20 نقطة)</button>`}</main>`},
res:()=>{const a=G.cor/G.tot,s=a>=.9?3:a>=.6?2:1,has=G.li<L.length-1;return `<main class="ctr"><div class="logo">${'⭐'.repeat(s)}${'☆'.repeat(3-s)}</div><h1>أنهيت: ${L[G.li].t}</h1><div class="pan">نقاط هذه المحاولة: <b>${G.sum}</b><br>أحداث في مواضعها الصحيحة: ${G.cor}/${G.tot}<br>أفضل نتيجة لهذا المستوى: <b>${lvBest(G.li)}</b><br>مجموع نقاطك: <b>${tot()}</b></div>${has?`<button class="b gold" onclick="startLevel(${G.li+1})">المستوى التالي ◀</button>`:'<p>🏆 أتممت جميع المستويات، أحسنت!</p>'}<button class="b" onclick="startLevel(${G.li})">🔁 إعادة المستوى</button><button class="b" onclick="go('levels')">📚 قائمة القصص</button></main>`}
};
function render(){document.body.classList.toggle('na',!S.anim);app.innerHTML=bar()+V[scr]()}
render();
