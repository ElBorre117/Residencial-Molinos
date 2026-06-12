/* ============================================
   CondoAdmin — Autenticación
   ============================================ */

function switchAuth(mode) {
  ['Login', 'OTP', 'Register'].forEach(m =>
    document.getElementById('form' + m).classList.add('hidden')
  );
  document.getElementById('form' + mode.charAt(0).toUpperCase() + mode.slice(1))
    .classList.remove('hidden');
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active', i === (mode === 'login' || mode === 'otp' ? 0 : 1))
  );
}

function showOTP() {
  document.getElementById('formLogin').classList.add('hidden');
  document.getElementById('formOTP').classList.remove('hidden');
}

function sendOTP() {
  const v = document.getElementById('otpContact').value.trim();
  if (!v) { showAlert('alertAuth', 'Por favor ingresa correo o teléfono', 'error'); return; }
  document.getElementById('otpCodeField').classList.remove('hidden');
  showAlert('alertAuth', 'Código enviado a ' + v + ' (demo: usa 123456)', 'info');
}

function verifyOTP() {
  const code = document.getElementById('otpCode').value.trim();
  if (code === '123456') {
    loginUser(DB.users[0]);
  } else {
    showAlert('alertAuth', 'Código incorrecto. Usa 123456 en demo', 'error');
  }
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const user  = DB.users.find(u => u.email === email && u.pass === pass);
  if (!user) { showAlert('alertAuth', 'Credenciales incorrectas', 'error'); return; }
  loginUser(user);
}

function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass  = document.getElementById('regPass').value;
  if (!name || !email || !pass) {
    showAlert('alertAuth', 'Completa todos los campos requeridos', 'error');
    return;
  }
  const newUser = { id: DB.nextId++, name, email, pass, phone, role: 'resident', depto: null, deptoStatus: 'pending', fee: 1500 };
  DB.users.push(newUser);
  const newRes  = { id: DB.nextId++, name, email, phone, depto: '—', status: 'pending', fee: 1500, userId: newUser.id };
  DB.residents.push(newRes);
  showAlert('alertAuth', 'Cuenta creada. El administrador verificará tu departamento.', 'info');
  switchAuth('login');
}

function loginUser(user) {
  currentUser = user;
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('sidebarName').textContent = user.name;
  document.getElementById('sidebarRole').textContent =
    user.role === 'admin' ? 'Administrador' : 'Depto ' + (user.depto || '—');
  document.getElementById('dashWelcome').textContent = 'Bienvenido de vuelta, ' + user.name;

  if (user.role === 'admin') {
    document.getElementById('navAdminFull').classList.remove('hidden');
    document.getElementById('navAdminFull').style.display = 'block';
    document.getElementById('navAdmin').classList.remove('hidden');
    document.getElementById('navAdmin').style.display = 'block';
    document.getElementById('navResident').classList.add('hidden');
    goTo('dashboard');
  } else {
    document.getElementById('navAdminFull').classList.add('hidden');
    document.getElementById('navResident').classList.remove('hidden');
    document.getElementById('navResident').style.display = 'block';
    goTo('myPayments');
  }
  updatePendingCounts();
}

function doLogout() {
  currentUser = null;
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('navAdmin').classList.add('hidden');
  document.getElementById('navAdminFull').classList.add('hidden');
  document.getElementById('navResident').classList.add('hidden');
}
