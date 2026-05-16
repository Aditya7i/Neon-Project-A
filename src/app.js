/**
 * Neon Silhouette Dashboard - Neural Auth Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // DOM Elements - PHASES
    const loginPhase = document.getElementById('login-phase');
    const dashboardPhase = document.getElementById('dashboard-phase');
    const registerModal = document.getElementById('register-modal');
    const loginEmail = document.getElementById('username');
    const loginPassword = document.getElementById('password');
    const loginSubmitBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('error-msg');
    const toggleRegBtn = document.getElementById('show-register-btn');
    const regSubmitBtn = document.getElementById('tombol-daftar');
    const closeRegisterBtn = document.getElementById('close-register-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const regAvatarPreview = document.getElementById('register-avatar-preview');
    const previewUsername = document.getElementById('preview-username');
    const loginAvatarPreview = document.getElementById('login-avatar-preview');

    const regUsername = document.getElementById('reg-username');
    const regEmail = document.getElementById('reg-email');
    const regPassword = document.getElementById('reg-password');
    const regError = document.getElementById('reg-error');

    // DOM Elements - DASHBOARD
    const headerUsername = document.getElementById('header-username');
    const headerAvatar = document.getElementById('header-avatar');
    const profileTrigger = document.getElementById('profile-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    const dropdownUsername = document.getElementById('dropdown-username');
    const profileMenuItems = document.querySelectorAll('.profile-menu-item');
    const currentTime = document.getElementById('current-time');
    const currentDateEl = document.getElementById('current-date');
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const navLogout = document.getElementById('nav-logout');

    // DOM Elements - TODO
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');
    const todoCountDisplay = document.getElementById('todo-count-display');

    // DOM Elements - JOURNAL
    const journalList = document.getElementById('journal-list');
    const journalTitle = document.getElementById('journal-title');
    const journalBody = document.getElementById('journal-body');
    const saveJournalBtn = document.getElementById('save-journal-btn');
    const addJournalBtn = document.getElementById('add-journal-btn');
    const journalCountDisplay = document.getElementById('journal-count-display');

    // DOM Elements - SCHEDULE
    const schEvent = document.getElementById('sch-event');
    const schDate = document.getElementById('sch-date');
    const schTime = document.getElementById('sch-time');
    const addSchBtn = document.getElementById('add-sch-btn');
    const dashScheduleList = document.getElementById('dash-schedule-list');
    const fullScheduleList = document.getElementById('full-schedule-list');

    // DOM Elements - WHITEBOARD
    const wbCanvas = document.getElementById('whiteboard-canvas');
    const wbPen = document.getElementById('wb-pen');
    const wbEraser = document.getElementById('wb-eraser');
    const wbClear = document.getElementById('wb-clear');
    const wbSave = document.getElementById('wb-save');

    // DOM Elements - SETTINGS MODAL
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsNavBtns = document.querySelectorAll('.settings-nav-btn');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    
    // Settings Fields
    const setUsername = document.getElementById('set-username');
    const setEmail = document.getElementById('email-locked');
    const setAvatarPreview = document.getElementById('set-avatar-preview');
    const avatarUpdateInput = document.getElementById('avatar-update-input');
    const updateProfileBtn = document.getElementById('update-profile-btn');
    const setOldPass = document.getElementById('set-old-pass');
    const setNewPass = document.getElementById('set-new-pass');
    const updatePassBtn = document.getElementById('update-pass-btn');
    const flushCacheBtn = document.getElementById('flush-cache-btn');
    const diagNode = document.getElementById('diag-node');
    const diagTime = document.getElementById('diag-time');

    // DOM Elements - LOCK SCREEN
    const lockScreen = document.getElementById('lock-screen');
    const lockAvatar = document.getElementById('lock-avatar');
    const lockUsername = document.getElementById('lock-username');
    const unlockPass = document.getElementById('unlock-pass');
    const unlockBtn = document.getElementById('unlock-btn');
    const unlockError = document.getElementById('unlock-error');
    const menuLockBtn = document.getElementById('menu-lock-btn');
    const menuLogoutBtn = document.getElementById('menu-logout-btn');

    // State
    let currentUser = null;
    let selectedJournalId = null;
    let wbMode = 'pen';
    let isDrawing = false;
    let ctx = null;

    // Mock Wails bindings for this web environment
    window.go = {
        main: {
            App: {
                CheckSession: async () => {
                    const resp = await fetch('/api/current-user');
                    const user = await resp.json();
                    return { authenticated: !!(user && user.username), user };
                },
                Login: async (username, password) => {
                    const resp = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    return await resp.json();
                },
                Register: async (username, email, password, avatarBase64) => {
                    const resp = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, email, password, avatarBase64 })
                    });
                    return await resp.json();
                },
                Logout: async () => {
                    const resp = await fetch('/api/logout', { method: 'POST' });
                    return await resp.json();
                },
                UpdateUsername: async (username) => {
                    const resp = await fetch('/api/user/update-username', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username })
                    });
                    return await resp.json();
                },
                UpdatePassword: async (currentPassword, newPassword) => {
                    const resp = await fetch('/api/user/update-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                    return await resp.json();
                },
                VerifyPassword: async (password) => {
                    const resp = await fetch('/api/user/verify-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password })
                    });
                    const data = await resp.json();
                    return data.success;
                },
                FlushCache: async () => {
                    const resp = await fetch('/api/system/flush', { method: 'POST' });
                    return await resp.json();
                },
                GetDiagnostics: async () => {
                    const resp = await fetch('/api/system/diagnostics');
                    return await resp.json();
                },
                VacuumDB: async () => {
                    const resp = await fetch('/api/system/vacuum', { method: 'POST' });
                    return await resp.json();
                }
            }
        }
    };

    const wails = window.go.main.App;

    // --- INITIALIZATION ---
    checkSession();
    startTimeUpdate();

    // --- INTERFACE TOGGLES ---

    function toggleProfileDropdown(show) {
        if (show === undefined) show = !profileDropdown.classList.contains('show');
        if (show) profileDropdown.classList.add('show');
        else profileDropdown.classList.remove('show');
    }

    function showSettingsModal(phase = 'account') {
        settingsModal.classList.remove('hidden');
        setTimeout(() => settingsModal.classList.add('opacity-100'), 10);
        switchSettingsTab(phase);
        populateSettings();
    }

    function hideSettingsModal() {
        settingsModal.classList.remove('opacity-100');
        setTimeout(() => settingsModal.classList.add('hidden'), 300);
    }

    function switchSettingsTab(tabName) {
        settingsTabs.forEach(tab => tab.classList.add('hidden'));
        const targetTab = document.getElementById(`settings-${tabName}`);
        if (targetTab) targetTab.classList.remove('hidden');

        settingsNavBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        if (tabName === 'security') fetchDiagnostics();
    }

    function populateSettings() {
        if (!currentUser) return;
        setUsername.value = currentUser.username;
        setEmail.value = currentUser.email || 'agent@neural.core';
        const avatarUrl = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
        setAvatarPreview.src = avatarUrl;
    }

    async function fetchDiagnostics() {
        try {
            const data = await wails.GetDiagnostics();
            diagNode.textContent = data.nodeId;
            diagTime.textContent = new Date(data.timestamp).toLocaleString();
            
            // Added value items - Diagnostics enrichment
            const parent = diagNode.parentElement.parentElement;
            let uptimeBox = parent.querySelector('.uptime-box');
            if (!uptimeBox) {
                uptimeBox = document.createElement('div');
                uptimeBox.className = 'uptime-box col-span-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center mt-4';
                parent.appendChild(uptimeBox);
            }
            uptimeBox.innerHTML = `
                <span class='text-[8px] text-gray-600 uppercase'>Hardware Uptime</span>
                <span class='text-xs font-mono text-neon'>${data.uptime || '148:12:05'}</span>
            `;
        } catch (err) {
            console.error('Diag sync failed');
        }
    }

    // --- PROFILE ACTIONS ---

    async function updateProfile() {
        const username = setUsername.value;
        if (!username) return showNotification('Alias required', 'error');

        try {
            const result = await wails.UpdateUsername(username);
            if (result.success) {
                currentUser.username = username;
                refreshUI();
                showNotification('Profile protocol updated');
            }
        } catch (err) {
            showNotification('Update sync failed', 'error');
        }
    }

    async function rotateSequence() {
        const currentPassword = setOldPass.value;
        const newPassword = setNewPass.value;

        if (!currentPassword || !newPassword) return showNotification('All sequences required', 'error');

        try {
            const result = await wails.UpdatePassword(currentPassword, newPassword);
            if (result.success) {
                showNotification('Sequence rotated successfully');
                setOldPass.value = '';
                setNewPass.value = '';
            } else {
                showNotification(result.message || 'Verification failed', 'error');
            }
        } catch (err) {
            showNotification('Sync anomaly', 'error');
        }
    }

    async function executePurge() {
        if (!confirm('Execute local database vacuum?')) return;
        try {
            const result = await wails.VacuumDB();
            showNotification(result.message || 'Optimization complete');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            showNotification('Vacuum protocol failed', 'error');
        }
    }

    // --- LOCK CORE LOGIC ---

    function lockCore() {
        toggleProfileDropdown(false);
        const avatarUrl = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
        lockAvatar.src = avatarUrl;
        lockUsername.textContent = `AGENT ${currentUser.username.toUpperCase()}`;
        
        lockScreen.classList.remove('hidden');
        setTimeout(() => lockScreen.classList.add('opacity-100'), 10);
        unlockPass.value = '';
        unlockPass.focus();
    }

    async function unlockCore() {
        const password = unlockPass.value;
        try {
            const authenticated = await wails.VerifyPassword(password);
            if (authenticated) {
                lockScreen.classList.remove('opacity-100');
                setTimeout(() => lockScreen.classList.add('hidden'), 500);
            } else {
                showError(unlockError, 'Sequence rejected');
            }
        } catch (err) {
            showError(unlockError, 'Access circuit error');
        }
    }

    // --- UI HELPERS ---

    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notify = document.createElement('div');
        notify.className = `glass-card px-6 py-3 border-l-2 mb-3 shadow-2xl translate-x-10 opacity-0 transition-all duration-300 pointer-events-auto flex items-center gap-3 ${
            type === 'error' ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-neon text-neon bg-neon/5'
        }`;
        
        const icon = type === 'error' ? 'alert-circle' : 'check-circle';
        notify.innerHTML = `
            <i data-lucide="${icon}" class="w-4 h-4"></i>
            <span class="text-[10px] font-bold uppercase tracking-widest">${message}</span>
        `;
        
        container.appendChild(notify);
        lucide.createIcons();

        // Animate in
        setTimeout(() => {
            notify.classList.remove('translate-x-10', 'opacity-0');
            notify.classList.add('translate-x-0', 'opacity-100');
        }, 10);

        // Remove after 4s
        setTimeout(() => {
            notify.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => notify.remove(), 300);
        }, 4000);
    }

    // Suppress Vite WebSocket noise in preview
    (function() {
        const originalError = console.error;
        console.error = function(...args) {
            if (args[0] && typeof args[0] === 'string' && 
               (args[0].includes('[vite] failed to connect to websocket') || 
                args[0].includes('WebSocket closed without opened'))) {
                return;
            }
            originalError.apply(console, args);
        };
    })();

    function refreshUI() {
        headerUsername.textContent = currentUser.username;
        dropdownUsername.textContent = currentUser.username;
        const avatarUrl = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
        headerAvatar.src = avatarUrl;
        dropdownAvatar.src = avatarUrl;
    }

    // --- CLOCK ---
    function startTimeUpdate() {
        setInterval(() => {
            const now = new Date();
            currentTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
            currentDateEl.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }, 1000);
    }

    // --- AUTH LOGIC ---

    async function checkSession() {
        try {
            const data = await wails.CheckSession();
            if (data.authenticated) {
                currentUser = data.user;
                transitionToDashboard();
            }
        } catch (err) {
            console.log('No active session.');
        }
    }

    async function handleLogin() {
        const username = loginEmail.value;
        const password = loginPassword.value;

        if (!username || !password) {
            return showError(loginError, 'Please input credentials');
        }

        try {
            const result = await wails.Login(username, password);
            if (result.success) {
                currentUser = result.userData;
                transitionToDashboard();
            } else {
                showError(loginError, result.message || 'Access Denied');
            }
        } catch (err) {
            showError(loginError, 'Network anomalies detected');
        }
    }

    async function handleRegister() {
        const username = regUsername.value;
        const email = regEmail.value;
        const password = regPassword.value;
        const avatarBase64 = regAvatarPreview.src.startsWith('data:') ? regAvatarPreview.src : null;

        if (!username || !email || password.length < 6) {
            return showError(regError, 'Invalid enrollment data (Pass min 6)');
        }

        try {
            const result = await wails.Register(username, email, password, avatarBase64);
            if (result.success) {
                showNotification('Account Initialized. Commencing sync...');
                regUsername.value = '';
                regEmail.value = '';
                regPassword.value = '';
                hideRegisterModal();
                
                // Set login inputs for convenience
                loginEmail.value = username;
                loginPassword.value = password;
                updatePreviewAvatar(avatarBase64, username);
            } else {
                showError(regError, result.message);
            }
        } catch (err) {
            showError(regError, 'Enrollment failed. Try again.');
        }
    }

    async function handleLogout() {
        try {
            await wails.Logout();
            currentUser = null;
            location.reload();
        } catch (err) {
            location.reload();
        }
    }

    // --- NAVIGATION ---

    function switchView(viewName) {
        views.forEach(v => v.classList.add('hidden'));
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) targetView.classList.remove('hidden');

        navButtons.forEach(b => {
            if (b.dataset.view === viewName) b.classList.add('active');
            else b.classList.remove('active');
        });

        if (viewName === 'whiteboard') initWhiteboard();
        if (viewName === 'todo') fetchTodos();
        if (viewName === 'journal') fetchJournals();
        if (viewName === 'calendar') fetchSchedules();
        if (viewName === 'overview') updateDashboardStats();
    }

    // --- TODO LOGIC ---

    async function fetchTodos() {
        const resp = await fetch('/api/todos');
        const todos = await resp.json();
        renderTodos(todos);
        todoCountDisplay.textContent = String(todos.filter(t => !t.completed).length).padStart(2, '0');
    }

    function renderTodos(todos) {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const div = document.createElement('div');
            div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            div.innerHTML = `
                <button class="toggle-todo w-5 h-5 border border-neon/30 rounded flex items-center justify-center text-neon">
                    ${todo.completed ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                </button>
                <span class="flex-1 font-mono text-xs">${todo.content}</span>
                <button class="delete-todo text-gray-700 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
            `;
            
            div.querySelector('.toggle-todo').onclick = () => toggleTodo(todo.id, !todo.completed);
            div.querySelector('.delete-todo').onclick = () => deleteTodo(todo.id);
            
            todoList.appendChild(div);
        });
        lucide.createIcons();
    }

    async function addTodo() {
        const content = todoInput.value;
        if (!content) return;
        await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        todoInput.value = '';
        fetchTodos();
    }

    async function toggleTodo(id, completed) {
        await fetch('/api/todos/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed })
        });
        fetchTodos();
    }

    async function deleteTodo(id) {
        await fetch('/api/todos/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchTodos();
    }

    // --- JOURNAL LOGIC ---

    async function fetchJournals() {
        const resp = await fetch('/api/journals');
        const journals = await resp.json();
        renderJournals(journals);
        journalCountDisplay.textContent = String(journals.length).padStart(2, '0');
    }

    function renderJournals(journals) {
        journalList.innerHTML = '';
        journals.forEach(j => {
            const div = document.createElement('div');
            div.className = `journal-item ${selectedJournalId === j.id ? 'active' : ''}`;
            div.innerHTML = `
                <h4 class="text-xs font-bold truncate">${j.title || 'Untitled'}</h4>
                <p class="text-[8px] text-gray-600 mt-1 uppercase font-mono">${new Date(j.createdAt).toLocaleDateString()}</p>
            `;
            div.onclick = () => selectJournal(j);
            journalList.appendChild(div);
        });
    }

    function selectJournal(j) {
        selectedJournalId = j.id;
        journalTitle.value = j.title;
        journalBody.value = j.content;
        fetchJournals(); // refresh list to show active state
    }

    async function saveJournal() {
        const title = journalTitle.value;
        const content = journalBody.value;
        await fetch('/api/journals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedJournalId, title, content })
        });
        fetchJournals();
    }

    // --- SCHEDULE LOGIC ---

    async function fetchSchedules() {
        const resp = await fetch('/api/schedules');
        const events = await resp.json();
        renderSchedules(events);
    }

    function renderSchedules(events) {
        const renderItem = (e) => `
            <div class="flex items-start gap-3 p-3 border-l-2 border-neon/30 bg-white/5">
                <div class="flex-1">
                    <p class="text-[10px] font-bold uppercase truncate">${e.event}</p>
                    <p class="text-[8px] text-gray-600 font-mono mt-1">${e.date} @ ${e.time}</p>
                </div>
                <button onclick="window.deleteSch(${e.id})" class="text-gray-800 hover:text-red-500"><i data-lucide="x" class="w-3 h-3"></i></button>
            </div>
        `;
        
        const listHtml = events.length ? events.map(renderItem).join('') : '<p class="text-[8px] text-gray-700 italic">No events.</p>';
        dashScheduleList.innerHTML = listHtml;
        fullScheduleList.innerHTML = listHtml;
        lucide.createIcons();
    }

    async function addSchedule() {
        const event = schEvent.value;
        const date = schDate.value;
        const time = schTime.value;
        if (!event || !date || !time) return;

        await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, date, time })
        });
        schEvent.value = '';
        fetchSchedules();
    }

    window.deleteSch = async (id) => {
        await fetch('/api/schedules/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchSchedules();
    };

    // --- WHITEBOARD LOGIC ---

    function initWhiteboard() {
        if (ctx) return;
        ctx = wbCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        wbCanvas.addEventListener('mousedown', startDraw);
        wbCanvas.addEventListener('mousemove', draw);
        wbCanvas.addEventListener('mouseup', stopDraw);
        wbCanvas.addEventListener('mouseleave', stopDraw);
    }

    function resizeCanvas() {
        const rect = wbCanvas.parentElement.getBoundingClientRect();
        wbCanvas.width = rect.width;
        wbCanvas.height = rect.height;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    function startDraw(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        const rect = wbCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = wbMode === 'eraser' ? 20 : 2;
        ctx.strokeStyle = wbMode === 'eraser' ? '#0a0b10' : '#39ff14';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function stopDraw() {
        isDrawing = false;
        ctx.beginPath();
    }

    // --- DASHBOARD HELPERS ---

    function transitionToDashboard() {
        loginPhase.classList.remove('active');
        loginPhase.classList.add('hidden');
        
        refreshUI();

        setTimeout(() => {
            dashboardPhase.classList.remove('hidden');
            dashboardPhase.classList.add('active');
            updateDashboardStats();
            fetchSchedules();
        }, 500);
    }

    async function updateDashboardStats() {
        const todoResp = await fetch('/api/todos');
        const todos = await todoResp.json();
        todoCountDisplay.textContent = String(todos.filter(t => !t.completed).length).padStart(2, '0');

        const journalResp = await fetch('/api/journals');
        const journals = await journalResp.json();
        journalCountDisplay.textContent = String(journals.length).padStart(2, '0');
    }

    function showError(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.classList.add('opacity-100');
        setTimeout(() => el.classList.remove('opacity-100'), 3000);
    }

    function showRegisterModal() {
        registerModal.classList.remove('hidden');
        setTimeout(() => registerModal.classList.add('opacity-100'), 10);
    }

    function hideRegisterModal() {
        registerModal.classList.remove('opacity-100');
        setTimeout(() => registerModal.classList.add('hidden'), 300);
    }

    function updatePreviewAvatar(base64, username) {
        if (base64) {
            loginAvatarPreview.src = base64;
        } else if (username) {
            loginAvatarPreview.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
        }
        previewUsername.textContent = username || 'Guest_User';
    }

    // --- EVENT LISTENERS ---

    loginSubmitBtn.addEventListener('click', handleLogin);
    toggleRegBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });
    closeRegisterBtn.addEventListener('click', hideRegisterModal);
    regSubmitBtn.addEventListener('click', handleRegister);
    navLogout.addEventListener('click', handleLogout);
    menuLogoutBtn.addEventListener('click', handleLogout);
    menuLockBtn.addEventListener('click', lockCore);
    unlockBtn.addEventListener('click', unlockCore);
    unlockPass.addEventListener('keypress', (e) => { if (e.key === 'Enter') unlockCore(); });

    profileTrigger.addEventListener('click', (e) => {
        if (e.target.closest('#profile-dropdown')) return;
        e.stopPropagation();
        toggleProfileDropdown();
    });

    profileDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // FIX: Prevent dropdown close when clicking inside
    });

    document.addEventListener('click', () => toggleProfileDropdown(false));

    profileMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling to profileTrigger
            const phase = item.dataset.phase;
            if (phase) {
                showSettingsModal(phase);
                toggleProfileDropdown(false);
            }
        });
    });

    closeSettingsBtn.addEventListener('click', hideSettingsModal);
    
    settingsNavBtns.forEach(btn => {
        btn.addEventListener('click', () => switchSettingsTab(btn.dataset.tab));
    });

    updateProfileBtn.addEventListener('click', updateProfile);
    updatePassBtn.addEventListener('click', rotateSequence);
    flushCacheBtn.addEventListener('click', executePurge);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.body.setAttribute('data-theme', theme);
            
            // Update button styles
            document.querySelectorAll('.theme-btn').forEach(b => {
                b.classList.remove('border-neon');
                b.classList.add('border-transparent');
                b.querySelector('span').classList.remove('text-neon');
                b.querySelector('span').classList.add('text-gray-600');
            });
            btn.classList.add('border-neon');
            btn.classList.remove('border-transparent');
            btn.querySelector('span').classList.add('text-neon');
            btn.querySelector('span').classList.remove('text-gray-600');
        });
    });

    avatarUpdateInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setAvatarPreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodo(); });

    addJournalBtn.addEventListener('click', () => {
        selectedJournalId = null;
        journalTitle.value = '';
        journalBody.value = '';
    });
    saveJournalBtn.addEventListener('click', saveJournal);

    addSchBtn.addEventListener('click', addSchedule);

    wbPen.addEventListener('click', () => {
        wbMode = 'pen';
        wbPen.classList.add('active');
        wbEraser.classList.remove('active');
    });
    wbEraser.addEventListener('click', () => {
        wbMode = 'eraser';
        wbEraser.classList.add('active');
        wbPen.classList.remove('active');
    });
    wbClear.addEventListener('click', () => {
        ctx.fillStyle = '#111'; // effectively clear to dark
        ctx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
    });
    wbSave.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `neural_sketch_${Date.now()}.png`;
        link.href = wbCanvas.toDataURL();
        link.click();
    });

    loginEmail.addEventListener('input', (e) => {
        updatePreviewAvatar(null, e.target.value);
    });

    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                regAvatarPreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Close on overlay click
    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) hideRegisterModal();
    });
});
