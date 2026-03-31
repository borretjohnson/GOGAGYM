/**
 * GOGAGYM Mini App - JavaScript
 * Полностью автономное приложение с localStorage
 */

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

const TelegramWebApp = window.Telegram.WebApp;

// Структура данных
let appData = {
    user: {
        id: 0,
        name: 'ВОИН',
        joinedDate: null
    },
    stats: {
        workouts: 0,
        calories: 0,
        streak: 0,
        lastWorkoutDate: null
    },
    progress: [],
    certificates: [],
    achievements: [],
    workoutHistory: []
};

// Данные текущей тренировки
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

// Базовые сертификаты
const BASE_CERTIFICATES = [
    { name: 'Анатомия для тренера', issuer: 'Evotren', status: 'completed', date: '2024-01-15' },
    { name: 'Нутрициология', issuer: 'Evotren', status: 'completed', date: '2024-02-20' },
    { name: 'Функциональный тренинг', issuer: 'Evotren', status: 'in_progress', date: null },
    { name: 'Биомеханика движений', issuer: 'Evotren', status: 'locked', date: null },
    { name: 'Периодизация тренировок', issuer: 'Evotren', status: 'locked', date: null },
    { name: 'Реабилитация и восстановление', issuer: 'Evotren', status: 'locked', date: null },
    { name: 'Спортивная физиология', issuer: 'Evotren', status: 'locked', date: null },
    { name: 'Психология мотивации', issuer: 'Evotren', status: 'locked', date: null },
    { name: 'Элитный тренер', issuer: 'Evotren', status: 'locked', date: null }
];

// Достижения
const ACHIEVEMENTS = {
    first_blood: { name: 'Первая кровь', desc: 'Первая тренировка', unlocked: false },
    week_warrior: { name: '7 дней в аду', desc: 'Неделя тренировок подряд', unlocked: false },
    immortal: { name: 'Бессмертный', desc: '30 дней подряд', unlocked: false },
    steel_character: { name: 'Стальной характер', desc: '50 тренировок', unlocked: false }
};

// ==================== ЗАГРУЗКА ====================

document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initParticles();
    loadData();
    renderCerts();
    renderCalendar();
    updateStats();
    checkAchievements();
});

// ==================== TELEGRAM INTEGRATION ====================

function initTelegram() {
    TelegramWebApp.ready();
    TelegramWebApp.expand();
    
    // Получаем данные пользователя из Telegram
    const user = TelegramWebApp.initDataUnsafe?.user;
    if (user) {
        appData.user.name = user.first_name || 'ВОИН';
        appData.user.id = user.id;
        appData.user.joinedDate = new Date().toISOString();
    }
    
    // Обновляем UI
    document.getElementById('user-name').textContent = appData.user.name.toUpperCase();
    
    // Настраиваем цвета
    TelegramWebApp.setHeaderColor('#000000');
    
    // Сохраняем при первом запуске
    saveData();
}

// ==================== LOCALSTORAGE ====================

function loadData() {
    const saved = localStorage.getItem('gogagym_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appData = { ...appData, ...parsed };
            
            // Восстанавливаем достижения
            if (appData.achievements) {
                appData.achievements.forEach(key => {
                    if (ACHIEVEMENTS[key]) ACHIEVEMENTS[key].unlocked = true;
                });
            }
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
    
    // Инициализируем сертификаты если нет
    if (!appData.certificates || appData.certificates.length === 0) {
        appData.certificates = [...BASE_CERTIFICATES];
    }
}

function saveData() {
    try {
        localStorage.setItem('gogagym_data', JSON.stringify(appData));
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
    }
}

// ==================== НАВИГАЦИЯ ====================

function showScreen(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем нужный
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
    
    // Обновляем навигацию
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const navMap = {
        'screen-home': 0,
        'screen-workout': 1,
        'screen-progress': 2,
        'screen-certs': 3
    };
    
    const navIndex = navMap[screenId];
    if (navIndex !== undefined) {
        document.querySelectorAll('.nav-btn')[navIndex]?.classList.add('active');
    }
    
    // Если экран тренировки - запускаем
    if (screenId === 'screen-workout') {
        initWorkout();
    }
    
    // Если прогресс - обновляем
    if (screenId === 'screen-progress') {
        updateMeasurements();
        renderCalendar();
    }
    
    // Haptic feedback
    TelegramWebApp.HapticFeedback?.impactOccurred('light');
}

// ==================== ЧАСТИЦЫ ====================

function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ==================== СТАТИСТИКА ====================

function updateStats() {
    animateNumber('stat-workouts', appData.stats.workouts);
    animateNumber('stat-calories', appData.stats.calories);
    animateNumber('stat-streak', appData.stats.streak);
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ==================== ТРЕНИРОВКА ====================

function initWorkout() {
    workoutState.currentRound = 1;
    workoutState.currentExercise = 0;
    workoutState.timer = workoutState.exercises[0].duration;
    
    const protocolNum = Math.floor(Math.random() * 900) + 100;
    document.getElementById('protocol-num').textContent = '#' + protocolNum;
    
    updateExerciseDisplay();
    startTimer();
}

function updateExerciseDisplay() {
    const exercise = workoutState.exercises[workoutState.currentExercise];
    
    document.getElementById('exercise-name').textContent = exercise.name;
    document.getElementById('exercise-icon').textContent = exercise.icon;
    document.getElementById('exercise-sets').textContent = exercise.sets;
    document.getElementById('round-current').textContent = workoutState.currentRound;
    document.getElementById('round-total').textContent = workoutState.totalRounds;
    
    const progress = ((workoutState.currentRound - 1) * workoutState.exercises.length + workoutState.currentExercise) / 
                     (workoutState.totalRounds * workoutState.exercises.length) * 100;
    document.getElementById('workout-progress-fill').style.width = progress + '%';
}

function startTimer() {
    if (workoutState.timerInterval) {
        clearInterval(workoutState.timerInterval);
    }
    
    const exercise = workoutState.exercises[workoutState.currentExercise];
    workoutState.timer = exercise.duration;
    
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
    const timerElement = document.getElementById('round-timer');
    timerElement.textContent = workoutState.timer;
    
    if (workoutState.timer <= 10) {
        timerElement.style.animation = 'pulse 0.5s infinite';
    } else {
        timerElement.style.animation = '';
    }
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
    
    // Обновляем статистику
    appData.stats.workouts++;
    appData.stats.calories += 400;
    
    const today = new Date().toDateString();
    if (appData.stats.lastWorkoutDate !== today) {
        appData.stats.streak++;
        appData.stats.lastWorkoutDate = today;
    }
    
    // Добавляем в историю
    appData.workoutHistory.push({
        date: new Date().toISOString(),
        calories: 400,
        rounds: workoutState.currentRound
    });
    
    saveData();
    updateStats();
    checkAchievements();
    
    showToast('🔥 ТРЕНИРОВКА ЗАВЕРШЕНА!');
    
    setTimeout(() => {
        showScreen('screen-home');
    }, 2000);
}

function checkAchievements() {
    let unlocked = [];
    
    if (appData.stats.workouts >= 1 && !ACHIEVEMENTS.first_blood.unlocked) {
        ACHIEVEMENTS.first_blood.unlocked = true;
        unlocked.push('first_blood');
    }
    
    if (appData.stats.streak >= 7 && !ACHIEVEMENTS.week_warrior.unlocked) {
        ACHIEVEMENTS.week_warrior.unlocked = true;
        unlocked.push('week_warrior');
    }
    
    if (appData.stats.streak >= 30 && !ACHIEVEMENTS.immortal.unlocked) {
        ACHIEVEMENTS.immortal.unlocked = true;
        unlocked.push('immortal');
    }
    
    if (appData.stats.workouts >= 50 && !ACHIEVEMENTS.steel_character.unlocked) {
        ACHIEVEMENTS.steel_character.unlocked = true;
        unlocked.push('steel_character');
    }
    
    if (unlocked.length > 0) {
        // Сохраняем достижения
        appData.achievements = Object.keys(ACHIEVEMENTS).filter(k => ACHIEVEMENTS[k].unlocked);
        saveData();
        
        // Показываем первое новое достижение
        const firstNew = unlocked[0];
        showAchievement(ACHIEVEMENTS[firstNew].name);
    }
}

function showAchievement(name) {
    const banner = document.getElementById('achievement-banner');
    const text = document.getElementById('achievement-text');
    
    text.textContent = 'РАЗБЛОКИРОВАНО: ' + name;
    banner.style.display = 'block';
    
    TelegramWebApp.HapticFeedback?.notificationOccurred('success');
    
    setTimeout(() => {
        banner.style.display = 'none';
    }, 4000);
}

// ==================== ПРОГРЕСС ====================

function updateMeasurements() {
    if (appData.progress.length > 0) {
        const latest = appData.progress[0];
        document.getElementById('measure-weight').textContent = latest.weight || '--';
        document.getElementById('measure-chest').textContent = latest.chest || '--';
        document.getElementById('measure-waist').textContent = latest.waist || '--';
        document.getElementById('measure-hips').textContent = latest.hips || '--';
    }
}

function saveProgress(event) {
    event.preventDefault();
    
    const weight = parseFloat(document.getElementById('input-weight').value);
    const chest = parseFloat(document.getElementById('input-chest').value);
    const waist = parseFloat(document.getElementById('input-waist').value);
    const hips = parseFloat(document.getElementById('input-hips').value);
    
    appData.progress.unshift({
        date: new Date().toISOString().split('T')[0],
        weight: weight || null,
        chest: chest || null,
        waist: waist || null,
        hips: hips || null
    });
    
    // Оставляем только последние 30 записей
    if (appData.progress.length > 30) {
        appData.progress = appData.progress.slice(0, 30);
    }
    
    saveData();
    updateMeasurements();
    renderCalendar();
    
    document.getElementById('progress-form').reset();
    
    showToast('📊 ДАННЫЕ СОХРАНЕНЫ');
    TelegramWebApp.HapticFeedback?.notificationOccurred('success');
    
    setTimeout(() => {
        showScreen('screen-progress');
    }, 500);
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    // Пустые ячейки
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.style.visibility = 'hidden';
        grid.appendChild(cell);
    }
    
    // Дни
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;
        
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasWorkout = appData.workoutHistory.some(w => w.date.startsWith(dateStr));
        
        if (hasWorkout) {
            cell.classList.add('has-workout');
        }
        
        if (day === today.getDate()) {
            cell.classList.add('today');
        }
        
        grid.appendChild(cell);
    }
}

// ==================== СЕРТИФИКАТЫ ====================

function renderCerts() {
    const list = document.getElementById('certs-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const statusIcons = { completed: '✅', in_progress: '🔄', locked: '🔒' };
    let completed = 0;
    
    appData.certificates.forEach(cert => {
        if (cert.status === 'completed') completed++;
        
        const card = document.createElement('div');
        card.className = `cert-card ${cert.status}`;
        
        card.innerHTML = `
            <div class="cert-info">
                <div class="cert-name">${cert.name}</div>
                <div class="cert-issuer">${cert.issuer}</div>
            </div>
            <div class="cert-status">${statusIcons[cert.status]}</div>
        `;
        
        list.appendChild(card);
    });
    
    document.getElementById('certs-progress-value').textContent = `${completed}/${appData.certificates.length}`;
    document.getElementById('certs-progress-fill').style.width = (completed / appData.certificates.length * 100) + '%';
}

// ==================== TOAST ====================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Глобальные функции
window.showScreen = showScreen;
window.completeSet = completeSet;
window.skipExercise = skipExercise;
window.saveProgress = saveProgress;
