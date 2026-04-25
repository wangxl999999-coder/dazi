// 键盘处理模块
class KeyboardManager {
    constructor() {
        this.virtualKeyboard = null;
        this.currentKey = null;
        this.keyListeners = [];
        this.isListening = false;
        
        // 绑定上下文，确保事件监听器可以正确移除
        this.boundHandleKeyDown = this.handlePhysicalKeyDown.bind(this);
        this.boundHandleKeyUp = this.handlePhysicalKeyUp.bind(this);
    }

    // 初始化虚拟键盘
    initVirtualKeyboard(containerId = 'virtual-keyboard') {
        this.virtualKeyboard = document.getElementById(containerId);
        if (!this.virtualKeyboard) return;
        
        this.renderVirtualKeyboard();
        this.bindVirtualKeyboardEvents();
    }

    // 渲染虚拟键盘
    renderVirtualKeyboard() {
        if (!this.virtualKeyboard) return;

        const keyboardLayout = this.getKeyboardLayout();
        let html = '<div class="keyboard-layout">';

        keyboardLayout.forEach(row => {
            html += '<div class="keyboard-row">';
            row.forEach(key => {
                const keyData = CONFIG.wubiRadicals[key] || { radicals: [key.toUpperCase()], pinyin: '' };
                html += `
                    <div class="key" data-key="${key}">
                        <div class="key-label">${key.toUpperCase()}</div>
                        <div class="key-radicals">${keyData.radicals.join('')}</div>
                        <div class="key-pinyin">${keyData.pinyin}</div>
                    </div>
                `;
            });
            html += '</div>';
        });

        html += '</div>';
        this.virtualKeyboard.innerHTML = html;
    }

    // 获取键盘布局
    getKeyboardLayout() {
        return [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        ];
    }

    // 绑定虚拟键盘事件
    bindVirtualKeyboardEvents() {
        if (!this.virtualKeyboard) return;

        this.virtualKeyboard.addEventListener('click', (e) => {
            const keyElement = e.target.closest('.key');
            if (keyElement) {
                const key = keyElement.dataset.key;
                this.handleKeyPress(key, keyElement);
            }
        });

        this.virtualKeyboard.addEventListener('mousedown', (e) => {
            const keyElement = e.target.closest('.key');
            if (keyElement) {
                keyElement.classList.add('active');
            }
        });

        this.virtualKeyboard.addEventListener('mouseup', (e) => {
            const keyElement = e.target.closest('.key');
            if (keyElement) {
                keyElement.classList.remove('active');
            }
        });

        this.virtualKeyboard.addEventListener('mouseleave', (e) => {
            const keyElement = e.target.closest('.key');
            if (keyElement) {
                keyElement.classList.remove('active');
            }
        });
    }

    // 开始监听物理键盘
    startListening() {
        if (this.isListening) return;
        
        this.isListening = true;
        document.addEventListener('keydown', this.boundHandleKeyDown);
        document.addEventListener('keyup', this.boundHandleKeyUp);
    }

    // 停止监听物理键盘
    stopListening() {
        if (!this.isListening) return;
        
        this.isListening = false;
        document.removeEventListener('keydown', this.boundHandleKeyDown);
        document.removeEventListener('keyup', this.boundHandleKeyUp);
    }

    // 处理物理键盘按下
    handlePhysicalKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (!Utils.isLetter(key)) return;
        
        e.preventDefault();
        
        const keyElement = this.getKeyElement(key);
        if (keyElement) {
            keyElement.classList.add('active');
        }
        
        this.handleKeyPress(key, keyElement);
    }

    // 处理物理键盘释放
    handlePhysicalKeyUp(e) {
        const key = e.key.toLowerCase();
        
        if (!Utils.isLetter(key)) return;
        
        const keyElement = this.getKeyElement(key);
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }

    // 处理按键事件
    handleKeyPress(key, keyElement) {
        this.currentKey = key;
        
        this.keyListeners.forEach(listener => {
            listener(key, keyElement);
        });
    }

    // 添加按键监听器
    addKeyListener(callback) {
        if (typeof callback === 'function') {
            this.keyListeners.push(callback);
        }
    }

    // 移除按键监听器
    removeKeyListener(callback) {
        const index = this.keyListeners.indexOf(callback);
        if (index > -1) {
            this.keyListeners.splice(index, 1);
        }
    }

    // 清除所有监听器
    clearKeyListeners() {
        this.keyListeners = [];
    }

    // 获取按键元素
    getKeyElement(key) {
        if (!this.virtualKeyboard) return null;
        return this.virtualKeyboard.querySelector(`[data-key="${key.toLowerCase()}"]`);
    }

    // 高亮正确按键
    highlightCorrect(key) {
        const keyElement = this.getKeyElement(key);
        if (keyElement) {
            keyElement.classList.remove('wrong');
            keyElement.classList.add('correct');
            setTimeout(() => {
                keyElement.classList.remove('correct');
            }, 500);
        }
    }

    // 高亮错误按键
    highlightWrong(key) {
        const keyElement = this.getKeyElement(key);
        if (keyElement) {
            keyElement.classList.remove('correct');
            keyElement.classList.add('wrong');
            setTimeout(() => {
                keyElement.classList.remove('wrong');
            }, 500);
        }
    }

    // 高亮目标按键
    highlightTarget(key) {
        this.clearHighlights();
        const keyElement = this.getKeyElement(key);
        if (keyElement) {
            keyElement.style.borderColor = '#FFD700';
            keyElement.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
        }
    }

    // 清除所有高亮
    clearHighlights() {
        if (!this.virtualKeyboard) return;
        
        const keys = this.virtualKeyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.style.borderColor = '';
            key.style.boxShadow = '';
            key.classList.remove('correct', 'wrong', 'active');
        });
    }

    // 更新按键标签（根据练习类型）
    updateKeyLabels(practiceType = 'wubi') {
        if (!this.virtualKeyboard) return;
        
        const keys = this.virtualKeyboard.querySelectorAll('.key');
        keys.forEach(keyElement => {
            const key = keyElement.dataset.key;
            
            if (practiceType === 'wubi') {
                // 五笔模式显示字根
                const keyData = CONFIG.wubiRadicals[key] || { radicals: [key.toUpperCase()], pinyin: '' };
                const radicalsEl = keyElement.querySelector('.key-radicals');
                const pinyinEl = keyElement.querySelector('.key-pinyin');
                
                if (radicalsEl) radicalsEl.textContent = keyData.radicals.join('');
                if (pinyinEl) pinyinEl.textContent = keyData.pinyin;
            } else {
                // 拼音模式显示字母
                const radicalsEl = keyElement.querySelector('.key-radicals');
                const pinyinEl = keyElement.querySelector('.key-pinyin');
                
                if (radicalsEl) radicalsEl.textContent = key.toUpperCase();
                if (pinyinEl) pinyinEl.textContent = '';
            }
        });
    }

    // 显示/隐藏虚拟键盘
    toggleVirtualKeyboard(show) {
        if (!this.virtualKeyboard) return;
        
        if (show === undefined) {
            this.virtualKeyboard.style.display = 
                this.virtualKeyboard.style.display === 'none' ? 'block' : 'none';
        } else {
            this.virtualKeyboard.style.display = show ? 'block' : 'none';
        }
    }
}

// 创建全局键盘管理器实例
const keyboardManager = new KeyboardManager();

// 导出到全局
window.keyboardManager = keyboardManager;
