// Configuración inicial
const CONFIG = {
    DB_KEY: 'letsgopol_premium_db',
    ADMIN_CREDENTIALS: {
        username: 'letsgopol',
        password: 'streamer123'
    },
    INITIAL_ACTIVE_CODES: 10 // Solo 10 códigos activos inicialmente
};

// Sonidos
const sounds = {
    bgMusic: document.getElementById('bgMusic'),
    clickSound: document.getElementById('clickSound'),
    successSound: document.getElementById('successSound')
};

// Estado de la aplicación
const state = {
    isAdminLoggedIn: false,
    currentEditId: null,
    isMusicPlaying: false
};

// Inicialización de la base de datos
function initializeDatabase() {
    if (!localStorage.getItem(CONFIG.DB_KEY)) {
        const activeCodes = generateRandomCodes(CONFIG.INITIAL_ACTIVE_CODES, 'available');
        const usedCodes = generateRandomCodes(5, 'used');
        const allCodes = [...activeCodes, ...usedCodes];
        localStorage.setItem(CONFIG.DB_KEY, JSON.stringify(allCodes));
    }
}

// Generador de códigos
function generateRandomCodes(count, status) {
    const codes = [];
    const existingNumeric = new Set();
    const existingVerification = new Set();
    
    for (let i = 0; i < count; i++) {
        let numericCode, verificationCode;
        
        do {
            numericCode = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        } while (existingNumeric.has(numericCode));
        
        do {
            verificationCode = generateVerificationCode();
        } while (existingVerification.has(verificationCode));
        
        codes.push({
            id: Date.now().toString() + i,
            numericCode,
            verificationCode,
            status,
            createdAt: new Date().toISOString()
        });
        
        existingNumeric.add(numericCode);
        existingVerification.add(verificationCode);
    }
    
    return codes;
}

function generateVerificationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Operaciones con la base de datos
function getCodesFromDB() {
    const dbData = localStorage.getItem(CONFIG.DB_KEY);
    return dbData ? JSON.parse(dbData) : [];
}

function saveCodesToDB(codes) {
    localStorage.setItem(CONFIG.DB_KEY, JSON.stringify(codes));
}

function getActiveCodesCount() {
    const codes = getCodesFromDB();
    return codes.filter(c => c.status === 'available').length;
}

// Funciones de la UI
function updateUIStats() {
    const codes = getCodesFromDB();
    const available = codes.filter(c => c.status === 'available').length;
    const used = codes.filter(c => c.status === 'used').length;
    
    document.getElementById('availableCount').textContent = available;
    document.getElementById('usedCount').textContent = used;
    
    if (state.isAdminLoggedIn) {
        document.getElementById('totalCodesStat').textContent = codes.length;
        document.getElementById('availableCodesStat').textContent = available;
        document.getElementById('usedCodesStat').textContent = used;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Error al reproducir sonido:", e));
}

// Verificación de códigos
function verifyCode() {
    playSound(sounds.clickSound);
    
    const codeInput = document.getElementById('codeInput');
    const code = codeInput.value.trim();
    const errorElement = document.getElementById('inputError');
    const resultElement = document.getElementById('verificationResult');
    const verificationCodeElement = document.getElementById('verificationCode');
    
    // Reset UI
    errorElement.textContent = '';
    resultElement.style.display = 'none';
    
    // Validación básica
    if (!/^\d{5}$/.test(code)) {
        showError('inputError', '❌ El código debe tener 5 dígitos');
        return;
    }
    
    const codes = getCodesFromDB();
    const codeObj = codes.find(c => c.numericCode === code);
    
    if (!codeObj) {
        showError('inputError', '❌ Código no encontrado');
        return;
    }
    
    if (codeObj.status === 'used') {
        showError('inputError', '⚠️ Este código ya fue usado');
        return;
    }
    
    // Marcar como usado
    codeObj.status = 'used';
    saveCodesToDB(codes);
    
    // Mostrar resultado
    verificationCodeElement.textContent = codeObj.verificationCode;
    resultElement.style.display = 'block';
    playSound(sounds.successSound);
    
    // Actualizar UI
    updateUIStats();
    codeInput.value = '';
    
    // Si estamos en el panel admin, recargar
    if (state.isAdminLoggedIn) {
        loadAdminCodes();
    }
}

// Funciones del panel de administración
function showAdminModal() {
    playSound(sounds.clickSound);
    const adminModal = document.getElementById('adminModal');
    adminModal.style.display = 'flex';
    
    if (state.isAdminLoggedIn) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminCodes();
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

function closeAllModals() {
    playSound(sounds.clickSound);
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('codeModal').style.display = 'none';
    state.currentEditId = null;
}

function handleLogin() {
    playSound(sounds.clickSound);
    
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value.trim();
    const errorElement = document.getElementById('loginError');
    
    if (username === CONFIG.ADMIN_CREDENTIALS.username && 
        password === CONFIG.ADMIN_CREDENTIALS.password) {
        state.isAdminLoggedIn = true;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        errorElement.textContent = '';
        loadAdminCodes();
    } else {
        showError('loginError', '❌ Credenciales incorrectas');
    }
}

function handleLogout() {
    playSound(sounds.clickSound);
    state.isAdminLoggedIn = false;
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    closeAllModals();
}

function loadAdminCodes() {
    const codes = getCodesFromDB();
    const tbody = document.getElementById('codesTableBody');
    tbody.innerHTML = '';
    
    codes.forEach(code => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${code.numericCode}</td>
            <td>${code.verificationCode}</td>
            <td class="${code.status === 'available' ? 'status-available' : 'status-used'}">
                ${code.status === 'available' ? 'DISPONIBLE' : 'USADO'}
            </td>
            <td>
                <div class="cyber-actions">
                    <button class="cyber-action-btn edit" data-id="${code.id}">
                        <i class="fas fa-edit"></i> EDITAR
                    </button>
                    <button class="cyber-action-btn delete" data-id="${code.id}">
                        <i class="fas fa-trash-alt"></i> ELIMINAR
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Agregar eventos a los botones
    document.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playSound(sounds.clickSound);
            const codeId = e.currentTarget.getAttribute('data-id');
            editCode(codeId);
        });
    });
    
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            playSound(sounds.clickSound);
            const codeId = e.currentTarget.getAttribute('data-id');
            deleteCode(codeId);
        });
    });
    
    updateUIStats();
}

function showCodeForm(action, codeId = null) {
    playSound(sounds.clickSound);
    const modal = document.getElementById('codeModal');
    const title = document.getElementById('codeModalTitle');
    const numericInput = document.getElementById('numericCodeInput');
    const verificationInput = document.getElementById('verificationCodeInput');
    const statusSelect = document.getElementById('statusSelect');
    const errorElement = document.getElementById('codeModalError');
    
    errorElement.textContent = '';
    
    if (action === 'add') {
        title.innerHTML = '<i class="fas fa-plus"></i> NUEVO CÓDIGO';
        numericInput.value = '';
        verificationInput.value = generateVerificationCode();
        statusSelect.value = 'available';
        state.currentEditId = null;
        
        // Generar un código numérico único
        const codes = getCodesFromDB();
        let newCode;
        do {
            newCode = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        } while (codes.some(c => c.numericCode === newCode));
        
        numericInput.value = newCode;
    } else if (action === 'edit') {
        const codes = getCodesFromDB();
        const code = codes.find(c => c.id === codeId);
        
        if (code) {
            title.innerHTML = '<i class="fas fa-edit"></i> EDITAR CÓDIGO';
            numericInput.value = code.numericCode;
            verificationInput.value = code.verificationCode;
            statusSelect.value = code.status;
            state.currentEditId = codeId;
        }
    }
    
    modal.style.display = 'flex';
}

function saveCode() {
    playSound(sounds.clickSound);
    
    const numericCode = document.getElementById('numericCodeInput').value.trim();
    const verificationCode = document.getElementById('verificationCodeInput').value.trim().toUpperCase();
    const status = document.getElementById('statusSelect').value;
    const errorElement = document.getElementById('codeModalError');
    
    // Validaciones
    if (!/^\d{5}$/.test(numericCode)) {
        showError('codeModalError', '❌ El código numérico debe tener 5 dígitos');
        return;
    }
    
    if (!/^[A-Z]{5}$/.test(verificationCode)) {
        showError('codeModalError', '❌ El código de verificación debe tener 5 letras (A-Z)');
        return;
    }
    
    const codes = getCodesFromDB();
    
    if (state.currentEditId === null) {
        // Verificar duplicados para nuevo código
        if (codes.some(c => c.numericCode === numericCode)) {
            showError('codeModalError', '❌ Este código numérico ya existe');
            return;
        }
        
        if (codes.some(c => c.verificationCode === verificationCode)) {
            showError('codeModalError', '❌ Este código de verificación ya existe');
            return;
        }
        
        // Agregar nuevo código
        codes.push({
            id: Date.now().toString(),
            numericCode,
            verificationCode,
            status,
            createdAt: new Date().toISOString()
        });
    } else {
        // Editar código existente
        const index = codes.findIndex(c => c.id === state.currentEditId);
        if (index !== -1) {
            // Verificar duplicados al editar
            if (codes[index].numericCode !== numericCode && 
                codes.some(c => c.numericCode === numericCode)) {
                showError('codeModalError', '❌ Este código numérico ya existe');
                return;
            }
            
            if (codes[index].verificationCode !== verificationCode && 
                codes.some(c => c.verificationCode === verificationCode)) {
                showError('codeModalError', '❌ Este código de verificación ya existe');
                return;
            }
            
            // Actualizar código
            codes[index] = {
                ...codes[index],
                numericCode,
                verificationCode,
                status
            };
        }
    }
    
    saveCodesToDB(codes);
    closeAllModals();
    loadAdminCodes();
    updateUIStats();
    playSound(sounds.successSound);
}

function deleteCode(codeId) {
    if (confirm('¿Estás seguro de eliminar este código? Esta acción no se puede deshacer.')) {
        playSound(sounds.clickSound);
        const codes = getCodesFromDB();
        const updatedCodes = codes.filter(c => c.id !== codeId);
        saveCodesToDB(updatedCodes);
        loadAdminCodes();
        updateUIStats();
        playSound(sounds.successSound);
    }
}

function editCode(codeId) {
    showCodeForm('edit', codeId);
}

// Inicialización de la aplicación
function initApp() {
    initializeDatabase();
    updateUIStats();
    
    // Configurar event listeners
    document.getElementById('verifyBtn').addEventListener('click', verifyCode);
    document.getElementById('codeInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyCode();
    });
    
    document.getElementById('adminLoginBtn').addEventListener('click', showAdminModal);
    document.querySelectorAll('.cyber-close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('addCodeBtn').addEventListener('click', () => showCodeForm('add'));
    document.getElementById('saveCodeBtn').addEventListener('click', saveCode);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('cyber-modal')) {
            closeAllModals();
        }
    });
    
    // Reproducir música automáticamente (con manejo de errores)
    document.addEventListener('click', () => {
        if (!state.isMusicPlaying) {
            sounds.bgMusic.volume = 0.3;
            sounds.bgMusic.play().then(() => {
                state.isMusicPlaying = true;
            }).catch(e => {
                console.log("La reproducción automática fue bloqueada:", e);
            });
        }
    }, { once: true });
    
    // Intentar reproducir música automáticamente al cargar
    sounds.bgMusic.volume = 0.3;
    const playPromise = sounds.bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            state.isMusicPlaying = true;
        }).catch(e => {
            console.log("La reproducción automática fue bloqueada:", e);
        });
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);