/**
 * GOGAGYM — Premium Fitness App v2
 * Веса, Питание, Сон, 1ПМ калькулятор
 */

const TelegramWebApp = window.Telegram.WebApp;

// ==================== БАЗА ДАННЫХ ====================

const EXERCISES_DB = [
    { id: 'bench_press', name: 'Жим штанги лёжа', icon: '🏋️', muscles: 'Грудь, трицепс, плечи', desc: 'Базовое упражнение для грудных', level: 'beginner' },
    { id: 'incline_press', name: 'Жим на наклонной', icon: '🏋️', muscles: 'Верх груди', desc: 'Акцент на верхнюю часть', level: 'intermediate' },
    { id: 'dips', name: 'Отжимания на брусьях', icon: '🤲', muscles: 'Низ груди, трицепс', desc: 'База для низа груди', level: 'intermediate' },
    { id: 'flyes', name: 'Разводка гантелей', icon: '🦋', muscles: 'Грудь', desc: 'Изоляция + растяжение', level: 'beginner' },
    { id: 'deadlift', name: 'Становая тяга', icon: '💀', muscles: 'Вся спина, ноги', desc: 'Король упражнений', level: 'advanced' },
    { id: 'pullups', name: 'Подтягивания', icon: '🤲', muscles: 'Широчайшие', desc: 'База для спины', level: 'beginner' },
    { id: 'barbell_row', name: 'Тяга штанги в наклоне', icon: '🏋️', muscles: 'Спина', desc: 'Для толщины спины', level: 'intermediate' },
    { id: 'lat_pulldown', name: 'Тяга верхнего блока', icon: '🔽', muscles: 'Широчайшие', desc: 'Для ширины спины', level: 'beginner' },
    { id: 'squat', name: 'Приседания со штангой', icon: '🏋️', muscles: 'Ноги, ягодицы', desc: 'Король на ноги', level: 'intermediate' },
    { id: 'leg_press', name: 'Жим ногами', icon: '🦵', muscles: 'Квадрицепс', desc: 'Базовое в тренажёре', level: 'beginner' },
    { id: 'lunges', name: 'Выпады', icon: '🚶', muscles: 'Ноги', desc: 'Для формы и баланса', level: 'beginner' },
    { id: 'leg_curl', name: 'Сгибание ног', icon: '🦵', muscles: 'Бицепс бедра', desc: 'Изоляция', level: 'beginner' },
    { id: 'ohp', name: 'Армейский жим', icon: '🏋️', muscles: 'Плечи', desc: 'База на плечи', level: 'intermediate' },
    { id: 'lateral_raise', name: 'Махи в стороны', icon: '🦋', muscles: 'Средние дельты', desc: 'Для ширины плеч', level: 'beginner' },
    { id: 'face_pull', name: 'Face Pull', icon: '🔙', muscles: 'Задние дельты', desc: 'Для осанки', level: 'beginner' },
    { id: 'barbell_curl', name: 'Подъём штанги на бицепс', icon: '💪', muscles: 'Бицепс', desc: 'База на бицепс', level: 'beginner' },
    { id: 'hammer_curl', name: 'Молотки', icon: '🔨', muscles: 'Бицепс, брахиалис', desc: 'Для толщины руки', level: 'beginner' },
    { id: 'tricep_pushdown', name: 'Разгибание на блоке', icon: '🔽', muscles: 'Трицепс', desc: 'Изоляция', level: 'beginner' },
    { id: 'skull_crusher', name: 'Французский жим', icon: '💀', muscles: 'Трицепс', desc: 'Для массы', level: 'intermediate' },
    { id: 'crunch', name: 'Скручивания', icon: '🌀', muscles: 'Пресс', desc: 'База для пресса', level: 'beginner' },
    { id: 'leg_raise', name: 'Подъём ног', icon: '🦵', muscles: 'Низ пресса', desc: 'Для низа', level: 'intermediate' },
    { id: 'plank', name: 'Планка', icon: '🧘', muscles: 'Кор', desc: 'Статика', level: 'beginner' }
];

const PROGRAMS = {
    fullbody: { name: 'FULL BODY', level: 'beginner', icon: '💪', desc: 'Всё тело за одну тренировку', duration: '60 мин', exercises: ['squat', 'bench_press', 'barbell_row', 'ohp', 'deadlift', 'plank'] },
    upper: { name: 'ВЕРХ ТЕЛА', level: 'intermediate', icon: '🦾', desc: 'Грудь, спина, плечи, руки', duration: '55 мин', exercises: ['bench_press', 'pullups', 'ohp', 'barbell_row', 'barbell_curl', 'tricep_pushdown'] },
    lower: { name: 'НИЗ ТЕЛА', level: 'intermediate', icon: '🦵', desc: 'Ноги и ягодицы', duration: '60 мин', exercises: ['squat', 'leg_press', 'lunges', 'leg_curl', 'crunch', 'leg_raise'] },
    push: { name: 'PUSH DAY', level: 'intermediate', icon: '🔥', desc: 'Жимовые: грудь, плечи, трицепс', duration: '50 мин', exercises: ['bench_press', 'incline_press', 'ohp', 'lateral_raise', 'tricep_pushdown', 'dips'] },
    pull: { name: 'PULL DAY', level: 'intermediate', icon: '💀', desc: 'Тяговые: спина, бицепс', duration: '50 мин', exercises: ['deadlift', 'pullups', 'barbell_row', 'lat_pulldown', 'barbell_curl', 'face_pull'] },
    beginner_full: { name: 'ДЛЯ НОВИЧКОВ', level: 'beginner', icon: '🌟', desc: 'Старт для начинающих', duration: '45 мин', exercises: ['bodyweight_squat', 'pushups', 'lat_pulldown', 'leg_press', 'plank'] }
};

const ACHIEVEMENTS = {
    first_blood: { icon: '🩸', name: 'Первая кровь', desc: 'Первая тренировка' },
    week_warrior: { icon: '🔥', name: '7 дней в аду', desc: 'Неделя подряд' },
    immortal: { icon: '💀', name: 'Бессмертный', desc: '30 дней подряд' },
    steel: { icon: '⚡', name: 'Стальной характер', desc: '50 тренировок' },
    water_master: { icon: '💧', name: 'Водный бог', desc: '2л воды' },
    goal_setter: { icon: '🎯', name: 'Целеуказатель', desc: 'Поставить цель' },
    early_bird: { icon: '🌅', name: 'Ранняя пташка', desc: 'Тренировка до 8 утра' },
    night_owl: { icon: '🦉', name: 'Ночная сова', desc: 'Тренировка после 22:00' },
    strong: { icon: '🏋️', name: 'Силач', desc: 'Первый раз 100кг' }
};

// ==================== ДАННЫЕ ====================

let appData = {
    user: { id: 0, name: 'ВОИН', joinedDate: null, onboardingComplete: false, goal: null, place: 'gym', weight: null, height: null, age: null },
    stats: { workouts: 0, calories: 0, streak: 0, bestStreak: 0, lastWorkoutDate: null, totalMinutes: 0, xp: 0, level: 1 },
    progress: [],
    workoutHistory: [],
    weightsHistory: [],
    nutrition: { goals: { calories: 2500, protein: 150, carbs: 300, fats: 80 }, today: { calories: 0, protein: 0, carbs: 0, fats: 0 }, meals: [], lastDate: null },
    sleep: { history: [], lastNight: null },
    achievements: [],
    settings: { notifications: true, sound: true }
};

let currentWorkout = { program: null, phase: 'warmup', exerciseIndex: 0, completedExercises: [], startTime: null, timerInterval: null, restTimer: 60, restInterval: null, currentWeights: {} };

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initParticles();
    loadData();
    if (appData.user.onboardingComplete) { showApp(); } else { showOnboarding(); }
});

function initTelegram() {
    TelegramWebApp.ready();
    TelegramWebApp.expand();
    const user = TelegramWebApp.initDataUnsafe?.user;
    if (user) {
        appData.user.name = user.first_name || 'ВОИН';
        appData.user.id = user.id;
        if (!appData.user.joinedDate) appData.user.joinedDate = new Date().toISOString();
    }
    TelegramWebApp.setHeaderColor('#000000');
}

function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        container.appendChild(particle);
    }
}

// ==================== LOCALSTORAGE ====================

function loadData() {
    try {
        const saved = localStorage.getItem('gogagym_premium_v2');
        if (saved) {
            appData = { ...appData, ...JSON.parse(saved) };
            const today = new Date().toDateString();
            if (appData.stats.lastWorkoutDate !== today) {
                const lastDate = appData.stats.lastWorkoutDate ? new Date(appData.stats.lastWorkoutDate) : null;
                if (lastDate && (new Date() - lastDate) / (1000 * 60 * 60 * 24) > 2) appData.stats.streak = 0;
            }
            if (appData.nutrition.lastDate !== today) {
                appData.nutrition.today = { calories: 0, protein: 0, carbs: 0, fats: 0 };
                appData.nutrition.meals = [];
                appData.nutrition.lastDate = today;
            }
        }
    } catch (e) { console.error('❌ Load error:', e); }
}

function saveData() {
    try { localStorage.setItem('gogagym_premium_v2', JSON.stringify(appData)); }
    catch (e) { console.error('❌ Save error:', e); }
}

// ==================== ОНБОРДИНГ ====================

function showOnboarding() { document.getElementById('onboarding').style.display = 'flex'; document.getElementById('app').style.display = 'none'; }
function showApp() { document.getElementById('onboarding').style.display = 'none'; document.getElementById('app').style.display = 'flex'; updateUI(); }

function selectPlace(place) {
    appData.user.place = place;
    document.querySelectorAll('.place-btn').forEach(btn => btn.classList.toggle('selected', btn.dataset.place === place));
}

function completeOnboarding() {
    appData.user.goal = document.getElementById('onboard-goal').value;
    appData.user.weight = parseFloat(document.getElementById('onboard-weight').value) || null;
    appData.user.height = parseFloat(document.getElementById('onboard-height').value) || null;
    appData.user.age = parseFloat(document.getElementById('onboard-age').value) || null;
    appData.user.onboardingComplete = true;
    // Расчёт калорий
    if (appData.user.weight && appData.user.height && appData.user.age) {
        const bmr = 10 * appData.user.weight + 6.25 * appData.user.height - 5 * appData.user.age + 5;
        appData.nutrition.goals.calories = Math.round(bmr * 1.55);
        appData.nutrition.goals.protein = Math.round(appData.user.weight * 2);
        appData.nutrition.goals.carbs = Math.round(appData.user.weight * 4);
        appData.nutrition.goals.fats = Math.round(appData.user.weight * 1);
    }
    saveData();
    showApp();
    showToast('🚀 Добро пожаловать!');
}

// ==================== НАВИГАЦИЯ ====================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');
    const navMap = { 'screen-home': 0, 'screen-programs': 1, 'screen-profile': 2 };
    document.querySelectorAll('.nav-btn').forEach((btn, i) => btn.classList.toggle('active', i === navMap[screenId]));
    if (screenId === 'screen-home') updateHome();
    if (screenId === 'screen-programs') renderPrograms();
    if (screenId === 'screen-profile') updateProfile();
    if (screenId === 'screen-progress') updateProgress();
    if (screenId === 'screen-achievements') renderAchievements();
    if (screenId === 'screen-weights') renderWeights();
    if (screenId === 'screen-nutrition') updateNutrition();
    if (screenId === 'screen-sleep') updateSleep();
    TelegramWebApp.HapticFeedback?.impactOccurred('light');
}

// ==================== UI ====================

function updateUI() { updateHome(); updateProfile(); }

function updateHome() {
    const hour = new Date().getHours();
    const greeting = hour < 6 ? 'ДОБРОЙ НОЧИ' : hour < 12 ? 'С ДОБРЫМ УТРОМ' : hour < 18 ? 'С ДНЁМ' : 'ДОБРЫЙ ВЕЧЕР';
    document.getElementById('greeting-title').textContent = `${greeting}, ${appData.user.name.toUpperCase()}`;
    document.getElementById('header-streak').textContent = appData.stats.streak;
    const goals = { burn: '🔥 СЖИГАНИЕ', gain: '💪 МАССА', strength: '🏋️ СИЛА', relief: '⚡ РЕЛЬЕФ' };
    document.getElementById('goal-progress-value').textContent = goals[appData.user.goal] || '--';
    document.getElementById('goal-progress-bar').style.width = `${(appData.stats.workouts % 10) * 10}%`;
    const weekData = getWeekStats();
    document.getElementById('week-workouts').textContent = weekData.workouts;
    document.getElementById('week-calories').textContent = weekData.calories;
    document.getElementById('week-minutes').textContent = weekData.minutes;
    renderMiniAchievements();
}

function updateProfile() {
    document.getElementById('profile-name').textContent = appData.user.name.toUpperCase();
    document.getElementById('profile-avatar-large').textContent = appData.user.name[0]?.toUpperCase() || '👤';
    const level = Math.floor(appData.stats.xp / 1000) + 1;
    document.getElementById('profile-level-num').textContent = level;
    const xpNeeded = level * 1000;
    document.querySelector('.xp-fill').style.width = `${(appData.stats.xp / xpNeeded) * 100}%`;
    document.getElementById('xp-text').textContent = `${appData.stats.xp}/${xpNeeded} XP`;
    document.getElementById('profile-total-workouts').textContent = appData.stats.workouts;
    document.getElementById('profile-total-calories').textContent = appData.stats.calories;
    document.getElementById('profile-best-streak').textContent = appData.stats.bestStreak;
}

function getWeekStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = appData.workoutHistory.filter(w => new Date(w.date) > weekAgo);
    return { workouts: weekWorkouts.length, calories: weekWorkouts.reduce((s, w) => s + (w.calories || 0), 0), minutes: weekWorkouts.reduce((s, w) => s + (w.minutes || 45), 0) };
}

// ==================== ПРОГРАММЫ ====================

function renderPrograms(filter = 'all') {
    const grid = document.getElementById('programs-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(PROGRAMS).forEach(([id, p]) => {
        if (filter !== 'all' && p.level !== filter) return;
        const card = document.createElement('div');
        card.className = 'program-card';
        card.onclick = () => startProgram(id);
        card.innerHTML = `<div class="program-card-image">${p.icon}</div><div class="program-card-info"><h3 class="program-card-name">${p.name}</h3><p class="program-card-desc">${p.desc}</p><div class="program-card-meta"><span>⏱️ ${p.duration}</span><span>📊 ${p.exercises.length} упр.</span></div></div>`;
        grid.appendChild(card);
    });
}

function filterPrograms(level) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === level));
    renderPrograms(level === 'all' ? 'all' : level);
}

// ==================== ТРЕНИРОВКА ====================

function startProgram(programId) {
    const program = PROGRAMS[programId];
    if (!program) return;
    currentWorkout = { program: programId, phase: 'warmup', exerciseIndex: 0, completedExercises: [], startTime: Date.now(), timerInterval: null, restTimer: 60, restInterval: null, currentWeights: {} };
    document.getElementById('workout-title').textContent = program.name;
    renderWarmup();
    showScreen('screen-workout');
    showToast(`🏋️ ${program.name}: НАЧАЛИ!`);
}

function quickWorkout() { startProgram(Object.keys(PROGRAMS)[Math.floor(Math.random() * Object.keys(PROGRAMS).length)]); }

function renderWarmup() {
    const list = document.getElementById('warmup-list');
    list.innerHTML = '';
    [{ name: 'Вращение руками', icon: '🔄', duration: '30 сек' }, { name: 'Наклоны головы', icon: '📍', duration: '20 сек' }, { name: 'Вращение тазом', icon: '🔄', duration: '30 сек' }, { name: 'Бег на месте', icon: '🏃', duration: '60 сек' }].forEach(ex => {
        const item = document.createElement('div');
        item.className = 'warmup-item';
        item.innerHTML = `<span class="warmup-icon">${ex.icon}</span><span class="warmup-name">${ex.name}</span><span class="warmup-duration">${ex.duration}</span>`;
        list.appendChild(item);
    });
    document.getElementById('phase-warmup').style.display = 'block';
    document.getElementById('phase-main').style.display = 'none';
    document.getElementById('phase-cooldown').style.display = 'none';
}

function startMainWorkout() {
    currentWorkout.phase = 'main';
    document.getElementById('phase-warmup').style.display = 'none';
    document.getElementById('phase-main').style.display = 'block';
    loadExercise(0);
    startWorkoutTimer();
}

function loadExercise(index) {
    const program = PROGRAMS[currentWorkout.program];
    if (!program || index >= program.exercises.length) { startCooldown(); return; }
    const exId = program.exercises[index];
    const exercise = EXERCISES_DB.find(e => e.id === exId) || { name: 'Упражнение', icon: '🏋️', desc: '...' };
    currentWorkout.exerciseIndex = index;
    document.getElementById('exercise-num').textContent = index + 1;
    document.getElementById('exercise-total').textContent = program.exercises.length;
    document.getElementById('exercise-icon-large').textContent = exercise.icon;
    document.getElementById('exercise-title').textContent = exercise.name;
    document.getElementById('exercise-description').textContent = exercise.desc;
    document.getElementById('workout-progress').style.width = `${(index / program.exercises.length) * 100}%`;
    startRestTimer();
}

function startWorkoutTimer() {
    const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - currentWorkout.startTime) / 1000);
        document.getElementById('workout-timer-mini').textContent = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;
    };
    currentWorkout.timerInterval = setInterval(updateTimer, 1000);
}

function startRestTimer() {
    if (currentWorkout.restInterval) clearInterval(currentWorkout.restInterval);
    currentWorkout.restTimer = 60;
    updateRestTimerDisplay();
    currentWorkout.restInterval = setInterval(() => {
        currentWorkout.restTimer--;
        updateRestTimerDisplay();
        if (currentWorkout.restTimer <= 0) { clearInterval(currentWorkout.restInterval); TelegramWebApp.HapticFeedback?.notificationOccurred('success'); }
    }, 1000);
}

function updateRestTimerDisplay() {
    document.getElementById('timer-text').textContent = currentWorkout.restTimer;
    const circle = document.getElementById('timer-progress');
    circle.style.strokeDashoffset = 283 - (currentWorkout.restTimer / 60) * 283;
}

function completeExercise() {
    // Сохраняем веса
    const weights = {};
    for (let i = 1; i <= 4; i++) {
        const val = parseFloat(document.getElementById(`set-${i}-weight`)?.value) || 0;
        if (val > 0) weights[`set${i}`] = val;
    }
    if (Object.keys(weights).length > 0) {
        const exercise = EXERCISES_DB.find(e => e.id === PROGRAMS[currentWorkout.program].exercises[currentWorkout.exerciseIndex]);
        appData.weightsHistory.unshift({
            date: new Date().toISOString(),
            exercise: exercise?.name || 'Упражнение',
            weights: weights
        });
    }
    currentWorkout.completedExercises.push(currentWorkout.exerciseIndex);
    TelegramWebApp.HapticFeedback?.notificationOccurred('success');
    showToast('✅ ВЫПОЛНЕНО!');
    nextExercise();
}

function skipExercise() { TelegramWebApp.HapticFeedback?.impactOccurred('medium'); nextExercise(); }
function nextExercise() { loadExercise(currentWorkout.exerciseIndex + 1); }

function startCooldown() {
    currentWorkout.phase = 'cooldown';
    document.getElementById('phase-main').style.display = 'none';
    document.getElementById('phase-cooldown').style.display = 'block';
    const list = document.getElementById('cooldown-list');
    list.innerHTML = '';
    [{ name: 'Растяжка груди', icon: '🧘', duration: '30 сек' }, { name: 'Растяжка спины', icon: '🧘', duration: '30 сек' }, { name: 'Растяжка ног', icon: '🧘', duration: '60 сек' }].forEach(ex => {
        const item = document.createElement('div');
        item.className = 'cooldown-item';
        item.innerHTML = `<span class="cooldown-icon">${ex.icon}</span><span class="cooldown-name">${ex.name}</span><span class="cooldown-duration">${ex.duration}</span>`;
        list.appendChild(item);
    });
}

function finishWorkout() {
    if (currentWorkout.timerInterval) clearInterval(currentWorkout.timerInterval);
    if (currentWorkout.restInterval) clearInterval(currentWorkout.restInterval);
    const duration = Math.floor((Date.now() - currentWorkout.startTime) / 1000 / 60);
    appData.stats.workouts++;
    appData.stats.calories += 400 + (duration * 5);
    appData.stats.totalMinutes += duration;
    appData.stats.xp += 100 + (duration * 2);
    const today = new Date().toDateString();
    if (appData.stats.lastWorkoutDate !== today) {
        appData.stats.streak++;
        if (appData.stats.streak > appData.stats.bestStreak) appData.stats.bestStreak = appData.stats.streak;
        appData.stats.lastWorkoutDate = today;
    }
    const program = PROGRAMS[currentWorkout.program];
    appData.workoutHistory.unshift({ date: new Date().toISOString(), program: program?.name || 'Тренировка', calories: 400 + (duration * 5), minutes: duration, exercises: currentWorkout.completedExercises.length });
    saveData();
    checkAchievements();
    showToast('🏆 ТРЕНИРОВКА ЗАВЕРШЕНА!');
    setTimeout(() => showScreen('screen-home'), 2000);
}

function quitWorkout() { if (confirm('Завершить тренировку?')) { if (currentWorkout.timerInterval) clearInterval(currentWorkout.timerInterval); if (currentWorkout.restInterval) clearInterval(currentWorkout.restInterval); showScreen('screen-home'); } }

// ==================== ПРОГРЕСС ====================

function updateProgress() {
    if (appData.progress.length > 0) {
        const p = appData.progress[0];
        document.getElementById('measure-weight').textContent = p.weight || '--';
        document.getElementById('measure-chest').textContent = p.chest || '--';
        document.getElementById('measure-waist').textContent = p.waist || '--';
        document.getElementById('measure-hips').textContent = p.hips || '--';
        document.getElementById('measure-biceps').textContent = p.biceps || '--';
        document.getElementById('measure-calves').textContent = p.calves || '--';
    }
    renderProgressHistory();
}

function saveProgress(e) {
    e.preventDefault();
    appData.progress.unshift({
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(document.getElementById('input-weight').value) || null,
        chest: parseFloat(document.getElementById('input-chest').value) || null,
        waist: parseFloat(document.getElementById('input-waist').value) || null,
        hips: parseFloat(document.getElementById('input-hips').value) || null,
        biceps: parseFloat(document.getElementById('input-biceps').value) || null,
        calves: parseFloat(document.getElementById('input-calves').value) || null
    });
    if (appData.progress.length > 30) appData.progress = appData.progress.slice(0, 30);
    saveData();
    updateProgress();
    document.getElementById('progress-form').reset();
    showToast('📊 СОХРАНЕНО!');
    setTimeout(() => showScreen('screen-progress'), 500);
}

function renderProgressHistory() {
    const list = document.getElementById('progress-history');
    if (!list) return;
    list.innerHTML = '';
    if (appData.progress.length === 0) { list.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Нет записей</div>'; return; }
    appData.progress.slice(0, 10).forEach(p => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const data = [p.weight && `⚖️ ${p.weight}кг`, p.chest && `📏 ${p.chest}см`].filter(Boolean).join(' | ');
        item.innerHTML = `<span class="history-date">${p.date}</span><span class="history-data">${data || '—'}</span>`;
        list.appendChild(item);
    });
}

// ==================== ВЕСА ====================

function renderWeights() {
    const list = document.getElementById('weights-list');
    if (!list) return;
    list.innerHTML = '';
    if (appData.weightsHistory.length === 0) { list.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Нет записей весов</div>'; return; }
    appData.weightsHistory.slice(0, 20).forEach(w => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const weights = Object.entries(w.weights).map(([k, v]) => `${k.replace('set', 'П')}: ${v}кг`).join(', ');
        item.innerHTML = `<span class="history-date">${new Date(w.date).toLocaleDateString('ru')}</span><span class="history-data">${w.exercise}: ${weights}</span>`;
        list.appendChild(item);
    });
}

function calculateOneRepMax() {
    const weight = parseFloat(document.getElementById('one-rep-weight').value);
    const reps = parseFloat(document.getElementById('one-rep-reps').value);
    if (!weight || !reps) { showToast('⚠️ Введи данные'); return; }
    const oneRepMax = Math.round(weight * (1 + reps / 30));
    document.getElementById('one-rep-value').textContent = `${oneRepMax} кг`;
    document.getElementById('one-rep-result').style.display = 'block';
    showToast(`🏆 Твой 1ПМ: ${oneRepMax}кг!`);
}

// ==================== ПИТАНИЕ ====================

function updateNutrition() {
    document.getElementById('nutrition-calories').textContent = appData.nutrition.today.calories;
    document.getElementById('nutrition-protein').textContent = appData.nutrition.today.protein;
    document.getElementById('nutrition-carbs').textContent = appData.nutrition.today.carbs;
    document.getElementById('nutrition-fats').textContent = appData.nutrition.today.fats;
    document.getElementById('nutrition-calories-target').textContent = appData.nutrition.goals.calories;
    document.getElementById('nutrition-protein-target').textContent = appData.nutrition.goals.protein;
    document.getElementById('nutrition-carbs-target').textContent = appData.nutrition.goals.carbs;
    document.getElementById('nutrition-fats-target').textContent = appData.nutrition.goals.fats;
    renderMeals();
}

function addFood(e) {
    e.preventDefault();
    const name = document.getElementById('food-name').value;
    const protein = parseFloat(document.getElementById('food-protein').value) || 0;
    const carbs = parseFloat(document.getElementById('food-carbs').value) || 0;
    const fats = parseFloat(document.getElementById('food-fats').value) || 0;
    const calories = Math.round(protein * 4 + carbs * 4 + fats * 9);
    
    appData.nutrition.today.calories += calories;
    appData.nutrition.today.protein += protein;
    appData.nutrition.today.carbs += carbs;
    appData.nutrition.today.fats += fats;
    appData.nutrition.meals.unshift({ name, calories, protein, carbs, fats, time: new Date().toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'}) });
    
    saveData();
    updateNutrition();
    document.getElementById('food-name').value = '';
    document.getElementById('food-protein').value = '';
    document.getElementById('food-carbs').value = '';
    document.getElementById('food-fats').value = '';
    showToast('🍗 Добавлено!');
}

function renderMeals() {
    const list = document.getElementById('meals-list');
    if (!list) return;
    list.innerHTML = '';
    if (appData.nutrition.meals.length === 0) { list.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Пока пусто</div>'; return; }
    appData.nutrition.meals.forEach(m => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `<span class="history-date">${m.time} — ${m.name}</span><span class="history-data">${m.calories} ккал (Б:${m.protein} У:${m.carbs} Ж:${m.fats})</span>`;
        list.appendChild(item);
    });
}

// ==================== СОН ====================

function updateSleep() {
    if (appData.sleep.lastNight) {
        document.getElementById('sleep-last-hours').textContent = appData.sleep.lastNight.hours;
    }
    renderSleepWeek();
}

function setSleepHours(hours) {
    if (!appData.sleep.lastNight) appData.sleep.lastNight = { hours: 0, quality: 0, date: new Date().toISOString().split('T')[0] };
    appData.sleep.lastNight.hours = hours;
    saveData();
    updateSleep();
    showToast(`😴 ${hours}ч записано!`);
}

function setSleepQuality(quality) {
    if (!appData.sleep.lastNight) appData.sleep.lastNight = { hours: 0, quality: 0, date: new Date().toISOString().split('T')[0] };
    appData.sleep.lastNight.quality = quality;
    appData.sleep.history.unshift({ ...appData.sleep.lastNight });
    if (appData.sleep.history.length > 30) appData.sleep.history = appData.sleep.history.slice(0, 30);
    saveData();
    updateSleep();
    showToast('⭐ Качество сохранено!');
    // Сброс для следующей ночи
    appData.sleep.lastNight = null;
}

function renderSleepWeek() {
    const grid = document.getElementById('sleep-week-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (appData.sleep.history.length === 0) { grid.innerHTML = '<div style="color:var(--text-secondary);text-align:center;padding:20px;">Нет данных</div>'; return; }
    appData.sleep.history.slice(0, 7).forEach(s => {
        const item = document.createElement('div');
        item.className = 'sleep-day';
        const date = new Date(s.date).toLocaleDateString('ru', {weekday:'short'});
        const stars = '★'.repeat(s.quality) + '☆'.repeat(5 - s.quality);
        item.innerHTML = `<span class="sleep-day-name">${date}</span><span class="sleep-day-hours">${s.hours}ч</span><span class="sleep-day-stars">${stars}</span>`;
        grid.appendChild(item);
    });
}

// ==================== ДОСТИЖЕНИЯ ====================

function renderMiniAchievements() {
    const container = document.getElementById('achievements-mini');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(ACHIEVEMENTS).slice(0, 4).forEach(key => {
        const ach = ACHIEVEMENTS[key];
        const unlocked = appData.achievements?.includes(key);
        const item = document.createElement('div');
        item.className = `achievement-mini-item ${unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `<span class="achievement-mini-icon">${ach.icon}</span><span class="achievement-mini-name">${ach.name}</span>`;
        container.appendChild(item);
    });
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(ACHIEVEMENTS).forEach(([key, ach]) => {
        const unlocked = appData.achievements?.includes(key);
        const item = document.createElement('div');
        item.className = `achievement-item-large ${unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `<span class="achievement-icon-large">${ach.icon}</span><span class="achievement-name-large">${ach.name}</span><span class="achievement-desc-large">${ach.desc}</span>`;
        grid.appendChild(item);
    });
}

function checkAchievements() {
    let unlocked = [];
    if (appData.stats.workouts >= 1 && !appData.achievements?.includes('first_blood')) unlocked.push('first_blood');
    if (appData.stats.streak >= 7 && !appData.achievements?.includes('week_warrior')) unlocked.push('week_warrior');
    if (appData.stats.streak >= 30 && !appData.achievements?.includes('immortal')) unlocked.push('immortal');
    if (appData.stats.workouts >= 50 && !appData.achievements?.includes('steel')) unlocked.push('steel');
    if (appData.stats.xp >= 5000 && !appData.achievements?.includes('goal_setter')) unlocked.push('goal_setter');
    if (unlocked.length > 0) {
        appData.achievements = [...(appData.achievements || []), ...unlocked];
        saveData();
        renderMiniAchievements();
        showAchievementPopup(ACHIEVEMENTS[unlocked[0]].name);
    }
}

function showAchievementPopup(name) {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg-card);border:2px solid var(--primary);padding:30px 50px;border-radius:20px;z-index:2000;text-align:center;box-shadow:0 0 50px var(--glow-strong);animation:fadeIn 0.3s;`;
    popup.innerHTML = `<div style="font-size:60px;margin-bottom:15px;">🏆</div><div style="font-family:var(--font-heading);font-size:20px;color:var(--primary);">ДОСТИЖЕНИЕ!</div><div style="font-size:16px;margin-top:10px;">${name}</div>`;
    document.body.appendChild(popup);
    TelegramWebApp.HapticFeedback?.notificationOccurred('success');
    setTimeout(() => popup.remove(), 3000);
}

// ==================== НАСТРОЙКИ ====================

function saveSettings() {
    appData.settings.notifications = document.getElementById('setting-notifications').checked;
    appData.settings.sound = document.getElementById('setting-sound').checked;
    saveData();
    showToast('⚙️ Настройки сохранены!');
}

function resetAllData() {
    if (confirm('ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить?')) {
        localStorage.removeItem('gogagym_premium_v2');
        location.reload();
    }
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
window.selectPlace = selectPlace;
window.completeOnboarding = completeOnboarding;
window.quickWorkout = quickWorkout;
window.filterPrograms = filterPrograms;
window.startProgram = startProgram;
window.completeExercise = completeExercise;
window.skipExercise = nextExercise;
window.nextExercise = nextExercise;
window.quitWorkout = quitWorkout;
window.startMainWorkout = startMainWorkout;
window.finishWorkout = finishWorkout;
window.saveProgress = saveProgress;
window.calculateOneRepMax = calculateOneRepMax;
window.addFood = addFood;
window.setSleepHours = setSleepHours;
window.setSleepQuality = setSleepQuality;
window.resetAllData = resetAllData;
window.saveSettings = saveSettings;
