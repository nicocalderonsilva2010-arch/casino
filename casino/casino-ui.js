(() => {
  const dialog = document.getElementById('balance-dialog');
  const form = dialog.querySelector('.balance-modal');
  const amountInput = document.getElementById('balance-amount');
  const error = document.getElementById('balance-error');
  const storageKey = 'purobr.demoBalance';
  const rankingKey = 'nexus.demoRanking';
  const seedRanking = [
    { name: 'Outts', wagered: 42000000, delta: 3000000 },
    { name: 'Spirloz', wagered: 26100000, delta: -19800000 },
    { name: 'NoteCruek', wagered: 14300000, delta: 10600000 },
    { name: 'elmanxy', wagered: 2700000, delta: -288400 },
    { name: 'josenm11gamer', wagered: 60500, delta: -25900 },
    { name: 'Mrjuan234', wagered: 40500, delta: 24500 }
  ];
  let saved = NaN;
  try { saved = Number(localStorage.getItem(storageKey)); } catch (_) { /* storage may be disabled in private mode */ }
  let balance = Number.isFinite(saved) && saved >= 0 ? saved : 6.89;

  const money = value => '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const renderBalance = () => document.querySelectorAll('[data-balance-display]').forEach(node => node.textContent = money(balance));
  renderBalance();
  window.updateCasinoBalanceDisplay = renderBalance;

  const compact = value => value >= 1e6 ? `${(value / 1e6).toFixed(value % 1e6 ? 1 : 0).replace(/\.0$/, '')}M` : value >= 1e3 ? `${(value / 1e3).toFixed(value % 1e3 ? 1 : 0).replace(/\.0$/, '')}K` : String(Math.round(value));
  let ranking = seedRanking;
  try {
    const stored = JSON.parse(localStorage.getItem(rankingKey));
    if (Array.isArray(stored) && stored.length) ranking = stored;
  } catch (_) { /* use the example ranking */ }
  const renderRanking = () => {
    const list = document.getElementById('ranking-list');
    if (!list) return;
    ranking = ranking.filter(player => player && typeof player.name === 'string' && Number.isFinite(player.wagered) && Number.isFinite(player.delta)).sort((a, b) => b.wagered - a.wagered);
    list.replaceChildren(...ranking.map((player, index) => {
      const row = document.createElement('li');
      if (player.name === 'elmanxy') row.classList.add('me');
      const position = document.createElement('span');
      position.className = `pos${index === 0 ? ' gold' : ''}`;
      position.textContent = `#${index + 1}`;
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = player.name;
      const amount = document.createElement('span');
      amount.className = 'amt';
      amount.append(document.createTextNode(compact(player.wagered)));
      const delta = document.createElement('em');
      delta.className = player.delta >= 0 ? 'up' : 'down';
      delta.textContent = `${player.delta >= 0 ? '+' : '-'}${compact(Math.abs(player.delta))}`;
      amount.append(delta);
      row.append(position, name, amount);
      return row;
    }));
    const place = ranking.findIndex(player => player.name === 'elmanxy');
    const rank = document.getElementById('player-rank');
    const wagered = document.getElementById('player-wagered');
    if (rank) rank.textContent = place < 0 ? '—' : `#${place + 1}`;
    if (wagered) wagered.textContent = compact(ranking[place]?.wagered || 0);
  };
  renderRanking();
  window.recordCasinoWager = amount => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    let player = ranking.find(item => item.name === 'elmanxy');
    if (!player) { player = { name: 'elmanxy', wagered: 0, delta: 0 }; ranking.push(player); }
    player.wagered += amount;
    player.delta += amount;
    try { localStorage.setItem(rankingKey, JSON.stringify(ranking)); } catch (_) { /* ranking stays updated for this session */ }
    renderRanking();
  };

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-balance-open]')) return;
    error.textContent = '';
    amountInput.value = '';
    if (!dialog.open) dialog.showModal();
    window.setTimeout(() => amountInput.focus(), 0);
  });
  dialog.querySelector('[data-balance-close]').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('[data-amount-preset]').forEach(button => button.addEventListener('click', () => {
    amountInput.value = button.dataset.amountPreset;
    amountInput.focus();
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(balance + amount)) {
      error.textContent = 'Escribe una cantidad válida mayor que cero.';
      amountInput.focus();
      return;
    }
    balance = Math.round((balance + amount) * 100) / 100;
    try { localStorage.setItem(storageKey, String(balance)); } catch (_) { /* balance remains available for this session */ }
    renderBalance();
    dialog.close();
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
