(() => {
  const view = document.getElementById('game-view');
  const red = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  const wheel = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  let chip = 10, bets = [], lastBets = [], playerHand = [], dealerHand = [], returnFocus = null, returnScroll = 0, roundFinished = true, dealerPlaying = false, viewVersion = 0, ballRotation = 0;
  const chips = [10,100,1000,10000,100000,1000000];
  const chipNames = ['10','100','1K','10K','100K','1M'];
  const cards = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const suits = ['♠','♥','♦','♣'];

  const wheelPoint = (radius, angle) => {
    const radians = angle * Math.PI / 180;
    return [210 + radius * Math.cos(radians), 160 + radius * .76 * Math.sin(radians)];
  };
  const wheelSector = (number, index) => {
    const step = 360 / wheel.length;
    const center = -90 + index * step;
    const start = wheelPoint(184, center - step / 2), end = wheelPoint(184, center + step / 2);
    const innerEnd = wheelPoint(112, center + step / 2), innerStart = wheelPoint(112, center - step / 2);
    const label = wheelPoint(148, center);
    const color = number === 0 ? '#126b4d' : red.has(number) ? '#9e2334' : '#111210';
    const labelRotation = center > 0 && center < 180 ? center + 90 - 180 : center + 90;
    return `<path d="M${start[0].toFixed(2)} ${start[1].toFixed(2)} A184 140 0 0 1 ${end[0].toFixed(2)} ${end[1].toFixed(2)} L${innerEnd[0].toFixed(2)} ${innerEnd[1].toFixed(2)} A112 85 0 0 0 ${innerStart[0].toFixed(2)} ${innerStart[1].toFixed(2)}Z" fill="${color}" stroke="#c6a65e" stroke-opacity=".62" stroke-width="1.2"/><text x="${label[0].toFixed(2)}" y="${label[1].toFixed(2)}" transform="rotate(${labelRotation.toFixed(2)} ${label[0].toFixed(2)} ${label[1].toFixed(2)})" text-anchor="middle" dominant-baseline="central" fill="#f6f0df" font-family="Georgia,serif" font-size="12" font-weight="700">${number}</text>`;
  };
  const wheelArtwork = () => `<div class="big-wheel"><svg class="roulette-wheel-svg" viewBox="0 0 420 330" role="img" aria-label="Ruleta europea con treinta y siete casillas"><g class="wheel-face"><ellipse cx="210" cy="160" rx="201" ry="153" fill="#080807" stroke="#b9964b" stroke-width="3"/><ellipse cx="210" cy="160" rx="194" ry="147" fill="#171510" stroke="#f0d581" stroke-width="2"/>${wheel.map(wheelSector).join('')}<ellipse cx="210" cy="160" rx="113" ry="86" fill="#090908" stroke="#f0d581" stroke-width="4"/><ellipse cx="210" cy="160" rx="101" ry="76" fill="#17140e" stroke="#8d7138" stroke-width="2"/><path d="M210 88L210 232M117 160H303M144 106L276 214M144 214L276 106" stroke="#b9964b" stroke-opacity=".72" stroke-width="4"/><ellipse cx="210" cy="160" rx="25" ry="20" fill="#090908" stroke="#f0d581" stroke-width="5"/><ellipse cx="210" cy="160" rx="12" ry="9" fill="#d9bb70"/></g><circle class="roulette-ball-svg" cx="210" cy="27" r="7" fill="#fff8e4" stroke="#bb984f" stroke-width="2"/></svg></div>`;

  const roulette = () => `<div class="roulette-layout">
    <section class="game-panel roulette-stage"><div class="game-kicker">MESA EUROPEA · NEXUS</div><h1>Ruleta europea</h1><p class="game-subtitle">37 casillas · Un solo cero</p>
      ${wheelArtwork()}
      <div class="roulette-result" id="roulette-result">—</div><p class="stage-hint">Pon fichas en la mesa y gira</p>
    </section>
    <section class="game-panel roulette-controls"><div class="roulette-table"><div class="number-grid"><button class="bet-cell zero" data-number="0">0</button>${[...Array(12)].flatMap((_,i)=>[3+i*3,2+i*3,1+i*3]).map(n=>`<button class="bet-cell ${red.has(n)?'red':'black'}" data-number="${n}">${n}</button>`).join('')}</div><div class="outside-bets"><button data-number="low">1–18</button><button data-number="even">PAR</button><button class="red" data-number="red">◆</button><button class="black" data-number="black">◆</button><button data-number="odd">IMPAR</button><button data-number="high">19–36</button></div></div>
      <div class="chip-picker">${chips.map((n,i)=>`<button class="casino-chip c${i} ${i===0?'selected':''}" data-chip="${n}">${chipNames[i]}</button>`).join('')}</div>
      <p class="bet-total">APUESTA TOTAL <strong id="bet-total">$0</strong></p><div class="table-actions"><button data-action="undo">Deshacer</button><button data-action="clear">Borrar</button><button data-action="repeat">Repetir</button></div><button class="primary-game-button" data-action="spin" disabled>Girar ruleta <span>↗</span></button>
    </section><div class="roulette-outcome" id="roulette-outcome" hidden role="status" aria-live="assertive"><div class="roulette-outcome-card"><span class="outcome-eyebrow">CIERRE DE RONDA</span><h2 id="roulette-outcome-title">Resultado</h2><strong id="roulette-net">$0</strong><p id="roulette-outcome-detail"></p><button class="primary-game-button" data-action="outcome-close">Continuar jugando</button></div></div></div>`;

  const slots = () => `<div class="solo-game"><section class="game-panel slots-machine"><div class="game-kicker">NEXUS CASINO · SLOTS</div><h1>Fortuna nocturna</h1><p class="game-subtitle">Tres rodillos. Una oportunidad brillante.</p><div class="reels" id="reels"><i>BAR</i><i>🔔</i><i>🍒</i></div><p class="slot-status" id="slot-status">Tu próxima jugada puede cambiarlo todo.</p><div class="slot-controls"><label>FICHA <select id="slot-bet"><option>10</option><option>100</option><option>1000</option><option>10000</option></select></label><button class="primary-game-button" data-action="slot-spin">Girar rodillos <span>↗</span></button></div><div class="payout-strip"><span>🍒 <b>×35</b></span><span>🔔 <b>×10</b></span><span>⭐ <b>×20</b></span><span>🍋 <b>×3</b></span><span>7️⃣ <b>×200</b></span></div></section></div>`;

  const avatar = `<svg class="pixel-crupier" viewBox="0 0 180 210" role="img" aria-label="Crupier con cabello café, camiseta negra y pantalón rosa" shape-rendering="crispEdges"><g class="avatar-bob"><!-- piernas rosas -->
    <path fill="#e880ad" d="M48 126h37v59H48zM88 126h39v59H88z"/><path fill="#f4a9c7" d="M49 131h11v9H49zm23 31h12v9H72zm18-21h11v10H90zm21 29h14v10h-14z"/><path fill="#fff0f5" d="M48 178h17v8H48zm67 0h12v8h-12z"/><path fill="#111015" d="M47 185h20v7H47zm65 0h18v7h-18z"/>
    <!-- torso y brazos --> <path fill="#111014" d="M49 75h77v61H49zM35 82h18v53H35zM122 82h19v53h-19z"/><path fill="#242126" d="M43 82h10v47H43zm80 0h10v47h-10z"/><path fill="#1b171e" d="M57 78h62v7H57z"/>
    <g class="avatar-arm arm-left"><path fill="#17141a" d="M34 91h18v34H34z"/><path fill="#e6a17c" d="M36 123h15v13H36z"/><path fill="#f1b18b" d="M39 127h8v6h-8z"/></g><g class="avatar-arm arm-right"><path fill="#17141a" d="M124 91h18v34h-18z"/><path fill="#e6a17c" d="M125 123h15v13h-15z"/><path fill="#f1b18b" d="M129 127h8v6h-8z"/></g>
    <!-- rostro y cabello --> <path fill="#d9926f" d="M58 34h58v48H58z"/><path fill="#f1b18b" d="M63 37h49v39H63z"/><path fill="#eaa17d" d="M58 51h7v17h-7zm51 0h7v17h-7z"/><path fill="#3a251f" d="M52 20h68v23h-7V35H64v8h-9v18h-7V31h4zm4 14h9v16h-9zm54 0h9v18h-9z"/><path fill="#523329" d="M60 18h52v12H60zM50 31h12v12H50zm64-1h10v17h-10z"/><path fill="#201a18" d="M69 51h10v5H69zm28 0h10v5H97z"/><path fill="#f0eee9" d="M71 52h6v3h-6zm28 0h6v3h-6z"/><path fill="#21202a" d="M73 52h3v4h-3zm28 0h3v4h-3z"/><path fill="#9b4966" d="M82 67h17v4H82z"/><path fill="#d27678" d="M87 71h8v3h-8z"/>
    <path fill="#f8c6dc" d="M54 143h8v6h-8zm57-9h8v7h-8zm-36 32h8v6h-8z"/><path fill="#fff" d="M50 180h12v4H50zm67 0h10v4h-10z"/></g></svg>`;
  const blackjack = () => `<div class="solo-game"><section class="game-panel blackjack-table"><div class="dealer"><div class="dealer-character">${avatar}<span class="dealer-card-flight" aria-hidden="true">♠</span></div><span>CRUPIER</span></div><div class="table-rule">BLACKJACK PAGA 3 A 2</div><div class="hand-label">CRUPIER <b id="dealer-score">—</b></div><div class="playing-hand" id="dealer-hand"></div><div class="hand-label player-label">TÚ <b id="player-score">—</b></div><div class="playing-hand player-hand" id="player-hand"></div><div class="blackjack-message" id="blackjack-message">Elige una ficha y reparte</div><div class="chip-picker blackjack-chips">${chips.map((n,i)=>`<button class="casino-chip c${i} ${i===0?'selected':''}" data-chip="${n}">${chipNames[i]}</button>`).join('')}</div><div class="blackjack-actions"><button class="soft-button" data-action="hit" disabled>Pedir</button><button class="soft-button" data-action="stand" disabled>Plantarse</button><button class="primary-game-button" data-action="deal">Repartir · <span data-current-bet>10</span></button></div></section></div>`;

  const poker = () => `<div class="solo-game"><section class="game-panel slots-machine poker-game"><div class="game-kicker">NEXUS CASINO · VIDEO POKER</div><h1>Jacks or Better</h1><p class="game-subtitle">Forma la mejor mano de cinco cartas.</p><div class="playing-hand poker-hand" id="poker-hand">${[['A','♠'],['K','♥'],['Q','♣'],['J','♦'],['10','♠']].map(([rank,suit])=>`<button class="playing-card ${['♥','♦'].includes(suit)?'red-card':''}" data-card="${rank}${suit}"><span>${rank}</span><small>${suit}</small></button>`).join('')}</div><p class="slot-status" id="poker-status">Toca una carta para conservarla</p><div class="chip-picker poker-chips">${chips.map((n,i)=>`<button class="casino-chip c${i} ${i===0?'selected':''}" data-chip="${n}">${chipNames[i]}</button>`).join('')}</div><button class="primary-game-button" data-action="draw">Cambiar cartas · <span data-current-bet>10</span></button><div class="payout-strip"><span>Jotas <b>1×</b></span><span>Doble pareja <b>2×</b></span><span>Color <b>6×</b></span><span>Escalera <b>9×</b></span><span>Royal flush <b>250×</b></span></div></section></div>`;

  function open(game) {
    viewVersion++;
    chip = 10;
    returnFocus = document.activeElement;
    returnScroll = window.scrollY;
    bets = [];
    const title = {slots:'Slots',ruleta:'Ruleta',blackjack:'Blackjack',poker:'Video Poker'}[game] || 'Casino';
    view.innerHTML = `<header class="game-topbar"><button class="back-to-lobby" data-action="close">‹ <span>Volver al lobby</span></button><a href="#lobby" class="game-brand"><img src="nexus-logo.svg" alt=""><span>NEXUS <b>CASINO</b></span></a><button class="game-top-balance" type="button" data-balance-open>elmanxy <strong data-balance-display>$6.89</strong><span>+</span></button></header><main class="game-main"><div class="game-titlebar"><i></i> MESA DE ${title.toUpperCase()} <span></span> <small>MESA ABIERTA</small></div>${game==='ruleta'?roulette():game==='slots'?slots():game==='blackjack'?blackjack():poker()}</main>`;
    const rouletteBall=view.querySelector('.roulette-ball-svg');
    if(rouletteBall)rouletteBall.style.transform=`rotate(${ballRotation}deg) scaleY(.76)`;
    window.updateCasinoBalanceDisplay?.();
    view.setAttribute('aria-label', `Mesa de ${title}`);
    [...document.body.children].forEach(element => { if(element!==view&&element.id!=='balance-dialog') element.inert=true; });
    view.hidden = false; document.body.classList.add('game-open');
    view.querySelector('.back-to-lobby').focus();
  }
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => open(button.dataset.game)));
  const randomCard = () => { const rank=cards[Math.floor(Math.random()*cards.length)], suit=suits[Math.floor(Math.random()*4)]; return {rank,suit,value:rank==='A'?11:['J','Q','K'].includes(rank)?10:Number(rank)}; };
  const handValue = hand => { let score=hand.reduce((sum,c)=>sum+c.value,0), aces=hand.filter(c=>c.rank==='A').length; while(score>21&&aces){score-=10;aces--;} return score; };
  const cardHTML = card => `<span class="playing-card dealt-card ${['♥','♦'].includes(card.suit)?'red-card':''}">${card.rank}<small>${card.suit}</small></span>`;
  const animateDealer = () => { const character=document.querySelector('.dealer-character'); if(!character)return; character.classList.remove('is-dealing'); void character.offsetWidth; character.classList.add('is-dealing'); window.setTimeout(()=>character.classList.remove('is-dealing'),1100); };
  const total = () => { const el=document.getElementById('bet-total'); if(el) el.textContent='$'+bets.reduce((n,b)=>n+b.amount,0).toLocaleString('es-CO'); };
  const syncSpin = () => { const button=view.querySelector('[data-action=spin]'); if(button) button.disabled=bets.length===0; };
  const syncBlackjack = () => { const canPlay=playerHand.length>0&&!roundFinished&&!dealerPlaying;const hit=view.querySelector('[data-action=hit]'),stand=view.querySelector('[data-action=stand]'),deal=view.querySelector('[data-action=deal]');if(hit)hit.disabled=!canPlay;if(stand)stand.disabled=!canPlay;if(deal)deal.disabled=dealerPlaying; };
  const paintBets = () => {view.querySelectorAll('[data-number]').forEach(cell=>{const amount=bets.filter(b=>b.number===cell.dataset.number).reduce((sum,b)=>sum+b.amount,0);cell.classList.toggle('bet-placed',amount>0);if(amount){cell.dataset.betLabel=amount>=1000000?`${amount/1000000}M`:amount>=1000?`${amount/1000}K`:String(amount);cell.setAttribute('aria-label',`Apuesta ${cell.dataset.number}: ${amount.toLocaleString('es-CO')} fichas`);}else{delete cell.dataset.betLabel;cell.removeAttribute('aria-label');}});syncSpin();};

  view.addEventListener('click', event => {
    const button=event.target.closest('button'); if(!button) return;
    const action=button.dataset.action;
    if(action==='close'){view.hidden=true;document.body.classList.remove('game-open');[...document.body.children].forEach(element=>{element.inert=false;});window.scrollTo({top:returnScroll,behavior:'auto'});if(returnFocus?.focus)returnFocus.focus();return;}
    if(action==='outcome-close'){const outcome=view.querySelector('#roulette-outcome');outcome.hidden=true;view.querySelector('[data-action="spin"]')?.focus();return;}
    if(button.dataset.chip){chip=Number(button.dataset.chip);view.querySelectorAll('[data-chip]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.chip)===chip));view.querySelectorAll('[data-current-bet]').forEach(node=>node.textContent=chip.toLocaleString('es-CO'));return;}
    if(button.dataset.number){bets.push({number:button.dataset.number,amount:chip});paintBets();total();return;}
    if(action==='undo'){bets.pop();paintBets();total();return;}
    if(action==='clear'){bets=[];paintBets();total();return;}
    if(action==='repeat'){bets=lastBets.map(b=>({...b}));paintBets();total();return;}
    if(action==='spin'){
      if(!bets.length)return;
      const roundBets=bets.map(bet=>({...bet}));
      const wager=roundBets.reduce((sum,bet)=>sum+bet.amount,0);
      if(!window.placeCasinoWager?.(wager)){document.querySelector('.stage-hint').textContent='Saldo insuficiente. Toca tu saldo para agregar fichas.';return;}
      const token=viewVersion,wheelEl=view.querySelector('.big-wheel'),ballEl=view.querySelector('.roulette-ball-svg'),spinButton=button,n=Math.floor(Math.random()*37);
      lastBets=roundBets.map(bet=>({...bet}));
      const desiredAngle=(wheel.indexOf(n)*(360/wheel.length))%360;
      const stopAngle=ballRotation+1800+((desiredAngle-(ballRotation%360)+360)%360);
      wheelEl.style.setProperty('--ball-stop',`${stopAngle}deg`);
      wheelEl.classList.remove('is-spinning');void wheelEl.offsetWidth;wheelEl.classList.add('is-spinning');
      spinButton.disabled=true;
      view.querySelectorAll('[data-number],[data-chip],[data-action=undo],[data-action=clear],[data-action=repeat]').forEach(control=>control.disabled=true);
      view.querySelector('.stage-hint').textContent='La bola recorre la pista…';
      window.setTimeout(()=>{
        const winningReturn=roundBets.reduce((total,bet)=>{
          const hit=bet.number===String(n)||(bet.number==='red'&&red.has(n))||(bet.number==='black'&&n>0&&!red.has(n))||(bet.number==='even'&&n>0&&n%2===0)||(bet.number==='odd'&&n%2===1)||(bet.number==='low'&&n>0&&n<=18)||(bet.number==='high'&&n>=19);
          return total+(hit?bet.amount+bet.amount*(/^\d+$/.test(bet.number)?35:1):0);
        },0);
        if(winningReturn)window.creditCasinoPayout?.(winningReturn);
        if(view.hidden||token!==viewVersion)return;
        const result=view.querySelector('#roulette-result');
        result.textContent=n;result.className='roulette-result '+(n===0?'green-text':red.has(n)?'red-text':'black-text');
        const outcome=view.querySelector('#roulette-outcome');
        const net=winningReturn-wager;
        view.querySelector('#roulette-outcome-title').textContent=net>0?'¡Ganaste!':'Perdiste';
        view.querySelector('#roulette-net').textContent=`${net>0?'+':'−'}$${Math.abs(net||wager).toLocaleString('es-CO')}`;
        view.querySelector('#roulette-outcome-detail').textContent=net>0?`Premio acreditado: $${winningReturn.toLocaleString('es-CO')} · Apuesta: $${wager.toLocaleString('es-CO')}`:`La apuesta de $${wager.toLocaleString('es-CO')} se descontó de tu saldo.`;
        outcome.hidden=false;
        view.querySelector('.stage-hint').textContent=net>0?'Premio acreditado a tu saldo.':'La apuesta fue descontada del saldo.';
        view.querySelectorAll('[data-number],[data-chip],[data-action=undo],[data-action=clear],[data-action=repeat]').forEach(control=>control.disabled=false);
        syncSpin();ballRotation=stopAngle;ballEl.style.transform=`rotate(${stopAngle}deg) scaleY(.76)`;wheelEl.classList.remove('is-spinning');
        outcome.querySelector('[data-action="outcome-close"]').focus();
      },window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?30:6600);
      return;
    }
    if(action==='slot-spin'){const wager=Number(document.getElementById('slot-bet').value)||10;window.recordCasinoWager?.(wager);const token=viewVersion,reelView=document.getElementById('reels'),status=document.getElementById('slot-status'),symbols=['🍒','🔔','⭐','🍋','💎','7️⃣','BAR'];reelView.classList.remove('is-spinning');void reelView.offsetWidth;reelView.classList.add('is-spinning');button.disabled=true;window.setTimeout(()=>{if(view.hidden||token!==viewVersion)return;const result=Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]);reelView.innerHTML=result.map(s=>`<i>${s}</i>`).join('');reelView.classList.remove('is-spinning');status.textContent=result.every(s=>s===result[0])?'¡Tres iguales! Premio mayor.':'Casi. Prueba otra combinación.';button.disabled=false;},1050);return;}
    if(action==='deal'){if(dealerPlaying)return;window.recordCasinoWager?.(chip);animateDealer();dealerPlaying=false;roundFinished=false;dealerHand=[randomCard(),randomCard()];playerHand=[randomCard(),randomCard()];document.getElementById('dealer-hand').innerHTML=cardHTML(dealerHand[0])+'<span class="playing-card card-back dealt-card">✦</span>';document.getElementById('player-hand').innerHTML=playerHand.map(cardHTML).join('');document.getElementById('dealer-score').textContent=dealerHand[0].value+' + ?';document.getElementById('player-score').textContent=handValue(playerHand);document.getElementById('blackjack-message').textContent='¿Pides otra carta o te plantas?';syncBlackjack();return;}
    if(action==='hit'){if(!playerHand.length||roundFinished||dealerPlaying||handValue(playerHand)>=21)return;animateDealer();const card=randomCard();playerHand.push(card);document.getElementById('player-hand').innerHTML=playerHand.map(cardHTML).join('');document.getElementById('player-score').textContent=handValue(playerHand);if(handValue(playerHand)>21){roundFinished=true;document.getElementById('blackjack-message').textContent='Te pasaste de 21. Reparte para volver a jugar.';}else document.getElementById('blackjack-message').textContent='El crupier te pasa '+card.rank+card.suit;syncBlackjack();return;}
    if(action==='stand'){if(!playerHand.length||roundFinished||dealerPlaying)return;dealerPlaying=true;syncBlackjack();animateDealer();document.getElementById('dealer-hand').innerHTML=dealerHand.map(cardHTML).join('');document.getElementById('dealer-score').textContent=handValue(dealerHand);document.getElementById('blackjack-message').textContent='El crupier está jugando…';const token=viewVersion,finish=()=>{if(view.hidden||token!==viewVersion)return;const playerScore=handValue(playerHand),dealerScore=handValue(dealerHand);document.getElementById('dealer-score').textContent=dealerScore;if(dealerScore<17){dealerHand.push(randomCard());animateDealer();document.getElementById('dealer-hand').innerHTML=dealerHand.map(cardHTML).join('');document.getElementById('dealer-score').textContent=handValue(dealerHand);window.setTimeout(finish,650);return;}roundFinished=true;dealerPlaying=false;document.getElementById('blackjack-message').textContent=playerScore>21?'Te pasaste. Gana el crupier.':dealerScore>21||playerScore>dealerScore?'¡Ganaste la mano!':playerScore===dealerScore?'Empate.':'Gana el crupier.';syncBlackjack();};window.setTimeout(finish,650);return;}
    if(action==='draw'){window.recordCasinoWager?.(chip);document.querySelectorAll('#poker-hand .playing-card:not(.held)').forEach(c=>{const next=randomCard();c.classList.toggle('red-card',['♥','♦'].includes(next.suit));c.innerHTML=`<span>${next.rank}</span><small>${next.suit}</small>`;});document.getElementById('poker-status').textContent='Cartas cambiadas. ¡Buena suerte!';return;}
    if(button.dataset.card) button.classList.toggle('held');
  });
  window.addEventListener('keydown', event => { if(event.key==='Escape'&&!view.hidden&&!document.getElementById('balance-dialog').open){view.hidden=true;document.body.classList.remove('game-open');[...document.body.children].forEach(element=>{element.inert=false;});window.scrollTo({top:returnScroll,behavior:'auto'});if(returnFocus?.focus)returnFocus.focus();} });
})();
