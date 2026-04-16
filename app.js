/**
 * Class Tracker - Main Application Logic
 */

// Configuration - Paste your Google Apps Script URL here
const CONFIG = {
    API_URL: localStorage.getItem('classTracker_apiUrl') || 'https://script.google.com/macros/s/AKfycby0wgOda580M12b48OZg31LjKRI6dJ5-RmhPfyEHvmumKzvUdY70pddYKF8ouspheH_/exec', 
};

// Application State
let studentsData = {}; // { classId: [studentNames] }
let evalHistory = [];  // [ { studentName, oi, te, sc, date } ]

const state = {
    currentScreen: 'home', // 'home' | 'evaluation' | 'stats'
    currentClass: null,
    evaluations: {}, 
};

// --- DOM Elements ---
const mainContent = document.getElementById('main-content');
const loader = document.getElementById('loader');
const toastEl = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const syncBtn = document.getElementById('sync-btn');

// Templates
const tplHome = document.getElementById('screen-home');
const tplEval = document.getElementById('screen-evaluation');

// --- Initialization ---
async function init() {
    // Try to load cached data first
    const cachedStudents = localStorage.getItem('classTracker_cachedStudents');
    const cachedHistory = localStorage.getItem('classTracker_cachedHistory');
    
    if (cachedStudents) studentsData = JSON.parse(cachedStudents);
    if (cachedHistory) evalHistory = JSON.parse(cachedHistory);

    renderHome();

    // Fetch fresh data if URL is configured
    if (CONFIG.API_URL) {
        await refreshData();
    } else {
        showToast("Configura l'URL de Google Sheets per carregar dades.");
    }
    
    // Sync Button logic
    syncBtn.addEventListener('click', async () => {
        if (!CONFIG.API_URL) {
            const url = prompt("Introdueix l'URL del teu Google Apps Script:");
            if (url) {
                localStorage.setItem('classTracker_apiUrl', url);
                CONFIG.API_URL = url;
                await refreshData();
            }
            return;
        }
        await refreshData();
    });
}

async function refreshData() {
    syncBtn.classList.add('spinning');
    showToast("Sincronitzant amb Google Sheets...");
    
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) throw new Error("Error en la xarxa");
        const json = await response.json();
        
        // Split data (expecting { students, history })
        studentsData = json.students || json; // fallback for old structure
        evalHistory = json.history || [];
        
        localStorage.setItem('classTracker_cachedStudents', JSON.stringify(studentsData));
        localStorage.setItem('classTracker_cachedHistory', JSON.stringify(evalHistory));
        
        if (state.currentScreen === 'home') {
            renderHome();
        }
        
        showToast("Dades sincronitzades correctament");
    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Error al sincronitzar. Revisa l'URL.");
    } finally {
        syncBtn.classList.remove('spinning');
    }
}

// --- Navigation & Rendering ---

function showLoader() {
    loader.classList.remove('hidden');
}

function hideLoader() {
    setTimeout(() => loader.classList.add('hidden'), 300); // slight delay for smoothness
}

function renderHome() {
    state.currentScreen = 'home';
    state.currentClass = null;
    
    // Clear main content completely (except loader)
    Array.from(mainContent.children).forEach(child => {
        if (child.id !== 'loader') child.remove();
    });

    const content = tplHome.content.cloneNode(true);
    const classGrid = content.getElementById('class-grid');
    
    // Clear the loading message
    classGrid.innerHTML = '';

    const classIds = Object.keys(studentsData);
    
    if (classIds.length === 0) {
        classGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-light);">
                <span class="material-symbols-rounded" style="font-size: 3rem; margin-bottom: 1rem;">sync_disabled</span>
                <p>No hi ha dades cargades. Fes clic a sincronitzar.</p>
            </div>
        `;
    }

    classIds.forEach(classId => {
        const studentCount = studentsData[classId].length;
        const colorClass = classId.includes('4') ? 'blue' : classId.includes('5') ? 'green' : 'purple';
        const displayLabel = classId.replace('th', '');

        const card = document.createElement('button');
        card.className = 'class-card';
        card.setAttribute('data-class', classId);
        card.innerHTML = `
            <div class="class-icon ${colorClass}">${displayLabel}</div>
            <div class="class-info">
                <h3>${classId}</h3>
                <span>${studentCount} Alumnes</span>
            </div>
            <span class="material-symbols-rounded icon-arrow">chevron_right</span>
        `;
        
        card.addEventListener('click', () => navigateToEvaluation(classId));
        classGrid.appendChild(card);
    });

    mainContent.appendChild(content);
}

function navigateToEvaluation(classId) {
    showLoader();
    setTimeout(() => {
        renderEvaluation(classId);
        hideLoader();
    }, 400); // Simulate network/processing delay for better UX
}

function renderEvaluation(classId) {
    state.currentScreen = 'evaluation';
    state.currentClass = classId;
    
    // Reset temporary state for new evaluation
    state.evaluations = {};
    
    // Clear main content
    Array.from(mainContent.children).forEach(child => {
        if (child.id !== 'loader') child.remove();
    });

    const content = tplEval.content.cloneNode(true);
    
    // Customize Header
    const title = content.getElementById('current-class-title');
    title.textContent = `Classe ${classId.replace('th', 'r ').replace('A', ' A').replace('B', ' B')}`; 
    
    const dateEl = content.getElementById('current-date');
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Populate Students
    const studentList = content.getElementById('student-list');
    const students = studentsData[classId] || ["Sense alumnes"];
    
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

    students.forEach((studentName) => {
        // Initialize State with 0 (Intermediate/Default)
        state.evaluations[studentName] = { oi: 0, te: 0, sc: 0 };
        
        const item = document.createElement('div');
        item.className = 'student-item';
        
        const createControl = (metric, label) => `
            <div class="control-column">
                <div class="eval-segment-control" data-student="${studentName}" data-metric="${metric}">
                    <button class="segment-btn state-poor" data-val="-1" title="Mejorable">
                        <span class="material-symbols-rounded">trending_down</span>
                    </button>
                    <button class="segment-btn state-mid active" data-val="0" title="Bien">
                        <span class="material-symbols-rounded">check</span>
                    </button>
                    <button class="segment-btn state-great" data-val="1" title="Excelente">
                        <span class="material-symbols-rounded">star</span>
                    </button>
                </div>
            </div>
        `;

        item.innerHTML = `
            <div class="student-info interactive" title="Ver progreso">
                <div class="student-avatar">${getInitials(studentName)}</div>
                <div class="student-name">${studentName}</div>
            </div>
            <div class="eval-controls">
                ${createControl('oi', 'Oral')}
                ${createControl('te', 'Task')}
                ${createControl('sc', 'Social')}
            </div>
        `;

        // Click on student info opens stats
        item.querySelector('.student-info').addEventListener('click', () => {
            renderStudentStats(studentName);
        });

        studentList.appendChild(item);
    });

    mainContent.appendChild(content);

    // Event Listeners
    document.getElementById('back-to-home').addEventListener('click', renderHome);
    document.getElementById('save-evaluation').addEventListener('click', saveEvaluation);

    // Delegate events for segment buttons
    studentList.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (!btn) return;

        const container = btn.closest('.eval-segment-control');
        const student = container.getAttribute('data-student');
        const metric = container.getAttribute('data-metric');
        const newVal = parseInt(btn.getAttribute('data-val'));

        // Update state
        state.evaluations[student][metric] = newVal;

        // Update UI: deactivate siblings, activate this one
        container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        updateStatsCounter();
    });

    updateStatsCounter();
}

function updateStatsCounter() {
    const statObj = state.evaluations;
    let studentsModified = 0;
    const totalStudents = Object.keys(statObj).length;
    
    // Consider 'modified' if any metric is not 0 (since 0 is the default "everyone worked well")
    // Or, count how many students have been "reviewed" (all start as assessed by default in this model)
    for (const student in statObj) {
        const s = statObj[student];
        if (s.oi !== 0 || s.te !== 0 || s.sc !== 0) {
            studentsModified++;
        }
    }

    const counterEl = document.getElementById('eval-count');
    if (counterEl) {
        counterEl.textContent = `${studentsModified}/${totalStudents}`;
    }
}


async function saveEvaluation() {
    const saveData = {
        classId: state.currentClass,
        date: new Date().toISOString(),
        evaluations: state.evaluations
    };
    
    if (!CONFIG.API_URL) {
        showToast("Error: URL de API no configurada.");
        return;
    }

    const saveBtn = document.getElementById('save-evaluation');
    const originalText = saveBtn.innerHTML;
    
    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="material-symbols-rounded spinning">sync</span> Guardant...';
        
        // We use text/plain to avoid CORS preflight issues with GAS
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            mode: 'no-cors', // GAS needs no-cors or specialized headers for simple POSTs
            body: JSON.stringify(saveData)
        });

        // With no-cors, we can't see the response body, but if it doesn't throw, it's usually fine
        showToast("Avaluació enviada a Google Sheets!");
        
        // Backup to local storage too
        const existing = JSON.parse(localStorage.getItem('classTracker_evaluations') || '[]');
        existing.push(saveData);
        localStorage.setItem('classTracker_evaluations', JSON.stringify(existing));

        setTimeout(() => {
            renderHome();
        }, 1500);

    } catch (error) {
        console.error("Save error:", error);
        showToast("Error al guardar. Revisa la conexió.");
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// --- Statistics Logic ---
const tplStats = document.getElementById('screen-student-stats');

function renderStudentStats(studentName) {
    const parentClass = state.currentClass;
    state.currentScreen = 'stats';
    
    // Clear main content
    Array.from(mainContent.children).forEach(child => {
        if (child.id !== 'loader') child.remove();
    });

    const content = tplStats.content.cloneNode(true);
    
    content.getElementById('stats-student-name').textContent = studentName;
    
    // Calculate Stats
    const history = evalHistory.filter(h => h.studentName === studentName);
    const count = history.length;
    
    content.getElementById('total-sessions').textContent = count;
    
    if (count > 0) {
        const sum = history.reduce((acc, curr) => ({
            oi: acc.oi + (Number(curr.oi) || 0),
            te: acc.te + (Number(curr.te) || 0),
            sc: acc.sc + (Number(curr.sc) || 0)
        }), { oi: 0, te: 0, sc: 0 });

        const avgs = {
            oi: (sum.oi / count).toFixed(1),
            te: (sum.te / count).toFixed(1),
            sc: (sum.sc / count).toFixed(1)
        };

        // Update UI
        const updateBar = (metric, val) => {
            const el = content.getElementById(`avg-${metric}`);
            const bar = content.getElementById(`bar-${metric}`);
            el.textContent = (val > 0 ? '+' : '') + val;
            
            // Map -1..1 to 0%..100% (with 0 as 50%)
            const percentage = ((parseFloat(val) + 1) / 2) * 100;
            bar.style.width = `${percentage}%`;
            
            // Colors
            if (val > 0.3) bar.style.backgroundColor = 'var(--secondary)';
            else if (val < -0.3) bar.style.backgroundColor = '#fecaca'; // red-ish
            else bar.style.backgroundColor = 'var(--primary-light)';
        };

        updateBar('oi', avgs.oi);
        updateBar('te', avgs.te);
        updateBar('sc', avgs.sc);
    } else {
        // No history state
        ['oi', 'te', 'sc'].forEach(m => {
            content.getElementById(`bar-${m}`).style.width = '50%';
            content.getElementById(`avg-${m}`).textContent = '0.0';
        });
    }

    mainContent.appendChild(content);

    document.getElementById('back-to-eval').addEventListener('click', () => {
        renderEvaluation(parentClass);
    });
}
let toastTimeout;
function showToast(msg) {
    toastMessage.textContent = msg;
    toastEl.classList.remove('hidden');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3000);
}

// Ensure the app initializes when the script runs
window.addEventListener('DOMContentLoaded', init);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered', reg))
            .catch(err => console.log('SW Error', err));
    });
}
