const fmt = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
const fmtDate = d => new Date(d).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});
let currentUser = null;
let chartFlow = null, chartDist = null;

function switchAuth(mode){
  ['login','otp','register'].forEach(m=>document.getElementById('form'+m.charAt(0).toUpperCase()+m.slice(1)).classList.add('hidden'));
  document.getElementById('form'+mode.charAt(0).toUpperCase()+mode.slice(1)).classList.remove('hidden');
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',i===(mode==='login'||mode==='otp'?0:1)));
}

function showOTP(){
  document.getElementById('formLogin').classList.add('hidden');
  document.getElementById('formOTP').classList.remove('hidden');
}

function sendOTP(){
  const v=document.getElementById('otpContact').value.trim();
  if(!v){showAlert('authAlert','Por favor ingresa correo o teléfono','error');return;}
  document.getElementById('otpCodeField').classList.remove('hidden');
  showAlert('alertAuth','Código enviado a '+v+' (demo: usa 123456)','info');
}

function verifyOTP(){
  const code=document.getElementById('otpCode').value.trim();
  if(code==='123456'){
    loginUser(DB.users[0]);
  } else {
    showAlert('alertAuth','Código incorrecto. Usa 123456 en demo','error');
  }
}

function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  const user=DB.users.find(u=>u.email===email&&u.pass===pass);
  if(!user){showAlert('alertAuth','Credenciales incorrectas','error');return;}
  loginUser(user);
}

function doRegister(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const phone=document.getElementById('regPhone').value.trim();
  const pass=document.getElementById('regPass').value;
  if(!name||!email||!pass){showAlert('alertAuth','Completa todos los campos requeridos','error');return;}
  const newUser={id:DB.nextId++,name,email,pass,phone,role:'resident',depto:null,deptoStatus:'pending',fee:1500};
  DB.users.push(newUser);
  const newRes={id:DB.nextId++,name,email,phone,depto:'—',status:'pending',fee:1500,userId:newUser.id};
  DB.residents.push(newRes);
  showAlert('alertAuth','Cuenta creada. Contacta al admin para verificar tu departamento.','info');
  switchAuth('login');
}

function loginUser(user){
  currentUser=user;
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('sidebarName').textContent=user.name;
  document.getElementById('sidebarRole').textContent=user.role==='admin'?'Administrador':'Depto '+(user.depto||'—');
  document.getElementById('dashWelcome').textContent='Bienvenido de vuelta, '+user.name;
  if(user.role==='admin'){
    document.getElementById('navAdminFull').classList.remove('hidden');
    document.getElementById('navAdminFull').style.display='block';
    document.getElementById('navAdmin').classList.remove('hidden');
    document.getElementById('navAdmin').style.display='block';
    document.getElementById('navResident').classList.add('hidden');
    goTo('dashboard');
  } else {
    document.getElementById('navAdminFull').classList.add('hidden');
    document.getElementById('navResident').classList.remove('hidden');
    document.getElementById('navResident').style.display='block';
    goTo('myPayments');
  }
  updatePendingCounts();
}

function doLogout(){
  currentUser=null;
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('navAdmin').classList.add('hidden');
  document.getElementById('navAdminFull').classList.add('hidden');
  document.getElementById('navResident').classList.add('hidden');
}

function goTo(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const pageEl=document.getElementById('page'+page.charAt(0).toUpperCase()+page.slice(1));
  if(pageEl) pageEl.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>{
    if(n.getAttribute('onclick')&&n.getAttribute('onclick').includes("'"+page+"'")){n.classList.add('active');}
  });
  const renders={dashboard:renderDashboard,residents:renderResidents,payments:renderPayments,finances:renderFinances,reports:renderReports,myPayments:renderMyPayments,contacts:()=>{}};
  if(renders[page]) renders[page]();
}

function updatePendingCounts(){
  const pRes=DB.residents.filter(r=>r.status==='pending').length;
  const pPay=DB.payments.filter(p=>p.status==='pending').length;
  const resEl=document.getElementById('pendingResCount');
  const payEl=document.getElementById('pendingPayCount');
  if(resEl){resEl.textContent=pRes;resEl.classList.toggle('hidden',pRes===0);}
  if(payEl){payEl.textContent=pPay;payEl.classList.toggle('hidden',pPay===0);}
}

function renderDashboard(){
  const totalIncome=DB.finances.filter(f=>f.type==='income').reduce((s,f)=>s+f.amount,0);
  const totalExpense=DB.finances.filter(f=>f.type==='expense').reduce((s,f)=>s+f.amount,0);
  const balance=totalIncome-totalExpense;
  const approvedRes=DB.residents.filter(r=>r.status==='approved').length;
  const pendingPay=DB.payments.filter(p=>p.status==='pending').length;
  const area=document.getElementById('metricsArea');
  if(currentUser&&currentUser.role==='admin'){
    area.innerHTML=`
      <div class="metric"><div class="metric-label">Balance total</div><div class="metric-value" style="color:${balance>=0?'var(--c-teal)':'var(--c-red)'}">${fmt(balance)}</div><div class="metric-change">Ingresos - Egresos</div></div>
      <div class="metric"><div class="metric-label">Ingresos totales</div><div class="metric-value">${fmt(totalIncome)}</div><div class="metric-change up">↑ acumulado</div></div>
      <div class="metric"><div class="metric-label">Egresos totales</div><div class="metric-value">${fmt(totalExpense)}</div><div class="metric-change down">↓ acumulado</div></div>
      <div class="metric"><div class="metric-label">Residentes activos</div><div class="metric-value">${approvedRes}</div><div class="metric-change">${DB.residents.filter(r=>r.status==='pending').length} pendientes</div></div>
      <div class="metric"><div class="metric-label">Pagos por revisar</div><div class="metric-value" style="color:var(--c-amber)">${pendingPay}</div><div class="metric-change">comprobantes</div></div>`;
  } else {
    const myPays=DB.payments.filter(p=>p.residentId===currentUser.id);
    const myApproved=myPays.filter(p=>p.status==='approved').length;
    area.innerHTML=`
      <div class="metric"><div class="metric-label">Departamento</div><div class="metric-value">${currentUser.depto||'—'}</div><div class="metric-change">${currentUser.deptoStatus==='approved'?'Verificado':'Pendiente'}</div></div>
      <div class="metric"><div class="metric-label">Pagos registrados</div><div class="metric-value">${myPays.length}</div><div class="metric-change">${myApproved} aprobados</div></div>
      <div class="metric"><div class="metric-label">Cuota mensual</div><div class="metric-value">${fmt(currentUser.fee||1500)}</div><div class="metric-change">mantenimiento</div></div>`;
  }
  renderCharts();
  const recent=document.getElementById('recentActivity');
  const all=[...DB.finances.map(f=>({date:f.date,desc:f.desc,type:f.type,amount:f.amount,status:'—'})),
             ...DB.payments.map(p=>({date:p.sentDate,desc:'Pago '+p.month+' — depto '+p.depto,type:'payment',amount:p.amount,status:p.status}))];
  all.sort((a,b)=>new Date(b.date)-new Date(a.date));
  recent.innerHTML=all.slice(0,8).map(r=>`<tr>
    <td>${fmtDate(r.date)}</td><td>${r.desc}</td>
    <td><span class="badge ${r.type==='income'?'badge-income':r.type==='expense'?'badge-expense':'badge-pending'}">${r.type==='income'?'Ingreso':r.type==='expense'?'Egreso':'Pago'}</span></td>
    <td style="font-weight:500;color:${r.type==='income'?'var(--c-teal)':'var(--c-red)'}">${r.type==='income'?'+':'−'}${fmt(r.amount)}</td>
    <td><span class="badge ${r.status==='approved'?'badge-approved':r.status==='pending'?'badge-pending':'badge-rejected'}">${r.status==='—'?'—':r.status==='approved'?'Aprobado':r.status==='pending'?'Pendiente':'Rechazado'}</span></td>
  </tr>`).join('');
}

function renderCharts(){
  const months=['Ene','Feb','Mar','Abr','May','Jun'];
  const monthKeys=['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];
  const incomes=monthKeys.map(m=>DB.finances.filter(f=>f.type==='income'&&f.date.startsWith(m)).reduce((s,f)=>s+f.amount,0));
  const expenses=monthKeys.map(m=>DB.finances.filter(f=>f.type==='expense'&&f.date.startsWith(m)).reduce((s,f)=>s+f.amount,0));
  if(chartFlow){chartFlow.destroy();}
  const ctx1=document.getElementById('chartFlow');
  if(ctx1){
    chartFlow=new Chart(ctx1,{type:'bar',data:{labels:months,datasets:[
      {label:'Ingresos',data:incomes,backgroundColor:'#9FE1CB',borderColor:'#1D9E75',borderWidth:1,borderRadius:4},
      {label:'Egresos',data:expenses,backgroundColor:'#F7C1C1',borderColor:'#E24B4A',borderWidth:1,borderRadius:4}
    ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:11}}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,0.04)'},ticks:{callback:v=>'$'+(v/1000).toFixed(0)+'k'}}}}});
  }
  const cats={};
  DB.finances.filter(f=>f.type==='expense').forEach(f=>{cats[f.cat]=(cats[f.cat]||0)+f.amount;});
  if(chartDist){chartDist.destroy();}
  const ctx2=document.getElementById('chartDist');
  const colors=['#9FE1CB','#F5C4B3','#CECBF6','#FAC775','#B5D4F4','#C0DD97','#F4C0D1'];
  if(ctx2){
    chartDist=new Chart(ctx2,{type:'doughnut',data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats),backgroundColor:colors,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},padding:8}}}}});
  }
}

function renderResidents(){
  const search=document.getElementById('searchResident').value.toLowerCase();
  const pending=DB.residents.filter(r=>r.status==='pending');
  const all=DB.residents.filter(r=>r.name.toLowerCase().includes(search)||r.depto.includes(search));
  document.getElementById('pendingBadge').textContent=pending.length;
  document.getElementById('tblPendingResidents').innerHTML=pending.map(r=>`<tr>
    <td style="font-weight:500">${r.name}</td><td>${r.depto}</td><td>${r.email}</td><td>${r.phone}</td><td>${fmtDate(new Date())}</td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-success btn-sm" onclick="approveResident(${r.id})">✓ Aprobar</button>
      <button class="btn btn-danger btn-sm" onclick="rejectResident(${r.id})">✕ Rechazar</button>
    </td></tr>`).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--c-text-3);padding:1.5rem">Sin residentes pendientes</td></tr>';
  document.getElementById('tblAllResidents').innerHTML=all.map(r=>`<tr>
    <td style="font-weight:500">${r.name}</td><td><strong>${r.depto}</strong></td>
    <td><span class="badge ${r.status==='approved'?'badge-approved':r.status==='pending'?'badge-pending':'badge-rejected'}">${r.status==='approved'?'Aprobado':r.status==='pending'?'Pendiente':'Rechazado'}</span></td>
    <td>${r.email}</td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-secondary btn-sm" onclick="editResident(${r.id})">Editar</button>
    </td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--c-text-3);padding:1.5rem">Sin resultados</td></tr>';
  updatePendingCounts();
}

function approveResident(id){
  const r=DB.residents.find(r=>r.id===id);
  if(r){r.status='approved';const u=DB.users.find(u=>u.id===r.userId);if(u)u.deptoStatus='approved';}
  renderResidents(); showToast('Departamento '+r.depto+' verificado');
}
function rejectResident(id){
  const r=DB.residents.find(r=>r.id===id);
  if(r){r.status='rejected';}
  renderResidents(); showToast('Departamento rechazado','error');
}
function editResident(id){showToast('Editor de residente (integración Supabase requerida para persistir)');}

function renderPayments(){
  const month=document.getElementById('filterPayMonth').value;
  const pending=DB.payments.filter(p=>p.status==='pending');
  const all=DB.payments.filter(p=>!month||p.month===month);
  document.getElementById('payPendingBadge').textContent=pending.length;
  document.getElementById('tblPendingPayments').innerHTML=pending.map(p=>`<tr>
    <td style="font-weight:500">${p.residentName}</td><td>${p.depto}</td><td>${p.month}</td>
    <td>${fmt(p.amount)}</td><td>${fmtDate(p.sentDate)}</td>
    <td><button class="btn btn-secondary btn-sm" onclick="viewVoucher(${p.id})">Ver imagen</button></td>
    <td style="display:flex;gap:6px">
      <button class="btn btn-success btn-sm" onclick="approvePayment(${p.id})">✓ Aprobar</button>
      <button class="btn btn-danger btn-sm" onclick="rejectPayment(${p.id})">✕ Rechazar</button>
    </td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--c-text-3);padding:1.5rem">Sin comprobantes pendientes</td></tr>';
  document.getElementById('tblAllPayments').innerHTML=all.map(p=>`<tr>
    <td>${p.residentName}</td><td>${p.depto}</td><td>${p.month}</td><td>${fmt(p.amount)}</td>
    <td><span class="badge ${p.status==='approved'?'badge-approved':p.status==='pending'?'badge-pending':'badge-rejected'}">${p.status==='approved'?'Aprobado':p.status==='pending'?'Pendiente':'Rechazado'}</span></td>
    <td>${p.receiptNum?`<button class="btn btn-secondary btn-sm" onclick="showReceipt(${p.id})">${p.receiptNum}</button>`:'—'}</td>
  </tr>`).join('');
  updatePendingCounts();
}

function approvePayment(id){
  const p=DB.payments.find(p=>p.id===id);
  if(!p) return;
  p.status='approved';
  p.approvedDate=new Date().toISOString().split('T')[0];
  p.receiptNum='REC-'+String(DB.nextId++).padStart(3,'0');
  renderPayments();
  showReceipt(id);
  DB.finances.push({id:DB.nextId++,date:p.approvedDate,desc:'Cuota mantenimiento '+p.month+' — Depto '+p.depto,cat:'Mantenimiento',type:'income',amount:p.amount,ref:p.receiptNum,notes:''});
  updatePendingCounts();
}

function rejectPayment(id){
  const p=DB.payments.find(p=>p.id===id);
  if(p){p.status='rejected';}
  renderPayments();showToast('Comprobante rechazado','error');updatePendingCounts();
}

function showReceipt(id){
  const p=DB.payments.find(p=>p.id===id);
  if(!p||!p.receiptNum) return;
  document.getElementById('receiptContent').innerHTML=`
    <div class="receipt">
      <div class="receipt-header">
        <div><div class="receipt-logo">CondoAdmin</div><div style="font-size:11px;color:var(--c-text-2);margin-top:3px">Torre Residencial</div></div>
        <div class="receipt-num"><strong>${p.receiptNum}</strong><br>${fmtDate(p.approvedDate)}</div>
      </div>
      <div class="receipt-row"><span class="key">Residente</span><span>${p.residentName}</span></div>
      <div class="receipt-row"><span class="key">Departamento</span><span>${p.depto}</span></div>
      <div class="receipt-row"><span class="key">Concepto</span><span>Mantenimiento mensual</span></div>
      <div class="receipt-row"><span class="key">Período</span><span>${p.month}</span></div>
      <div class="receipt-row"><span class="key">Fecha de pago</span><span>${fmtDate(p.approvedDate)}</span></div>
      <div class="receipt-total"><span>Total pagado</span><span style="color:var(--c-teal)">${fmt(p.amount)}</span></div>
      <div class="receipt-sig">
        <div class="receipt-sig-label">Firma del administrador</div>
        <div class="sig-box"><span class="sig-text">Administración</span></div>
        <div style="font-size:11px;color:var(--c-text-3)">Torre Residencial CondoAdmin</div>
      </div>
    </div>`;
  openModal('modalReceipt');
}

function printReceipt(){window.print();}

function viewVoucher(id){
  const p=DB.payments.find(p=>p.id===id);
  document.getElementById('voucherBody').innerHTML=`
    <div style="text-align:center;padding:1rem">
      <div style="background:var(--c-bg);border-radius:var(--r-md);padding:2rem;margin-bottom:1rem">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-3)" stroke-width="1.5" style="margin:0 auto;display:block"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <div style="font-size:13px;color:var(--c-text-2);margin-top:8px">Comprobante de ${p.residentName}</div>
        <div style="font-size:12px;color:var(--c-text-3)">${p.month} · ${fmt(p.amount)}</div>
        <div style="font-size:11px;color:var(--c-text-3);margin-top:4px">Enviado el ${fmtDate(p.sentDate)}</div>
      </div>
      <div class="alert alert-info" style="text-align:left">En producción, aquí se mostraría la imagen del comprobante subida desde el teléfono del residente via Supabase Storage.</div>
    </div>`;
  document.getElementById('voucherFoot').innerHTML=`
    <button class="btn btn-danger btn-sm" onclick="rejectPayment(${id});closeModal('modalViewVoucher')">✕ Rechazar</button>
    <button class="btn btn-success" onclick="approvePayment(${id});closeModal('modalViewVoucher')">✓ Aprobar y generar recibo</button>`;
  openModal('modalViewVoucher');
}

function renderFinances(){
  const type=document.getElementById('filterFinType').value;
  const cat=document.getElementById('filterFinCat').value;
  const filtered=DB.finances.filter(f=>(!type||f.type===type)&&(!cat||f.cat===cat));
  const totalIn=filtered.filter(f=>f.type==='income').reduce((s,f)=>s+f.amount,0);
  const totalEx=filtered.filter(f=>f.type==='expense').reduce((s,f)=>s+f.amount,0);
  document.getElementById('finMetrics').innerHTML=`
    <div class="metric"><div class="metric-label">Ingresos filtrados</div><div class="metric-value" style="color:var(--c-teal)">${fmt(totalIn)}</div></div>
    <div class="metric"><div class="metric-label">Egresos filtrados</div><div class="metric-value" style="color:var(--c-red)">${fmt(totalEx)}</div></div>
    <div class="metric"><div class="metric-label">Balance</div><div class="metric-value" style="color:${totalIn-totalEx>=0?'var(--c-teal)':'var(--c-red)'}">${fmt(totalIn-totalEx)}</div></div>`;
  const cats=[...new Set(DB.finances.map(f=>f.cat))];
  const catSel=document.getElementById('filterFinCat');
  if(catSel&&catSel.children.length===1){cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;catSel.appendChild(o);});}
  document.getElementById('tblFinances').innerHTML=filtered.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(f=>`<tr>
    <td>${fmtDate(f.date)}</td><td>${f.desc}</td><td>${f.cat}</td>
    <td><span class="badge ${f.type==='income'?'badge-income':'badge-expense'}">${f.type==='income'?'Ingreso':'Egreso'}</span></td>
    <td style="font-weight:500;color:${f.type==='income'?'var(--c-teal)':'var(--c-red)'}">${f.type==='income'?'+':'−'}${fmt(f.amount)}</td>
    <td style="color:var(--c-text-2)">${f.ref||'—'}</td>
    <td><button class="btn btn-danger btn-sm" onclick="deleteTransaction(${f.id})">Eliminar</button></td>
  </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--c-text-3);padding:1.5rem">Sin transacciones</td></tr>';
}

function deleteTransaction(id){
  DB.finances=DB.finances.filter(f=>f.id!==id);
  renderFinances();showToast('Transacción eliminada');
}

function renderReports(){
  document.getElementById('tblReport').innerHTML=DB.residents.map(r=>{
    const latestPay=DB.payments.filter(p=>p.residentId===r.id&&p.status==='approved').sort((a,b)=>new Date(b.approvedDate)-new Date(a.approvedDate))[0];
    const hasCurrent=DB.payments.find(p=>p.residentId===r.id&&p.month==='Junio 2026'&&p.status==='approved');
    return `<tr>
      <td><strong>${r.depto}</strong></td><td>${r.name}</td><td>${fmt(r.fee)}</td>
      <td><span class="badge ${hasCurrent?'badge-approved':r.status==='approved'?'badge-pending':'badge-rejected'}">${hasCurrent?'Pagado':r.status==='approved'?'Pendiente':'Inactivo'}</span></td>
      <td>${hasCurrent&&latestPay?fmtDate(latestPay.approvedDate):'—'}</td>
    </tr>`;}).join('');
}

function renderMyPayments(){
  if(!currentUser) return;
  const res=DB.residents.find(r=>r.userId===currentUser.id);
  const depto=res?.depto||currentUser.depto||'—';
  const status=res?.status||currentUser.deptoStatus||'pending';
  const fee=res?.fee||currentUser.fee||1500;
  const deptoNumEl=document.getElementById('resDeptoNum');
  const deptoStatusEl=document.getElementById('resDeptoStatus');
  const feeEl=document.getElementById('resFeeDisplay');
  const ctaEl=document.getElementById('uploadCTAArea');
  const alertEl=document.getElementById('deptoVerifAlert');
  if(deptoNumEl) deptoNumEl.textContent='Depto '+depto;
  if(deptoStatusEl) deptoStatusEl.textContent=status==='approved'?'✓ Verificado por administración':'⏳ Pendiente de verificación';
  if(feeEl) feeEl.textContent=fmt(fee);
  if(status!=='approved'){
    if(alertEl) alertEl.innerHTML='<div class="alert alert-info" style="margin-bottom:1rem">Tu departamento aún está siendo verificado por el administrador. Una vez aprobado podrás subir comprobantes.</div>';
    if(ctaEl) ctaEl.style.opacity='0.5';
  } else {
    if(alertEl) alertEl.innerHTML='';
    if(ctaEl) ctaEl.style.opacity='1';
  }
  const myPays=DB.payments.filter(p=>p.residentId===currentUser.id);
  const tbody=document.getElementById('tblMyPayments');
  if(tbody){
    tbody.innerHTML=myPays.sort((a,b)=>new Date(b.sentDate)-new Date(a.sentDate)).map(p=>`<tr>
      <td>${p.month}</td><td>${fmt(p.amount)}</td><td>${fmtDate(p.sentDate)}</td>
      <td><span class="badge ${p.status==='approved'?'badge-approved':p.status==='pending'?'badge-pending':'badge-rejected'}">${p.status==='approved'?'Aprobado':p.status==='pending'?'En revisión':'Rechazado'}</span></td>
      <td>${p.receiptNum?`<button class="btn btn-secondary btn-sm" onclick="showReceipt(${p.id})">${p.receiptNum}</button>`:'—'}</td>
    </tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--c-text-3);padding:1.5rem">Sin pagos registrados aún</td></tr>';
  }
}

function openModalTransaction(type){
  document.getElementById('transType').value=type;
  document.getElementById('transModalTitle').textContent=type==='income'?'Nuevo ingreso':'Nuevo egreso';
  document.getElementById('transDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('transAmount').value='';
  document.getElementById('transDesc').value='';
  document.getElementById('transRef').value='';
  document.getElementById('transNotes').value='';
  openModal('modalTransaction');
}

function saveTransaction(){
  const type=document.getElementById('transType').value;
  const date=document.getElementById('transDate').value;
  const amount=parseFloat(document.getElementById('transAmount').value);
  const desc=document.getElementById('transDesc').value.trim();
  const cat=document.getElementById('transCat').value;
  const ref=document.getElementById('transRef').value.trim();
  const notes=document.getElementById('transNotes').value.trim();
  if(!date||!amount||!desc){showToast('Completa fecha, monto y descripción','error');return;}
  DB.finances.push({id:DB.nextId++,date,desc,cat,type,amount,ref,notes});
  closeModal('modalTransaction');
  renderFinances();
  showToast((type==='income'?'Ingreso':'Egreso')+' registrado: '+fmt(amount));
}

function openModalUploadPayment(){
  const res=DB.residents.find(r=>r.userId===currentUser?.id);
  if(res?.status!=='approved'){showToast('Tu departamento aún no ha sido verificado','error');return;}
  document.getElementById('payAmount').value='';
  document.getElementById('payRef').value='';
  document.getElementById('uploadFileName').textContent='Sin archivo seleccionado';
  openModal('modalUploadPayment');
}

function simulateUpload(){document.getElementById('payFile').click();}
function fileSelected(input){document.getElementById('uploadFileName').textContent=input.files[0]?input.files[0].name:'Sin archivo';}

function savePayment(){
  const month=document.getElementById('payMonth').value;
  const amount=parseFloat(document.getElementById('payAmount').value);
  if(!amount){showToast('Ingresa el monto','error');return;}
  const res=DB.residents.find(r=>r.userId===currentUser.id)||{id:currentUser.id,name:currentUser.name,depto:currentUser.depto||'—'};
  DB.payments.push({id:DB.nextId++,residentId:currentUser.id,residentName:currentUser.name,depto:res.depto,month,amount,status:'pending',sentDate:new Date().toISOString().split('T')[0],approvedDate:null,receiptNum:null,hasVoucher:true});
  closeModal('modalUploadPayment');
  renderMyPayments();
  showToast('Comprobante enviado. El administrador lo revisará pronto.');
}

function openModalImport(){openModal('modalImport');}
function selectImportMethod(m){
  const area=document.getElementById('importMethodArea');
  const btn=document.getElementById('btnDoImport');
  if(m==='csv'){
    area.innerHTML='<div class="field"><label>Archivo CSV</label><div class="upload-zone" onclick="document.getElementById(\'csvFile\').click()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:28px;height:28px;margin:0 auto 6px;display:block"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style="font-size:13px">Seleccionar archivo .csv</div><div style="font-size:11px;color:var(--c-text-3);margin-top:4px">Columnas: fecha, descripcion, tipo, monto, categoria, referencia</div></div><input type="file" id="csvFile" accept=".csv" style="display:none"></div>';
    btn.style.display='inline-flex';
  } else if(m==='paste'){
    area.innerHTML='<div class="field"><label>Pegar datos de Excel (Tab separado)</label><textarea id="pasteData" placeholder="2026-06-01\tCuota depto 101\tincome\t1500\tMantenimiento\nEjemplo de formato..." style="height:120px;font-family:monospace;font-size:12px"></textarea></div>';
    btn.style.display='inline-flex';
  }
}

function doImport(){
  const pasteEl=document.getElementById('pasteData');
  if(pasteEl&&pasteEl.value.trim()){
    const lines=pasteEl.value.trim().split('\n');
    let imported=0;
    lines.forEach(line=>{
      const [date,desc,type,amount,cat,ref]=line.split('\t');
      if(date&&desc&&type&&amount){
        DB.finances.push({id:DB.nextId++,date:date.trim(),desc:desc.trim(),cat:cat?.trim()||'Otros',type:type.trim(),amount:parseFloat(amount)||0,ref:ref?.trim()||'',notes:''});
        imported++;
      }
    });
    closeModal('modalImport');
    renderFinances();
    showToast(imported+' transacciones importadas');
  } else {
    showToast('Selecciona un archivo o pega datos','error');
  }
}

function exportCSV(){
  const headers='Fecha,Descripción,Tipo,Categoría,Monto,Referencia,Notas';
  const rows=DB.finances.map(f=>`${f.date},"${f.desc}",${f.type},${f.cat},${f.amount},${f.ref},"${f.notes}"`);
  const csv=[headers,...rows].join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='transacciones-condominio.csv';
  a.click();
  showToast('CSV exportado');
}

function openModalAddResident(){
  document.getElementById('newResName').value='';
  document.getElementById('newResEmail').value='';
  document.getElementById('newResPhone').value='';
  document.getElementById('newResDepto').value='';
  document.getElementById('newResFee').value='1500';
  openModal('modalAddResident');
}

function saveNewResident(){
  const name=document.getElementById('newResName').value.trim();
  const email=document.getElementById('newResEmail').value.trim();
  const phone=document.getElementById('newResPhone').value.trim();
  const depto=document.getElementById('newResDepto').value.trim();
  const fee=parseFloat(document.getElementById('newResFee').value)||1500;
  const status=document.getElementById('newResStatus').value;
  if(!name||!depto){showToast('Nombre y departamento son requeridos','error');return;}
  DB.residents.push({id:DB.nextId++,name,email,phone,depto,status,fee,userId:null});
  closeModal('modalAddResident');
  renderResidents();
  showToast('Residente '+name+' agregado al depto '+depto);
}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}

function showAlert(elId,msg,type){
  const el=document.getElementById(elId);
  if(el){el.innerHTML=`<div class="alert alert-${type}">${msg}</div>`;setTimeout(()=>{if(el)el.innerHTML='';},4000);}
}

let toastTimer=null;
function showToast(msg,type='success'){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:999;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:500;transition:opacity 0.3s;';document.body.appendChild(t);}
  t.textContent=msg;
  t.style.background=type==='error'?'#A32D2D':'#085041';
  t.style.color='white';
  t.style.opacity='1';
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{t.style.opacity='0';},3000);
}

document.querySelectorAll('.modal-overlay').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));});
