// 主入口文件 - 控制整个应用的交互

// DOM 元素缓存
const DOM = {
    sections: document.querySelectorAll('.section'),
    navButtons: document.querySelectorAll('.nav-btn'),
    practiceType: document.getElementById('practice-type'),
    difficultyLevel: document.getElementById('difficulty-level'),
    gamePanel: document.getElementById('game-panel'),
    resultPanel: document.getElementById('result-panel'),
    settingsPanel: null,
    startGameBtn: document.querySelector('.start-game-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    
    // 游戏统计显示元素
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    correctCount: document.getElementById('correct-count'),
    wrongCount: document.getElementById('wrong-count'),
    accuracy: document.getElementById('accuracy'),
    speed: document.getElementById('speed'),
    
    // 目标显示
    targetHint: document.getElementById('target-hint'),
    targetText: document.getElementById('target-text'),
    inputDisplay: document.getElementById('input-display'),
    
    // 结果显示
    resultTitle: document.getElementById('result-title'),
    finalScore: document.getElementById('final-score'),
    finalSpeed: document.getElementById('final-speed'),
    finalAccuracy: document.getElementById('final-accuracy'),
    finalCorrect: document.getElementById('final-correct'),
    finalWrong: document.getElementById('final-wrong'),
    resultMessage: document.getElementById('result-message')
};

// 当前状态
let currentSection = 'home';

// 初始化应用
function initApp() {
    // 绑定导航事件
    bindNavigationEvents();
    
    // 初始化键盘管理器
    keyboardManager.initVirtualKeyboard();
    
    // 初始化游戏回调
    game.setOnUpdate(handleGameUpdate);
    game.setOnEnd(handleGameEnd);
    
    // 初始化统计页面
    statsManager.updateStatsUI();
    
    // 添加粒子背景效果
    createParticles();
}

// 绑定导航事件
function bindNavigationEvents() {
    DOM.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
        });
    });

    // 开始游戏按钮
    if (DOM.startGameBtn) {
        DOM.startGameBtn.addEventListener('click', startGame);
    }

    // 练习类型切换
    if (DOM.practiceType) {
        DOM.practiceType.addEventListener('change', handlePracticeTypeChange);
    }

    // 难度切换
    if (DOM.difficultyLevel) {
        DOM.difficultyLevel.addEventListener('change', handleDifficultyChange);
    }
}

// 显示指定页面
function showSection(sectionId) {
    // 更新导航状态
    DOM.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // 更新页面显示
    DOM.sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    currentSection = sectionId;

    // 特殊处理
    if (sectionId === 'stats') {
        statsManager.updateStatsUI();
    }
}

// 处理练习类型切换
function handlePracticeTypeChange() {
    const type = DOM.practiceType.value;
    keyboardManager.updateKeyLabels(type);
    
    // 更新提示文本
    if (DOM.targetHint) {
        if (type === 'wubi') {
            DOM.targetHint.textContent = '请输入对应汉字的按键：';
        } else {
            DOM.targetHint.textContent = '请输入以下字符：';
        }
    }
}

// 处理难度切换
function handleDifficultyChange() {
    // 可以在这里添加难度变化的视觉反馈
    const level = parseInt(DOM.difficultyLevel.value);
    const config = CONFIG.difficulty[level];
    
    // 显示难度提示
    showToast(`已选择：${config.name} (${config.description})`);
}

// 开始游戏
function startGame() {
    const practiceType = DOM.practiceType.value;
    const difficulty = parseInt(DOM.difficultyLevel.value);

    // 初始化游戏
    game.init({
        practiceType: practiceType,
        difficulty: difficulty
    });

    // 显示游戏面板
    if (DOM.gamePanel) {
        DOM.gamePanel.style.display = 'block';
    }
    if (DOM.resultPanel) {
        DOM.resultPanel.style.display = 'none';
    }

    // 更新键盘显示
    keyboardManager.updateKeyLabels(practiceType);
    keyboardManager.toggleVirtualKeyboard(true);

    // 开始游戏
    game.start();

    // 更新提示文本
    if (DOM.targetHint) {
        if (practiceType === 'wubi') {
            DOM.targetHint.textContent = '请输入对应汉字的按键：';
        } else {
            DOM.targetHint.textContent = '请输入以下字符：';
        }
    }
}

// 暂停/继续游戏
function togglePause() {
    if (game.state === GAME_STATE.PLAYING) {
        game.pause();
        showPauseOverlay();
    } else if (game.state === GAME_STATE.PAUSED) {
        game.resume();
        hidePauseOverlay();
    }
}

// 重新开始游戏
function restartGame() {
    game.restart();
    
    // 隐藏结果面板
    if (DOM.resultPanel) {
        DOM.resultPanel.style.display = 'none';
    }
    if (DOM.gamePanel) {
        DOM.gamePanel.style.display = 'block';
    }

    // 开始新游戏
    game.start();
}

// 退出游戏
function quitGame() {
    game.end(false);
    
    // 隐藏游戏面板
    if (DOM.gamePanel) {
        DOM.gamePanel.style.display = 'none';
    }
    if (DOM.resultPanel) {
        DOM.resultPanel.style.display = 'none';
    }

    // 停止键盘监听
    keyboardManager.stopListening();
    keyboardManager.clearHighlights();
    keyboardManager.toggleVirtualKeyboard(false);
}

// 处理游戏更新
function handleGameUpdate(gameData) {
    // 更新时间
    if (DOM.timer) {
        DOM.timer.textContent = gameData.timeRemaining;
        // 时间警告
        if (gameData.timeRemaining <= 10) {
            DOM.timer.style.color = '#f44336';
        } else {
            DOM.timer.style.color = '';
        }
    }

    // 更新统计
    if (DOM.score) DOM.score.textContent = gameData.stats.score;
    if (DOM.correctCount) DOM.correctCount.textContent = gameData.stats.correct;
    if (DOM.wrongCount) DOM.wrongCount.textContent = gameData.stats.wrong;
    if (DOM.accuracy) DOM.accuracy.textContent = `${gameData.stats.accuracy}%`;
    if (DOM.speed) DOM.speed.textContent = gameData.stats.speed;

    // 更新目标显示
    if (DOM.targetText) {
        DOM.targetText.textContent = gameData.targetText;
    }

    // 更新输入显示
    if (DOM.inputDisplay) {
        updateInputDisplay(gameData);
    }

    // 更新暂停按钮文本
    if (DOM.pauseBtn) {
        if (gameData.state === GAME_STATE.PAUSED) {
            DOM.pauseBtn.textContent = '▶️ 继续';
        } else {
            DOM.pauseBtn.textContent = '⏸️ 暂停';
        }
    }
}

// 更新输入显示
function updateInputDisplay(gameData) {
    const targetText = gameData.targetText;
    const currentIndex = gameData.currentIndex;
    const inputText = gameData.inputText;

    let html = '';

    // 显示已输入的字符
    for (let i = 0; i < inputText.length; i++) {
        const inputChar = inputText[i];
        const targetChar = targetText[i];
        
        if (inputChar === targetChar) {
            html += `<span class="correct">${inputChar}</span>`;
        } else {
            html += `<span class="wrong">${inputChar}</span>`;
        }
    }

    // 显示当前需要输入的字符位置
    if (currentIndex < targetText.length) {
        html += `<span class="current">${targetText[currentIndex]}</span>`;
    }

    // 显示剩余字符
    for (let i = currentIndex + 1; i < targetText.length; i++) {
        html += `<span>${targetText[i]}</span>`;
    }

    DOM.inputDisplay.innerHTML = html;
}

// 处理游戏结束
function handleGameEnd(gameData, success) {
    // 隐藏游戏面板，显示结果面板
    if (DOM.gamePanel) {
        DOM.gamePanel.style.display = 'none';
    }
    if (DOM.resultPanel) {
        DOM.resultPanel.style.display = 'block';
    }

    // 计算最终结果
    const stats = gameData.stats;
    const config = CONFIG.difficulty[gameData.difficulty];
    const passed = stats.accuracy >= config.accuracy;

    // 更新结果显示
    if (DOM.resultTitle) {
        if (passed && stats.score > 0) {
            DOM.resultTitle.textContent = '🎉 恭喜完成！';
        } else if (stats.score > 0) {
            DOM.resultTitle.textContent = '💪 继续加油！';
        } else {
            DOM.resultTitle.textContent = '📝 练习完成';
        }
    }

    if (DOM.finalScore) DOM.finalScore.textContent = stats.score;
    if (DOM.finalSpeed) DOM.finalSpeed.textContent = `${stats.speed} 字/分钟`;
    if (DOM.finalAccuracy) DOM.finalAccuracy.textContent = `${stats.accuracy}%`;
    if (DOM.finalCorrect) DOM.finalCorrect.textContent = stats.correct;
    if (DOM.finalWrong) DOM.finalWrong.textContent = stats.wrong;

    // 更新结果消息
    if (DOM.resultMessage) {
        let message = '';
        if (stats.accuracy >= 98 && stats.speed >= 80) {
            message = '🔥 太厉害了！你已经是打字高手了！';
        } else if (stats.accuracy >= 95 && stats.speed >= 60) {
            message = '⭐ 非常棒！继续保持这个速度和准确率！';
        } else if (stats.accuracy >= 90) {
            message = '👍 不错！还可以再提高一些速度哦！';
        } else if (stats.accuracy >= 80) {
            message = '💪 继续练习，准确率还可以更高！';
        } else {
            message = '📚 不要着急，从基础开始练习，熟能生巧！';
        }
        
        if (stats.maxCombo > 5) {
            message += ` 最高连击：${stats.maxCombo} 次！`;
        }
        
        DOM.resultMessage.textContent = message;
    }

    // 更新统计页面
    statsManager.updateStatsUI();
}

// 显示暂停遮罩
function showPauseOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';
    overlay.id = 'pause-overlay';
    overlay.innerHTML = `
        <div class="pause-content">
            <h2>⏸️ 游戏暂停</h2>
            <p>按空格键或点击继续按钮恢复游戏</p>
        </div>
    `;
    
    overlay.addEventListener('click', () => {
        togglePause();
    });
    
    document.body.appendChild(overlay);
}

// 隐藏暂停遮罩
function hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 显示提示消息
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 9999;
        font-size: 0.95rem;
        animation: slideDown 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// 创建粒子背景效果
function createParticles() {
    const particleCount = 20;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            width: ${Utils.random(5, 15)}px;
            height: ${Utils.random(5, 15)}px;
            background: ${colors[Utils.random(0, colors.length - 1)]};
            border-radius: 50%;
            left: ${Utils.random(0, 100)}%;
            top: ${Utils.random(0, 100)}%;
            animation-delay: ${Utils.random(0, 3)}s;
            animation-duration: ${Utils.random(3, 6)}s;
            opacity: ${Utils.random(0.1, 0.3) / 10};
        `;
        document.body.appendChild(particle);
    }
}

// 键盘快捷键处理
document.addEventListener('keydown', (e) => {
    // 空格键暂停/继续（游戏进行中）
    if (e.code === 'Space' && (game.state === GAME_STATE.PLAYING || game.state === GAME_STATE.PAUSED)) {
        e.preventDefault();
        togglePause();
    }
    
    // ESC 键退出游戏
    if (e.code === 'Escape' && (game.state === GAME_STATE.PLAYING || game.state === GAME_STATE.PAUSED)) {
        e.preventDefault();
        quitGame();
    }
});

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 导出全局函数
window.showSection = showSection;
window.startGame = startGame;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.quitGame = quitGame;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
