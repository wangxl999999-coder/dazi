// 工具函数
const Utils = {
    // 获取随机数
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 从数组中随机选择元素
    randomFromArray(arr, count = 1) {
        if (count === 1) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
        const result = [];
        const temp = [...arr];
        for (let i = 0; i < count && temp.length > 0; i++) {
            const index = Math.floor(Math.random() * temp.length);
            result.push(temp[index]);
            temp.splice(index, 1);
        }
        return result;
    },

    // 随机打乱数组
    shuffleArray(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    // 格式化时间
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}';
    },

    // 计算准确率
    calculateAccuracy(correct, total) {
        if (total === 0) return 100;
        return Math.round((correct / total) * 100);
    },

    // 计算打字速度（字/分钟）
    calculateSpeed(charCount, timeInSeconds) {
        if (timeInSeconds === 0) return 0;
        return Math.round((charCount / timeInSeconds) * 60);
    },

    // 计算分数
    calculateScore(correct, wrong, combo, speed, perfect = false) {
        let score = 0;
        score += correct * CONFIG.scoring.correct;
        score += wrong * CONFIG.scoring.wrong;
        score += Math.floor(combo / 3) * CONFIG.scoring.comboBonus;
        score += speed * CONFIG.scoring.speedBonus;
        if (perfect) {
            score += CONFIG.scoring.perfectBonus;
        }
        return Math.max(0, score);
    },

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 获取当前时间字符串
    getCurrentTimeString() {
        const now = new Date();
        return now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // 验证字母大小写转换
    toUpperCase(char) {
        return char.toUpperCase();
    },

    toLowerCase(char) {
        return char.toLowerCase();
    },

    // 判断是否为字母
    isLetter(char) {
        return /^[a-zA-Z]$/.test(char);
    },

    // 判断是否为数字
    isNumber(char) {
        return /^[0-9]$/.test(char);
    },

    // 判断是否为特殊字符
    isSpecialChar(char) {
        return /^[,.?!;:]$/.test(char);
    },

    // 安全的JSON解析
    safeJSONParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return defaultValue;
        }
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 克隆对象
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }
};
