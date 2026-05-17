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
    const loginUsernameInput = document.getElementById('username');
    const loginPassword = document.getElementById('password');
    const loginSubmitBtn = document.getElementById('login-btn');
    const guestLoginBtn = document.getElementById('guest-login-btn');
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

    // DOM Elements - SCHEDULE
    const schEvent = document.getElementById('sch-event');
    const schDate = document.getElementById('sch-date');
    const schTime = document.getElementById('sch-time');
    const addSchBtn = document.getElementById('add-sch-btn');
    const dashScheduleList = document.getElementById('dash-schedule-list');
    const fullScheduleList = document.getElementById('full-schedule-list');

    // DOM Elements - TODO
    const todoInput = document.getElementById('todo-input-main');
    const addTodoBtn = document.getElementById('add-todo-btn-main');
    const todoList = document.getElementById('todo-list-main');
    const todoCountDisplay = document.getElementById('todo-count-display-main');
    const journalCountDisplay = document.getElementById('journal-count-display');

    // DOM Elements - ROUTINES (Phase 3)
    const calendarGrid = document.getElementById('calendar-grid');
    const calMonthTitle = document.getElementById('cal-month-title');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');

    // DOM Elements - JOURNAL (Phase 2)
    const journalList = document.getElementById('journal-list');
    const journalTitle = document.getElementById('journal-title');
    const journalBody = document.getElementById('journal-body');
    const saveJournalBtn = document.getElementById('save-journal-btn');
    const addJournalBtn = document.getElementById('add-journal-btn');
    const jrFontFamily = document.getElementById('jr-font-family');
    const jrFontSize = document.getElementById('jr-font-size');
    const jrSpacing = document.getElementById('jr-spacing');
    const jrFontColor = document.getElementById('jr-font-color');
    const jrPaperColor = document.getElementById('jr-paper-color');
    const jrParagraphAlign = document.getElementById('jr-paragraph-align');
    const btnToggleLines = document.getElementById('btn-toggle-lines');
    const paperLines = document.getElementById('paper-lines');

    // DOM Elements - WHITEBOARD (Phase 4)
    const wbCanvas = document.getElementById('whiteboard-canvas');
    const wbClear = document.getElementById('wb-clear');
    const wbSave = document.getElementById('wb-save');
    const wbUndo = document.getElementById('wb-undo');
    const wbRedo = document.getElementById('wb-redo');
    const wbBrushSize = document.getElementById('wb-brush-size');
    const wbBrushColor = document.getElementById('wb-brush-color');
    const brushSizeLabel = document.getElementById('brush-size-label');
    const rulerBtns = document.querySelectorAll('.ruler-btn');
    const toolBtns = document.querySelectorAll('.tool-btn');

    const openRoutineBtn = document.getElementById('open-routine-btn');
    const routineModal = document.getElementById('routine-modal');
    const modalRoutineContent = document.getElementById('modal-routine-content');
    const modalRoutineTime = document.getElementById('modal-routine-time');
    const modalRoutineEnd = document.getElementById('modal-routine-end');
    const modalRoutineColor = document.getElementById('modal-routine-color');
    const confirmRoutineBtn = document.getElementById('confirm-routine-btn');
    const routineError = document.getElementById('routine-error');

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
    let wbRuler = 'none';
    let isDrawing = false;
    let ctx = null;
    let undoStack = [];
    let redoStack = [];
    let currentPath = [];

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
                LoginGuest: async () => {
                    const resp = await fetch('/api/login/guest', { method: 'POST' });
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
                GetRoutines: async () => {
                    const resp = await fetch('/api/routines');
                    return await resp.json();
                },
                AddRoutine: async (content, time, endDate, color) => {
                    const resp = await fetch('/api/routines', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content, time, endDate, color })
                    });
                    return await resp.json();
                },
                ToggleRoutine: async (id, completed) => {
                    const resp = await fetch('/api/routines/toggle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, completed })
                    });
                    return await resp.json();
                },
                GetActivityStats: async () => {
                    const resp = await fetch('/api/activity/stats');
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
                UpdateAvatar: async (avatarBase64) => {
                    const resp = await fetch('/api/user/update-avatar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatarBase64 })
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
        if (!profileDropdown) return;
        if (show === undefined) show = profileDropdown.classList.contains('pointer-events-none');
        
        if (show) {
            profileDropdown.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
            profileDropdown.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
            profileDropdown.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
            profileDropdown.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
    }

    function showSettingsModal(phase = 'account') {
        if (!settingsModal) return;
        settingsModal.classList.remove('hidden');
        setTimeout(() => {
            settingsModal.classList.remove('opacity-0');
            settingsModal.classList.add('opacity-100');
        }, 10);
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
        if (setUsername) setUsername.value = currentUser.username;
        if (setEmail) setEmail.value = currentUser.email || 'agent@neural.core';
        const avatarUrl = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
        if (setAvatarPreview) setAvatarPreview.src = avatarUrl;
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
        const avatarBase64 = setAvatarPreview.src.startsWith('data:') ? setAvatarPreview.src : null;

        if (!username) return showNotification('Alias required', 'error');

        try {
            let userUpdateSuccess = true;
            
            // Update username if changed
            if (username !== currentUser.username) {
                const nameResult = await wails.UpdateUsername(username);
                if (nameResult.success) {
                    currentUser.username = username;
                } else {
                    userUpdateSuccess = false;
                    showNotification(nameResult.message || 'Username update failed', 'error');
                }
            }

            // Update avatar if changed (we check if it's base64)
            if (avatarBase64) {
                const avatarResult = await wails.UpdateAvatar(avatarBase64);
                if (avatarResult.success) {
                    currentUser.avatar = avatarBase64;
                } else {
                    userUpdateSuccess = false;
                    showNotification(avatarResult.message || 'Avatar update failed', 'error');
                }
            }

            if (userUpdateSuccess) {
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
        if (!currentUser) return;
        if (headerUsername) headerUsername.textContent = currentUser.username;
        if (dropdownUsername) dropdownUsername.textContent = currentUser.username;
        const avatarUrl = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
        if (headerAvatar) headerAvatar.src = avatarUrl;
        if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
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
        const username = loginUsernameInput.value;
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

    async function handleGuestLogin() {
        try {
            const result = await wails.LoginGuest();
            if (result.success) {
                currentUser = result.userData;
                transitionToDashboard();
            }
        } catch (err) {
            showError(loginError, 'Guest access failed');
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
                loginUsernameInput.value = username;
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
        if (journalCountDisplay) journalCountDisplay.textContent = String(journals.length).padStart(2, '0');
        const overviewJournalCount = document.getElementById('overview-journal-count');
        if (overviewJournalCount) overviewJournalCount.textContent = String(journals.length).padStart(2, '0');
    }

    function renderJournals(journals) {
        journalList.innerHTML = '';
        journals.forEach(j => {
            const div = document.createElement('div');
            div.className = `journal-item ${selectedJournalId === j.id ? 'active' : ''}`;
            div.innerHTML = `
                <h4 class="text-[10px] font-bold truncate uppercase">${j.title || 'Untitled Protocol'}</h4>
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
        
        // Apply saved formatting if exists
        if (j.fontFamily) jrFontFamily.value = j.fontFamily;
        if (j.fontSize) jrFontSize.value = j.fontSize;
        if (j.spacing) jrSpacing.value = j.spacing;
        if (j.fontColor) jrFontColor.value = j.fontColor;
        if (j.paperColor) jrPaperColor.value = j.paperColor;
        if (j.paragraphAlign) jrParagraphAlign.value = j.paragraphAlign;
        if (j.showLines !== undefined) {
             if (j.showLines) paperLines.classList.remove('hidden');
             else paperLines.classList.add('hidden');
        }

        applyJournalStyles();
        fetchJournals(); 
    }

    function applyJournalStyles() {
        journalBody.style.fontFamily = jrFontFamily.value === 'font-mono' ? 'JetBrains Mono, monospace' : 
                                       jrFontFamily.value === 'font-serif' ? 'Playfair Display, serif' : 'Inter, sans-serif';
        journalBody.style.fontSize = `${jrFontSize.value}px`;
        journalBody.style.lineHeight = jrSpacing.value;
        journalBody.style.color = jrFontColor.value;
        journalBody.className = `flex-1 bg-transparent border-none focus:ring-0 resize-none font-mono placeholder-white/5 leading-relaxed ${jrParagraphAlign.value}`;
        document.getElementById('journal-editor-container').style.backgroundColor = jrPaperColor.value;
    }

    async function saveJournal() {
        const title = journalTitle.value;
        const content = journalBody.value;
        
        await fetch('/api/journals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: selectedJournalId, 
                title, 
                content,
                fontFamily: jrFontFamily.value,
                fontSize: parseInt(jrFontSize.value),
                spacing: parseFloat(jrSpacing.value),
                fontColor: jrFontColor.value,
                paperColor: jrPaperColor.value,
                paragraphAlign: jrParagraphAlign.value,
                showLines: !paperLines.classList.contains('hidden')
            })
        });
        fetchJournals();
        showNotification('Data Commited to Archive');
    }

    // --- ROUTINE & CALENDAR LOGIC (Phase 3) ---

    let currentCalDate = new Date();

    async function fetchRoutines() {
        renderCalendar();
        const routines = await wails.GetRoutines();
        renderRoutines(routines);
        updateDashboardStats();
    }

    function renderRoutines(routines) {
        const todoListMain = document.getElementById('todo-list-main');
        if (!todoListMain) return;

        todoListMain.innerHTML = '';
        routines.forEach(r => {
            const div = document.createElement('div');
            div.className = `todo-item border-l-4 group ${r.completed ? 'completed opacity-40' : ''}`;
            div.style.borderColor = r.color;
            div.innerHTML = `
                <button class="toggle-routine w-5 h-5 border border-white/10 rounded flex items-center justify-center text-neon">
                    ${r.completed ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                </button>
                <div class="flex-1">
                    <span class="block text-xs uppercase tracking-widest text-white">${r.content}</span>
                    <span class="text-[8px] font-mono text-gray-500 uppercase">${r.time} • Every ${r.days} Days</span>
                </div>
                <div class="px-2 py-1 bg-white/5 text-[8px] font-bold text-gray-500 uppercase rounded group-hover:text-neon transition-colors">
                    Routine
                </div>
            `;
            
            div.querySelector('.toggle-routine').onclick = () => toggleRoutine(r.id, !r.completed);
            todoListMain.appendChild(div);
        });
        lucide.createIcons();
    }

    async function toggleRoutine(id, completed) {
        await wails.ToggleRoutine(id, completed);
        fetchRoutines();
    }

    function renderCalendar() {
        if (!calendarGrid) return;
        calendarGrid.innerHTML = '';
        
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        
        calMonthTitle.textContent = currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Prev month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay; i > 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day opacity-20';
            day.textContent = prevMonthLastDay - i + 1;
            calendarGrid.appendChild(day);
        }

        // Current month days
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
            day.className = `calendar-day ${isToday ? 'active border-neon/50 bg-neon/10' : ''}`;
            day.textContent = i;
            calendarGrid.appendChild(day);
        }
    }

    async function fetchSchedules() {
        try {
            const resp = await fetch('/api/schedules');
            const events = await resp.json();
            renderSchedules(events);
        } catch (err) {
            console.error('Schedule sync error', err);
        }
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
        ctx = wbCanvas.getContext('2d', { willReadFrequently: true });
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        wbCanvas.addEventListener('mousedown', startDraw);
        wbCanvas.addEventListener('mousemove', draw);
        wbCanvas.addEventListener('mouseup', stopDraw);
        wbCanvas.addEventListener('mouseleave', stopDraw);
        
        saveState();
    }

    function resizeCanvas() {
        if (!wbCanvas || !ctx) return;
        const rect = wbCanvas.parentElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        let imgData = null;
        if (wbCanvas.width > 0 && wbCanvas.height > 0) {
            try {
                imgData = ctx.getImageData(0, 0, wbCanvas.width, wbCanvas.height);
            } catch (e) { console.warn('Canvas data extraction failed', e); }
        }

        wbCanvas.width = rect.width;
        wbCanvas.height = rect.height;

        if (imgData) {
            try {
                ctx.putImageData(imgData, 0, 0);
            } catch (e) { console.warn('Canvas data restoration failed', e); }
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    function saveState() {
        if (wbCanvas.width > 0 && wbCanvas.height > 0) {
            undoStack.push(ctx.getImageData(0, 0, wbCanvas.width, wbCanvas.height));
            if (undoStack.length > 50) undoStack.shift();
            redoStack = [];
        }
    }

    function undo() {
        if (undoStack.length <= 1) return;
        redoStack.push(undoStack.pop());
        const state = undoStack[undoStack.length - 1];
        ctx.putImageData(state, 0, 0);
    }

    function redo() {
        if (redoStack.length === 0) return;
        const state = redoStack.pop();
        undoStack.push(state);
        ctx.putImageData(state, 0, 0);
    }

    function startDraw(e) {
        if (wbMode === 'bucket') {
            floodFill(e);
            saveState();
            return;
        }
        isDrawing = true;
        const rect = wbCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        currentPath = [{ x, y }];
    }

    function draw(e) {
        if (!isDrawing) return;
        const rect = wbCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const lastPoint = currentPath[currentPath.length - 1];
        
        ctx.lineWidth = wbBrushSize.value;
        ctx.strokeStyle = wbMode === 'eraser' ? '#ffffff' : wbBrushColor.value;

        if (wbRuler === 'none') {
            drawLine(lastPoint.x, lastPoint.y, x, y);
        } else if (wbRuler.startsWith('sym-')) {
            const count = parseInt(wbRuler.split('-')[1]);
            drawSymmetric(lastPoint.x, lastPoint.y, x, y, count);
        }

        currentPath.push({ x, y });
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function drawSymmetric(x1, y1, x2, y2, segments) {
        const centerX = wbCanvas.width / 2;
        const centerY = wbCanvas.height / 2;
        
        for (let i = 0; i < segments; i++) {
            const angle = (Math.PI * 2 / segments) * i;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.translate(-centerX, -centerY);
            drawLine(x1, y1, x2, y2);
            ctx.restore();
        }
    }

    function stopDraw() {
        if (!isDrawing) return;
        isDrawing = false;
        saveState();
    }

    function floodFill(e) {
        const rect = wbCanvas.getBoundingClientRect();
        const startX = Math.round(e.clientX - rect.left);
        const startY = Math.round(e.clientY - rect.top);
        
        if (wbCanvas.width === 0 || wbCanvas.height === 0) return;

        const targetColor = getPixelColor(startX, startY);
        const fillColor = hexToRgb(wbBrushColor.value);
        
        if (colorsMatch(targetColor, fillColor)) return;

        const imageData = ctx.getImageData(0, 0, wbCanvas.width, wbCanvas.height);
        const pixels = imageData.data;
        const stack = [[startX, startY]];

        while (stack.length) {
            const [x, y] = stack.pop();
            const nodeIndex = (y * imageData.width + x) * 4;

            if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height &&
                colorsMatch(getPixelAt(pixels, nodeIndex), targetColor)) {
                
                setPixelAt(pixels, nodeIndex, fillColor);
                stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function getPixelColor(x, y) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        return [p[0], p[1], p[2], p[3]];
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, 255];
    }

    function colorsMatch(c1, c2) {
        return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
    }

    function getPixelAt(pixels, index) {
        return [pixels[index], pixels[index+1], pixels[index+2], pixels[index+3]];
    }

    function setPixelAt(pixels, index, color) {
        pixels[index] = color[0];
        pixels[index+1] = color[1];
        pixels[index+2] = color[2];
        pixels[index+3] = color[3];
    }

    // --- DASHBOARD HELPERS ---

    async function transitionToDashboard() {
        loginPhase.classList.remove('active');
        loginPhase.classList.add('hidden');
        
        refreshUI();

        setTimeout(() => {
            dashboardPhase.classList.remove('hidden');
            dashboardPhase.classList.add('active');
            updateDashboardStats();
            fetchSchedules();
            fetchRoutines(); // For Phase 1 & 3
        }, 500);
    }

    async function updateDashboardStats() {
        try {
            const todoResp = await fetch('/api/todos');
            const todos = await todoResp.json();
            const overviewTodoCount = document.getElementById('overview-todo-count');
            if (overviewTodoCount) overviewTodoCount.textContent = String(todos.filter(t => !t.completed).length).padStart(2, '0');

            const journalResp = await fetch('/api/journals');
            const journals = await journalResp.json();
            const overviewJournalCount = document.getElementById('overview-journal-count');
            if (overviewJournalCount) overviewJournalCount.textContent = String(journals.length).padStart(2, '0');

            const stats = await wails.GetActivityStats();
            const monthlyTasks = document.getElementById('stat-monthly-tasks');
            const activityBar = document.getElementById('activity-bar');
            
            if (monthlyTasks) monthlyTasks.textContent = stats.monthlyTasks;
            if (activityBar) {
                const percentage = Math.min((stats.monthlyTasks / 50) * 100, 100);
                activityBar.style.width = `${percentage}%`;
            }

            renderRoutineReminders();
            renderAchievements(stats.achievements);
            renderScheduleSuggestions(stats.achievements);
        } catch (err) {
            console.error('Stats update anomaly', err);
        }
    }

    function renderAchievements(achievements) {
        const achievementContainer = document.getElementById('achievement-container');
        if (!achievementContainer || !achievements) return;

        if (achievements.length === 0) {
            achievementContainer.innerHTML = '<div class="text-center py-20 opacity-20"><i data-lucide="award" class="w-12 h-12 mx-auto mb-4"></i><p class="text-[10px] uppercase">No routine achievements stored</p></div>';
            lucide.createIcons();
            return;
        }

        achievementContainer.innerHTML = achievements.map(a => `
            <div class="p-3 bg-white/[0.02] border border-white/5 rounded relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-1 h-full bg-neon shadow-neon transition-all group-hover:w-full group-hover:opacity-5" style="background-color: ${a.score > 0 ? '#39ff14' : '#333'}"></div>
                <div class="relative flex justify-between items-center">
                    <div>
                        <p class="text-[8px] uppercase tracking-widest text-white">${a.name}</p>
                        ${a.endDate ? `<p class="text-[6px] text-gray-600 mt-1 uppercase">Protocol ends: ${a.endDate}</p>` : ''}
                    </div>
                    <span class="text-[10px] font-mono ${a.score > 0 ? 'text-neon' : 'text-gray-700'}">${a.score > 0 ? 'COMPLETE' : 'PENDING'}</span>
                </div>
            </div>
        `).join('');
    }

    function renderScheduleSuggestions(achievements) {
        const suggestionContainer = document.getElementById('suggestion-container');
        if (!suggestionContainer) return;

        const suggestions = achievements.filter(a => a.score === 0);
        if (suggestions.length === 0) {
            suggestionContainer.innerHTML = '<p class="text-[8px] text-gray-700 italic">All routine objectives achieved. Optimal performance reached.</p>';
        } else {
            suggestionContainer.innerHTML = suggestions.map(s => `
                <div class="flex items-center gap-3 p-3 border border-white/5 bg-white/[0.01]">
                    <div class="w-8 h-8 rounded bg-neon/10 flex items-center justify-center text-neon">
                        <i data-lucide="zap" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <p class="text-[9px] font-bold text-white uppercase tracking-tighter">Prioritize ${s.name}</p>
                        <p class="text-[7px] text-gray-600 uppercase">Recommended focus for next sequence</p>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }
    }

    async function renderRoutineReminders() {
        const reminderContainer = document.getElementById('reminder-container');
        if (!reminderContainer) return;

        const routines = await wails.GetRoutines();
        const pending = routines.filter(r => !r.completed);

        if (pending.length === 0) {
            reminderContainer.innerHTML = '<p class="text-[8px] text-gray-700 italic">Core routine synchronized.</p>';
        } else {
            reminderContainer.innerHTML = pending.map(r => `
                <div class="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full shadow-neon" style="background-color: ${r.color}"></div>
                        <span class="text-[8px] uppercase tracking-widest text-white">${r.content}</span>
                    </div>
                    <span class="text-[8px] font-mono text-neon">${r.time}</span>
                </div>
            `).join('');
        }
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
    guestLoginBtn.addEventListener('click', handleGuestLogin);
    toggleRegBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });
    closeRegisterBtn.addEventListener('click', hideRegisterModal);
    regSubmitBtn.addEventListener('click', handleRegister);
    // navLogout.addEventListener('click', handleLogout); // Removed as it doesn't exist in DOM
    menuLogoutBtn.addEventListener('click', handleLogout);
    menuLockBtn.addEventListener('click', lockCore);
    unlockBtn.addEventListener('click', unlockCore);
    unlockPass.addEventListener('keypress', (e) => { if (e.key === 'Enter') unlockCore(); });

    profileTrigger.addEventListener('click', (e) => {
        // Stop propagation to prevent document click from closing it immediately
        e.stopPropagation();

        // Check if we clicked a menu item
        const menuItem = e.target.closest('.profile-menu-item');
        if (menuItem) {
            const phase = menuItem.dataset.phase;
            if (phase) {
                showSettingsModal(phase);
                toggleProfileDropdown(false);
            }
            return;
        }

        // If we clicked inside the dropdown but not on a menu item
        if (e.target.closest('#profile-dropdown')) {
            return;
        }

        // Otherwise toggle
        toggleProfileDropdown();
    });

    document.addEventListener('click', () => toggleProfileDropdown(false));

    // Remove legacy per-item listeners as we use delegation now
    /*
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
    */

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

    openRoutineBtn.addEventListener('click', () => {
        routineModal.classList.remove('hidden');
    });

    confirmRoutineBtn.addEventListener('click', async () => {
        const content = modalRoutineContent.value;
        const time = modalRoutineTime.value;
        const endDate = modalRoutineEnd.value;
        const color = modalRoutineColor.value;

        if (!content || !time || !endDate) {
            routineError.style.opacity = '1';
            return;
        }

        const result = await wails.AddRoutine(content, time, endDate, color);
        if (result.success) {
            routineModal.classList.add('hidden');
            modalRoutineContent.value = '';
            modalRoutineTime.value = '';
            modalRoutineEnd.value = '';
            fetchRoutines();
            showNotification('Routine Protocol Registered');
        }
    });

    calPrev.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar();
    });
    calNext.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar();
    });

    [jrFontFamily, jrFontSize, jrSpacing, jrFontColor, jrPaperColor].forEach(el => {
        el.addEventListener('change', applyJournalStyles);
        el.addEventListener('input', applyJournalStyles);
    });

    btnToggleLines.addEventListener('click', () => {
        paperLines.classList.toggle('hidden');
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

    wbUndo.addEventListener('click', undo);
    wbRedo.addEventListener('click', redo);
    wbBrushSize.addEventListener('input', (e) => {
        brushSizeLabel.textContent = `${e.target.value}px`;
    });

    rulerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rulerBtns.forEach(b => b.classList.remove('active', 'border-neon', 'text-neon'));
            btn.classList.add('active', 'border-neon', 'text-neon');
            wbRuler = btn.id.replace('ruler-', '');
        });
    });

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => {
                b.classList.remove('active', 'bg-neon/20', 'border-neon', 'text-neon');
                b.classList.add('bg-white/5', 'border-white/5', 'text-gray-500');
            });
            btn.classList.add('active', 'bg-neon/20', 'border-neon', 'text-neon');
            btn.classList.remove('bg-white/5', 'border-white/5', 'text-gray-500');
            wbMode = btn.id.replace('tool-', '');
        });
    });

    wbClear.addEventListener('click', () => {
        if (!confirm('Purge all visual data?')) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
        saveState();
    });
    wbSave.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `neural_sketch_${Date.now()}.png`;
        link.href = wbCanvas.toDataURL();
        link.click();
    });

    loginUsernameInput.addEventListener('input', (e) => {
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
