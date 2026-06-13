/**
 * data.js — Datos y sincronización con Supabase
 * Si `window.SUPABASE` está configurado con una `anon` key,
 * este archivo sincroniza automáticamente inserciones y cambios
 * mínimos (push / modificaciones de propiedades) con las tablas
 * `users`, `residents`, `payments`, `finances`.
 *
 * Si no hay Supabase configurado, funciona como antes en memoria.
 */

// Datos por defecto (fallback local)
const _local = {
  users: [
    { id: 1, name: 'Administrador', email: 'admin@condo.com', pass: 'admin123', role: 'admin', phone: '+52 55 0000 0001' },
    { id: 2, name: 'Juan García', email: 'admin2@condo.com', pass: 'res123', role: 'resident', phone: '+52 55 1234 5678', depto: '101', deptoStatus: 'approved', fee: 1500 },
    { id: 3, name: 'Admin Sistema', email: 'admin@condominios.mx', password_hash: 'hashed_password_123', role: 'admin', phone: '+52 55 5123 4567' }
  ],
  residents: [
    { id: 1, name: 'Juan García', email: 'juan@correo.com', phone: '+52 55 1234 5678', depto: '101', status: 'approved', fee: 1500, userId: 2 },
    { id: 2, name: 'María López', email: 'maria@correo.com', phone: '+52 55 2345 6789', depto: '102', status: 'approved', fee: 1500, userId: null },
    { id: 3, name: 'Carlos Ruiz', email: 'carlos@correo.com', phone: '+52 55 3456 7890', depto: '201', status: 'pending', fee: 1500, userId: null },
    { id: 4, name: 'Ana Torres', email: 'ana@correo.com', phone: '+52 55 4567 8901', depto: '202', status: 'approved', fee: 1500, userId: null },
    { id: 5, name: 'Luis Moreno', email: 'luis@correo.com', phone: '+52 55 5678 9012', depto: '301', status: 'approved', fee: 1800, userId: null },
    { id: 6, name: 'Sandra Vega', email: 'sandra@correo.com', phone: '+52 55 6789 0123', depto: '302', status: 'rejected', fee: 1500, userId: null }
  ],
  payments: [
    { id: 1, residentId: 1, residentName: 'Juan García', depto: '101', month: 'Enero 2026', amount: 1500, status: 'approved', sentDate: '2026-01-05', approvedDate: '2026-01-06', receiptNum: 'REC-001', hasVoucher: true },
    { id: 2, residentId: 2, residentName: 'María López', depto: '102', month: 'Enero 2026', amount: 1500, status: 'approved', sentDate: '2026-01-07', approvedDate: '2026-01-08', receiptNum: 'REC-002', hasVoucher: true },
    { id: 3, residentId: 4, residentName: 'Ana Torres', depto: '202', month: 'Enero 2026', amount: 1500, status: 'approved', sentDate: '2026-01-10', approvedDate: '2026-01-11', receiptNum: 'REC-003', hasVoucher: true },
    { id: 4, residentId: 1, residentName: 'Juan García', depto: '101', month: 'Febrero 2026', amount: 1500, status: 'approved', sentDate: '2026-02-03', approvedDate: '2026-02-04', receiptNum: 'REC-004', hasVoucher: true },
    { id: 5, residentId: 2, residentName: 'María López', depto: '102', month: 'Marzo 2026', amount: 1500, status: 'approved', sentDate: '2026-03-02', approvedDate: '2026-03-03', receiptNum: 'REC-005', hasVoucher: true },
    { id: 6, residentId: 5, residentName: 'Luis Moreno', depto: '301', month: 'Junio 2026', amount: 1800, status: 'pending', sentDate: '2026-06-02', approvedDate: null, receiptNum: null, hasVoucher: true },
    { id: 7, residentId: 1, residentName: 'Juan García', depto: '101', month: 'Junio 2026', amount: 1500, status: 'pending', sentDate: '2026-06-05', approvedDate: null, receiptNum: null, hasVoucher: true }
  ],
  finances: [
    { id: 1, date: '2026-01-06', desc: 'Cuotas mantenimiento enero', cat: 'Mantenimiento', type: 'income', amount: 7500, ref: 'DEP-001', notes: '' },
    { id: 2, date: '2026-01-10', desc: 'Pago servicio limpieza', cat: 'Limpieza', type: 'expense', amount: 3200, ref: 'FAC-012', notes: 'Empresa LimpioMax' },
    { id: 3, date: '2026-01-15', desc: 'Pago vigilancia', cat: 'Seguridad', type: 'expense', amount: 4500, ref: 'FAC-034', notes: '' },
    { id: 4, date: '2026-02-04', desc: 'Cuotas mantenimiento febrero', cat: 'Mantenimiento', type: 'income', amount: 6000, ref: 'DEP-002', notes: '' },
    { id: 5, date: '2026-02-12', desc: 'Reparación bomba de agua', cat: 'Reparaciones', type: 'expense', amount: 2800, ref: 'FAC-056', notes: 'Urgente' },
    { id: 6, date: '2026-02-15', desc: 'Pago servicio limpieza', cat: 'Limpieza', type: 'expense', amount: 3200, ref: 'FAC-057', notes: '' },
    { id: 7, date: '2026-03-03', desc: 'Cuotas mantenimiento marzo', cat: 'Mantenimiento', type: 'income', amount: 7500, ref: 'DEP-003', notes: '' },
    { id: 8, date: '2026-03-10', desc: 'Pago luz áreas comunes', cat: 'Servicios', type: 'expense', amount: 1850, ref: 'CFE-003', notes: '' },
    { id: 9, date: '2026-04-05', desc: 'Cuotas mantenimiento abril', cat: 'Mantenimiento', type: 'income', amount: 9000, ref: 'DEP-004', notes: '' },
    { id: 10, date: '2026-04-20', desc: 'Pintura fachada', cat: 'Reparaciones', type: 'expense', amount: 8500, ref: 'FAC-089', notes: 'Presupuesto aprobado en asamblea' },
    { id: 11, date: '2026-05-03', desc: 'Cuotas mantenimiento mayo', cat: 'Mantenimiento', type: 'income', amount: 7500, ref: 'DEP-005', notes: '' },
    { id: 12, date: '2026-05-15', desc: 'Pago seguro edificio', cat: 'Administración', type: 'expense', amount: 5200, ref: 'SEG-001', notes: 'Anual prorrateado' },
    { id: 13, date: '2026-06-06', desc: 'Cuotas mantenimiento junio (parcial)', cat: 'Mantenimiento', type: 'income', amount: 3300, ref: 'DEP-006', notes: 'En proceso' },
    { id: 14, date: '2026-06-08', desc: 'Pago servicio limpieza', cat: 'Limpieza', type: 'expense', amount: 3200, ref: 'FAC-112', notes: '' }
  ],
  nextId: 100
};

// Utility: wrap object so property sets trigger an update to Supabase (if configured)
function wrapObject(table, obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return new Proxy(obj, {
    set(target, prop, value) {
      const prev = target[prop];
      target[prop] = value;
      // Only attempt update if Supabase available and target has id
      if (window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey && target.id) {
        const payload = {};
        payload[prop] = value;
        // fire and forget
        window.SUPABASE.update(table, target.id, payload).catch(err => console.warn('Supabase update failed', err));
      }
      return true;
    }
  });
}

// Utility: create a proxied array that intercepts push/splice to persist
function createSyncArray(table, initialArr) {
  let arr = initialArr.map(it => wrapObject(table, it));
  return new Proxy(arr, {
    get(target, prop) {
      if (prop === 'push') {
        return async function (...items) {
          const results = [];
          for (const it of items) {
            if (window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey) {
              try {
                const created = await window.SUPABASE.insert(table, it);
                // Supabase returns an array representation; take first
                const row = Array.isArray(created) ? created[0] : created;
                const wrapped = wrapObject(table, row);
                const r = Array.prototype.push.call(target, wrapped);
                results.push(row);
              } catch (err) {
                console.warn('Insert failed, falling back to local push', err);
                const wrapped = wrapObject(table, it);
                results.push(it);
                Array.prototype.push.call(target, wrapped);
              }
            } else {
              const wrapped = wrapObject(table, it);
              results.push(it);
              Array.prototype.push.call(target, wrapped);
            }
          }
          return results.length;
        };
      }
      if (prop === 'splice') {
        return function (start, deleteCount, ...items) {
          const removed = Array.prototype.splice.apply(target, [start, deleteCount, ...items.map(it => wrapObject(table, it))]);
          if (window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey) {
            removed.forEach(r => { if (r && r.id) window.SUPABASE.remove(table, r.id).catch(e => console.warn('Remove failed', e)); });
          }
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

function mergeFallback(remoteArr, localArr, keyFn) {
  if (!Array.isArray(remoteArr) || remoteArr.length === 0) return localArr.slice();
  const seen = new Set(remoteArr.map(item => keyFn(item)).filter(Boolean));
  return remoteArr.concat(localArr.filter(item => {
    const key = keyFn(item);
    return key && !seen.has(key);
  }));
}

// Initializes DB: if Supabase configured, fetch remote tables and wrap them,
// otherwise use local in-memory data.
const DB = {
  users: createSyncArray('users', _local.users),
  residents: createSyncArray('residents', _local.residents),
  payments: createSyncArray('payments', _local.payments),
  finances: createSyncArray('finances', _local.finances),
  nextId: _local.nextId,

  async init() {
    if (window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey) {
      try {
        const [users, residents, payments, finances] = await Promise.all([
          window.SUPABASE.list('users'),
          window.SUPABASE.list('residents'),
          window.SUPABASE.list('payments'),
          window.SUPABASE.list('finances')
        ]);

        const normalizedUsers = Array.isArray(users)
          ? users.map(u => normalizeRemoteRow('users', u))
          : [];
        const normalizedResidents = Array.isArray(residents)
          ? residents.map(r => normalizeRemoteRow('residents', r))
          : [];

        this.users = createSyncArray('users', mergeFallback(normalizedUsers, _local.users, u => String(u.email).trim().toLowerCase()));
        this.residents = createSyncArray('residents', mergeFallback(normalizedResidents, _local.residents, r => String(r.email || r.id).trim().toLowerCase()));
        this.payments = createSyncArray('payments', payments || []);
        this.finances = createSyncArray('finances', finances || []);
        console.info(`DB initialized from Supabase: users=${normalizedUsers.length}, residents=${normalizedResidents.length}, payments=${(payments || []).length}, finances=${(finances || []).length}`);
      } catch (err) {
        console.warn('Failed to load from Supabase, using local data', err);
      }
    } else {
      console.info('Supabase not configured — using local in-memory DB');
    }
  }
};

// Auto-init (best-effort)
setTimeout(() => { if (window.SUPABASE && window.SUPABASE.config && window.SUPABASE.config().hasKey) { DB.init(); } }, 50);

/* Exported: global `DB` used by the rest of the app */
