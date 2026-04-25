// 统计数据管理模块
class StatsManager {
    constructor() {
        this.storageKeys = CONFIG.storage;
    }

    // 获取最佳统计数据
    getBestStats() {
        const saved = localStorage.getItem(this.storageKeys.stats);
        if (saved) {
            return Utils.safeJSONParse(saved, {
                bestScore: 0,
                bestSpeed: 0,
                bestAccuracy: 0,
                totalPractices: 0
            });
        }
        return {
            bestScore: 0,
            bestSpeed: 0,
            bestAccuracy: 0,
            totalPractices: 0
        };
    }

    // 获取历史记录
    getHistory() {
        const saved = localStorage.getItem(this.storageKeys.history);
        if (saved) {
            return Utils.safeJSONParse(saved, []);
        }
        return [];
    }

    // 获取错误按键记录
    getErrorKeys() {
        const saved = localStorage.getItem(this.storageKeys.errors);
        if (saved) {
            return Utils.safeJSONParse(saved, {});
        }
        return {};
    }

    // 获取排序后的错误按键
    getSortedErrorKeys(limit = 10) {
        const errorKeys = this.getErrorKeys();
        const sorted = Object.entries(errorKeys)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
        
        return sorted.map(([key, count]) => ({
            key,
            count,
            display: this.getKeyDisplay(key)
        }));
    }

    // 获取按键显示值
    getKeyDisplay(key) {
        const wubiChar = CONFIG.wubiSingleChars[key];
        if (wubiChar && wubiChar !== '学习键') {
            return `${key.toUpperCase()} (${wubiChar})`;
        }
        return key.toUpperCase();
    }

    // 清除所有统计数据
    clearAll() {
        localStorage.removeItem(this.storageKeys.stats);
        localStorage.removeItem(this.storageKeys.history);
        localStorage.removeItem(this.storageKeys.errors);
    }

    // 更新UI显示
    updateStatsUI() {
        this.updateSummaryUI();
        this.updateErrorAnalysisUI();
        this.updateHistoryUI();
    }

    // 更新统计摘要UI
    updateSummaryUI() {
        const stats = this.getBestStats();
        
        const bestScoreEl = document.getElementById('best-score');
        const bestSpeedEl = document.getElementById('best-speed');
        const bestAccuracyEl = document.getElementById('best-accuracy');
        const totalPracticesEl = document.getElementById('total-practices');

        if (bestScoreEl) bestScoreEl.textContent = stats.bestScore;
        if (bestSpeedEl) bestSpeedEl.textContent = stats.bestSpeed;
        if (bestAccuracyEl) bestAccuracyEl.textContent = `${stats.bestAccuracy}%`;
        if (totalPracticesEl) totalPracticesEl.textContent = stats.totalPractices;
    }

    // 更新错误分析UI
    updateErrorAnalysisUI() {
        const errorListEl = document.getElementById('error-list');
        if (!errorListEl) return;

        const sortedErrors = this.getSortedErrorKeys();

        if (sortedErrors.length === 0) {
            errorListEl.innerHTML = '<p>暂无易错记录，继续加油！</p>';
            return;
        }

        let html = '';
        sortedErrors.forEach((error, index) => {
            const percentage = this.getErrorPercentage(error.key);
            html += `
                <div class="error-item">
                    <div class="error-key">
                        <span class="error-rank">#${index + 1}</span>
                        ${error.display}
                    </div>
                    <div class="error-count">
                        <span>错误: ${error.count}次</span>
                        <span class="error-percentage">(${percentage}%)</span>
                    </div>
                </div>
            `;
        });

        errorListEl.innerHTML = html;
    }

    // 获取错误百分比
    getErrorPercentage(key) {
        const errorKeys = this.getErrorKeys();
        const totalErrors = Object.values(errorKeys).reduce((a, b) => a + b, 0);
        if (totalErrors === 0) return 0;
        return Math.round((errorKeys[key] / totalErrors) * 100);
    }

    // 更新历史记录UI
    updateHistoryUI() {
        const historyListEl = document.getElementById('history-list');
        if (!historyListEl) return;

        const history = this.getHistory();

        if (history.length === 0) {
            historyListEl.innerHTML = '<p>暂无练习记录，快去练习吧！</p>';
            return;
        }

        let html = '';
        history.slice(0, 20).forEach(record => {
            const typeLabel = record.practiceType === 'pinyin' ? '拼音练习' : '五笔练习';
            const levelLabel = CONFIG.difficulty[record.difficulty]?.name || '初级';
            
            html += `
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-type">${typeLabel} - ${levelLabel}</span>
                        <span class="history-date">${record.date}</span>
                    </div>
                    <div class="history-scores">
                        <span>🏆 ${record.score}分</span>
                        <span>⚡ ${record.speed}字/分</span>
                        <span>✅ ${record.accuracy}%</span>
                    </div>
                </div>
            `;
        });

        historyListEl.innerHTML = html;
    }

    // 获取练习类型统计
    getTypeStats() {
        const history = this.getHistory();
        const stats = {
            pinyin: { count: 0, avgScore: 0, avgSpeed: 0, avgAccuracy: 0 },
            wubi: { count: 0, avgScore: 0, avgSpeed: 0, avgAccuracy: 0 }
        };

        history.forEach(record => {
            const type = record.practiceType;
            stats[type].count++;
            stats[type].avgScore += record.score;
            stats[type].avgSpeed += record.speed;
            stats[type].avgAccuracy += record.accuracy;
        });

        // 计算平均值
        Object.keys(stats).forEach(type => {
            if (stats[type].count > 0) {
                stats[type].avgScore = Math.round(stats[type].avgScore / stats[type].count);
                stats[type].avgSpeed = Math.round(stats[type].avgSpeed / stats[type].count);
                stats[type].avgAccuracy = Math.round(stats[type].avgAccuracy / stats[type].count);
            }
        });

        return stats;
    }

    // 获取等级统计
    getLevelStats() {
        const history = this.getHistory();
        const stats = {};

        // 初始化所有等级
        Object.keys(CONFIG.difficulty).forEach(level => {
            stats[level] = {
                name: CONFIG.difficulty[level].name,
                count: 0,
                bestScore: 0,
                avgScore: 0
            };
        });

        // 计算统计
        history.forEach(record => {
            const level = record.difficulty;
            if (stats[level]) {
                stats[level].count++;
                stats[level].avgScore += record.score;
                stats[level].bestScore = Math.max(stats[level].bestScore, record.score);
            }
        });

        // 计算平均值
        Object.keys(stats).forEach(level => {
            if (stats[level].count > 0) {
                stats[level].avgScore = Math.round(stats[level].avgScore / stats[level].count);
            }
        });

        return stats;
    }

    // 导出数据
    exportData() {
        const data = {
            stats: this.getBestStats(),
            history: this.getHistory(),
            errors: this.getErrorKeys(),
            exportDate: Utils.getCurrentTimeString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typing-stats-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 导入数据
    importData(data) {
        try {
            if (data.stats) {
                localStorage.setItem(this.storageKeys.stats, JSON.stringify(data.stats));
            }
            if (data.history) {
                localStorage.setItem(this.storageKeys.history, JSON.stringify(data.history));
            }
            if (data.errors) {
                localStorage.setItem(this.storageKeys.errors, JSON.stringify(data.errors));
            }
            return true;
        } catch (e) {
            console.error('导入数据失败:', e);
            return false;
        }
    }
}

// 创建全局统计管理器实例
const statsManager = new StatsManager();

// 清除所有统计数据
function clearStats() {
    if (confirm('确定要清除所有练习记录吗？此操作不可恢复！')) {
        statsManager.clearAll();
        statsManager.updateStatsUI();
        alert('所有记录已清除！');
    }
}

// 导出到全局
window.statsManager = statsManager;
window.clearStats = clearStats;
