// 游戏核心逻辑
class Game {
    constructor() {
        this.state = GAME_STATE.IDLE;
        this.practiceType = 'pinyin';  // pinyin | wubi
        this.difficulty = 1;
        this.targetText = '';
        this.currentIndex = 0;
        this.inputText = '';
        
        // 游戏统计
        this.stats = {
            score: 0,
            correct: 0,
            wrong: 0,
            combo: 0,
            maxCombo: 0,
            startTime: 0,
            elapsedTime: 0,
            charactersTyped: 0
        };

        // 计时器
        this.timerInterval = null;
        this.timeRemaining = 60;

        // 错误按键记录（用于智能学习）
        this.errorKeys = {};
        
        // 回调函数
        this.onUpdate = null;
        this.onEnd = null;
    }

    // 初始化游戏
    init(options = {}) {
        this.practiceType = options.practiceType || 'pinyin';
        this.difficulty = options.difficulty || 1;
        
        const config = CONFIG.difficulty[this.difficulty];
        this.timeRemaining = config.time;
        
        this.resetStats();
        this.loadErrorKeys();
    }

    // 重置统计
    resetStats() {
        this.stats = {
            score: 0,
            correct: 0,
            wrong: 0,
            combo: 0,
            maxCombo: 0,
            startTime: 0,
            elapsedTime: 0,
            charactersTyped: 0
        };
        this.currentIndex = 0;
        this.inputText = '';
    }

    // 加载错误按键记录
    loadErrorKeys() {
        const saved = localStorage.getItem(CONFIG.storage.errors);
        if (saved) {
            this.errorKeys = Utils.safeJSONParse(saved, {});
        }
    }

    // 保存错误按键记录
    saveErrorKeys() {
        localStorage.setItem(CONFIG.storage.errors, JSON.stringify(this.errorKeys));
    }

    // 记录错误按键
    recordErrorKey(key) {
        if (!this.errorKeys[key]) {
            this.errorKeys[key] = 0;
        }
        this.errorKeys[key]++;
        this.saveErrorKeys();
    }

    // 生成目标文本
    generateTarget() {
        const config = CONFIG.difficulty[this.difficulty];
        const targetLength = config.targetLength;
        
        if (this.practiceType === 'pinyin') {
            return this.generatePinyinTarget(targetLength);
        } else {
            return this.generateWubiTarget(targetLength);
        }
    }

    // 生成拼音练习目标
    generatePinyinTarget(length) {
        // 优先包含易错按键
        const errorKeys = Object.keys(this.errorKeys)
            .sort((a, b) => this.errorKeys[b] - this.errorKeys[a])
            .slice(0, 3);

        let target = '';
        
        // 如果有易错按键，优先加入
        if (errorKeys.length > 0) {
            const errorCount = Math.min(Math.floor(length * 0.3), errorKeys.length * 2);
            for (let i = 0; i < errorCount; i++) {
                const key = Utils.randomFromArray(errorKeys);
                target += key;
            }
        }

        // 补充剩余字符
        while (target.length < length) {
            // 随机选择字符、单词或句子
            const type = Utils.random(1, 3);
            
            if (type === 1) {
                // 单个字符
                target += Utils.randomFromArray(CONFIG.pinyinChars);
            } else if (type === 2) {
                // 单词
                const word = Utils.randomFromArray(CONFIG.pinyinWords);
                if (target.length + word.length <= length) {
                    target += word;
                } else {
                    target += Utils.randomFromArray(CONFIG.pinyinChars);
                }
            } else {
                // 简单句子
                const sentences = [
                    'nihao', 'woaini', 'zhongguo', 'xuexi', 'gongzuo',
                    'jiankang', 'kuaile', 'xingfu', 'meili', 'congming'
                ];
                const sentence = Utils.randomFromArray(sentences);
                if (target.length + sentence.length <= length) {
                    target += sentence;
                } else {
                    target += Utils.randomFromArray(CONFIG.pinyinChars);
                }
            }
        }

        return target.substring(0, length);
    }

    // 生成五笔练习目标
    generateWubiTarget(length) {
        // 优先包含易错按键
        const errorKeys = Object.keys(this.errorKeys)
            .sort((a, b) => this.errorKeys[b] - this.errorKeys[a])
            .slice(0, 3);

        const wubiKeys = Object.keys(CONFIG.wubiSingleChars).filter(k => k !== 'z');
        let target = '';

        // 如果有易错按键，优先加入
        if (errorKeys.length > 0) {
            const validErrorKeys = errorKeys.filter(k => wubiKeys.includes(k));
            const errorCount = Math.min(Math.floor(length * 0.4), validErrorKeys.length * 2);
            for (let i = 0; i < errorCount; i++) {
                const key = Utils.randomFromArray(validErrorKeys);
                target += CONFIG.wubiSingleChars[key];
            }
        }

        // 补充剩余字符
        while (target.length < length) {
            const key = Utils.randomFromArray(wubiKeys);
            target += CONFIG.wubiSingleChars[key];
        }

        return target.substring(0, length);
    }

    // 获取按键对应的显示值
    getDisplayValue(key) {
        if (this.practiceType === 'wubi') {
            return CONFIG.wubiSingleChars[key] || key;
        }
        return key;
    }

    // 开始游戏
    start() {
        if (this.state !== GAME_STATE.IDLE && this.state !== GAME_STATE.ENDED) {
            return;
        }

        this.state = GAME_STATE.PLAYING;
        this.stats.startTime = Date.now();
        
        // 生成目标文本
        this.targetText = this.generateTarget();
        this.currentIndex = 0;
        this.inputText = '';

        // 开始计时器
        this.startTimer();

        // 开始监听键盘
        keyboardManager.startListening();
        keyboardManager.addKeyListener(this.handleKeyInput.bind(this));

        // 触发更新回调
        if (this.onUpdate) {
            this.onUpdate(this.getGameData());
        }

        // 高亮第一个目标按键
        this.highlightNextTarget();

        // 播放开始音效
        audioManager.playGameStart();
    }

    // 暂停游戏
    pause() {
        if (this.state !== GAME_STATE.PLAYING) return;

        this.state = GAME_STATE.PAUSED;
        this.stopTimer();
        keyboardManager.stopListening();

        if (this.onUpdate) {
            this.onUpdate(this.getGameData());
        }

        audioManager.playPause();
    }

    // 继续游戏
    resume() {
        if (this.state !== GAME_STATE.PAUSED) return;

        this.state = GAME_STATE.PLAYING;
        this.startTimer();
        keyboardManager.startListening();

        if (this.onUpdate) {
            this.onUpdate(this.getGameData());
        }

        // 恢复时重新高亮目标按键
        this.highlightNextTarget();

        audioManager.playResume();
    }

    // 结束游戏
    end(success = true) {
        if (this.state === GAME_STATE.ENDED) return;

        this.state = GAME_STATE.ENDED;
        this.stats.elapsedTime = (Date.now() - this.stats.startTime) / 1000;
        
        this.stopTimer();
        keyboardManager.stopListening();
        keyboardManager.clearKeyListeners();
        keyboardManager.clearHighlights();

        // 计算最终分数
        const speed = this.calculateSpeed();
        const accuracy = this.calculateAccuracy();
        const perfect = this.stats.wrong === 0 && accuracy >= CONFIG.difficulty[this.difficulty].accuracy;
        
        this.stats.score = Utils.calculateScore(
            this.stats.correct,
            this.stats.wrong,
            this.stats.maxCombo,
            speed,
            perfect
        );

        // 保存记录
        this.saveGameRecord();

        if (this.onEnd) {
            this.onEnd(this.getGameData(), success);
        }

        audioManager.playGameEnd(success && this.stats.score > 0);
    }

    // 处理按键输入
    handleKeyInput(key, keyElement) {
        if (this.state !== GAME_STATE.PLAYING) return;

        const targetChar = this.targetText[this.currentIndex];
        let correct = false;

        if (this.practiceType === 'wubi') {
            // 五笔模式：按键对应的字
            const expectedChar = CONFIG.wubiSingleChars[key];
            correct = expectedChar === targetChar;
        } else {
            // 拼音模式：直接比较字母
            correct = key.toLowerCase() === targetChar.toLowerCase();
        }

        if (correct) {
            this.handleCorrect(key, keyElement);
        } else {
            this.handleWrong(key, keyElement, targetChar);
        }

        // 检查是否完成当前目标
        if (this.currentIndex >= this.targetText.length) {
            // 生成新的目标
            this.targetText = this.generateTarget();
            this.currentIndex = 0;
            this.inputText = '';
            
            // 高亮新目标的第一个按键
            this.highlightNextTarget();
        }

        // 触发更新回调
        if (this.onUpdate) {
            this.onUpdate(this.getGameData());
        }
    }

    // 处理正确输入
    handleCorrect(key, keyElement) {
        this.stats.correct++;
        this.stats.combo++;
        this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
        this.stats.charactersTyped++;

        // 计算分数
        let points = CONFIG.scoring.correct;
        
        // 连击奖励
        if (this.stats.combo > 0 && this.stats.combo % 3 === 0) {
            points += CONFIG.scoring.comboBonus;
            audioManager.playCombo(this.stats.combo);
            this.showComboEffect(this.stats.combo);
        }

        this.stats.score += points;
        this.currentIndex++;
        this.inputText += this.getDisplayValue(key);

        // 视觉反馈
        keyboardManager.highlightCorrect(key);
        audioManager.playCorrect();

        // 高亮下一个目标
        this.highlightNextTarget();
    }

    // 处理错误输入
    handleWrong(key, keyElement, targetChar) {
        this.stats.wrong++;
        this.stats.combo = 0;

        // 扣分
        this.stats.score += CONFIG.scoring.wrong;
        this.stats.score = Math.max(0, this.stats.score);

        // 记录错误按键
        this.recordErrorKey(key);

        // 视觉反馈
        keyboardManager.highlightWrong(key);
        audioManager.playWrong();
    }

    // 高亮下一个目标
    highlightNextTarget() {
        if (this.currentIndex < this.targetText.length) {
            const nextChar = this.targetText[this.currentIndex];
            let targetKey = null;

            if (this.practiceType === 'wubi') {
                // 五笔模式：找到对应的按键
                for (const [key, char] of Object.entries(CONFIG.wubiSingleChars)) {
                    if (char === nextChar) {
                        targetKey = key;
                        break;
                    }
                }
            } else {
                // 拼音模式：直接是字母
                targetKey = nextChar.toLowerCase();
            }

            if (targetKey) {
                keyboardManager.highlightTarget(targetKey);
            }
        }
    }

    // 显示连击效果
    showComboEffect(combo) {
        const effect = document.createElement('div');
        effect.className = 'combo-display';
        effect.textContent = `🔥 ${combo} 连击!`;
        document.body.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    // 开始计时器
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.stats.elapsedTime = (Date.now() - this.stats.startTime) / 1000;

            if (this.onUpdate) {
                this.onUpdate(this.getGameData());
            }

            if (this.timeRemaining <= 0) {
                this.end(true);
            }
        }, 1000);
    }

    // 停止计时器
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // 计算打字速度
    calculateSpeed() {
        if (this.stats.elapsedTime === 0) return 0;
        return Utils.calculateSpeed(this.stats.charactersTyped, this.stats.elapsedTime);
    }

    // 计算准确率
    calculateAccuracy() {
        const total = this.stats.correct + this.stats.wrong;
        return Utils.calculateAccuracy(this.stats.correct, total);
    }

    // 获取游戏数据
    getGameData() {
        return {
            state: this.state,
            practiceType: this.practiceType,
            difficulty: this.difficulty,
            targetText: this.targetText,
            currentIndex: this.currentIndex,
            inputText: this.inputText,
            timeRemaining: this.timeRemaining,
            stats: {
                ...this.stats,
                speed: this.calculateSpeed(),
                accuracy: this.calculateAccuracy()
            }
        };
    }

    // 保存游戏记录
    saveGameRecord() {
        const gameData = this.getGameData();
        const record = {
            id: Utils.generateId(),
            date: Utils.getCurrentTimeString(),
            practiceType: gameData.practiceType,
            difficulty: gameData.difficulty,
            score: gameData.stats.score,
            speed: gameData.stats.speed,
            accuracy: gameData.stats.accuracy,
            correct: gameData.stats.correct,
            wrong: gameData.stats.wrong,
            maxCombo: gameData.stats.maxCombo
        };

        // 获取历史记录
        let history = [];
        const savedHistory = localStorage.getItem(CONFIG.storage.history);
        if (savedHistory) {
            history = Utils.safeJSONParse(savedHistory, []);
        }

        // 添加新记录（最多保存50条）
        history.unshift(record);
        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        localStorage.setItem(CONFIG.storage.history, JSON.stringify(history));

        // 更新最佳成绩
        this.updateBestStats(record);
    }

    // 更新最佳统计
    updateBestStats(record) {
        let bestStats = {
            bestScore: 0,
            bestSpeed: 0,
            bestAccuracy: 0,
            totalPractices: 0
        };

        const saved = localStorage.getItem(CONFIG.storage.stats);
        if (saved) {
            bestStats = Utils.safeJSONParse(saved, bestStats);
        }

        bestStats.bestScore = Math.max(bestStats.bestScore, record.score);
        bestStats.bestSpeed = Math.max(bestStats.bestSpeed, record.speed);
        bestStats.bestAccuracy = Math.max(bestStats.bestAccuracy, record.accuracy);
        bestStats.totalPractices++;

        localStorage.setItem(CONFIG.storage.stats, JSON.stringify(bestStats));
    }

    // 重新开始
    restart() {
        this.end(false);
        this.state = GAME_STATE.IDLE;
        this.resetStats();
        this.init({
            practiceType: this.practiceType,
            difficulty: this.difficulty
        });
    }

    // 设置更新回调
    setOnUpdate(callback) {
        this.onUpdate = callback;
    }

    // 设置结束回调
    setOnEnd(callback) {
        this.onEnd = callback;
    }
}

// 创建全局游戏实例
const game = new Game();

// 导出到全局
window.game = game;
