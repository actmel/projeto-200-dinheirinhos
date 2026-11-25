/* ===== Projeto 200 dinheirinhos — dados 100% locais (localStorage). Valores educacionais/estimados. ===== */
const KEY='projeto-mais-5kg',$=s=>document.querySelector(s),r=Math.round;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f1=n=>(Math.round(n*10)/10).toString().replace('.',',');
let S=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}})();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
let view='home',step=0,draft={},pd=(new Date().getDay()+6)%7,showExp=false,delArm=false;
const DIAS=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const toast=m=>{const t=$('#t');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2800)};
const today=()=>new Date().toLocaleDateString('sv-SE');
const dd=s=>Date.parse(s+'T12:00:00')/864e5;

const mac=(id,g)=>{const x=F[id],q=g/100;return{k:x.k*q,p:x.p*q,c:x.c*q,f:x.f*q}};
const sum=its=>its.reduce((s,x)=>{const m=mac(x.id,x.g);return{k:s.k+m.k,p:s.p+m.p,c:s.c+m.c,f:s.f+m.f}},{k:0,p:0,c:0,f:0});
const hm=x=>{const q=x.g/F[x.id].mg;return q<.5?'uma pitada':(Math.round(q*2)/2).toString().replace('.',',')+' '+F[x.id].mu};

/* ===== Cálculos nutricionais ===== */
const W=()=>[...(S.weights||[])].sort((a,b)=>a.d<b.d?-1:1);
const cw=()=>{const w=W();return w.length?w[w.length-1].w:S.profile.w0};
function calc(p){
 const w=cw(),bmr=10*w+6.25*p.h-5*p.a+(p.sex==='m'?5:-161);      // Mifflin-St Jeor
 const tdee=bmr*({1:1.2,2:1.375,3:1.55,4:1.725}[p.act]);          // fatores de atividade
 let sur=300+(p.hard==='sim'?100:0)+(p.adj||0);                    // superávit moderado
 sur=Math.max(150,Math.min(sur,Math.round(tdee*.15)));
 const kcal=r(tdee+sur),prot=r(1.8*w),fat=r(kcal*.25/9),carb=r((kcal-prot*4-fat*9)/4);
 const rate=Math.min(sur*7/7700,w*.005);                           // kg/semana (conservador)
 return{bmr:r(bmr),tdee:r(tdee),sur,kcal,prot,fat,carb,rate,need:(p.tw-S.profile.w0)/rate};
}
function obs(){const w=W();if(w.length<3||dd(w[w.length-1].d)-dd(w[0].d)<14)return null;
 const x=w.map(e=>dd(e.d)-dd(w[0].d)),y=w.map(e=>e.w),n=w.length,mx=x.reduce((a,b)=>a+b)/n,my=y.reduce((a,b)=>a+b)/n;let u=0,v=0;
 x.forEach((a,i)=>{u+=(a-mx)*(y[i]-my);v+=(a-mx)**2});return v?u/v*7:null}

/* ===== Restrições e gerador de planejamento ===== */
const words=s=>String(s||'').toLowerCase().split(/[,;\n]/).map(x=>x.trim()).filter(x=>x.length>2);
function allowed(id){const p=S.profile,x=F[id],rx=[...(p.rx||[]),...(p.bud==='baixo'?['caro']:[])];
 if(x.t.split(' ').some(t=>t&&rx.includes(t)))return false;
 return !words(p.dis+','+p.al).some(w=>x.n.toLowerCase().includes(w))}
const NM={3:[['Café da manhã','bf',.3],['Almoço','m',.4],['Jantar','m',.3]],
4:[['Café da manhã','bf',.25],['Almoço','m',.3],['Lanche da tarde','sn',.15],['Jantar','m',.3]],
5:[['Café da manhã','bf',.2],['Lanche da manhã','sn',.1],['Almoço','m',.3],['Lanche da tarde','sn',.15],['Jantar','m',.25]],
6:[['Café da manhã','bf',.18],['Lanche da manhã','sn',.1],['Almoço','m',.27],['Lanche da tarde','sn',.13],['Jantar','m',.22],['Ceia','sn',.1]]};
const T={bf:[[['pao',50],['ovo',100],['leite',200],['banana',70]],[['aveia',40],['leite',250],['banana',70],['amendoim',15]],[['iogurte',170],['aveia',30],['banana',70],['amendoim',15]],[['pao',50],['queijo',40],['leite',200]]],
sn:[[['pao',50],['queijo',30],['banana',70]],[['iogurte',170],['aveia',30],['amendoim',15]],[['banana',70],['amendoim',20],['leite',200]],[['ovo',100],['pao',50]],[['pao',50],['amendoim',20],['banana',70]]],
m:[[['arroz',150],['feijao',100],['frango',120],['azeite',5]],[['arroz',150],['feijao',100],['carne',110]],[['macarrao',200],['carne',100],['queijo',20]],[['arroz',150],['lentilha',100],['ovo',100]],[['arroz',150],['grao',100],['tofu',100]],[['batata',200],['frango',120],['arroz',100]],[['arroz',150],['feijao',100],['soja',30],['azeite',5]],[['macarrao',200],['frango',120],['azeite',5]]]};
function genPlan(){
 const p=S.profile,t=calc(p),ms=NM[p.nr],n=ms.length,fav=words(p.fav);
 const [h1,m1]=p.t1.split(':').map(Number),[h2,m2]=p.t2.split(':').map(Number),a=h1*60+m1,b=h2*60+m2;
 S.plan=[...Array(7)].map((_,d)=>ms.map((m,i)=>{
  const mn=r(a+(b-a)*i/(n-1)),meal={nm:m[0],t:String(Math.floor(mn/60)).padStart(2,'0')+':'+String(mn%60).padStart(2,'0'),items:[],warn:''};
  let ok=T[m[1]].filter(tp=>tp.every(x=>allowed(x[0])));
  ok=ok.concat(ok.filter(tp=>tp.some(x=>fav.some(w=>F[x[0]].n.toLowerCase().includes(w)))));
  if(!ok.length){meal.warn='Não foi possível montar esta refeição com as suas restrições. Registre o que comer no diário e procure um nutricionista.';return meal}
  const tp=ok[(d*3+i)%ok.length],base=tp.reduce((s,x)=>s+mac(x[0],x[1]).k,0);let f=t.kcal*m[2]/base;
  if(f<.5||f>2.5){meal.warn='A meta calórica desta refeição só foi aproximada.';f=Math.min(2.5,Math.max(.5,f))}
  meal.items=tp.map(x=>({id:x[0],g:Math.max(5,r(x[1]*f/5)*5)}));return meal}));save()}
function swap(d,m,i){const it=S.plan[d][m].items[i],o=F[it.id],kc=mac(it.id,it.g).k;
 const L=Object.values(F).filter(x=>x.g===o.g&&allowed(x.id));const j=L.findIndex(x=>x.id===o.id);
 if(L.length<2)return toast('Sem alternativa compatível com suas restrições.');
 const n=L[(j+1)%L.length];S.plan[d][m].items[i]={id:n.id,g:Math.max(5,r(kc/n.k*100/5)*5)};save();render()}
const dayTot=d=>S.plan[d].reduce((s,m)=>{const x=sum(m.items);return{k:s.k+x.k,p:s.p+x.p,c:s.c+x.c,f:s.f+x.f}},{k:0,p:0,c:0,f:0});
const wdOf=ds=>(new Date(ds+'T12:00:00').getDay()+6)%7;
function eaten(ds){const l=(S.log||{})[ds]||{done:{},extra:[]},wd=wdOf(ds);
 return sum([...S.plan[wd].flatMap((m,i)=>l.done[i]?m.items:[]),...l.extra])}

/* ===== Segurança ===== */
function risk(p){const imc=p.w0/((p.h/100)**2);
 if(p.a<18)return'Este app não gera planos automáticos para menores de 18 anos. Procure um nutricionista ou pediatra.';
 if(p.preg)return'Na gestação ou amamentação as necessidades mudam e exigem acompanhamento profissional. Procure seu obstetra ou nutricionista.';
 if(p.clin)return'Condições como diabetes, doença renal ou hepática e transtornos alimentares exigem acompanhamento especializado. Procure um nutricionista ou médico.';
 if(imc<17.5)return'Seu IMC está muito baixo; antes de qualquer plano, é importante uma avaliação médica e nutricional.';return''}

/* ===== Onboarding ===== */
const fld=(k,l,t='text',x='',o)=>{const v=draft[k]??'';return`<label class="fl">${l}${o?`<select data-k="${k}">${o.map(([a,b])=>`<option value="${a}"${String(v)===String(a)?' selected':''}>${b}</option>`).join('')}</select>`:`<input data-k="${k}" type="${t}" value="${esc(v)}" ${x}>`}</label>`};
const HR=o=>(o?[['','Sem horário fixo']]:[]).concat(Array.from({length:35},(_,i)=>{const m=300+i*30,t=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');return[t,t]}));
const RX=[['lac','Sem lactose'],['glu','Sem glúten'],['ovo','Sem ovo'],['nut','Sem amendoim'],['soy','Sem soja'],['carne','Vegetariana (sem carnes)']];
function onb(){const d=draft;d.sex=d.sex||'f';d.wk=d.wk||12;d.t1=d.t1||'07:00';d.t2=d.t2||'21:00';
 const S0=`<h2>Sobre você</h2>${fld('nome','Nome ou apelido','text','required maxlength=30')}${fld('sex','Sexo (usado na fórmula de cálculo)','',' ',[['f','Feminino'],['m','Masculino']])}${fld('a','Idade (anos)','number','required min=10 max=90')}${fld('h','Altura (cm)','number','required min=120 max=220')}${fld('w0','Peso atual (kg)','number','required min=30 max=200 step=0.1')}${fld('tw','Peso desejado (kg) — vazio = atual + 5 kg','number','min=31 max=215 step=0.1')}${fld('wk','Prazo desejado (semanas)','number','required min=4 max=52')}`;
 const S1=`<h2>Rotina e treino</h2>${fld('act','Nível de atividade física (fora o treino)','',' ',[[1,'Sedentária'],[2,'Leve'],[3,'Moderada'],[4,'Alta']])}${fld('exp','Experiência com musculação','',' ',[['ini','Iniciante'],['int','Intermediária'],['ava','Avançada']])}${fld('fr','Treinos por semana','number','required min=0 max=7')}${fld('tt','Horário do treino','',' ',HR(true))}${fld('ap','Nível de apetite','',' ',[['b','Baixo'],['m','Médio'],['a','Alto']])}${fld('sl','Horas de sono por noite','number','required min=3 max=12 step=0.5')}${fld('sq','Qualidade do sono','',' ',[['r','Ruim'],['g','Regular'],['b','Boa']])}${fld('nr','Refeições por dia','',' ',[[3,'3'],[4,'4'],[5,'5'],[6,'6']])}${fld('t1','Primeira refeição','',' ',HR())}${fld('t2','Última refeição','',' ',HR())}`;
 const S2=`<h2>Alimentação e saúde</h2><p class="mu">Restrições</p>${RX.map(([v,l])=>`<label class="ck"><input type="checkbox" data-g value="${v}"${(d.rx||[]).includes(v)?' checked':''}>${l}</label>`).join('')}${fld('al','Alergias (separe por vírgula)')}${fld('fav','Alimentos favoritos (vírgula)')}${fld('dis','Alimentos que não gosta (vírgula)')}${fld('bud','Orçamento','',' ',[['baixo','Apertado'],['med','Médio'],['alto','Confortável']])}${fld('hard','Tem dificuldade para ganhar peso?','',' ',[['nao','Não'],['sim','Sim']])}${fld('sup','Interesse em suplementos','',' ',[['nao','Nenhum'],['talvez','Talvez'],['sim','Sim']])}<label class="ck"><input type="checkbox" data-k="preg" ${d.preg?'checked':''}>Estou grávida ou amamentando</label><label class="ck"><input type="checkbox" data-k="clin" ${d.clin?'checked':''}>Tenho diabetes, doença renal/hepática, transtorno alimentar ou outra condição clínica</label>${fld('note','Observações de saúde (opcional)')}<label class="ck"><input type="checkbox" data-k="ack" required ${d.ack?'checked':''}>Entendo que os valores são estimativas educacionais e não substituem um nutricionista.</label>`;
 return`<h1>Projeto 200 dinheirinhos 💪</h1><p class="mu">Etapa ${step+1} de 3 — seus dados ficam só neste aparelho.</p><div class="bar"><i style="width:${(step+1)*33.3}%"></i></div><div class="card">${[S0,S1,S2][step]}</div><div class="row">${step?'<button class="btn s" data-act="back">Voltar</button>':'<span></span>'}<button class="btn" data-act="next">${step==2?'Concluir':'Próximo'}</button></div>`}
function collect(){document.querySelectorAll('[data-k]').forEach(el=>{const k=el.dataset.k;draft[k]=el.type==='checkbox'?el.checked:el.type==='number'?(el.value===''?'':+el.value):el.value});
 const g=document.querySelectorAll('[data-g]');if(g.length)draft.rx=[...g].filter(e=>e.checked).map(e=>e.value)}
function finish(){const p=draft;p.tw=p.tw===''||p.tw==null?+(p.w0+5).toFixed(1):p.tw;
 if(p.tw<=p.w0)return toast('O peso desejado deve ser maior que o atual.');
 if(p.t2<=p.t1)return toast('A última refeição deve ser depois da primeira.');
 const m=risk(p);if(m){S.blocked=m;save();return render()}
 const keepW=S.weights&&S.profile&&S.profile.w0===p.w0;S.profile={...p,adj:S.profile?S.profile.adj||0:0};
 if(!keepW)S.weights=[{d:today(),w:p.w0}];S.log=S.log||{};S.shop=S.shop||{ck:{},pr:{}};S.blocked=null;genPlan();view='home';render()}

/* ===== Componentes ===== */
const bar=(l,v,t,u)=>`<div class="row"><span>${l}</span><small>${r(v)} / ${r(t)} ${u}</small></div><div class="bar"><i style="width:${Math.min(100,v/t*100)}%"></i></div>`;
const mealH=(m,d,mi)=>{const s=sum(m.items);return`<div class="card"><div class="row"><b>${m.nm}</b><small>${m.t}</small></div>${m.warn?`<p class="wa">${m.warn}</p>`:''}${m.items.map((x,i)=>`<div class="it"><span>${F[x.id].n}<small>${x.g} g · ≈ ${hm(x)}</small></span><button class="ic np" data-act="swap" data-d="${d}" data-m="${mi}" data-i="${i}" aria-label="Trocar ${esc(F[x.id].n)} por alternativa">⇄</button></div>`).join('')}<small>${r(s.k)} kcal · P ${r(s.p)} g · C ${r(s.c)} g · G ${r(s.f)} g</small>${prepH(m.items)}</div>`};
function chart(t){const w=W(),d0=dd(w[0].d),p=S.profile;
 const xm=Math.max(dd(w[w.length-1].d)-d0,Math.min(7*Math.ceil(t.need),364),14),exp=x=>Math.min(p.tw,p.w0+t.rate*x/7);
 const ys=w.map(e=>e.w).concat([p.tw,p.w0]),lo=Math.min(...ys)-1,hi=Math.max(...ys)+1;
 const X=d=>30+d/xm*270,Y=v=>130-(v-lo)/(hi-lo)*115;
 return`<svg viewBox="0 0 320 150" role="img" aria-label="Gráfico de evolução do peso"><line x1="30" y1="130" x2="300" y2="130" stroke="var(--bd)"/><text x="2" y="${Y(hi-1)+4}" font-size="10" fill="var(--mu)">${f1(hi-1)}</text><text x="2" y="${Y(lo+1)+4}" font-size="10" fill="var(--mu)">${f1(lo+1)}</text><line x1="${X(0)}" y1="${Y(p.w0)}" x2="${X(xm)}" y2="${Y(exp(xm))}" stroke="var(--mu)" stroke-dasharray="4 4"/><polyline fill="none" stroke="var(--ac)" stroke-width="2.5" points="${w.map(e=>X(dd(e.d)-d0)+','+Y(e.w)).join(' ')}"/>${w.map(e=>`<circle cx="${X(dd(e.d)-d0)}" cy="${Y(e.w)}" r="3.5" fill="var(--ac)"/>`).join('')}</svg><small>Linha contínua: seu peso · tracejada: ritmo estimado</small>`}

/* ===== Telas ===== */
const V={};
const PREP={arroz:'Cozinhe o arroz com alho e sal; as sobras podem ser congeladas em porções.',feijao:'Cozinhe o feijão na panela de pressão por cerca de 25 minutos e tempere com alho e cebola.',lentilha:'Cozinhe a lentilha por 20 a 25 minutos, sem precisar de molho.',grao:'Deixe o grão-de-bico de molho por 8 horas e cozinhe na pressão por 25 minutos.',frango:'Tempere com sal, alho e limão e grelhe por 5 a 6 minutos de cada lado, até não ficar rosado por dentro.',carne:'Grelhe ou refogue o patinho até o ponto desejado, sem queimar.',ovo:'Cozinhe os ovos por 8 a 10 minutos em água fervente e esfrie antes de descascar.',macarrao:'Cozinhe em água com sal até ficar macio e escorra.',batata:'Cozinhe em água com sal por 15 a 20 minutos, até ficar macia.',tofu:'Corte em cubos e doure na frigideira com um fio de azeite.',soja:'Hidrate a proteína de soja em água quente por 10 a 15 minutos, escorra e refogue com temperos.',aveia:'Misture a aveia ao leite ou ao iogurte; se preferir quente, aqueça por 2 a 3 minutos.'};
const prepH=its=>{const t=its.filter(x=>PREP[x.id]).map(x=>`<small>• <b>${F[x.id].n}:</b> ${PREP[x.id]}</small>`);return t.length?`<details><summary>Modo de preparo</summary>${t.join('')}</details>`:''};
/* Receitas: ingredientes do banco de alimentos, então macros e restrições usam as mesmas regras do plano */
const REC=[
{n:'Shake hipercalórico caseiro',c:'Shakes',it:[['leite',300],['banana',140],['aveia',30],['amendoim',30]],s:'Bata tudo no liquidificador por 1 minuto. Beba gelado, de preferência entre as refeições.'},
{n:'Vitamina proteica de iogurte',c:'Shakes',it:[['iogurte',170],['leite',200],['banana',70],['aveia',20]],s:'Bata o iogurte, o leite, a banana e a aveia até ficar cremoso.'},
{n:'Panqueca de banana e aveia',c:'Café e lanches',it:[['ovo',100],['banana',70],['aveia',40],['amendoim',15]],s:'Amasse a banana e misture com os ovos e a aveia. Doure em frigideira antiaderente por 2 minutos de cada lado e sirva com a pasta de amendoim.'},
{n:'Sanduíche proteico',c:'Café e lanches',it:[['pao',100],['queijo',40],['ovo',100]],s:'Cozinhe os ovos por 8 a 10 minutos e fatie. Monte o pão com queijo e ovo e aqueça na frigideira até o queijo derreter.'},
{n:'Mingau de aveia reforçado',c:'Café e lanches',it:[['aveia',50],['leite',300],['banana',70],['amendoim',15]],s:'Aqueça a aveia com o leite, mexendo, por 5 minutos até engrossar. Finalize com a banana picada e a pasta de amendoim.'},
{n:'Lanche rápido de pasta de amendoim',c:'Café e lanches',it:[['pao',50],['amendoim',20],['banana',70]],s:'Passe a pasta de amendoim no pão e acrescente fatias de banana.'},
{n:'Marmita de frango com batata',c:'Marmitas',it:[['batata',250],['frango',150],['feijao',100],['azeite',8]],s:'Cozinhe a batata, grelhe o frango temperado e aqueça o feijão. Monte, regue com o azeite e guarde por até 3 dias na geladeira.'},
{n:'Marmita de lentilha com ovo',c:'Marmitas',it:[['arroz',150],['lentilha',150],['ovo',100],['azeite',5]],s:'Cozinhe o arroz, a lentilha e os ovos. Monte e finalize com o azeite. Geladeira por até 3 dias.'},
{n:'Macarrão com carne e queijo',c:'Marmitas',it:[['macarrao',200],['carne',100],['queijo',20],['azeite',5]],s:'Cozinhe o macarrão, grelhe a carne e corte em tiras. Refogue com o azeite, misture ao macarrão e cubra com o queijo.'},
{n:'Creme de aveia concentrado',c:'Pouco apetite',it:[['aveia',40],['leite',200],['amendoim',15]],s:'Aqueça a aveia com o leite até ficar cremoso e misture a pasta de amendoim. Pouco volume e muitas calorias; tome devagar, em goles.'},
{n:'Vitamina concentrada em copinhos',c:'Pouco apetite',it:[['iogurte',170],['banana',70],['amendoim',20],['aveia',20]],s:'Bata tudo com pouco líquido. Divida em 2 ou 3 copinhos ao longo da tarde se estiver sem fome.'}];
let recF='Todas',recS={};
V.rec=()=>{const cats=['Todas','Shakes','Café e lanches','Marmitas','Pouco apetite'];
 return`<h1>Receitas hipercalóricas</h1><div class='tabs'>${cats.map(c=>`<button class='${c===recF?'on':''}' data-act='recf' data-v='${c}'>${c}</button>`).join('')}</div>`+REC.map((x,i)=>[x,i]).filter(o=>recF==='Todas'||o[0].c===recF).map(([x,i])=>{const q=recS[i]||1,its=x.it.map(a=>({id:a[0],g:Math.max(5,r(a[1]*q/5)*5)})),s=sum(its),bad=its.some(a=>!allowed(a.id));
 return`<div class='card'><div class='row'><b>${x.n}</b><small>${x.c}</small></div>${bad?`<p class='wa'>Tem ingrediente que você marcou para evitar. Troque o ingrediente ou escolha outra receita.</p>`:''}<div class='row'><button class='ic' data-act='recs' data-i='${i}' data-v='-0.5' aria-label='Diminuir porção'>−</button><span>${f1(q)} porção(ões)</span><button class='ic' data-act='recs' data-i='${i}' data-v='0.5' aria-label='Aumentar porção'>+</button></div>${its.map(a=>`<div class='it'><span>${F[a.id].n}<small>${a.g} g · ≈ ${hm(a)}</small></span></div>`).join('')}<p><small><b>${r(s.k)} kcal</b> · P ${r(s.p)} g · C ${r(s.c)} g · G ${r(s.f)} g</small></p><p>${x.s}</p></div>`}).join('')+`<small>Estimativas calculadas com a tabela de alimentos do app. Confira os rótulos dos produtos que você usa.</small>`};
V.home=()=>{const p=S.profile,t=calc(p),c=cw(),pct=Math.max(0,Math.min(100,(c-p.w0)/(p.tw-p.w0)*100)),e=eaten(today()),o=obs(),rem=Math.max(0,p.tw-c);
 const rt=o&&o>.05?o:t.rate,wks=rem/rt,dt=new Date(Date.now()+wks*7*864e5).toLocaleDateString('pt-BR');
 const wd=wdOf(today()),l=(S.log||{})[today()]||{done:{}},nx=S.plan[wd].findIndex((m,i)=>!l.done[i]&&m.items.length);
 const late=t.need>p.wk;
 return`<h1>Olá, ${esc(p.nome)}!</h1>${late?`<div class="wa"><b>Sobre o prazo:</b> um ganho saudável fica em torno de ${f1(t.rate)} kg/semana. Para +${f1(p.tw-p.w0)} kg, isso significa cerca de ${Math.ceil(t.need)} semanas — mais que as ${p.wk} do prazo. Não aumentamos as calorias além de um superávit moderado: pressa vira gordura e desconforto, não músculo. Estimativa alternativa: ~${Math.ceil(t.need)} semanas, ou uma meta menor para o prazo (~${f1(t.rate*p.wk)} kg).</div><br>`:''}
<div class="card"><div class="row"><div><small>Peso atual</small><span class="big">${f1(c)} kg</span></div><div><small>Meta</small><span class="big">${f1(p.tw)} kg</span></div></div><div class="bar"><i style="width:${pct}%"></i></div><div class="g"><div><small>Inicial</small>${f1(p.w0)} kg</div><div><small>Restam</small>${f1(rem)} kg</div><div><small>Progresso</small>${r(pct)}%</div></div></div>
<div class="card"><h2>Hoje · meta ${t.kcal} kcal</h2>${bar('Calorias',e.k,t.kcal,'kcal')}${bar('Proteínas',e.p,t.prot,'g')}${bar('Carboidratos',e.c,t.carb,'g')}${bar('Gorduras',e.f,t.fat,'g')}<small>As metas são orientações, não obrigações. Coma conforme sua fome e conforto.</small></div>
<div class="card"><h2>Próxima refeição</h2>${nx<0?'Tudo registrado por hoje 🎉':`<b>${S.plan[wd][nx].nm}</b> · ${S.plan[wd][nx].t}<small>${S.plan[wd][nx].items.map(x=>F[x.id].n).join(', ')}</small>`}</div>
<div class="card"><h2>Evolução</h2>${chart(t)}<p>${rem?`Estimativa atualizada: ~${Math.ceil(wks)} semanas (por volta de ${dt}), usando ${o&&o>.05?'seu ritmo real':'o ritmo teórico'} de ${f1(rt)} kg/semana.`:'Meta atingida! 🎉'}</p><small>Peso ganho inclui músculo, gordura e água; músculo cresce devagar (frações de kg por mês) e depende do treino.</small></div>`};
V.plan=()=>{const t=calc(S.profile),tot=dayTot(pd),prot=r(tot.p/t.prot*100);
 return`<h1>Plano semanal</h1><div class="tabs">${DIAS.map((x,i)=>`<button class="${i==pd?'on':''}" data-act="day" data-v="${i}">${x}</button>`).join('')}</div>${S.plan[pd].map((m,i)=>mealH(m,pd,i)).join('')}<div class="card"><b>Total do dia:</b> ${r(tot.k)} kcal (meta ${t.kcal}) · P ${r(tot.p)} g · C ${r(tot.c)} g · G ${r(tot.f)} g${prot<85||Math.abs(tot.k-t.kcal)>t.kcal*.1?`<p class="wa">Este dia não atinge bem as metas (proteína ${prot}% da meta). Revise restrições ou procure um nutricionista.</p>`:''}</div><button class="btn s" data-act="regen">Gerar plano novamente</button><p><small>Toque em ⇄ para trocar por um alimento semelhante; as quantidades são recalculadas. Pesos de alimentos cozidos, quando aplicável.</small></p>`};
V.diary=()=>{const ds=today(),wd=wdOf(ds),t=calc(S.profile),l=(S.log=S.log||{})[ds]||{done:{},extra:[]},e=eaten(ds);
 const hist=Object.keys(S.log).sort().reverse().slice(0,7).map(d=>{const x=eaten(d);return`<div class="it"><span>${new Date(d+'T12:00').toLocaleDateString('pt-BR')}</span><span>${r(x.k)} kcal · P ${r(x.p)} g</span></div>`}).join('');
 return`<h1>Diário de hoje</h1><div class="card">${bar('Calorias',e.k,t.kcal,'kcal')}${bar('Proteínas',e.p,t.prot,'g')}${bar('Carboidratos',e.c,t.carb,'g')}${bar('Gorduras',e.f,t.fat,'g')}</div>
${S.plan[wd].map((m,i)=>`<div class="card"><label class="ck"><input type="checkbox" data-act="done" data-i="${i}" ${l.done[i]?'checked':''}><span><b>${m.nm}</b> · ${m.t}<small>${m.items.map(x=>F[x.id].n+' '+x.g+' g').join(' · ')||'—'}</small></span></label></div>`).join('')}
<div class="card"><h2>Alimento extra</h2><label class="fl">Alimento<select id="xf">${Object.values(F).map(x=>`<option value="${x.id}">${x.n}</option>`).join('')}</select></label><label class="fl">Quantidade (g)<input id="xg" type="number" min="1" max="2000" value="100"></label><button class="btn" data-act="addx">Adicionar</button>${l.extra.map((x,i)=>`<div class="it"><span>${F[x.id].n}<small>${x.g} g · ${r(mac(x.id,x.g).k)} kcal</small></span><button class="ic" data-act="delx" data-i="${i}" aria-label="Remover">✕</button></div>`).join('')}</div>
<div class="card"><h2>Histórico</h2>${hist||'<small>Sem registros ainda.</small>'}</div>`};
V.weight=()=>{const w=W(),t=calc(S.profile),o=obs(),wk={};w.forEach(e=>{const k=Math.floor((dd(e.d)-dd(w[0].d))/7);(wk[k]=wk[k]||[]).push(e.w)});
 let tip='Registre ao menos 3 pesagens em 2 semanas para comparar com o ritmo estimado.';
 if(o!==null){if(o<t.rate*.5&&(S.profile.adj||0)<200)tip=`Seu ritmo (${f1(o)} kg/sem) está abaixo do estimado (${f1(t.rate)}). Se a fome e a rotina permitirem, você pode somar +100 kcal ao dia.<br><br><button class="btn s" data-act="adj" data-v="100">Aplicar +100 kcal</button>`;
  else if(o>t.rate*1.5)tip=`Seu ritmo (${f1(o)} kg/sem) está acima do estimado. Você pode reduzir 100 kcal para limitar o ganho de gordura.<br><br><button class="btn s" data-act="adj" data-v="-100">Aplicar −100 kcal</button>`;
  else tip=`Seu ritmo (${f1(o)} kg/sem) está compatível com o estimado (${f1(t.rate)}). Mantenha o plano.`}
 return`<h1>Peso</h1><div class="card"><label class="fl">Data<input id="wd" type="date" value="${today()}" max="${today()}"></label><label class="fl">Peso (kg)<input id="wv" type="number" step="0.1" min="30" max="200"></label><button class="btn" data-act="addw">Registrar</button></div><div class="card"><h2>Evolução</h2>${chart(t)}</div><div class="card"><h2>Ajustes</h2><p>${tip}</p><small>Oscilações de 1–2 kg são normais (água, glicogênio, digestão, ciclo menstrual). Nenhuma meta é alterada por uma pesagem isolada.</small></div><div class="card"><h2>Médias semanais</h2>${Object.keys(wk).map(k=>`<div class="it"><span>Semana ${+k+1}</span><b>${f1(wk[k].reduce((a,b)=>a+b)/wk[k].length)} kg</b></div>`).join('')}</div><div class="card"><h2>Histórico</h2>${[...w].reverse().map(e=>`<div class="it"><span>${new Date(e.d+'T12:00').toLocaleDateString('pt-BR')} · ${f1(e.w)} kg</span><button class="ic" data-act="delw" data-d="${e.d}" aria-label="Remover pesagem">✕</button></div>`).join('')}</div>`};
function shopList(){const m={};S.plan.forEach(d=>d.forEach(x=>x.items.forEach(i=>m[i.id]=(m[i.id]||0)+i.g)));return Object.entries(m).map(([id,g])=>({id,g,x:F[id]}))}
const qty=g=>g>=1000?f1(g/1000)+' kg':g+' g';
V.more=()=>{const L=shopList(),cats=[...new Set(L.map(e=>e.x.cat))],sh=S.shop;
 const tot=L.reduce((s,e)=>s+(sh.pr[e.id]!==undefined&&sh.pr[e.id]!==''?+sh.pr[e.id]:e.g/1000*e.x.pr),0);
 return`<h1>Mais</h1><div class="card"><h2>Lista de compras (semana)</h2>${cats.map(c=>`<b>${c}</b>${L.filter(e=>e.x.cat===c).map(e=>`<div class="it"><label class="ck"><input type="checkbox" data-chg="ck" data-id="${e.id}" ${sh.ck[e.id]?'checked':''}><span>${e.x.n}<small>${qty(e.g)}</small></span></label><input data-chg="pr" data-id="${e.id}" type="number" min="0" step="0.01" placeholder="R$" value="${sh.pr[e.id]??''}" style="width:80px;padding:8px;border:1px solid var(--bd);border-radius:8px;background:var(--cd)" aria-label="Preço de ${esc(e.x.n)}"></div>`).join('')}`).join('')}<p><b>Custo estimado: R$ ${f1(tot).replace(/(\d)$/,'$1')}</b><small>Usa os preços informados; nos demais, valores médios de referência. Pesos em alimentos já cozidos.</small></p><div class="row np"><button class="btn s" data-act="copy">Copiar</button><button class="btn s" data-act="print">Imprimir</button></div></div>
<div class="card"><h2>Suplementação (opcional)</h2><details><summary>Whey protein</summary><p>Conveniente para atingir a meta de proteína; não é superior à comida. Evite com alergia a leite; cuidado se houver doença renal. Custo-benefício melhor que outros suplementos, mas ovos, leite, iogurte e frango resolvem o mesmo.</p></details><details><summary>Creatina</summary><p>Um dos suplementos mais estudados (3–5 g/dia de monoidrato), pode ajudar força e massa magra e causar retenção de água. Evite sem orientação se houver doença renal. Barata, mas não obrigatória.</p></details><details><summary>Hipercalóricos</summary><p>Basicamente carboidrato em pó; caros para o que entregam. Uma vitamina de leite, banana, aveia e pasta de amendoim faz o mesmo por menos.</p></details><details><summary>Alternativas alimentares</summary><p>Leite, iogurte, ovos, aveia, pasta de amendoim e azeite aumentam calorias e proteínas com pouco volume.</p></details></div>
<div class="card"><h2>Fontes e limitações</h2><small>BMR: Mifflin-St Jeor (1990). Fatores de atividade 1,2–1,725. Proteína 1,8 g/kg (faixa 1,6–2,2; ISSN 2017, Morton 2018). Gordura 25% das kcal. Superávit moderado (~300 kcal; teto de 15% do gasto) e ritmo ≤0,5% do peso/semana; conversão simplificada de 7.700 kcal/kg. Alimentos: valores aproximados com base em TACO/TBCA; confira rótulos. Tudo é estimativa educacional, não substitui nutricionista. Sem rastreadores; dados só neste aparelho.</small></div>
<div class="card np"><h2>Configurações</h2><div class="row"><button class="btn s" data-act="edit">Editar perfil</button><button class="btn s" data-act="theme">Tema</button></div><br><div class="row"><button class="btn s" data-act="exp">Exportar dados</button><button class="btn s" data-act="del" style="color:var(--wa)">${delArm?'Confirmar exclusão':'Excluir tudo'}</button></div>${showExp?`<p><textarea id="ex" readonly>${esc(JSON.stringify(S,null,1))}</textarea><button class="btn s" data-act="cpex">Copiar JSON</button></p>`:''}</div>`};

/* ===== Ações ===== */
const copy=txt=>{const f=()=>{const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Copiado!')}catch(e){toast('Não foi possível copiar.')}a.remove()};
 navigator.clipboard?navigator.clipboard.writeText(txt).then(()=>toast('Copiado!'),f):f()};
const A={
 tab:d=>{view=d.v;delArm=false;render()},day:d=>{pd=+d.v;render()},back:()=>{collect();step--;render()},
 next:()=>{if(![...document.querySelectorAll('[data-k]')].every(e=>e.reportValidity()))return;collect();if(step<2){step++;render()}else finish()},
 swap:d=>swap(+d.d,+d.m,+d.i),regen:()=>{genPlan();render();toast('Novo plano gerado.')},
 done:(d,b)=>{const k=today(),l=S.log[k]=S.log[k]||{done:{},extra:[]};l.done[d.i]=b.checked;save();render()},
 addx:()=>{const g=+$('#xg').value;if(!(g>0&&g<=2000))return toast('Informe entre 1 e 2000 g.');const k=today(),l=S.log[k]=S.log[k]||{done:{},extra:[]};l.extra.push({id:$('#xf').value,g});save();render()},
 delx:d=>{S.log[today()].extra.splice(+d.i,1);save();render()},
 addw:()=>{const d=$('#wd').value,v=+$('#wv').value;if(!d||!(v>=30&&v<=200))return toast('Informe uma data e um peso entre 30 e 200 kg.');S.weights=W().filter(e=>e.d!==d).concat([{d,w:v}]);save();render()},
 delw:d=>{if(W().length<2)return toast('Mantenha ao menos uma pesagem.');S.weights=W().filter(e=>e.d!==d.d);save();render()},
 adj:d=>{S.profile.adj=(S.profile.adj||0)+ +d.v;genPlan();render();toast('Ajuste aplicado e plano atualizado.')},
 copy:()=>copy('Lista de compras — Projeto 200 dinheirinhos\n'+shopList().map(e=>`- ${e.x.n}: ${qty(e.g)}`).join('\n')),print:()=>window.print(),
 edit:()=>{draft={...S.profile};step=0;view='onb';render()},theme:()=>{const dk=document.documentElement.dataset.theme==='dark'||(!S.theme&&matchMedia('(prefers-color-scheme:dark)').matches);S.theme=dk?'light':'dark';save();render()},
 exp:()=>{showExp=!showExp;render()},cpex:()=>copy(JSON.stringify(S)),
 del:()=>{if(!delArm){delArm=true;render();return toast('Toque de novo para confirmar.')}try{localStorage.removeItem(KEY)}catch(e){}S={};draft={};step=0;view='home';delArm=false;render()},
 unblock:()=>{S.blocked=null;step=2;view='onb';render()},recf:d=>{recF=d.v;render()},recs:d=>{recS[d.i]=Math.min(4,Math.max(.5,(recS[d.i]||1)+ +d.v));render()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&A[b.dataset.act])A[b.dataset.act](b.dataset,b)});
document.addEventListener('change',e=>{const b=e.target.closest('[data-chg]');if(!b)return;const id=b.dataset.id;
 if(b.dataset.chg==='ck')S.shop.ck[id]=b.checked;else S.shop.pr[id]=b.value;save();if(b.dataset.chg==='pr')render()});
function render(){const a=$('#app');document.documentElement.dataset.theme=S.theme||'';
 if(S.blocked){a.innerHTML=`<h1>Projeto 200 dinheirinhos</h1><div class="card"><p class="wa">${esc(S.blocked)}</p><p>Por segurança, não geramos plano automático neste caso. Se algum dado foi digitado errado, você pode revisar.</p><button class="btn" data-act="unblock">Revisar respostas</button></div>`;$('#nav').hidden=true;return}
 if(!S.profile||view==='onb'){a.innerHTML=onb();$('#nav').hidden=true;return}
 a.innerHTML=V[view]();$('#nav').hidden=false;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));window.scrollTo(0,0)}
if(!S.profile)view='onb';render();
