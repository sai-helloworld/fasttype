// FastType Luxury Mechanical Switch Synthesizer (Web Audio API)
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.soundType = 'thock'; // 'thock' | 'clicky' | 'soft' | 'muted'
        this.volume = 0.45;
        this.isAudioUnlocked = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.isAudioUnlocked = true;
    }

    playKeySound(isSpace = false, isError = false) {
        if (!this.enabled || this.soundType === 'muted') return;
        if (!this.ctx) {
            this.init();
        }
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;

        if (isError) {
            this.playErrorSound(now);
            return;
        }

        switch (this.soundType) {
            case 'thock':
                this.playThock(now, isSpace);
                break;
            case 'clicky':
                this.playClicky(now, isSpace);
                break;
            case 'soft':
                this.playSoft(now, isSpace);
                break;
            default:
                this.playThock(now, isSpace);
                break;
        }
    }

    playThock(time, isSpace) {
        // Deep resonant mechanical switch acoustic synthesis
        const baseFreq = isSpace ? 110 : (160 + (Math.random() * 30 - 15));
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.07);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.06);

        // Click transient noise
        const bufferSize = this.ctx.sampleRate * 0.02;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08 * this.volume, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        gain.gain.setValueAtTime(0.3 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(time);
        noise.start(time);
        osc.stop(time + 0.08);
        noise.stop(time + 0.03);
    }

    playClicky(time, isSpace) {
        // Crisp tactile mechanical click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = isSpace ? 1400 : (1800 + (Math.random() * 200 - 100));

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.exponentialRampToValueAtTime(300, time + 0.03);

        gain.gain.setValueAtTime(0.2 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.04);
    }

    playSoft(time, isSpace) {
        // Muted velvet bottom-out
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = isSpace ? 90 : (130 + Math.random() * 20);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

        gain.gain.setValueAtTime(0.22 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.06);
    }

    playErrorSound(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(90, time + 0.12);

        gain.gain.setValueAtTime(0.18 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.13);
    }
}

window.soundEngine = new SoundFX();
