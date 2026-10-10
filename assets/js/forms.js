(() => {
  'use strict';
  document.querySelectorAll('form[data-lead-form]').forEach(form => {
    const status = form.querySelector('[role="status"]');
    const button = form.querySelector('[type="submit"]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity() || button.disabled) return;
      const fields = Object.fromEntries(new FormData(form));
      const payload = { ...fields, consent: fields.consent === 'on', locale: document.documentElement.lang, source: form.dataset.leadForm, firstName: fields.name.trim().split(/\s+/)[0] };
      button.disabled = true; status.textContent = document.documentElement.lang === 'es' ? 'Enviando…' : 'Sending…';
      try {
        const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Lead service unavailable');
        const data = await response.json();
        if (!data.ok && !data.id && !data.success) throw new Error('Lead service did not confirm receipt');
        status.textContent = document.documentElement.lang === 'es' ? 'Mensaje enviado.' : 'Message sent.';
        form.reset();
      } catch {
        status.textContent = document.documentElement.lang === 'es' ? 'No se pudo enviar. Contáctanos por email o WhatsApp.' : 'Could not send. Please contact us by email or WhatsApp.';
      } finally { button.disabled = false; }
    });
  });
  document.querySelectorAll('form[data-tool-form]').forEach(form => {
    const status = form.querySelector('[role="status"]');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      status.textContent = document.documentElement.lang === 'es' ? 'Este análisis aún no está disponible en este sitio. Contáctanos para solicitarlo.' : 'This analysis is not yet available on this site. Contact us to request it.';
    });
  });
})();
