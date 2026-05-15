// AKRES — interactions
(function() {
  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }

  // Fade-up on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-up').forEach((el, i) => {
    el.style.transitionDelay = (i % 6) * 70 + 'ms';
    observer.observe(el);
  });

  // Form submit
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      this.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    });
  }

  // Typewriter terminal (cycles through 2 snippets)
  const termBody = document.getElementById('term-body');
  if (!termBody) return;

  const snippets = [
    [
      { c: 'com', t: '# Integração: Controle de Acesso → Sistema de RH' },
      { c: 'kw',  t: 'from', extra: ' akres ', after: { c: 'kw', t: 'import', extra: ' Connector, Pipeline' } },
      { c: '',    t: '' },
      { c: 'fn',  t: 'access', extra: '', after: { c: '', t: ' = Connector(', after: { c: 'str', t: '"control_acesso"', after: { c: '', t: ', auth=', after: { c: 'str', t: '"oauth2"', after: { c: '', t: ')' } } } } } },
      { c: 'fn',  t: 'hris', extra: '  ', after: { c: '', t: ' = Connector(', after: { c: 'str', t: '"sap_hcm"', after: { c: '', t: ', auth=', after: { c: 'str', t: '"api_key"', after: { c: '', t: ')' } } } } } },
      { c: '',    t: '' },
      { c: 'kw',  t: 'async def', extra: ' ', after: { c: 'fn', t: 'on_acesso', after: { c: '', t: '(evento):' } } },
      { c: '',    t: '    ', after: { c: 'kw', t: 'if', after: { c: '', t: ' evento.', after: { c: 'key', t: 'tipo', after: { c: '', t: ' == ', after: { c: 'str', t: '"entrada"', after: { c: '', t: ':' } } } } } } },
      { c: '',    t: '        ', after: { c: 'kw', t: 'await', after: { c: '', t: ' hris.', after: { c: 'fn', t: 'sync_ponto', after: { c: '', t: '(' } } } } },
      { c: '',    t: '            id=evento.colaborador,' },
      { c: '',    t: '            hora=evento.timestamp,' },
      { c: '',    t: '            local=evento.porta' },
      { c: '',    t: '        )' },
      { c: '',    t: '' },
      { c: 'fn',  t: 'pipeline', after: { c: '', t: ' = Pipeline(', after: { c: 'str', t: '"acesso_hris"', after: { c: '', t: ')' } } } },
      { c: '',    t: 'pipeline.', after: { c: 'fn', t: 'on', after: { c: '', t: '(access.events).', after: { c: 'fn', t: 'do', after: { c: '', t: '(on_acesso)' } } } } },
      { c: '',    t: 'pipeline.', after: { c: 'fn', t: 'start', after: { c: '', t: '()  ', after: { c: 'com', t: '# rodando 24/7' } } } },
      { c: '',    t: '' },
      { c: 'out', t: '✓ Pipeline ativo — 2.847 eventos sincronizados hoje' }
    ]
  ];

  let lineIdx = 0;
  let charIdx = 0;
  const snippet = snippets[0];
  const lineCount = snippet.length;

  function flattenLine(item) {
    // Walk the nested "after" chain to build the line's plain text + colored chunks
    const chunks = [];
    let cur = item;
    while (cur) {
      if (cur.t !== undefined) chunks.push({ c: cur.c, t: cur.t });
      if (cur.extra !== undefined) chunks.push({ c: '', t: cur.extra });
      cur = cur.after;
    }
    return chunks;
  }

  function renderUpTo(linesUpTo, partialChunksOnLast) {
    let html = '';
    for (let i = 0; i < linesUpTo; i++) {
      const chunks = flattenLine(snippet[i]);
      html += '<div><span class="ln">' + (i + 1) + '</span>';
      for (const ch of chunks) {
        if (!ch.t) continue;
        if (ch.c) html += '<span class="' + ch.c + '">' + escapeHtml(ch.t) + '</span>';
        else html += escapeHtml(ch.t);
      }
      html += '</div>';
    }
    // Partial line at end
    if (partialChunksOnLast !== null && linesUpTo < lineCount) {
      const chunks = flattenLine(snippet[linesUpTo]);
      html += '<div><span class="ln">' + (linesUpTo + 1) + '</span>';
      let remaining = partialChunksOnLast;
      for (const ch of chunks) {
        if (!ch.t) continue;
        const take = Math.min(remaining, ch.t.length);
        if (take <= 0) break;
        const piece = ch.t.slice(0, take);
        if (ch.c) html += '<span class="' + ch.c + '">' + escapeHtml(piece) + '</span>';
        else html += escapeHtml(piece);
        remaining -= take;
        if (remaining <= 0) break;
      }
      html += '<span class="cursor"></span></div>';
    } else if (linesUpTo >= lineCount) {
      html += '<div style="height: 8px"></div>';
    }
    return html;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function lineLength(idx) {
    return flattenLine(snippet[idx]).reduce((a, b) => a + (b.t ? b.t.length : 0), 0);
  }

  function tick() {
    if (lineIdx >= lineCount) {
      // Finished — wait, then restart
      termBody.innerHTML = renderUpTo(lineCount, null);
      setTimeout(() => {
        lineIdx = 0;
        charIdx = 0;
        tick();
      }, 6000);
      return;
    }
    const len = lineLength(lineIdx);
    termBody.innerHTML = renderUpTo(lineIdx, charIdx);
    charIdx++;
    let delay = 18;
    // Faster on empty lines
    if (len === 0) delay = 80;
    else if (charIdx > len) {
      lineIdx++;
      charIdx = 0;
      delay = 120;
    }
    setTimeout(tick, delay);
  }

  // Start typewriter when terminal is in view
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tick();
        termObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  termObserver.observe(termBody);
})();
