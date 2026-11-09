// FastType LocalStorage & Analytics Data Manager
const STORAGE_KEYS = {
    HISTORY: 'fasttype_history_v1',
    SETTINGS: 'fasttype_settings_v1',
    STATS: 'fasttype_stats_v1'
};

const DEFAULT_SETTINGS = {
    theme: 'obsidian-gold', // 'obsidian-gold', 'midnight-emerald', 'carbon-ice', 'amethyst-dark'
    sound: 'thock',         // 'thock', 'clicky', 'soft', 'muted'
    soundVolume: 0.45,
    caretStyle: 'line',     // 'line', 'block', 'underline'
    fontSize: 'normal',     // 'compact', 'normal', 'spacious'
    wordBank: 'standard',   // 'standard', 'advanced', 'code'
    punctuation: false,
    numbers: false,
    blindMode: false,
    strictMode: false,      // Stop on error: force correction with backspace
    ghostPacer: false,      // Speed pacer cursor
    ghostPacerWpm: 70,      // Target pace WPM
    quickRestart: 'tab'
};

// Finger mapping for mechanical diagnostics
const FINGER_MAP = {
    'q': 'Left Pinky', 'a': 'Left Pinky', 'z': 'Left Pinky', '1': 'Left Pinky',
    'w': 'Left Ring', 's': 'Left Ring', 'x': 'Left Ring', '2': 'Left Ring',
    'e': 'Left Middle', 'd': 'Left Middle', 'c': 'Left Middle', '3': 'Left Middle',
    'r': 'Left Index', 'f': 'Left Index', 'v': 'Left Index', '4': 'Left Index',
    't': 'Left Index', 'g': 'Left Index', 'b': 'Left Index', '5': 'Left Index',
    'y': 'Right Index', 'h': 'Right Index', 'n': 'Right Index', '6': 'Right Index',
    'u': 'Right Index', 'j': 'Right Index', 'm': 'Right Index', '7': 'Right Index',
    'i': 'Right Middle', 'k': 'Right Middle', ',': 'Right Middle', '8': 'Right Middle',
    'o': 'Right Ring', 'l': 'Right Ring', '.': 'Right Ring', '9': 'Right Ring',
    'p': 'Right Pinky', ';': 'Right Pinky', '/': 'Right Pinky', '0': 'Right Pinky',
    ' ': 'Thumbs'
};

const TYPING_RANKS = [
    { title: 'Novice Typist', minWpm: 0, maxWpm: 29, badge: '🌱', next: 'Apprentice' },
    { title: 'Apprentice', minWpm: 30, maxWpm: 49, badge: '⚡', next: 'Swift Artisan' },
    { title: 'Swift Artisan', minWpm: 50, maxWpm: 69, badge: '⚔️', next: 'Virtuoso' },
    { title: 'Virtuoso', minWpm: 70, maxWpm: 89, badge: '🔥', next: 'Speed Master' },
    { title: 'Speed Master', minWpm: 90, maxWpm: 109, badge: '👑', next: 'Grandmaster' },
    { title: 'Grandmaster', minWpm: 110, maxWpm: 129, badge: '💎', next: 'Transcendent' },
    { title: 'Transcendent', minWpm: 130, maxWpm: 999, badge: '🌌', next: 'Max Rank' }
];

// Worldwide Typing Benchmark Tiers based on standard normal distribution (Mean: 41 WPM, StdDev: 16.5 WPM)
const GLOBAL_BENCHMARK_TIERS = [
    {
        name: 'Top 1% Global Apex',
        badge: '🌌',
        range: '110+ WPM',
        minWpm: 110,
        maxWpm: 999,
        percentile: 'Top 1%',
        desc: 'Apex worldwide tier (Faster than 99% of global typists)'
    },
    {
        name: 'Top 5% Grandmaster',
        badge: '💎',
        range: '85 – 109 WPM',
        minWpm: 85,
        maxWpm: 109,
        percentile: 'Top 5%',
        desc: 'Professional high-speed transcription & power typist velocity'
    },
    {
        name: 'Top 10% Master',
        badge: '👑',
        range: '72 – 84 WPM',
        minWpm: 72,
        maxWpm: 84,
        percentile: 'Top 10%',
        desc: 'Elite touch typist, nearly 2x faster than international average'
    },
    {
        name: 'Top 25% Proficient',
        badge: '⚡',
        range: '56 – 71 WPM',
        minWpm: 56,
        maxWpm: 71,
        percentile: 'Top 25%',
        desc: 'Upper quartile velocity; swift and agile everyday developer / writer'
    },
    {
        name: 'Top 50% Global Median',
        badge: '🎯',
        range: '41 – 55 WPM',
        minWpm: 41,
        maxWpm: 55,
        percentile: 'Top 50%',
        desc: 'Global Median standard across hundreds of millions of computer typists'
    },
    {
        name: 'Lower 50% Developing',
        badge: '🌱',
        range: '< 41 WPM',
        minWpm: 0,
        maxWpm: 40,
        percentile: 'Lower 50%',
        desc: 'Foundation stage with high potential for rapid gains through muscle memory'
    }
];

function calculateGlobalBenchmark(wpm) {
    wpm = Math.max(0, Math.round(Number(wpm) || 0));
    const mean = 41;
    const stdDev = 16.5;

    if (wpm === 0) {
        return {
            wpm: 0,
            percentile: 0,
            fasterThanPct: 0,
            topPct: 100,
            topPctLabel: 'Unranked',
            tier: GLOBAL_BENCHMARK_TIERS[5],
            tierIndex: 5,
            deltaWpm: -41,
            deltaPct: -100,
            nextTier: GLOBAL_BENCHMARK_TIERS[4],
            wpmToNext: 41,
            tiers: GLOBAL_BENCHMARK_TIERS
        };
    }

    const z = (wpm - mean) / stdDev;
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.3989422804014327 * Math.exp(-z * z / 2.0);
    let p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    let cdf = (z >= 0) ? (1.0 - p) : p;

    let fasterThanPct = Math.min(99.9, Math.max(0.1, +(cdf * 100).toFixed(1)));
    let topPct = +(100 - fasterThanPct).toFixed(1);
    if (topPct < 0.1) topPct = 0.1;

    let tierIndex = 5;
    for (let i = 0; i < GLOBAL_BENCHMARK_TIERS.length; i++) {
        if (wpm >= GLOBAL_BENCHMARK_TIERS[i].minWpm) {
            tierIndex = i;
            break;
        }
    }

    const currentTier = GLOBAL_BENCHMARK_TIERS[tierIndex];
    const nextTier = tierIndex > 0 ? GLOBAL_BENCHMARK_TIERS[tierIndex - 1] : null;
    const wpmToNext = nextTier ? Math.max(0, nextTier.minWpm - wpm) : 0;
    const deltaWpm = wpm - mean;
    const deltaPct = Math.round(((wpm - mean) / mean) * 100);

    let topPctLabel = `Top ${topPct <= 1 ? '1%' : Math.round(topPct) + '%'}`;
    if (tierIndex === 0) topPctLabel = 'Top 1% Worldwide';

    return {
        wpm,
        percentile: fasterThanPct,
        fasterThanPct,
        topPct,
        topPctLabel,
        tier: currentTier,
        tierIndex,
        deltaWpm,
        deltaPct,
        nextTier,
        wpmToNext,
        tiers: GLOBAL_BENCHMARK_TIERS
    };
}

class DataManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (!raw) return { ...DEFAULT_SETTINGS };
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        } catch (e) {
            console.error('Failed to load settings:', e);
            return { ...DEFAULT_SETTINGS };
        }
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    getAllTests() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
            if (!raw) return [];
            const list = JSON.parse(raw);
            return Array.isArray(list) ? list : [];
        } catch (e) {
            console.error('Failed to parse test history:', e);
            return [];
        }
    }

    saveTest(testResult) {
        try {
            const tests = this.getAllTests();
            tests.unshift(testResult); // newest first
            if (tests.length > 500) {
                tests.length = 500;
            }
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(tests));
            this.saveLastTest(testResult);
            return testResult;
        } catch (e) {
            console.error('Failed to save test result:', e);
            return null;
        }
    }

    getLastTest() {
        try {
            const raw = sessionStorage.getItem('fasttype_last_test') || localStorage.getItem('fasttype_last_test');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        const all = this.getAllTests();
        return all.length > 0 ? all[0] : null;
    }

    saveLastTest(testRecord) {
        try {
            const payload = JSON.stringify(testRecord);
            sessionStorage.setItem('fasttype_last_test', payload);
            localStorage.setItem('fasttype_last_test', payload);
        } catch (e) {}
    }

    getGlobalBenchmark(wpm) {
        return calculateGlobalBenchmark(wpm);
    }

    deleteTest(testId) {
        try {
            let tests = this.getAllTests();
            tests = tests.filter(t => t.id !== testId);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(tests));
            return true;
        } catch (e) {
            console.error('Failed to delete test:', e);
            return false;
        }
    }

    clearAllHistory() {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
    }

    getPersonalBests() {
        const tests = this.getAllTests();
        const pb = {
            15: null,
            30: null,
            60: null,
            120: null,
            300: null,
            words_10: null,
            words_25: null,
            words_50: null,
            words_100: null,
            overall: null
        };

        tests.forEach(test => {
            const testWpm = Number(test.wpm) || 0;
            // Check overall PB
            if (!pb.overall || testWpm > (pb.overall.wpm || 0)) {
                pb.overall = test;
            }

            // Check mode PB
            if (test.mode === 'time') {
                const dur = Number(test.duration);
                if (pb.hasOwnProperty(dur)) {
                    if (!pb[dur] || testWpm > (pb[dur].wpm || 0)) {
                        pb[dur] = test;
                    }
                }
            } else if (test.mode === 'words') {
                const key = `words_${test.targetWords}`;
                if (pb.hasOwnProperty(key)) {
                    if (!pb[key] || testWpm > (pb[key].wpm || 0)) {
                        pb[key] = test;
                    }
                }
            }
        });

        return pb;
    }

    getAnalyticsSummary() {
        const tests = this.getAllTests();
        if (tests.length === 0) {
            return {
                totalTests: 0,
                totalTimeSeconds: 0,
                highestWpm: 0,
                avgWpm: 0,
                avgAccuracy: 0,
                recentAvgWpm: 0,
                trendDelta: 0,
                problemKeys: [],
                fingerBreakdown: {},
                userRank: TYPING_RANKS[0],
                rankProgress: 0,
                nextRankGoal: 30
            };
        }

        const totalTests = tests.length;
        let totalWpm = 0;
        let totalAccuracy = 0;
        let totalSeconds = 0;
        let highestWpm = 0;
        const keyErrorMap = {};
        const fingerErrors = {};

        tests.forEach(t => {
            const w = Number(t.wpm) || 0;
            const a = Number(t.accuracy) || 0;
            totalWpm += w;
            totalAccuracy += a;
            totalSeconds += Number(t.actualDuration || t.duration || 60);
            if (w > highestWpm) highestWpm = w;

            if (t.keyErrors && typeof t.keyErrors === 'object') {
                Object.entries(t.keyErrors).forEach(([key, count]) => {
                    const cleanKey = key.toLowerCase();
                    keyErrorMap[cleanKey] = (keyErrorMap[cleanKey] || 0) + Number(count);

                    const finger = FINGER_MAP[cleanKey] || 'Other';
                    fingerErrors[finger] = (fingerErrors[finger] || 0) + Number(count);
                });
            }
        });

        const avgWpm = Math.round(totalWpm / totalTests);
        const avgAccuracy = +(totalAccuracy / totalTests).toFixed(1);

        // Recent 10 vs previous 10 trend
        const recent10 = tests.slice(0, 10);
        const recentAvgWpm = recent10.length > 0 
            ? Math.round(recent10.reduce((acc, cur) => acc + (cur.wpm || 0), 0) / recent10.length)
            : avgWpm;

        const prev10 = tests.slice(10, 20);
        let trendDelta = 0;
        if (prev10.length > 0) {
            const prevAvg = prev10.reduce((acc, cur) => acc + (cur.wpm || 0), 0) / prev10.length;
            trendDelta = Math.round(recentAvgWpm - prevAvg);
        }

        // Top problem keys ranked
        const problemKeys = Object.entries(keyErrorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([key, count]) => ({
                key,
                count,
                finger: FINGER_MAP[key] || 'Unassigned'
            }));

        // Compute User Typing Rank Tier
        const effectiveSpeed = Math.max(highestWpm, recentAvgWpm);
        let currentRank = TYPING_RANKS[0];
        for (let i = TYPING_RANKS.length - 1; i >= 0; i--) {
            if (effectiveSpeed >= TYPING_RANKS[i].minWpm) {
                currentRank = TYPING_RANKS[i];
                break;
            }
        }

        let rankProgress = 0;
        let nextRankGoal = currentRank.maxWpm + 1;
        if (currentRank.maxWpm < 999) {
            const range = currentRank.maxWpm - currentRank.minWpm + 1;
            const progress = effectiveSpeed - currentRank.minWpm;
            rankProgress = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
        } else {
            rankProgress = 100;
        }

        return {
            totalTests,
            totalTimeSeconds: totalSeconds,
            highestWpm,
            avgWpm,
            avgAccuracy,
            recentAvgWpm,
            trendDelta,
            problemKeys,
            allKeyErrors: keyErrorMap,
            fingerBreakdown: fingerErrors,
            userRank: currentRank,
            rankProgress,
            nextRankGoal
        };
    }

    exportJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.2',
            settings: this.settings,
            history: this.getAllTests()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fasttype-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.history || !Array.isArray(parsed.history)) {
                throw new Error('Invalid format: missing history array');
            }
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
            if (parsed.settings) {
                this.saveSettings(parsed.settings);
            }
            return { success: true, count: parsed.history.length };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

window.dataManager = new DataManager();
