// FastType Luxe - State of the Art Typing Engine & Biomechanical Diagnostics
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Application State
    // -------------------------------------------------------------
    const state = {
        modeType: 'time', // 'time' | 'words' | 'quotes' | 'burst' | 'symbols' | 'zen' | 'drill'
        timeLimit: 60,    // 15, 30, 60 (1m), 120 (2m), 300 (5m)
        wordsLimit: 25,   // 10, 25, 50, 100
        punctuation: false,
        numbers: false,
        strictMode: false,
        ghostPacer: false,
        ghostPacerWpm: 70,

        words: [],
        currentWordIndex: 0,
        currentCharIndex: 0,
        
        hasStarted: false,
        isFinished: false,
        timerInterval: null,
        elapsedSeconds: 0,
        remainingSeconds: 60,
        
        // Keystroke statistics
        correctChars: 0,
        incorrectChars: 0,
        extraChars: 0,
        missedChars: 0,
        totalKeystrokes: 0,
        
        // Second-by-second telemetry for charts
        timeline: [],
        keyErrors: {}, // { 'e': 3, 'r': 1 }
        
        wordInputs: [],
        drillKeys: [],
        
        currentChartInstance: null,
        trajectoryChartInstance: null,
        activeAnalyticsFilter: 'all'
    };

    // Keyboard layout for heatmap
    const KEYBOARD_ROWS = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
        [' ']
    ];

    // -------------------------------------------------------------
    // DOM Element References
    // -------------------------------------------------------------
    const elements = {
        // Views & Nav
        typingView: document.getElementById('typingView'),
        analyticsView: document.getElementById('analyticsView'),
        navTypingView: document.getElementById('navTypingView'),
        navAnalyticsView: document.getElementById('navAnalyticsView'),
        brandLogo: document.getElementById('brandLogo'),

        // Sound & Settings
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        soundLabel: document.getElementById('soundLabel'),
        openSettingsBtn: document.getElementById('openSettingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn'),

        // Settings inputs
        settingThemeSelect: document.getElementById('settingThemeSelect'),
        settingStrictSelect: document.getElementById('settingStrictSelect'),
        settingCustomPacerInput: document.getElementById('settingCustomPacerInput'),
        settingSoundSelect: document.getElementById('settingSoundSelect'),
        settingVolumeRange: document.getElementById('settingVolumeRange'),
        settingCaretSelect: document.getElementById('settingCaretSelect'),
        settingWordBankSelect: document.getElementById('settingWordBankSelect'),

        // Toolbar
        modeTypeButtons: document.querySelectorAll('[data-mode-type]'),
        timeOptionsGroup: document.getElementById('timeOptionsGroup'),
        wordOptionsGroup: document.getElementById('wordOptionsGroup'),
        timeButtons: document.querySelectorAll('[data-time]'),
        wordButtons: document.querySelectorAll('[data-words]'),
        togglePunctuation: document.getElementById('togglePunctuation'),
        toggleNumbers: document.getElementById('toggleNumbers'),
        toggleStrictMode: document.getElementById('toggleStrictMode'),
        togglePacer: document.getElementById('togglePacer'),
        btnCustomPacerWpm: document.getElementById('btnCustomPacerWpm'),
        pacerCurrentWpmDisplay: document.getElementById('pacerCurrentWpmDisplay'),
        pacerControlWrapper: document.getElementById('pacerControlWrapper'),
        pacerDisplayGroup: document.getElementById('pacerDisplayGroup'),
        pacerInlineEditor: document.getElementById('pacerInlineEditor'),
        pacerInlineInput: document.getElementById('pacerInlineInput'),
        pacerConfirmBtn: document.getElementById('pacerConfirmBtn'),
        pacerCancelBtn: document.getElementById('pacerCancelBtn'),

        // Accelerators & Status
        speedBoosterBar: document.getElementById('speedBoosterBar'),
        strictBadge: document.getElementById('strictBadge'),
        pacerBadge: document.getElementById('pacerBadge'),
        pacerWpmLabel: document.getElementById('pacerWpmLabel'),
        drillFocusNotice: document.getElementById('drillFocusNotice'),
        drillTargetKeys: document.getElementById('drillTargetKeys'),
        zenNotice: document.getElementById('zenNotice'),

        // Arena & Live telemetry
        liveCountdown: document.getElementById('liveCountdown'),
        liveCountdownUnit: document.getElementById('liveCountdownUnit'),
        liveWpm: document.getElementById('liveWpm'),
        liveAccuracy: document.getElementById('liveAccuracy'),
        wordsCard: document.getElementById('wordsCard'),
        wordsStream: document.getElementById('wordsStream'),
        hiddenTypingInput: document.getElementById('hiddenTypingInput'),
        typingCaret: document.getElementById('typingCaret'),
        ghostCaret: document.getElementById('ghostCaret'),
        restartTestBtn: document.getElementById('restartTestBtn'),
        focusPrompt: document.getElementById('focusPrompt'),

        // Results Modal
        resultsModal: document.getElementById('resultsModal'),
        closeResultsModalBtn: document.getElementById('closeResultsModalBtn'),
        resModeLabel: document.getElementById('resModeLabel'),
        resTimestamp: document.getElementById('resTimestamp'),
        pbBanner: document.getElementById('pbBanner'),
        resHeroWpm: document.getElementById('resHeroWpm'),
        resRawWpmSub: document.getElementById('resRawWpmSub'),
        resAccuracy: document.getElementById('resAccuracy'),
        resCharsSub: document.getElementById('resCharsSub'),
        resConsistency: document.getElementById('resConsistency'),
        resDuration: document.getElementById('resDuration'),
        resCorrectChars: document.getElementById('resCorrectChars'),
        resIncorrectChars: document.getElementById('resIncorrectChars'),
        resExtraChars: document.getElementById('resExtraChars'),
        resTotalChars: document.getElementById('resTotalChars'),
        resProblemKeysSection: document.getElementById('resProblemKeysSection'),
        resProblemKeysList: document.getElementById('resProblemKeysList'),
        btnDrillFromTest: document.getElementById('btnDrillFromTest'),
        resNextTestBtn: document.getElementById('resNextTestBtn'),
        resViewAnalyticsBtn: document.getElementById('resViewAnalyticsBtn'),
        testTrajectoryCanvas: document.getElementById('testTrajectoryCanvas'),

        // Analytics View Elements
        rankBadgeIcon: document.getElementById('rankBadgeIcon'),
        rankTitle: document.getElementById('rankTitle'),
        rankSubtitle: document.getElementById('rankSubtitle'),
        rankProgressPct: document.getElementById('rankProgressPct'),
        rankTargetLabel: document.getElementById('rankTargetLabel'),
        rankProgressBar: document.getElementById('rankProgressBar'),

        kpiBestWpm: document.getElementById('kpiBestWpm'),
        kpiBestSub: document.getElementById('kpiBestSub'),
        kpiAvgWpm: document.getElementById('kpiAvgWpm'),
        kpiTrendSub: document.getElementById('kpiTrendSub'),
        kpiAvgAcc: document.getElementById('kpiAvgAcc'),
        kpiTotalTests: document.getElementById('kpiTotalTests'),
        kpiTotalTime: document.getElementById('kpiTotalTime'),
        improvementCanvas: document.getElementById('improvementCanvas'),
        chartFilterButtons: document.querySelectorAll('.chart-filter-btn'),
        btnLaunchWeaknessDrill: document.getElementById('btnLaunchWeaknessDrill'),
        keyboardHeatmap: document.getElementById('keyboardHeatmap'),
        fingerMatrixGrid: document.getElementById('fingerMatrixGrid'),
        problemKeysContainer: document.getElementById('problemKeysContainer'),
        historyTableBody: document.getElementById('historyTableBody'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        exportDataBtn: document.getElementById('exportDataBtn'),
        importJsonInput: document.getElementById('importJsonInput')
    };

    // -------------------------------------------------------------
    // Initialization & Settings Setup
    // -------------------------------------------------------------
    function initApp() {
        applySettings(window.dataManager.settings);
        attachEventListeners();
        resetTest(true);
    }

    function applySettings(cfg) {
        // Theme
        document.body.className = `theme-${cfg.theme}`;
        if (cfg.caretStyle && cfg.caretStyle !== 'line') {
            document.body.classList.add(`caret-${cfg.caretStyle}`);
        }
        if (elements.settingThemeSelect) elements.settingThemeSelect.value = cfg.theme;
        if (elements.settingCaretSelect) elements.settingCaretSelect.value = cfg.caretStyle || 'line';

        // Sound
        window.soundEngine.soundType = cfg.sound;
        window.soundEngine.volume = cfg.soundVolume || 0.45;
        if (elements.settingSoundSelect) elements.settingSoundSelect.value = cfg.sound;
        if (elements.settingVolumeRange) elements.settingVolumeRange.value = cfg.soundVolume || 0.45;
        updateSoundToggleUI();

        // Strict Mastery Mode
        state.strictMode = !!cfg.strictMode;
        if (elements.toggleStrictMode) elements.toggleStrictMode.classList.toggle('active', state.strictMode);
        if (elements.strictBadge) elements.strictBadge.style.display = state.strictMode ? 'inline-flex' : 'none';
        if (elements.settingStrictSelect) elements.settingStrictSelect.value = state.strictMode ? 'true' : 'false';

        // Ghost Pacer Target
        state.ghostPacer = !!cfg.ghostPacer;
        state.ghostPacerWpm = Number(cfg.ghostPacerWpm) || 70;
        if (elements.togglePacer) elements.togglePacer.classList.toggle('active', state.ghostPacer);
        if (elements.pacerBadge) elements.pacerBadge.style.display = state.ghostPacer ? 'inline-flex' : 'none';
        if (elements.pacerWpmLabel) elements.pacerWpmLabel.textContent = state.ghostPacerWpm;
        if (elements.pacerCurrentWpmDisplay) elements.pacerCurrentWpmDisplay.textContent = state.ghostPacerWpm;
        if (elements.settingCustomPacerInput) elements.settingCustomPacerInput.value = state.ghostPacerWpm;

        // Word bank
        if (elements.settingWordBankSelect) elements.settingWordBankSelect.value = cfg.wordBank || 'standard';
    }

    function updateSoundToggleUI() {
        const isMuted = window.soundEngine.soundType === 'muted';
        elements.soundToggleBtn.classList.toggle('muted', isMuted);
        elements.soundLabel.textContent = isMuted ? 'Muted' : `${capitalize(window.soundEngine.soundType)} FX`;
    }

    // -------------------------------------------------------------
    // Test Setup & Reset
    // -------------------------------------------------------------
    function resetTest(regenerateWords = true, customDrillKeys = null) {
        clearInterval(state.timerInterval);

        state.hasStarted = false;
        state.isFinished = false;
        state.elapsedSeconds = 0;
        state.correctChars = 0;
        state.incorrectChars = 0;
        state.extraChars = 0;
        state.missedChars = 0;
        state.totalKeystrokes = 0;
        state.currentWordIndex = 0;
        state.currentCharIndex = 0;
        state.timeline = [];
        state.keyErrors = {};
        state.wordInputs = [];

        document.body.classList.remove('is-typing');
        elements.wordsCard.classList.remove('is-focused');
        elements.ghostCaret.classList.remove('active');

        // Mode specific setup
        elements.drillFocusNotice.style.display = 'none';
        elements.zenNotice.style.display = 'none';

        if (state.modeType === 'time') {
            state.remainingSeconds = state.timeLimit;
            elements.liveCountdown.textContent = state.timeLimit;
            elements.liveCountdownUnit.textContent = 's';
        } else if (state.modeType === 'words') {
            elements.liveCountdown.textContent = state.wordsLimit;
            elements.liveCountdownUnit.textContent = 'words';
        } else if (state.modeType === 'quotes') {
            elements.liveCountdown.textContent = 'Quote';
            elements.liveCountdownUnit.textContent = '';
        } else if (state.modeType === 'burst') {
            elements.liveCountdown.textContent = '20';
            elements.liveCountdownUnit.textContent = 'words';
        } else if (state.modeType === 'symbols') {
            elements.liveCountdown.textContent = '30';
            elements.liveCountdownUnit.textContent = 'words';
        } else if (state.modeType === 'zen') {
            elements.liveCountdown.textContent = '∞';
            elements.liveCountdownUnit.textContent = 'zen';
            elements.zenNotice.style.display = 'block';
        } else if (state.modeType === 'drill') {
            state.remainingSeconds = 60;
            elements.liveCountdown.textContent = '60';
            elements.liveCountdownUnit.textContent = 's';
            elements.drillFocusNotice.style.display = 'block';
        }

        elements.liveWpm.textContent = '0';
        elements.liveAccuracy.textContent = '100%';

        // Generate Words
        if (regenerateWords) {
            if (state.modeType === 'quotes') {
                state.words = getRandomQuote();
            } else if (state.modeType === 'burst') {
                state.words = getBurstWords(20);
            } else if (state.modeType === 'symbols') {
                state.words = getNumbersAndSymbolsWords(30);
            } else if (state.modeType === 'zen') {
                state.words = getRandomWords(150, 'standard', true, false);
            } else if (state.modeType === 'drill') {
                const summary = window.dataManager.getAnalyticsSummary();
                const problemKeys = customDrillKeys || summary.problemKeys.slice(0, 5).map(p => p.key);
                state.drillKeys = problemKeys.length > 0 ? problemKeys : ['p', 'q', 'x', 'z', 'c'];
                elements.drillTargetKeys.textContent = state.drillKeys.join(', ').toUpperCase();
                state.words = getWeaknessDrillWords(state.drillKeys, 45);
            } else if (state.modeType === 'words') {
                state.words = getRandomWords(state.wordsLimit, 'standard', state.punctuation, state.numbers);
            } else {
                const count = Math.max(120, state.timeLimit * 3.5);
                const bankType = window.dataManager.settings.wordBank || 'standard';
                state.words = getRandomWords(count, bankType, state.punctuation, state.numbers);
            }
        }

        renderWordsStream();
        focusHiddenInput();
        updateCaretPosition();
    }

    // Render words to DOM
    function renderWordsStream() {
        // Keep carets in place, clear word elements
        elements.wordsStream.querySelectorAll('.word').forEach(w => w.remove());
        state.wordInputs = new Array(state.words.length).fill('');

        const fragment = document.createDocumentFragment();

        state.words.forEach((wordStr, wIndex) => {
            const wordEl = document.createElement('div');
            wordEl.className = `word ${wIndex === 0 ? 'active' : ''}`;
            wordEl.dataset.wordIndex = wIndex;

            for (let i = 0; i < wordStr.length; i++) {
                const letterEl = document.createElement('span');
                letterEl.className = 'letter';
                letterEl.textContent = wordStr[i];
                wordEl.appendChild(letterEl);
            }
            fragment.appendChild(wordEl);
        });

        elements.wordsStream.appendChild(fragment);
        elements.wordsStream.style.transform = 'translateY(0px)';
    }

    function focusHiddenInput() {
        elements.hiddenTypingInput.value = '';
        elements.hiddenTypingInput.focus();
        elements.wordsCard.classList.add('is-focused');
        elements.focusPrompt.style.display = 'none';
    }

    // -------------------------------------------------------------
    // Keystroke & Typing Mechanics
    // -------------------------------------------------------------
    function handleKeyDown(e) {
        // 1. Guard against keystrokes when not in typing arena (e.g. Analytics view)
        if (elements.analyticsView && elements.analyticsView.classList.contains('active')) {
            return;
        }
        if (elements.typingView && elements.typingView.style.display === 'none') {
            return;
        }

        // 2. Guard against keystrokes when settings or results modal is active
        if ((elements.settingsModal && elements.settingsModal.classList.contains('active')) ||
            (elements.resultsModal && elements.resultsModal.classList.contains('active'))) {
            return;
        }

        // 3. Guard against keystrokes when user is typing in any webpage input/textarea
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            return;
        }

        if (state.isFinished) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            resetTest(true);
            return;
        }

        // Zen Mode completion hotkey: Shift + Enter
        if (state.modeType === 'zen' && e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            finishTest();
            return;
        }

        if (['Control', 'Alt', 'Shift', 'Meta', 'CapsLock'].includes(e.key)) {
            return;
        }

        // Start on first valid keypress
        if (!state.hasStarted) {
            startTest();
        }

        const currentWordStr = state.words[state.currentWordIndex];
        const activeWordEl = elements.wordsStream.querySelector(`[data-word-index="${state.currentWordIndex}"]`);
        if (!activeWordEl) return;

        const letters = activeWordEl.querySelectorAll('.letter:not(.extra)');
        const hasUncorrectedError = Array.from(activeWordEl.querySelectorAll('.letter')).some(l => l.classList.contains('incorrect') || l.classList.contains('extra'));

        // 1. SPACE KEY - Advance to next word
        if (e.key === ' ') {
            e.preventDefault();

            // STRICT MASTERY MODE: Block space completely if current word has ANY uncorrected errors
            if (state.strictMode && hasUncorrectedError) {
                window.soundEngine.playKeySound(false, true);
                activeWordEl.classList.add('error-highlight');
                return;
            }

            if (state.currentCharIndex === 0 && (!state.wordInputs[state.currentWordIndex] || state.wordInputs[state.currentWordIndex].length === 0)) {
                return;
            }

            window.soundEngine.playKeySound(true, false);

            let wordHasError = false;
            letters.forEach((letterEl, idx) => {
                if (!letterEl.classList.contains('correct') && !letterEl.classList.contains('incorrect')) {
                    letterEl.classList.add('incorrect');
                    state.incorrectChars++;
                    state.missedChars++;
                    wordHasError = true;
                    const charMissed = currentWordStr[idx];
                    state.keyErrors[charMissed] = (state.keyErrors[charMissed] || 0) + 1;
                } else if (letterEl.classList.contains('incorrect')) {
                    wordHasError = true;
                }
            });

            if (activeWordEl.querySelectorAll('.letter.extra').length > 0) {
                wordHasError = true;
            }

            if (wordHasError) {
                activeWordEl.classList.add('error-highlight');
            }

            activeWordEl.classList.remove('active');
            state.currentWordIndex++;
            state.currentCharIndex = 0;

            // Check completion for word count limited modes or drill mode
            const isWordLimitedMode = (state.modeType === 'words' && state.currentWordIndex >= state.wordsLimit) ||
                                      (state.modeType === 'quotes' && state.currentWordIndex >= state.words.length) ||
                                      (state.modeType === 'burst' && state.currentWordIndex >= 20) ||
                                      (state.modeType === 'symbols' && state.currentWordIndex >= 30) ||
                                      (state.modeType === 'drill' && state.currentWordIndex >= state.words.length) ||
                                      (state.modeType !== 'time' && state.modeType !== 'zen' && state.currentWordIndex >= state.words.length);

            if (isWordLimitedMode) {
                finishTest();
                return;
            }

            const nextWordEl = elements.wordsStream.querySelector(`[data-word-index="${state.currentWordIndex}"]`);
            if (nextWordEl) {
                nextWordEl.classList.add('active');
                adjustScrollPosition(nextWordEl);
            }

            updateCaretPosition();
            updateLiveStats();
            return;
        }

        // 2. BACKSPACE KEY
        if (e.key === 'Backspace') {
            e.preventDefault();

            if (state.currentCharIndex === 0) {
                if (state.currentWordIndex > 0 && !state.strictMode) {
                    const prevWordEl = elements.wordsStream.querySelector(`[data-word-index="${state.currentWordIndex - 1}"]`);
                    if (prevWordEl && prevWordEl.classList.contains('error-highlight')) {
                        activeWordEl.classList.remove('active');
                        prevWordEl.classList.add('active');
                        prevWordEl.classList.remove('error-highlight');
                        state.currentWordIndex--;

                        const prevWordLetters = prevWordEl.querySelectorAll('.letter');
                        state.currentCharIndex = prevWordLetters.length;
                        adjustScrollPosition(prevWordEl);
                        updateCaretPosition();
                    }
                }
                return;
            }

            const allLetters = activeWordEl.querySelectorAll('.letter');
            const targetLetter = allLetters[state.currentCharIndex - 1];

            if (targetLetter) {
                if (targetLetter.classList.contains('extra')) {
                    targetLetter.remove();
                    state.extraChars = Math.max(0, state.extraChars - 1);
                } else {
                    if (targetLetter.classList.contains('correct')) {
                        state.correctChars = Math.max(0, state.correctChars - 1);
                    } else if (targetLetter.classList.contains('incorrect')) {
                        state.incorrectChars = Math.max(0, state.incorrectChars - 1);
                    }
                    targetLetter.className = 'letter';
                }
                state.currentCharIndex--;
            }

            updateCaretPosition();
            updateLiveStats();
            return;
        }

        // 3. REGULAR CHARACTER INPUT
        if (e.key.length === 1) {
            e.preventDefault();

            // STRICT MASTERY MODE: If the user already made a mistake on current or previous letter, force Backspace!
            if (state.strictMode && hasUncorrectedError) {
                window.soundEngine.playKeySound(false, true);
                return;
            }

            const typedChar = e.key;
            state.totalKeystrokes++;
            let isCorrect = false;

            if (state.currentCharIndex < currentWordStr.length) {
                const expectedChar = currentWordStr[state.currentCharIndex];
                const letterEl = letters[state.currentCharIndex];

                if (typedChar === expectedChar) {
                    letterEl.classList.add('correct');
                    state.correctChars++;
                    isCorrect = true;
                } else {
                    letterEl.classList.add('incorrect');
                    state.incorrectChars++;
                    state.keyErrors[expectedChar] = (state.keyErrors[expectedChar] || 0) + 1;
                }
                state.currentCharIndex++;
            } else {
                // Typing beyond word length (extra letters) - completely disabled in strict mode
                if (!state.strictMode) {
                    const currentExtras = activeWordEl.querySelectorAll('.letter.extra').length;
                    if (currentExtras < 10) {
                        const extraEl = document.createElement('span');
                        extraEl.className = 'letter extra';
                        extraEl.textContent = typedChar;
                        activeWordEl.appendChild(extraEl);
                        state.extraChars++;
                        state.incorrectChars++;
                        state.currentCharIndex++;
                    }
                }
            }

            window.soundEngine.playKeySound(false, !isCorrect);

            // Check if last letter of last word
            const isLastWord = (state.modeType === 'words' && state.currentWordIndex === state.wordsLimit - 1) ||
                               (state.modeType === 'quotes' && state.currentWordIndex === state.words.length - 1) ||
                               (state.modeType === 'burst' && state.currentWordIndex === 19) ||
                               (state.modeType === 'symbols' && state.currentWordIndex === 29) ||
                               (state.modeType === 'drill' && state.currentWordIndex === state.words.length - 1) ||
                               (state.modeType !== 'time' && state.modeType !== 'zen' && state.currentWordIndex === state.words.length - 1);

            if (isLastWord && state.currentCharIndex >= currentWordStr.length) {
                finishTest();
                return;
            }

            updateCaretPosition();
            updateLiveStats();
        }
    }

    // -------------------------------------------------------------
    // Synchronized In-Stream Caret Positioning (Fixes Line Skip Bug!)
    // -------------------------------------------------------------
    function updateCaretPosition() {
        const activeWordEl = elements.wordsStream.querySelector(`[data-word-index="${state.currentWordIndex}"]`);
        if (!activeWordEl) return;

        // Caret is inside .words-stream, so activeWordEl.offsetLeft and activeWordEl.offsetTop
        // give the exact coordinate relative to the stream container without bounding rect lag!
        let targetX = activeWordEl.offsetLeft;
        const targetY = activeWordEl.offsetTop;

        if (state.currentCharIndex > 0) {
            const letters = activeWordEl.querySelectorAll('.letter');
            const targetLetter = letters[state.currentCharIndex - 1];
            if (targetLetter) {
                targetX = activeWordEl.offsetLeft + targetLetter.offsetLeft + targetLetter.offsetWidth;
            }
        }

        elements.typingCaret.style.left = `${targetX}px`;
        elements.typingCaret.style.top = `${targetY + 4}px`;

        elements.typingCaret.classList.add('typing');
        clearTimeout(elements.typingCaret._timer);
        elements.typingCaret._timer = setTimeout(() => {
            elements.typingCaret.classList.remove('typing');
        }, 450);
    }

    // Smooth auto-scroll keeps the current typing line always visible
    function adjustScrollPosition(activeWordEl) {
        const wordTop = activeWordEl.offsetTop;
        // Each row is ~42px. Row 0 = ~0px, Row 1 = ~42px, Row 2 = ~84px
        if (wordTop >= 70) {
            const scrollDistance = wordTop - 40;
            elements.wordsStream.style.transform = `translateY(-${scrollDistance}px)`;
        } else {
            elements.wordsStream.style.transform = 'translateY(0px)';
        }
    }

    // -------------------------------------------------------------
    // Test Start, Timer & Ghost Pacer
    // -------------------------------------------------------------
    function startTest() {
        state.hasStarted = true;
        document.body.classList.add('is-typing');
        window.soundEngine.init();

        if (state.ghostPacer) {
            elements.ghostCaret.classList.add('active');
        }

        state.timerInterval = setInterval(() => {
            state.elapsedSeconds++;

            if (state.modeType === 'time' || state.modeType === 'drill') {
                const limit = state.modeType === 'drill' ? 60 : state.timeLimit;
                state.remainingSeconds = Math.max(0, limit - state.elapsedSeconds);
                elements.liveCountdown.textContent = state.remainingSeconds;

                if (state.remainingSeconds <= 0) {
                    finishTest();
                    return;
                }
            } else if (state.modeType === 'words') {
                const wordsLeft = Math.max(0, state.wordsLimit - state.currentWordIndex);
                elements.liveCountdown.textContent = wordsLeft;
            } else if (state.modeType === 'zen') {
                elements.liveCountdown.textContent = `${state.elapsedSeconds}s`;
            }

            // In drill mode, also finish test immediately if all words are completed
            if (state.modeType === 'drill' && state.currentWordIndex >= state.words.length) {
                finishTest();
                return;
            }

            // Ghost pacer positioning
            if (state.ghostPacer) {
                updateGhostPacerPosition();
            }

            const currentWpm = computeNetWpm();
            const currentRaw = computeRawWpm();
            state.timeline.push({
                second: state.elapsedSeconds,
                wpm: currentWpm,
                rawWpm: currentRaw,
                errors: state.incorrectChars
            });

            updateLiveStats();
        }, 1000);
    }

    function updateGhostPacerPosition() {
        const targetWpm = Number(state.ghostPacerWpm) || 70;
        const targetChars = Math.round((targetWpm * 5 / 60) * state.elapsedSeconds);

        const allLetters = elements.wordsStream.querySelectorAll('.letter:not(.extra)');
        if (targetChars < allLetters.length) {
            const targetLetterEl = allLetters[targetChars];
            if (targetLetterEl) {
                const wordParent = targetLetterEl.closest('.word');
                if (wordParent) {
                    const pacerX = wordParent.offsetLeft + targetLetterEl.offsetLeft;
                    const pacerY = wordParent.offsetTop;
                    elements.ghostCaret.style.left = `${pacerX}px`;
                    elements.ghostCaret.style.top = `${pacerY + 4}px`;
                }
            }
        }
    }

    function computeNetWpm() {
        const minutes = Math.max(state.elapsedSeconds, 1) / 60;
        const netChars = Math.max(0, state.correctChars);
        const wpm = (netChars / 5) / minutes;
        return Math.max(0, Math.round(wpm));
    }

    function computeRawWpm() {
        const minutes = Math.max(state.elapsedSeconds, 1) / 60;
        const total = state.correctChars + state.incorrectChars;
        const raw = (total / 5) / minutes;
        return Math.max(0, Math.round(raw));
    }

    function computeAccuracy() {
        const total = state.correctChars + state.incorrectChars;
        if (total === 0) return 100;
        return +((state.correctChars / total) * 100).toFixed(1);
    }

    function computeConsistency() {
        if (state.timeline.length < 2) return 100;
        const wpms = state.timeline.map(t => t.wpm);
        const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
        if (mean === 0) return 100;

        const variance = wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, Math.min(100, Math.round(100 - (stdDev / mean * 100))));
    }

    function updateLiveStats() {
        elements.liveWpm.textContent = computeNetWpm();
        elements.liveAccuracy.textContent = `${computeAccuracy()}%`;
    }

    // -------------------------------------------------------------
    // Finish Test & Compact Viewport-Fitted Luxury Report
    // -------------------------------------------------------------
    function finishTest() {
        clearInterval(state.timerInterval);
        state.isFinished = true;
        document.body.classList.remove('is-typing');
        elements.ghostCaret.classList.remove('active');

        const netWpm = computeNetWpm();
        const rawWpm = computeRawWpm();
        const accuracy = computeAccuracy();
        const consistency = computeConsistency();
        const actualDuration = state.elapsedSeconds;

        const testRecord = {
            id: 'test_' + Date.now(),
            timestamp: new Date().toISOString(),
            mode: state.modeType,
            duration: state.modeType === 'time' ? state.timeLimit : null,
            targetWords: state.modeType === 'words' ? state.wordsLimit : (state.modeType === 'drill' ? state.words.length : null),
            actualDuration: actualDuration,
            wpm: netWpm,
            rawWpm: rawWpm,
            accuracy: accuracy,
            consistency: consistency,
            strictMode: state.strictMode,
            characters: {
                correct: state.correctChars,
                incorrect: state.incorrectChars,
                extra: state.extraChars,
                missed: state.missedChars
            },
            keyErrors: { ...state.keyErrors },
            timeline: [...state.timeline]
        };

        const pbsBefore = window.dataManager.getPersonalBests();
        const isPb = checkIsPb(testRecord, pbsBefore);

        window.dataManager.saveTest(testRecord);

        if (isPb && window.confetti) {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#dfb15b', '#f8fafc', '#10b981', '#38bdf8']
            });
        }

        renderReportModal(testRecord, isPb);
    }

    function checkIsPb(record, pbs) {
        if (!pbs.overall || record.wpm > pbs.overall.wpm) return true;
        if (record.mode === 'time' && pbs[record.duration]) {
            return record.wpm > pbs[record.duration].wpm;
        }
        return false;
    }

    function renderReportModal(record, isPb) {
        elements.pbBanner.style.display = isPb ? 'block' : 'none';

        let modeStr = `${record.duration}s Time Test`;
        if (record.mode === 'words') modeStr = `${record.targetWords} Words Sprint`;
        if (record.mode === 'quotes') modeStr = 'Famous Quotes Test';
        if (record.mode === 'burst') modeStr = 'Speed Burst N-Grams';
        if (record.mode === 'symbols') modeStr = 'Symbols Mastery Drill';
        if (record.mode === 'zen') modeStr = 'Zen Flow Session';
        if (record.mode === 'drill') modeStr = 'Weakness Practice Drill';

        elements.resModeLabel.textContent = modeStr;
        elements.resTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        elements.resHeroWpm.textContent = record.wpm;
        elements.resRawWpmSub.textContent = `Raw: ${record.rawWpm} WPM`;
        elements.resAccuracy.textContent = `${record.accuracy}%`;
        elements.resCharsSub.textContent = `${record.characters.incorrect} errors`;
        elements.resConsistency.textContent = `${record.consistency}%`;
        elements.resDuration.textContent = `${record.actualDuration}s`;

        elements.resCorrectChars.textContent = record.characters.correct;
        elements.resIncorrectChars.textContent = record.characters.incorrect;
        elements.resExtraChars.textContent = record.characters.extra;
        elements.resTotalChars.textContent = record.characters.correct + record.characters.incorrect + record.characters.extra;

        // Problem keys in this test
        const missedEntries = Object.entries(record.keyErrors || {}).sort((a, b) => b[1] - a[1]);

        if (missedEntries.length > 0) {
            elements.resProblemKeysSection.style.display = 'flex';
            elements.resProblemKeysList.innerHTML = '';
            missedEntries.slice(0, 8).forEach(([key, count]) => {
                const pill = document.createElement('div');
                pill.className = 'problem-key-pill';
                const finger = FINGER_MAP[key.toLowerCase()] || 'Key';
                pill.innerHTML = `
                    <span class="problem-key-char">${key === ' ' ? 'Space' : key}</span>
                    <span class="problem-key-count">${count} err</span>
                    <span class="problem-key-finger">(${finger})</span>
                `;
                elements.resProblemKeysList.appendChild(pill);
            });
        } else {
            elements.resProblemKeysSection.style.display = 'none';
        }

        renderTestTrajectoryChart(record.timeline);
        elements.resultsModal.classList.add('active');
    }

    function renderTestTrajectoryChart(timeline) {
        if (!timeline || timeline.length === 0) return;

        if (state.trajectoryChartInstance) {
            state.trajectoryChartInstance.destroy();
        }

        const labels = timeline.map(t => `${t.second}s`);
        const wpmData = timeline.map(t => t.wpm);
        const rawData = timeline.map(t => t.rawWpm);

        const ctx = elements.testTrajectoryCanvas.getContext('2d');
        const goldGradient = ctx.createLinearGradient(0, 0, 0, 160);
        goldGradient.addColorStop(0, 'rgba(223, 177, 91, 0.28)');
        goldGradient.addColorStop(1, 'rgba(223, 177, 91, 0.0)');

        state.trajectoryChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net WPM',
                        data: wpmData,
                        borderColor: '#dfb15b',
                        backgroundColor: goldGradient,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2.2,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Raw WPM',
                        data: rawData,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderDash: [3, 3],
                        tension: 0.35,
                        borderWidth: 1.3,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            boxWidth: 10,
                            font: { family: 'Plus Jakarta Sans', size: 10 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 24, 0.95)',
                        borderColor: 'rgba(223, 177, 91, 0.4)',
                        borderWidth: 1,
                        titleColor: '#dfb15b',
                        bodyColor: '#f8fafc',
                        titleFont: { family: 'JetBrains Mono', weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // -------------------------------------------------------------
    // Analytics Dashboard & Biomechanical Diagnostics
    // -------------------------------------------------------------
    function openAnalyticsDashboard() {
        document.body.classList.remove('is-typing');
        document.body.classList.add('analytics-view-active');
        if (state.hasStarted && !state.isFinished) {
            clearInterval(state.timerInterval);
            state.hasStarted = false;
        }
        elements.typingView.style.display = 'none';
        elements.analyticsView.classList.add('active');
        elements.navTypingView.classList.remove('active');
        elements.navAnalyticsView.classList.add('active');

        refreshAnalyticsData();
    }

    function openTypingArena() {
        document.body.classList.remove('analytics-view-active');
        document.body.classList.remove('is-typing');
        elements.analyticsView.classList.remove('active');
        elements.typingView.style.display = 'flex';
        elements.navAnalyticsView.classList.remove('active');
        elements.navTypingView.classList.add('active');

        focusHiddenInput();
    }

    function refreshAnalyticsData() {
        try {
            const summary = window.dataManager.getAnalyticsSummary();
            const pbs = window.dataManager.getPersonalBests();
            const tests = window.dataManager.getAllTests();

            // 1. Rank & Mastery Tier
            if (elements.rankBadgeIcon) elements.rankBadgeIcon.textContent = summary.userRank.badge;
            if (elements.rankTitle) elements.rankTitle.textContent = summary.userRank.title;
            if (elements.rankSubtitle) {
                elements.rankSubtitle.textContent = `Next Tier: ${summary.userRank.next} • Target: ${summary.nextRankGoal} WPM`;
            }
            if (elements.rankProgressPct) elements.rankProgressPct.textContent = `${summary.rankProgress}% Mastery`;
            if (elements.rankTargetLabel) elements.rankTargetLabel.textContent = `Goal: ${summary.nextRankGoal} WPM`;
            if (elements.rankProgressBar) elements.rankProgressBar.style.width = `${summary.rankProgress}%`;

            // 2. Summary KPI Cards
            if (elements.kpiBestWpm) elements.kpiBestWpm.textContent = summary.highestWpm;
            if (elements.kpiBestSub) {
                elements.kpiBestSub.textContent = pbs.overall 
                    ? `${pbs.overall.mode === 'time' ? pbs.overall.duration + 's' : (pbs.overall.targetWords || 25) + 'w'} test` 
                    : 'Take a test';
            }

            if (elements.kpiAvgWpm) elements.kpiAvgWpm.textContent = summary.avgWpm;
            if (elements.kpiTrendSub) {
                if (summary.trendDelta > 0) {
                    elements.kpiTrendSub.innerHTML = `<span class="positive">↑ +${summary.trendDelta} WPM</span> (last 10 tests)`;
                } else if (summary.trendDelta < 0) {
                    elements.kpiTrendSub.innerHTML = `<span class="negative">↓ ${summary.trendDelta} WPM</span> (last 10 tests)`;
                } else {
                    elements.kpiTrendSub.textContent = `Recent: ${summary.recentAvgWpm} WPM`;
                }
            }

            if (elements.kpiAvgAcc) elements.kpiAvgAcc.textContent = `${summary.avgAccuracy}%`;
            if (elements.kpiTotalTests) elements.kpiTotalTests.textContent = summary.totalTests;
            const totalMinutes = Math.round(summary.totalTimeSeconds / 60);
            if (elements.kpiTotalTime) elements.kpiTotalTime.textContent = `${totalMinutes} min${totalMinutes !== 1 ? 's' : ''} typed`;

            // 3. Bulletproof Personal Records Update
            updatePersonalRecordsGrid(pbs);

            // 4. Interactive QWERTY Keyboard Heatmap
            renderKeyboardHeatmap(summary.allKeyErrors || {});

            // 5. Finger Weakness Matrix
            renderFingerMatrix(summary.fingerBreakdown || {});

            // 6. Ranked Problem Keys Diagnostics
            renderProblemKeysRanking(summary.problemKeys);

            // 7. Historical Log Table
            renderHistoryTable(tests);

            // 8. Main Improvement Progression Chart
            renderImprovementChart(state.activeAnalyticsFilter);

        } catch (err) {
            console.error('Error refreshing analytics dashboard:', err);
        }
    }

    // Safely update all Personal Record cards
    function updatePersonalRecordsGrid(pbs) {
        const records = [
            { id: 'pb-15', key: 15, metaId: 'pb-15-meta' },
            { id: 'pb-30', key: 30, metaId: 'pb-30-meta' },
            { id: 'pb-60', key: 60, metaId: 'pb-60-meta' },
            { id: 'pb-120', key: 120, metaId: 'pb-120-meta' },
            { id: 'pb-300', key: 300, metaId: 'pb-300-meta' },
            { id: 'pb-words_25', key: 'words_25', metaId: 'pb-words_25-meta' },
            { id: 'pb-words_50', key: 'words_50', metaId: 'pb-words_50-meta' },
            { id: 'pb-words_100', key: 'words_100', metaId: 'pb-words_100-meta' }
        ];

        records.forEach(item => {
            const valEl = document.getElementById(item.id);
            const metaEl = document.getElementById(item.metaId);
            const test = pbs[item.key];

            if (valEl) {
                if (test && test.wpm) {
                    valEl.textContent = `${test.wpm} WPM`;
                } else {
                    valEl.textContent = '-';
                }
            }

            if (metaEl) {
                if (test && test.wpm) {
                    const dateFormatted = new Date(test.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    metaEl.textContent = `${test.accuracy}% acc • ${dateFormatted}`;
                } else {
                    metaEl.textContent = 'No record yet';
                }
            }
        });
    }

    // Render interactive physical QWERTY keyboard heatmap
    function renderKeyboardHeatmap(allKeyErrors) {
        if (!elements.keyboardHeatmap) return;
        elements.keyboardHeatmap.innerHTML = '';

        const maxErrors = Math.max(...Object.values(allKeyErrors), 1);

        KEYBOARD_ROWS.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'keyboard-row';

            row.forEach(char => {
                const misses = allKeyErrors[char] || 0;
                const keyEl = document.createElement('div');
                keyEl.className = 'key-cap';

                if (char === ' ') {
                    keyEl.classList.add('wide-space');
                    keyEl.textContent = misses > 0 ? `Space (${misses})` : 'Space';
                } else {
                    keyEl.textContent = char.toUpperCase();
                }

                if (misses === 0) {
                    keyEl.classList.add('key-safe');
                } else if (misses <= Math.ceil(maxErrors * 0.35)) {
                    keyEl.classList.add('key-mild-error');
                    const sub = document.createElement('span');
                    sub.className = 'key-miss-sub';
                    sub.textContent = `${misses}`;
                    keyEl.appendChild(sub);
                } else {
                    keyEl.classList.add('key-severe-error');
                    const sub = document.createElement('span');
                    sub.className = 'key-miss-sub';
                    sub.textContent = `${misses}!`;
                    keyEl.appendChild(sub);
                }

                const finger = FINGER_MAP[char] || 'Unassigned';
                keyEl.title = `Key: '${char === ' ' ? 'Space' : char.toUpperCase()}' | Errors: ${misses} | Finger: ${finger}`;

                rowEl.appendChild(keyEl);
            });

            elements.keyboardHeatmap.appendChild(rowEl);
        });
    }

    // Render finger weakness distribution matrix
    function renderFingerMatrix(fingerErrors) {
        if (!elements.fingerMatrixGrid) return;
        elements.fingerMatrixGrid.innerHTML = '';

        const fingerKeys = [
            'Left Pinky', 'Right Pinky',
            'Left Ring', 'Right Ring',
            'Left Middle', 'Right Middle',
            'Left Index', 'Right Index',
            'Thumbs'
        ];

        const maxFingerErrors = Math.max(...Object.values(fingerErrors), 1);

        fingerKeys.forEach(finger => {
            const count = fingerErrors[finger] || 0;
            const pct = Math.round((count / maxFingerErrors) * 100);

            const item = document.createElement('div');
            item.className = 'finger-item';
            item.innerHTML = `
                <div class="finger-name-row">
                    <span>${finger}</span>
                    <span style="font-family: var(--font-mono); color: ${count > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-weight: 600;">
                        ${count} err
                    </span>
                </div>
                <div class="finger-bar">
                    <div class="finger-fill" style="width: ${pct}%;"></div>
                </div>
            `;
            elements.fingerMatrixGrid.appendChild(item);
        });
    }

    // Render ranked problem keys list
    function renderProblemKeysRanking(problemKeys) {
        if (!elements.problemKeysContainer) return;
        elements.problemKeysContainer.innerHTML = '';

        if (!problemKeys || problemKeys.length === 0) {
            elements.problemKeysContainer.innerHTML = `
                <div class="empty-state" style="padding: 1rem 0;">
                    <p>No character errors recorded yet. Complete tests to build diagnostics!</p>
                </div>
            `;
            return;
        }

        const maxErrors = Math.max(...problemKeys.map(k => k.count), 1);

        problemKeys.forEach(item => {
            const pct = Math.round((item.count / maxErrors) * 100);
            const row = document.createElement('div');
            row.className = 'ranked-key-item';
            row.innerHTML = `
                <div class="key-badge-square">${item.key === ' ' ? '␣' : item.key}</div>
                <div class="key-progress-track">
                    <div class="key-progress-fill" style="width: ${pct}%"></div>
                </div>
                <span class="key-error-stat">${item.count} miss${item.count > 1 ? 'es' : ''} (${item.finger})</span>
            `;
            elements.problemKeysContainer.appendChild(row);
        });
    }

    // Render test history log table
    function renderHistoryTable(tests) {
        if (!elements.historyTableBody) return;
        elements.historyTableBody.innerHTML = '';

        if (!tests || tests.length === 0) {
            elements.historyTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">No typing sessions recorded yet. Start practicing!</td>
                </tr>
            `;
            return;
        }

        tests.slice(0, 50).forEach(test => {
            const tr = document.createElement('tr');
            const dateStr = new Date(test.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            let modeLabel = `${test.duration || 60}s`;
            if (test.mode === 'words') modeLabel = `${test.targetWords || 25}w`;
            if (test.mode === 'quotes') modeLabel = 'Quote';
            if (test.mode === 'burst') modeLabel = 'Burst';
            if (test.mode === 'symbols') modeLabel = 'Symbols';
            if (test.mode === 'zen') modeLabel = 'Zen';
            if (test.mode === 'drill') modeLabel = 'Drill';

            tr.innerHTML = `
                <td style="font-size: 0.8rem;">${dateStr}</td>
                <td><span class="key-badge">${modeLabel}</span></td>
                <td class="wpm-cell">${test.wpm}</td>
                <td>${test.rawWpm}</td>
                <td class="acc-cell">${test.accuracy}%</td>
                <td>${test.consistency || '-'}%</td>
                <td style="text-align: right;">
                    <button class="btn-delete-row" data-delete-id="${test.id}" title="Delete session">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            elements.historyTableBody.appendChild(tr);
        });
    }

    // Render main improvement line chart
    function renderImprovementChart(filterMode = 'all') {
        if (!elements.improvementCanvas) return;
        const tests = window.dataManager.getAllTests().slice().reverse();
        let filtered = tests;

        if (filterMode !== 'all') {
            const targetDur = parseInt(filterMode, 10);
            filtered = tests.filter(t => t.mode === 'time' && t.duration === targetDur);
        }

        if (state.currentChartInstance) {
            state.currentChartInstance.destroy();
        }

        const ctx = elements.improvementCanvas.getContext('2d');

        if (filtered.length === 0) {
            ctx.clearRect(0, 0, elements.improvementCanvas.width, elements.improvementCanvas.height);
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Plus Jakarta Sans';
            ctx.textAlign = 'center';
            ctx.fillText('No tests found for this filter. Complete more tests to view graph.', elements.improvementCanvas.width / 2, 100);
            return;
        }

        const labels = filtered.map((t, idx) => `#${idx + 1}`);
        const wpmData = filtered.map(t => t.wpm);
        const accData = filtered.map(t => t.accuracy);

        const goldGradient = ctx.createLinearGradient(0, 0, 0, 300);
        goldGradient.addColorStop(0, 'rgba(223, 177, 91, 0.28)');
        goldGradient.addColorStop(1, 'rgba(223, 177, 91, 0.0)');

        state.currentChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net WPM',
                        data: wpmData,
                        borderColor: '#dfb15b',
                        backgroundColor: goldGradient,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2.5,
                        pointBackgroundColor: '#dfb15b',
                        pointHoverRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Accuracy %',
                        data: accData,
                        borderColor: '#38bdf8',
                        borderDash: [5, 5],
                        tension: 0.3,
                        borderWidth: 1.8,
                        pointRadius: 0,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Plus Jakarta Sans', size: 12 },
                            boxWidth: 14
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 24, 0.95)',
                        borderColor: 'rgba(223, 177, 91, 0.4)',
                        borderWidth: 1,
                        titleColor: '#dfb15b',
                        bodyColor: '#f8fafc',
                        titleFont: { family: 'JetBrains Mono', weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Words Per Minute', color: '#dfb15b' },
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#dfb15b', font: { family: 'JetBrains Mono', size: 11 } },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Accuracy %', color: '#38bdf8' },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#38bdf8', font: { family: 'JetBrains Mono', size: 11 } },
                        min: 70,
                        max: 100
                    }
                }
            }
        });
    }

    // -------------------------------------------------------------
    // Event Listeners & Interactions
    // -------------------------------------------------------------
    function attachEventListeners() {
        window.addEventListener('keydown', handleKeyDown);
        elements.wordsCard.addEventListener('click', focusHiddenInput);

        elements.restartTestBtn.addEventListener('click', () => {
            resetTest(true);
        });

        // Mode Switching: Time, Words, Quotes, Burst, Symbols, Zen, Drill
        elements.modeTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.modeTypeButtons.forEach(b => {
                    b.classList.remove('active');
                    b.classList.remove('drill-active');
                });

                state.modeType = btn.dataset.modeType;

                if (state.modeType === 'time') {
                    btn.classList.add('active');
                    elements.timeOptionsGroup.style.display = 'flex';
                    elements.wordOptionsGroup.style.display = 'none';
                } else if (state.modeType === 'words') {
                    btn.classList.add('active');
                    elements.timeOptionsGroup.style.display = 'none';
                    elements.wordOptionsGroup.style.display = 'flex';
                } else if (state.modeType === 'drill') {
                    btn.classList.add('drill-active');
                    elements.timeOptionsGroup.style.display = 'none';
                    elements.wordOptionsGroup.style.display = 'none';
                } else {
                    btn.classList.add('active');
                    elements.timeOptionsGroup.style.display = 'none';
                    elements.wordOptionsGroup.style.display = 'none';
                }

                resetTest(true);
            });
        });

        // Time limits (15s, 30s, 60s [1m], 120s [2m], 300s [5m])
        elements.timeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.timeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.timeLimit = parseInt(btn.dataset.time, 10);
                resetTest(true);
            });
        });

        // Words limits
        elements.wordButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.wordButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.wordsLimit = parseInt(btn.dataset.words, 10);
                resetTest(true);
            });
        });

        // Modifiers: Punctuation & Numbers
        elements.togglePunctuation.addEventListener('click', () => {
            state.punctuation = !state.punctuation;
            elements.togglePunctuation.classList.toggle('active', state.punctuation);
            resetTest(true);
        });

        elements.toggleNumbers.addEventListener('click', () => {
            state.numbers = !state.numbers;
            elements.toggleNumbers.classList.toggle('active', state.numbers);
            resetTest(true);
        });

        // Speed Accelerator: Strict Mastery Mode (Stop on Error)
        elements.toggleStrictMode.addEventListener('click', () => {
            state.strictMode = !state.strictMode;
            window.dataManager.saveSettings({ strictMode: state.strictMode });
            elements.toggleStrictMode.classList.toggle('active', state.strictMode);
            elements.strictBadge.style.display = state.strictMode ? 'inline-flex' : 'none';
            if (elements.settingStrictSelect) elements.settingStrictSelect.value = state.strictMode ? 'true' : 'false';
        });

        // Speed Accelerator: Ghost Target Pacer
        elements.togglePacer.addEventListener('click', () => {
            state.ghostPacer = !state.ghostPacer;
            window.dataManager.saveSettings({ ghostPacer: state.ghostPacer });
            elements.togglePacer.classList.toggle('active', state.ghostPacer);
            elements.pacerBadge.style.display = state.ghostPacer ? 'inline-flex' : 'none';
            if (!state.ghostPacer) {
                elements.ghostCaret.classList.remove('active');
            }
        });

        // Webpage Input Field for custom Ghost Pacer WPM (Replaces prompt dialog)
        function openPacerEditor() {
            if (elements.pacerDisplayGroup && elements.pacerInlineEditor) {
                elements.pacerDisplayGroup.style.display = 'none';
                elements.pacerInlineEditor.style.display = 'flex';
                elements.pacerInlineInput.value = state.ghostPacerWpm || 70;
                elements.pacerInlineInput.focus();
                elements.pacerInlineInput.select();
            }
        }

        function closePacerEditor() {
            if (elements.pacerDisplayGroup && elements.pacerInlineEditor) {
                elements.pacerInlineEditor.style.display = 'none';
                elements.pacerDisplayGroup.style.display = 'flex';
            }
        }

        function savePacerCustomWpm() {
            if (!elements.pacerInlineInput) return;
            const valStr = elements.pacerInlineInput.value.trim();
            const parsed = parseInt(valStr, 10);
            if (!isNaN(parsed) && parsed > 0) {
                const targetVal = Math.max(20, Math.min(250, parsed));
                state.ghostPacer = true;
                state.ghostPacerWpm = targetVal;
                window.dataManager.saveSettings({ ghostPacer: true, ghostPacerWpm: targetVal });
                applySettings(window.dataManager.settings);
                resetTest(false);
            }
            closePacerEditor();
            focusHiddenInput();
        }

        elements.btnCustomPacerWpm.addEventListener('click', (e) => {
            e.stopPropagation();
            openPacerEditor();
        });

        if (elements.pacerConfirmBtn) {
            elements.pacerConfirmBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                savePacerCustomWpm();
            });
        }

        if (elements.pacerCancelBtn) {
            elements.pacerCancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closePacerEditor();
                focusHiddenInput();
            });
        }

        if (elements.pacerInlineInput) {
            elements.pacerInlineInput.addEventListener('keydown', (e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                    e.preventDefault();
                    savePacerCustomWpm();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closePacerEditor();
                    focusHiddenInput();
                }
            });
        }

        // Close pacer inline editor when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.pacerControlWrapper && 
                elements.pacerInlineEditor && 
                elements.pacerInlineEditor.style.display !== 'none' && 
                !elements.pacerControlWrapper.contains(e.target)) {
                savePacerCustomWpm();
            }
        });

        // Launch Targeted Weakness Practice button from Analytics View
        elements.btnLaunchWeaknessDrill.addEventListener('click', () => {
            openTypingArena();
            elements.modeTypeButtons.forEach(b => {
                b.classList.remove('active');
                b.classList.remove('drill-active');
            });
            const drillBtn = document.getElementById('modeDrillBtn');
            if (drillBtn) drillBtn.classList.add('drill-active');
            state.modeType = 'drill';
            elements.timeOptionsGroup.style.display = 'none';
            elements.wordOptionsGroup.style.display = 'none';
            resetTest(true);
        });

        // Launch Drill from Post-Test Results Modal
        elements.btnDrillFromTest.addEventListener('click', () => {
            elements.resultsModal.classList.remove('active');
            openTypingArena();
            elements.modeTypeButtons.forEach(b => {
                b.classList.remove('active');
                b.classList.remove('drill-active');
            });
            const drillBtn = document.getElementById('modeDrillBtn');
            if (drillBtn) drillBtn.classList.add('drill-active');
            state.modeType = 'drill';
            elements.timeOptionsGroup.style.display = 'none';
            elements.wordOptionsGroup.style.display = 'none';

            const recentMisses = Object.keys(state.keyErrors || {});
            resetTest(true, recentMisses.length > 0 ? recentMisses : null);
        });

        // Sound Toggle
        elements.soundToggleBtn.addEventListener('click', () => {
            const types = ['thock', 'clicky', 'soft', 'muted'];
            const curIdx = types.indexOf(window.soundEngine.soundType);
            const nextType = types[(curIdx + 1) % types.length];
            window.soundEngine.soundType = nextType;
            window.dataManager.saveSettings({ sound: nextType });
            if (elements.settingSoundSelect) elements.settingSoundSelect.value = nextType;
            updateSoundToggleUI();
            window.soundEngine.playKeySound(false, false);
        });

        // Navigation Views
        elements.navTypingView.addEventListener('click', openTypingArena);
        elements.navAnalyticsView.addEventListener('click', openAnalyticsDashboard);
        elements.brandLogo.addEventListener('click', openTypingArena);

        // Chart Filter Buttons
        elements.chartFilterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.chartFilterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeAnalyticsFilter = btn.dataset.filter;
                renderImprovementChart(state.activeAnalyticsFilter);
            });
        });

        // Clear History
        elements.clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all typing test history? This action cannot be undone.')) {
                window.dataManager.clearAllHistory();
                refreshAnalyticsData();
            }
        });

        // Delete Row in History Table
        elements.historyTableBody.addEventListener('click', (e) => {
            const delBtn = e.target.closest('[data-delete-id]');
            if (delBtn) {
                const id = delBtn.dataset.deleteId;
                window.dataManager.deleteTest(id);
                refreshAnalyticsData();
            }
        });

        // Export data
        elements.exportDataBtn.addEventListener('click', () => {
            window.dataManager.exportJSON();
        });

        // Import data
        elements.importJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const res = window.dataManager.importJSON(event.target.result);
                if (res.success) {
                    alert(`Successfully imported ${res.count} test sessions!`);
                    refreshAnalyticsData();
                } else {
                    alert('Error importing JSON: ' + res.error);
                }
            };
            reader.readAsText(file);
        });

        // Results Modal actions
        elements.closeResultsModalBtn.addEventListener('click', () => {
            elements.resultsModal.classList.remove('active');
            resetTest(true);
        });

        elements.resNextTestBtn.addEventListener('click', () => {
            elements.resultsModal.classList.remove('active');
            resetTest(true);
        });

        elements.resViewAnalyticsBtn.addEventListener('click', () => {
            elements.resultsModal.classList.remove('active');
            openAnalyticsDashboard();
        });

        // Settings Modal
        elements.openSettingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.add('active');
        });

        elements.closeSettingsBtn.addEventListener('click', () => {
            elements.settingsModal.classList.remove('active');
        });

        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                elements.settingsModal.classList.remove('active');
            }
        });

        // Settings Controls
        elements.settingThemeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            window.dataManager.saveSettings({ theme });
            applySettings(window.dataManager.settings);
        });

        elements.settingStrictSelect.addEventListener('change', (e) => {
            const strict = e.target.value === 'true';
            window.dataManager.saveSettings({ strictMode: strict });
            applySettings(window.dataManager.settings);
        });

        elements.settingCustomPacerInput.addEventListener('change', (e) => {
            const val = Math.max(20, Math.min(250, parseInt(e.target.value, 10) || 70));
            window.dataManager.saveSettings({ ghostPacer: true, ghostPacerWpm: val });
            applySettings(window.dataManager.settings);
        });

        elements.settingCaretSelect.addEventListener('change', (e) => {
            const caret = e.target.value;
            window.dataManager.saveSettings({ caretStyle: caret });
            applySettings(window.dataManager.settings);
        });

        elements.settingSoundSelect.addEventListener('change', (e) => {
            const sound = e.target.value;
            window.dataManager.saveSettings({ sound });
            applySettings(window.dataManager.settings);
            window.soundEngine.playKeySound(false, false);
        });

        elements.settingVolumeRange.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            window.dataManager.saveSettings({ soundVolume: vol });
            window.soundEngine.volume = vol;
        });

        elements.settingWordBankSelect.addEventListener('change', (e) => {
            const bank = e.target.value;
            window.dataManager.saveSettings({ wordBank: bank });
            resetTest(true);
        });

        // Hotkey: Tab + Enter restarts or advances test
        let tabPressed = false;
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') tabPressed = true;
            if (e.key === 'Enter' && tabPressed) {
                e.preventDefault();
                elements.resultsModal.classList.remove('active');
                resetTest(true);
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Tab') tabPressed = false;
        });

        window.addEventListener('resize', () => {
            updateCaretPosition();
        });
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Launch Application
    initApp();
});
