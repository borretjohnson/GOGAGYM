/**
 * GOGAGYM Mini App - Полный функционал
 */

const TelegramWebApp = window.Telegram.WebApp;

// Данные приложения
let appData = {
    user: { id: 0, name: 'ВОИН', joinedDate: null },
    stats: { workouts: 0, calories: 0, streak: 0, lastWorkoutDate: null },
    progress: [],
    workoutHistory: [],
    goal: null,
    water: { current: 0, goal: 2000, lastReset: null },
    checklist: [],
    notes: '',
    achievements: []
};

// Достижения
const ACHIEVEMENTS = {
    first_blood: { icon: '🩸', name: 'Первая кровь', desc: 'Первая тренировка' },
    week_warrior: { icon: '🔥', name: '7 дней в аду', desc: 'Неделя подряд' },
    immortal: { icon: '💀', name: 'Бессмертный', desc: '30 дней подряд' },
    steel: { icon: '⚡', name: 'Стальной характер', desc: '50 тренировок' },
    water_master: { icon: '💧', name: 'Водный бог', desc: '2л воды за день' },
    goal_setter: { icon: '🎯', name: 'Целеуказатель', desc: 'Поставить цель' }
};

// Упражнения
const EXERCISES_DB = [
    { name: 'Бёрпи', icon: '🤸', desc: 'Полное тело, кардио + сила', sets: '4×15' },
    { name: 'Приседания', icon: '🏋️', desc: 'Ноги и ягодицы', sets: '4×20' },
    { name: 'Отжимания', icon: '💪', desc: 'Грудь, трицепс, плечи', sets: '4×15' },
    { name: 'Планка', icon: '🧘', desc: 'Пресс, кор', sets: '3×60сек' },
    { name: 'Скалолаз', icon: '🧗', desc: 'Пресс + кардио', sets: '3×40сек' },
    { name: 'Выпады', icon: '🦵', desc: 'Ноги, баланс', sets: '3×12' },
    { name: 'Подтягивания', icon: '🤲', desc: 'Спина, бицепс', sets: '4×10' },
    { name: 'Скручивания', icon: '🌀', desc: 'Пресс', sets: '4×25' }
];

// Тренировка
let workoutState = {
    currentRound: 1,
    totalRounds: 5,
    currentExercise: 0,
    timer: 45,
    timerInterval: null,
    exercises: [
        { name: 'БЁРПИ', icon: '🤸', sets: '4 подхода × 15 повторений', duration: 45 },
        { name: 'ПРИСЕДАНИЯ', icon: '🏋️', sets: '4 подхода × 20 повторений', duration: 45 },
        { name: 'ОТЖИМАНИЯ', icon: '💪', sets: '4 подхода × 15 повторений', duration: 45 },
        { name: 'ПЛАНКА', icon: '🧘', sets: '3 подхода × 60 сек', duration: 60 },
        { name: 'СКАЛОЛАЗ', icon: '🧗', sets: '3 подхода × 40 сек', duration: 40 }
    ]
};

// ==================== ЗАГРУЗКА ====================

document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initParticles();
    loadData();
    updateStats();
    renderAchievements();
    renderExercises();
    updateGoalDisplay();
    updateWaterDisplay();
    renderProgressHistory();
    renderWorkoutHistory();
    document.getElementById('notes-text').value = appData.notes || '';
});

function initTelegram() {
    TelegramWebApp.ready();
    TelegramWebApp.expand();
    
    const user = TelegramWebApp.initDataUnsafe?.user;
    if (user) {
        appData.user.name = user.first_name || 'ВОИН';
        appData.user.id = user.id;
        if (!appData.user.joinedDate) {
            appData.user.joinedDate = new Date().toISOString();
        }
    }
    
    document.getElementById('user-name').textContent = appData.user.name.toUpperCase();
    TelegramWebApp.setHeaderColor('#000000');
    saveData();
}

function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ==================== LOCALSTORAGE ====================

function loadData() {
    const saved = localStorage.getItem('gogagym_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appData = { ...appData, ...parsed };
            
            // Сброс воды если новый день
            const today = new Date().toDateString();
            if (appData.water.lastReset !== today) {
                appData.water.current = 0;
                appData.water.lastReset = today;
            }
            
            // Сброс чек-листа если новый день
            if (appData.checklistDate !== today) {
                appData.checklist = [];
                appData.checklistDate = today;
            }
        } catch (e) {
            console.error('Ошибка загрузки:', e);
        }
    }
}

function saveData() {
    localStorage.setItem('gogagym_data', JSON.stringify(appData));
}

// ==================== НАВИГАЦИЯ ====================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        const screens = ['screen-home', 'screen-workout', 'screen-progress', 'screen-more'];
        btn.classList.toggle('active', screens[i] === screenId);
    });
    
    if (screenId === 'screen-workout') initWorkout();
    if (screenId === 'screen-progress') {
        updateMeasurements();
        renderCalendar();
        renderProgressHistory();
    }
    
    TelegramWebApp.HapticFeedback?.impactOccurred('light');
}

// ==================== СТАТИСТИКА ====================

function updateStats() {
    animateNumber('stat-workouts', appData.stats.workouts);
    animateNumber('stat-calories', appData.stats.calories);
    animateNumber('stat-streak', appData.stats.streak);
}

function animateNumber(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ==================== ДОСТИЖЕНИЯ ====================

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    Object.entries(ACHIEVEMENTS).forEach(([key, ach]) => {
        const unlocked = appData.achievements?.includes(key);
        const item = document.createElement('div');
        item.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <span class="achievement-icon">${ach.icon}</span>
            <span class="achievement-name">${ach.name}</span>
        `;
        grid.appendChild(item);
    });
}

function checkAchievements() {
    let unlocked = [];
    
    if (appData.stats.workouts >= 1 && !appData.achievements?.includes('first_blood')) {
        unlocked.push('first_blood');
    }
    if (appData.stats.streak >= 7 && !appData.achievements?.includes('week_warrior')) {
        unlocked.push('week_warrior');
    }
    if (appData.stats.streak >= 30 && !appData.achievements?.includes('immortal')) {
        unlocked.push('immortal');
    }
    if (appData.stats.workouts >= 50 && !appData.achievements?.includes('steel')) {
        unlocked.push('steel');
    }
    if (appData.water.current >= appData.water.goal && !appData.achievements?.includes('water_master')) {
        unlocked.push('water_master');
    }
    if (appData.goal && !appData.achievements?.includes('goal_setter')) {
        unlocked.push('goal_setter');
    }
    
    if (unlocked.length > 0) {
        appData.achievements = [...(appData.achievements || []), ...unlocked];
        saveData();
        renderAchievements();
        showAchievement(ACHIEVEMENTS[unlocked[0]].name);
    }
}

function showAchievement(name) {
    const banner = document.createElement('div');
    banner.className = 'achievement-banner';
    banner.style.cssText = `
        position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
        background: var(--bg-card); border: 1px solid var(--primary-red);
        padding: 15px 30px; z-index: 1000; text-align: center;
        box-shadow: 0 0 30px var(--glow-color);
    `;
    banner.innerHTML = `🏆 <b style="color: var(--primary-red)">${name}</b>`;
    document.body.appendChild(banner);
    TelegramWebApp.HapticFeedback?.notificationOccurred('success');
    setTimeout(() => banner.remove(), 3000);
}

// ==================== ТРЕНИРОВКА ====================

function initWorkout() {
    workoutState.currentRound = 1;
    workoutState.currentExercise = 0;
    workoutState.timer = workoutState.exercises[0].duration;
    document.getElementById('protocol-num').textContent = '#' + Math.floor(Math.random() * 900 + 100);
    updateExerciseDisplay();
    startTimer();
}

function updateExerciseDisplay() {
    const ex = workoutState.exercises[workoutState.currentExercise];
    document.getElementById('exercise-name').textContent = ex.name;
    document.getElementById('exercise-icon').textContent = ex.icon;
    document.getElementById('exercise-sets').textContent = ex.sets;
    document.getElementById('round-current').textContent = workoutState.currentRound;
    document.getElementById('round-total').textContent = workoutState.totalRounds;
    
    const progress = ((workoutState.currentRound - 1) * 5 + workoutState.currentExercise) / 25 * 100;
    document.getElementById('workout-progress-fill').style.width = progress + '%';
}

function startTimer() {
    if (workoutState.timerInterval) clearInterval(workoutState.timerInterval);
    workoutState.timer = workoutState.exercises[workoutState.currentExercise].duration;
    updateTimerDisplay();
    
    workoutState.timerInterval = setInterval(() => {
        workoutState.timer--;
        updateTimerDisplay();
        if (workoutState.timer <= 0) {
            clearInterval(workoutState.timerInterval);
            setTimeout(() => nextExercise(), 500);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const el = document.getElementById('round-timer');
    el.textContent = workoutState.timer;
    el.style.animation = workoutState.timer <= 10 ? 'pulse 0.5s infinite' : '';
}

function completeSet() {
    TelegramWebApp.HapticFeedback?.notificationOccurred('success');
    showToast('✅ УНИЧТОЖЕНО!');
    nextExercise();
}

function skipExercise() {
    TelegramWebApp.HapticFeedback?.impactOccurred('medium');
    nextExercise();
}

function nextExercise() {
    workoutState.currentExercise++;
    if (workoutState.currentExercise >= workoutState.exercises.length) {
        workoutState.currentExercise = 0;
        workoutState.currentRound++;
        if (workoutState.currentRound > workoutState.totalRounds) {
            finishWorkout();
            return;
        }
    }
    updateExerciseDisplay();
    startTimer();
}

function finishWorkout() {
    clearInterval(workoutState.timerInterval);
    appData.stats.workouts++;
    appData.stats.calories += 400;
    
    const today = new Date().toDateString();
    if (appData.stats.lastWorkoutDate !== today) {
        appData.stats.streak++;
        appData.stats.lastWorkoutDate = today;
    }
    
    appData.workoutHistory.unshift({
        date: new Date().toISOString(),
        calories: 400,
        rounds: workoutState.currentRound
    });
    
    saveData();
    updateStats();
    checkAchievements();
    showToast('🔥 ТРЕНИРОВКА ЗАВЕРШЕНА!');
    setTimeout(() => showScreen('screen-home'), 2000);
}

// ==================== ПРОГРЕСС ====================

function updateMeasurements() {
    if (appData.progress.length > 0) {
        const p = appData.progress[0];
        document.getElementById('measure-weight').textContent = p.weight || '--';
        document.getElementById('measure-chest').textContent = p.chest || '--';
        document.getElementById('measure-waist').textContent = p.waist || '--';
        document.getElementById('measure-hips').textContent = p.hips || '--';
    }
}

function saveProgress(e) {
    e.preventDefault();
    appData.progress.unshift({
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(document.getElementById('input-weight').value) || null,
        chest: parseFloat(document.getElementById('input-chest').value) || null,
        waist: parseFloat(document.getElementById('input-waist').value) || null,
        hips: parseFloat(document.getElementById('input-hips').value) || null
    });
    if (appData.progress.length > 30) appData.progress = appData.progress.slice(0, 30);
    saveData();
    updateMeasurements();
    renderProgressHistory();
    document.getElementById('progress-form').reset();
    showToast('📊 ДАННЫЕ СОХРАНЕНЫ');
    setTimeout(() => showScreen('screen-progress'), 500);
}

function renderProgressHistory() {
    const list = document.getElementById('progress-history');
    if (!list) return;
    list.innerHTML = '';
    if (appData.progress.length === 0) {
        list.innerHTML = '<div style="color:var(--text-secondary);text-align:center;">Нет записей</div>';
        return;
    }
    appData.progress.slice(0, 10).forEach(p => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="history-date">${p.date}</span>
            <span class="history-data">${p.weight ? p.weight + 'кг' : ''}</span>
        `;
        list.appendChild(item);
    });
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.style.visibility = 'hidden';
        grid.appendChild(cell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;
        
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (appData.workoutHistory.some(w => w.date.startsWith(dateStr))) {
            cell.classList.add('has-workout');
        }
        if (day === today.getDate()) cell.classList.add('today');
        grid.appendChild(cell);
    }
}

function renderWorkoutHistory() {
    const list = document.getElementById('workout-history');
    if (!list) return;
    list.innerHTML = '';
    if (appData.workoutHistory.length === 0) {
        list.innerHTML = '<div style="color:var(--text-secondary);text-align:center;">Нет тренировок</div>';
        return;
    }
    appData.workoutHistory.slice(0, 20).forEach(w => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(w.date).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        item.innerHTML = `
            <span class="history-date">${date}</span>
            <span class="history-data">${w.calories} ккал</span>
        `;
        list.appendChild(item);
    });
}

// ==================== ЦЕЛИ ====================

function setGoal(goal) {
    appData.goal = goal;
    saveData();
    updateGoalDisplay();
    checkAchievements();
    
    document.querySelectorAll('.goal-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.goal === goal);
    });
    
    showToast('🎯 ЦЕЛЬ УСТАНОВЛЕНА!');
}

function updateGoalDisplay() {
    const goals = {
        burn: { icon: '🔥', text: 'СЖИГАНИЕ ЖИРА' },
        gain: { icon: '💪', text: 'НАБОР МАССЫ' },
        endurance: { icon: '⚡', text: 'ВЫНОСЛИВОСТЬ' },
        strength: { icon: '🏋️', text: 'СИЛА' }
    };
    
    const goal = appData.goal ? goals[appData.goal] : null;
    document.getElementById('goal-display-icon').textContent = goal?.icon || '❓';
    document.getElementById('goal-display-text').textContent = goal?.text || 'Не выбрана';
    
    document.querySelectorAll('.goal-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.goal === appData.goal);
    });
}

function toggleCheck(el) {
    el.classList.toggle('checked');
    TelegramWebApp.HapticFeedback?.impactOccurred('light');
}

// ==================== ВОДА ====================

function addWater(amount) {
    appData.water.current = Math.max(0, appData.water.current + amount);
    saveData();
    updateWaterDisplay();
    checkAchievements();
}

function resetWater() {
    appData.water.current = 0;
    saveData();
    updateWaterDisplay();
    showToast('🔄 СБРОШЕНО');
}

function updateWaterDisplay() {
    document.getElementById('water-current').textContent = appData.water.current;
    document.getElementById('water-goal').textContent = appData.water.goal;
    
    const percent = Math.min(100, (appData.water.current / appData.water.goal) * 100);
    document.getElementById('water-fill').style.height = percent + '%';
}

// ==================== КАЛЬКУЛЯТОР ====================

function calculateCalories(e) {
    e.preventDefault();
    
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const height = parseFloat(document.getElementById('calc-height').value);
    const age = parseFloat(document.getElementById('calc-age').value);
    const activity = parseFloat(document.getElementById('calc-activity').value);
    
    // Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'male' ? 5 : -161;
    
    const tdee = Math.round(bmr * activity);
    
    document.getElementById('result-bmr').textContent = Math.round(bmr);
    document.getElementById('result-tdee').textContent = tdee;
    document.getElementById('result-deficit').textContent = Math.round(tdee * 0.85);
    document.getElementById('result-surplus').textContent = Math.round(tdee * 1.15);
    
    document.getElementById('calc-result').style.display = 'flex';
    showToast('🧮 ГОТОВО!');
}

// ==================== УПРАЖНЕНИЯ ====================

function renderExercises() {
    const list = document.getElementById('exercises-list');
    if (!list) return;
    list.innerHTML = '';
    
    EXERCISES_DB.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.innerHTML = `
            <span class="exercise-item-icon">${ex.icon}</span>
            <div class="exercise-item-info">
                <div class="exercise-item-name">${ex.name}</div>
                <div class="exercise-item-desc">${ex.desc} • ${ex.sets}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

// ==================== ЗАМЕТКИ ====================

function saveNotes() {
    appData.notes = document.getElementById('notes-text').value;
    saveData();
    document.getElementById('notes-saved').style.display = 'block';
    setTimeout(() => {
        document.getElementById('notes-saved').style.display = 'none';
    }, 2000);
    showToast('💾 СОХРАНЕНО!');
}

// ==================== TOAST ====================

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Глобальные функции
window.showScreen = showScreen;
window.completeSet = completeSet;
window.skipExercise = skipExercise;
window.saveProgress = saveProgress;
window.setGoal = setGoal;
window.toggleCheck = toggleCheck;
window.addWater = addWater;
window.resetWater = resetWater;
window.calculateCalories = calculateCalories;
window.saveNotes = saveNotes;
