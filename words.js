// Curated word banks for FastType Luxury Typing Suite
const WORD_BANKS = {
    standard: [
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
        "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
        "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
        "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
        "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
        "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
        "great", "between", "need", "large", "under", "system", "program", "world", "state", "place",
        "never", "found", "through", "during", "before", "while", "should", "without", "again", "number",
        "part", "every", "night", "point", "little", "power", "water", "small", "house", "line",
        "light", "might", "world", "still", "study", "always", "right", "hand", "high", "simple",
        "sound", "differ", "move", "sentence", "thought", "head", "form", "keep", "group", "stand",
        "country", "problem", "plant", "start", "story", "father", "far", "run", "press", "close",
        "night", "real", "life", "few", "north", "book", "carry", "took", "science", "eat",
        "room", "friend", "began", "idea", "fish", "mountain", "stop", "once", "base", "hear",
        "horse", "cut", "sure", "watch", "color", "face", "wood", "main", "open", "seem",
        "together", "next", "white", "children", "begin", "walk", "example", "ease", "paper", "group",
        "always", "music", "those", "both", "mark", "often", "letter", "until", "mile", "river",
        "car", "feet", "care", "second", "book", "carry", "took", "rain", "eat", "room",
        "craft", "speed", "focus", "drive", "pulse", "stream", "glide", "swift", "rhythm", "zenith",
        "luxury", "smooth", "nexus", "vertex", "matrix", "vector", "signal", "radiant", "flow", "tempo",
        "zen", "peak", "hyper", "ultra", "drift", "prime", "vibe", "orbit", "chrono",
        "tactile", "switch", "linear", "spring", "cadence", "velocity", "poise", "precision", "streak"
    ],
    advanced: [
        "sophisticated", "equilibrium", "architecture", "phenomenon", "crystallize",
        "transcendence", "quintessential", "kaleidoscope", "luminescence", "perspicacity",
        "resilience", "connoisseur", "metamorphosis", "synchronicity", "juxtaposition",
        "renaissance", "ephemeral", "paradigm", "trajectory", "ambivalence",
        "serendipity", "magnanimous", "eloquence", "benevolent", "labyrinth",
        "clandestine", "verisimilitude", "aesthetic", "panacea", "idiosyncrasy",
        "mellifluous", "nostalgia", "ineffable", "sonorous", "solitude",
        "effervescent", "surreptitious", "equanimity", "pristine", "luminary",
        "magnificence", "infallible", "scintillating", "retrospective", "quintessence"
    ],
    code: [
        "function", "const", "return", "import", "export", "async", "await", "promise",
        "interface", "class", "extends", "constructor", "payload", "response", "request",
        "callback", "element", "selector", "listener", "dispatch", "variable", "boolean",
        "string", "number", "undefined", "filter", "reduce", "foreach", "template", "component",
        "console", "document", "window", "package", "render", "state", "props", "effect"
    ],
    ngrams: [
        "the", "and", "that", "have", "for", "not", "with", "you", "this", "but",
        "his", "from", "they", "say", "her", "she", "will", "one", "all", "would",
        "there", "their", "what", "out", "about", "who", "get", "which", "go", "when",
        "make", "can", "like", "time", "just", "him", "know", "take", "people", "into",
        "year", "your", "good", "some", "could", "them", "see", "other", "than", "then"
    ]
};

const QUOTES = [
    "Simplicity is the prerequisite for reliability and elegance.",
    "The best way to predict the future is to invent it with precision.",
    "Stay hungry, stay foolish, and never compromise on your craft.",
    "Do not pray for an easy life, pray for the strength to endure a difficult one.",
    "Focus is a muscle; the more you train deliberate cadence, the faster you glide.",
    "Perfection is achieved not when there is nothing more to add, but when nothing left to take away.",
    "Small daily improvements over time lead to stunning, compounding results.",
    "Talk is cheap. Show me the code and master the keystrokes that write it.",
    "The journey of a thousand miles begins with a single deliberate step.",
    "Quality is not an act, it is a habit forged through rhythmic consistency."
];

// Generates words array based on type, punctuation, and numbers flags
function getRandomWords(count = 50, mode = 'standard', includePunctuation = false, includeNumbers = false) {
    const pool = WORD_BANKS[mode] || WORD_BANKS.standard;
    const punctuationMarks = [".", ",", ";", "!", "?"];
    const words = [];

    for (let i = 0; i < count; i++) {
        let word = pool[Math.floor(Math.random() * pool.length)];

        if (includeNumbers && Math.random() < 0.18) {
            word = Math.floor(Math.random() * 900 + 10).toString();
        } else {
            if (includePunctuation && Math.random() < 0.22) {
                const mark = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
                word = word + mark;
            }
            if (includePunctuation && Math.random() < 0.15) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
        }
        words.push(word);
    }
    return words;
}

// Quote Mode generator
function getRandomQuote() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return q.split(" ");
}

// Speed Burst N-Grams generator (Short high-tempo clusters to build burst speed)
function getBurstWords(count = 20) {
    const list = [];
    for (let i = 0; i < count; i++) {
        list.push(WORD_BANKS.ngrams[Math.floor(Math.random() * WORD_BANKS.ngrams.length)]);
    }
    return list;
}

// Numbers & Symbols Drill generator
function getNumbersAndSymbolsWords(count = 30) {
    const symbols = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "[", "]", "{", "}", ";", ":", "<", ">", "?", "/"];
    const baseWords = ["speed", "type", "fast", "code", "run", "key", "mode", "test", "peak", "core", "data", "flow", "lux", "pro"];
    const result = [];

    for (let i = 0; i < count; i++) {
        const rand = Math.random();
        if (rand < 0.35) {
            // pure number cluster (e.g. 1984, 2026, 420)
            result.push(Math.floor(Math.random() * 9999 + 10).toString());
        } else if (rand < 0.7) {
            // word wrapped in symbols (e.g. #speed, @data!, [fast])
            const w = baseWords[Math.floor(Math.random() * baseWords.length)];
            const s1 = symbols[Math.floor(Math.random() * symbols.length)];
            const s2 = symbols[Math.floor(Math.random() * symbols.length)];
            result.push(`${s1}${w}${s2}`);
        } else {
            // code-like expression (e.g. x=42;, count++;, data[0])
            const num = Math.floor(Math.random() * 100);
            result.push(`val_${num}=${num * 2};`);
        }
    }
    return result;
}

// Targeted weakness drill words containing user's problem keys
function getWeaknessDrillWords(problemKeys = [], count = 35) {
    if (!problemKeys || problemKeys.length === 0) {
        problemKeys = ['e', 'r', 't', 'a', 's', 'p'];
    }

    const cleanKeys = problemKeys.map(k => (typeof k === 'string' ? k.toLowerCase() : (k.key || '')).toLowerCase()).filter(k => k.length === 1 && /[a-z0-9]/.test(k));
    if (cleanKeys.length === 0) cleanKeys.push('p', 'q', 'x', 'z', 'c');

    const allWords = [...WORD_BANKS.standard, ...WORD_BANKS.advanced, ...WORD_BANKS.code];
    
    const weightedWords = allWords.filter(word => {
        const lower = word.toLowerCase();
        return cleanKeys.some(k => lower.includes(k));
    });

    const chosen = [];
    const sourcePool = weightedWords.length >= 10 ? weightedWords : allWords;

    for (let i = 0; i < count; i++) {
        const word = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        chosen.push(word);
    }

    return chosen;
}
