/* js/supabase.js
   Helpers mínimos para conectar a Supabase REST desde el cliente
   - Define `window.SUPABASE_CONFIG = { url, key }` en el HTML antes de cargar este script
   - Si `key` está vacío el módulo solo ofrece una interfaz de fallback (no autenticada)

   Uso básico:
     window.SUPABASE.init();
     const residents = await window.SUPABASE.list('residents');
*/

(function () {
  const DEFAULT_URL = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) || 'https://qxjuztctbpwymmskdyqw.supabase.co/rest/v1/';
  let SUPABASE_URL = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) || DEFAULT_URL;
  let SUPABASE_KEY = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.key) || null;

  function headers() {
    const h = { 'Content-Type': 'application/json' };
    if (SUPABASE_KEY) {
      h['apikey'] = SUPABASE_KEY;
      h['Authorization'] = 'Bearer ' + SUPABASE_KEY;
    }
    return h;
  }

  async function apiFetch(path, opts = {}) {
    const url = SUPABASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    const fetchOpts = Object.assign({
      headers: headers()
    }, opts);
    const res = await fetch(url, fetchOpts);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase REST error ${res.status}: ${text}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }

  // CRUD helpers for a table (Supabase REST v1)
  async function list(table, query = '') {
    const q = query ? `?${query}` : '';
    return apiFetch(`${table}${q}`, { method: 'GET' });
  }

  async function get(table, id) {
    // Assumes primary key column is `id` and uses eq.id
    return list(table, `id=eq.${encodeURIComponent(id)}`);
  }

  async function insert(table, obj) {
    return apiFetch(`${table}`, { method: 'POST', body: JSON.stringify(obj) });
  }

  async function update(table, id, obj) {
    return apiFetch(`${table}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(obj) });
  }

  async function remove(table, id) {
    return apiFetch(`${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  // Public API
  window.SUPABASE = {
    init(config = {}) {
      SUPABASE_URL = config.url || SUPABASE_URL;
      SUPABASE_KEY = config.key || SUPABASE_KEY;
      console.info('SUPABASE init', { SUPABASE_URL, hasKey: !!SUPABASE_KEY });
    },
    list,
    get,
    insert,
    update,
    remove,
    rawFetch: apiFetch,
    config: () => ({ url: SUPABASE_URL, hasKey: !!SUPABASE_KEY })
  };
})();
