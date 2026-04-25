// 音效系统
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = CONFIG.audio.enabled;
        this.volume = CONFIG.audio.volume;
        this.initialized = false;
    }

    // 初始化音频上下文
    init() {
        if (this.initialized) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // 播放音效
    playTone(frequency, duration, type = 'sine', volume = this.volume) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 正确按键音效（愉快的高音）
    playCorrect() {
        this.init();
        
        // 播放两个音符的和弦
        this.playTone(523.25, 0.1, 'sine');  // C5
        setTimeout(() => {
            this.playTone(659.25, 0.2, 'sine');  // E5
        }, 50);
        setTimeout(() => {
            this.playTone(783.99, 0.3, 'sine');  // G5
        }, 100);
    }

    // 错误按键音效（低沉的警告音）
    playWrong() {
        this.init();
        
        this.playTone(200, 0.15, 'sawtooth', this.volume * 0.7);
        setTimeout(() => {
            this.playTone(150, 0.2, 'sawtooth', this.volume * 0.6);
        }, 80);
    }

    // 连击音效
    playCombo(comboCount) {
        this.init();
        
        const baseFreq = 440;
        const interval = 50;
        
        for (let i = 0; i < Math.min(comboCount, 5); i++) {
            setTimeout(() => {
                this.playTone(baseFreq + i * 100, 0.1, 'triangle', this.volume * 0.6);
            }, i * interval);
        }
    }

    // 游戏开始音效
    playGameStart() {
        this.init();
        
        const notes = [261.63, 329.63, 392.00, 523.25];  // C4, E4, G4, C5
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sine');
            }, i * 150);
        });
    }

    // 游戏结束音效
    playGameEnd(success = true) {
        this.init();
        
        if (success) {
            // 胜利音效
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    this.playTone(freq, 0.4, 'sine');
                }, i * 200);
            });
        } else {
            // 失败音效
            this.playTone(392.00, 0.3, 'sawtooth');
            setTimeout(() => {
                this.playTone(349.23, 0.3, 'sawtooth');
            }, 200);
            setTimeout(() => {
                this.playTone(329.63, 0.5, 'sawtooth');
            }, 400);
        }
    }

    // 等级提升音效
    playLevelUp() {
        this.init();
        
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'triangle');
            }, i * 100);
        });
    }

    // 暂停音效
    playPause() {
        this.init();
        this.playTone(440, 0.1, 'sine', this.volume * 0.5);
    }

    // 继续音效
    playResume() {
        this.init();
        this.playTone(523.25, 0.15, 'sine', this.volume * 0.5);
    }

    // 切换音效开关
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // 设置音量
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // 获取音量
    getVolume() {
        return this.volume;
    }

    // 是否启用
    isEnabled() {
        return this.enabled;
    }
}

// 创建全局音效管理器实例
const audioManager = new AudioManager();

// 导出到全局
window.audioManager = audioManager;
