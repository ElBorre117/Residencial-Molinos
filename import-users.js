#!/usr/bin/env node
/**
 * Script para importar usuarios desde CSV a Supabase
 * Uso: node import-users.js users_sample.csv
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://qxjuztctbpwymmskdyqw.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4anV6dGN0YnB3eW1tc2tkeXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjg5NjAsImV4cCI6MjA5Njg0NDk2MH0.PZFOWDjcpeohOm9yXldpH3QzaQs2g0rIqx07_UHcwhs';

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || null;
    });
    rows.push(obj);
  }
  return rows;
}

async function insertUsers(users) {
  console.log(`\n📤 Importando ${users.length} usuario(s) a Supabase...`);

  for (const user of users) {
    try {
      const payload = {
        id: parseInt(user.id),
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        phone: user.phone || null,
        depto: user.depto || null,
        depto_status: user.depto_status || 'active',
        fee: user.fee ? parseFloat(user.fee) : 0,
        created_at: user.created_at || new Date().toISOString(),
      };

      const response = await fetch(`${SUPABASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ ${user.name} (${user.role}) importado correctamente`);
    } catch (err) {
      console.error(`❌ Error importando ${user.name}: ${err.message}`);
    }
  }

  console.log('\n✨ Importación completada\n');
}

async function main() {
  const csvFile = process.argv[2] || 'users_sample.csv';
  const filePath = path.join(__dirname, csvFile);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const users = parseCSV(content);

  console.log(`📖 CSV leído: ${users.length} usuario(s) encontrado(s)\n`);
  users.forEach(u => {
    console.log(`  • ${u.name} (${u.role}) - ${u.email}`);
  });

  await insertUsers(users);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
