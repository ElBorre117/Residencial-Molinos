/**
 * data.js — Datos de demostración
 * ─────────────────────────────────
 * Cuando conectes Supabase, reemplaza este archivo por
 * llamadas reales a la base de datos. Por ahora todo
 * vive en memoria (se reinicia al recargar la página).
 *
 * Cuentas de demo:
 *   admin@condo.com  / admin123  → rol: admin
 *   admin2@condo.com / res123    → rol: residente, depto 101
 */

const DB = {

  /* ── Usuarios ─────────────────────────────────── */
  users: [
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@condo.com',
      pass: 'admin123',
      role: 'admin',
      phone: '+52 55 0000 0001'
    },
    {
      id: 2,
      name: 'Juan García',
      email: 'admin2@condo.com',
      pass: 'res123',
      role: 'resident',
      phone: '+52 55 1234 5678',
      depto: '101',
      deptoStatus: 'approved',
      fee: 1500
    }
  ],

  /* ── Residentes ───────────────────────────────── */
  residents: [
    { id: 1, name: 'Juan García',   email: 'juan@correo.com',   phone: '+52 55 1234 5678', depto: '101', status: 'approved',  fee: 1500, userId: 2 },
    { id: 2, name: 'María López',   email: 'maria@correo.com',  phone: '+52 55 2345 6789', depto: '102', status: 'approved',  fee: 1500, userId: null },
    { id: 3, name: 'Carlos Ruiz',   email: 'carlos@correo.com', phone: '+52 55 3456 7890', depto: '201', status: 'pending',   fee: 1500, userId: null },
    { id: 4, name: 'Ana Torres',    email: 'ana@correo.com',    phone: '+52 55 4567 8901', depto: '202', status: 'approved',  fee: 1500, userId: null },
    { id: 5, name: 'Luis Moreno',   email: 'luis@correo.com',   phone: '+52 55 5678 9012', depto: '301', status: 'approved',  fee: 1800, userId: null },
    { id: 6, name: 'Sandra Vega',   email: 'sandra@correo.com', phone: '+52 55 6789 0123', depto: '302', status: 'rejected',  fee: 1500, userId: null }
  ],

  /* ── Pagos / Comprobantes ─────────────────────── */
  payments: [
    { id: 1, residentId: 1, residentName: 'Juan García',  depto: '101', month: 'Enero 2026',    amount: 1500, status: 'approved', sentDate: '2026-01-05', approvedDate: '2026-01-06', receiptNum: 'REC-001', hasVoucher: true },
    { id: 2, residentId: 2, residentName: 'María López',  depto: '102', month: 'Enero 2026',    amount: 1500, status: 'approved', sentDate: '2026-01-07', approvedDate: '2026-01-08', receiptNum: 'REC-002', hasVoucher: true },
    { id: 3, residentId: 4, residentName: 'Ana Torres',   depto: '202', month: 'Enero 2026',    amount: 1500, status: 'approved', sentDate: '2026-01-10', approvedDate: '2026-01-11', receiptNum: 'REC-003', hasVoucher: true },
    { id: 4, residentId: 1, residentName: 'Juan García',  depto: '101', month: 'Febrero 2026',  amount: 1500, status: 'approved', sentDate: '2026-02-03', approvedDate: '2026-02-04', receiptNum: 'REC-004', hasVoucher: true },
    { id: 5, residentId: 2, residentName: 'María López',  depto: '102', month: 'Marzo 2026',    amount: 1500, status: 'approved', sentDate: '2026-03-02', approvedDate: '2026-03-03', receiptNum: 'REC-005', hasVoucher: true },
    { id: 6, residentId: 5, residentName: 'Luis Moreno',  depto: '301', month: 'Junio 2026',    amount: 1800, status: 'pending',  sentDate: '2026-06-02', approvedDate: null,         receiptNum: null,      hasVoucher: true },
    { id: 7, residentId: 1, residentName: 'Juan García',  depto: '101', month: 'Junio 2026',    amount: 1500, status: 'pending',  sentDate: '2026-06-05', approvedDate: null,         receiptNum: null,      hasVoucher: true }
  ],

  /* ── Finanzas (ingresos y egresos) ───────────── */
  finances: [
    { id: 1,  date: '2026-01-06', desc: 'Cuotas mantenimiento enero',         cat: 'Mantenimiento',  type: 'income',  amount: 7500, ref: 'DEP-001', notes: '' },
    { id: 2,  date: '2026-01-10', desc: 'Pago servicio limpieza',             cat: 'Limpieza',       type: 'expense', amount: 3200, ref: 'FAC-012', notes: 'Empresa LimpioMax' },
    { id: 3,  date: '2026-01-15', desc: 'Pago vigilancia',                    cat: 'Seguridad',      type: 'expense', amount: 4500, ref: 'FAC-034', notes: '' },
    { id: 4,  date: '2026-02-04', desc: 'Cuotas mantenimiento febrero',       cat: 'Mantenimiento',  type: 'income',  amount: 6000, ref: 'DEP-002', notes: '' },
    { id: 5,  date: '2026-02-12', desc: 'Reparación bomba de agua',           cat: 'Reparaciones',   type: 'expense', amount: 2800, ref: 'FAC-056', notes: 'Urgente' },
    { id: 6,  date: '2026-02-15', desc: 'Pago servicio limpieza',             cat: 'Limpieza',       type: 'expense', amount: 3200, ref: 'FAC-057', notes: '' },
    { id: 7,  date: '2026-03-03', desc: 'Cuotas mantenimiento marzo',         cat: 'Mantenimiento',  type: 'income',  amount: 7500, ref: 'DEP-003', notes: '' },
    { id: 8,  date: '2026-03-10', desc: 'Pago luz áreas comunes',             cat: 'Servicios',      type: 'expense', amount: 1850, ref: 'CFE-003', notes: '' },
    { id: 9,  date: '2026-04-05', desc: 'Cuotas mantenimiento abril',         cat: 'Mantenimiento',  type: 'income',  amount: 9000, ref: 'DEP-004', notes: '' },
    { id: 10, date: '2026-04-20', desc: 'Pintura fachada',                    cat: 'Reparaciones',   type: 'expense', amount: 8500, ref: 'FAC-089', notes: 'Presupuesto aprobado en asamblea' },
    { id: 11, date: '2026-05-03', desc: 'Cuotas mantenimiento mayo',          cat: 'Mantenimiento',  type: 'income',  amount: 7500, ref: 'DEP-005', notes: '' },
    { id: 12, date: '2026-05-15', desc: 'Pago seguro edificio',               cat: 'Administración', type: 'expense', amount: 5200, ref: 'SEG-001', notes: 'Anual prorrateado' },
    { id: 13, date: '2026-06-06', desc: 'Cuotas mantenimiento junio (parcial)', cat: 'Mantenimiento', type: 'income', amount: 3300, ref: 'DEP-006', notes: 'En proceso' },
    { id: 14, date: '2026-06-08', desc: 'Pago servicio limpieza',             cat: 'Limpieza',       type: 'expense', amount: 3200, ref: 'FAC-112', notes: '' }
  ],

  /* ── Contador de IDs ─────────────────────────── */
  nextId: 100
};
