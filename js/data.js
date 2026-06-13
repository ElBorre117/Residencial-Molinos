/**
 * data.js — Datos y sincronización exclusiva con Supabase
 * No hay datos locales ni fallback en memoria.
 */

function wrapObject(table, obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return new Proxy(obj, {
    set(target, prop, value) {
      target[prop] = value;
      if (window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey && target.id) {
        const payload = { [prop]: value };
        window.SUPABASE.update(table, target.id, payload).catch(err => console.warn('Supabase update failed', err));
      }
      return true;
    }
  });
}

function createSyncArray(table, initialArr) {
  let arr = (Array.isArray(initialArr) ? initialArr : []).map(it => wrapObject(table, it));
  return new Proxy(arr, {
    get(target, prop) {
      if (prop === 'push') {
        return async function (...items) {
          if (!(window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey)) {
            throw new Error('Supabase no está configurado. No se puede insertar datos localmente.');
          }
          const results = [];
          for (const it of items) {
            const created = await window.SUPABASE.insert(table, it);
            const row = Array.isArray(created) ? created[0] : created;
            Array.prototype.push.call(target, wrapObject(table, row));
            results.push(row);
          }
          return results.length;
        };
      }
      if (prop === 'splice') {
        return function (start, deleteCount, ...items) {
          if (!(window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey)) {
            throw new Error('Supabase no está configurado. No se puede eliminar datos localmente.');
          }
          const removed = Array.prototype.splice.apply(target, [start, deleteCount, ...items.map(it => wrapObject(table, it))]);
          removed.forEach(r => { if (r && r.id) window.SUPABASE.remove(table, r.id).catch(err => console.warn('Supabase remove failed', err)); });
          return removed;
        };
      }
      return Reflect.get(target, prop);
    }
  });
}

function normalizeRemoteRow(table, row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = { ...row };
  if (table === 'users') {
    if (normalized.password_hash !== undefined && normalized.pass === undefined) {
      normalized.pass = normalized.password_hash;
    }
    if (normalized.depto_status !== undefined && normalized.deptoStatus === undefined) {
      normalized.deptoStatus = normalized.depto_status;
    }
    if (normalized.user_id !== undefined && normalized.userId === undefined) {
      normalized.userId = normalized.user_id;
    }
  }
  if (table === 'residents') {
    if (normalized.user_id !== undefined && normalized.userId === undefined) {
      normalized.userId = normalized.user_id;
    }
  }
  return normalized;
}

function normalizeRows(table, rows) {
  return Array.isArray(rows) ? rows.map(row => normalizeRemoteRow(table, row)) : [];
}

const DB = {
  users: createSyncArray('users', []),
  residents: createSyncArray('residents', []),
  payments: createSyncArray('payments', []),
  finances: createSyncArray('finances', []),
  nextId: 1,

  async init() {
    if (!(window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey)) {
      console.error('Supabase no está configurado. Define window.SUPABASE_CONFIG en index.html.');
      return;
    }
    try {
      const [users, residents, payments, finances] = await Promise.all([
        window.SUPABASE.list('users'),
        window.SUPABASE.list('residents'),
        window.SUPABASE.list('payments'),
        window.SUPABASE.list('finances')
      ]);

      this.users = createSyncArray('users', normalizeRows('users', users));
      this.residents = createSyncArray('residents', normalizeRows('residents', residents));
      this.payments = createSyncArray('payments', payments || []);
      this.finances = createSyncArray('finances', finances || []);

      const maxId = Math.max(
        1,
        ...this.users.map(u => Number(u.id) || 0),
        ...this.residents.map(r => Number(r.id) || 0),
        ...this.payments.map(p => Number(p.id) || 0),
        ...this.finances.map(f => Number(f.id) || 0)
      );
      this.nextId = maxId + 1;

      console.info('DB initialized from Supabase', {
        users: this.users.length,
        residents: this.residents.length,
        payments: this.payments.length,
        finances: this.finances.length
      });
      if (!this.users || this.users.length === 0) {
        console.warn('Supabase returned 0 users. This usually means Row Level Security (RLS) or table policies block anonymous SELECT on `users`.');
        console.warn('Fix options: 1) In Supabase UI -> Table Editor -> users, disable RLS or add a policy that allows SELECT for anon role; 2) Use Supabase Auth (recommended) and query `auth.users`.');
        if (window.SUPABASE && typeof window.SUPABASE.client === 'function') {
          try {
            window.SUPABASE.client().from('users').select('*').then(r => console.info('Direct client users fetch result (debug):', r)).catch(e => console.warn('Direct client fetch error:', e));
          } catch (e) { console.warn('Could not run direct client fetch:', e); }
        }
      }
    } catch (err) {
      console.error('Failed to load data from Supabase', err);
    }
  }
};

window.addEventListener('load', () => DB.init());

/* Exported: global `DB` usado por la app */
