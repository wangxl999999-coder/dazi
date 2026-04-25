// 游戏配置文件
const CONFIG = {
    // 难度等级配置
    difficulty: {
        1: {
            name: '初级',
            time: 60,
            accuracy: 90,
            targetLength: 5,
            description: '60秒，准确率90%'
        },
        2: {
            name: '中级',
            time: 45,
            accuracy: 95,
            targetLength: 8,
            description: '45秒，准确率95%'
        },
        3: {
            name: '高级',
            time: 30,
            accuracy: 98,
            targetLength: 10,
            description: '30秒，准确率98%'
        },
        4: {
            name: '专家',
            time: 20,
            accuracy: 99,
            targetLength: 12,
            description: '20秒，准确率99%'
        },
        5: {
            name: '大师',
            time: 15,
            accuracy: 100,
            targetLength: 15,
            description: '15秒，准确率100%'
        }
    },

    // 五笔字根配置
    wubiRadicals: {
        'q': { radicals: ['金', '勹', '儿', '夕'], pinyin: 'jīn bāo ér xī' },
        'w': { radicals: ['人', '八', '亻'], pinyin: 'rén bā dān' },
        'e': { radicals: ['月', '彡', '乃', '用'], pinyin: 'yuè shān nǎi yòng' },
        'r': { radicals: ['白', '手', '扌', '斤'], pinyin: 'bái shǒu tí jīn' },
        't': { radicals: ['禾', '竹', '丿', '攵'], pinyin: 'hé zhú piě wén' },
        'y': { radicals: ['言', '讠', '文', '方'], pinyin: 'yán yán wén fāng' },
        'u': { radicals: ['立', '六', '辛', '门'], pinyin: 'lì liù xīn mén' },
        'i': { radicals: ['水', '氵', '氺', '小'], pinyin: 'shuǐ shuǐ shuǐ xiǎo' },
        'o': { radicals: ['火', '业', '灬', '米'], pinyin: 'huǒ yè huǒ mǐ' },
        'p': { radicals: ['之', '辶', '宀'], pinyin: 'zhī zǒu bǎo' },
        'a': { radicals: ['工', '戈', '七', '艹'], pinyin: 'gōng gē qī cǎo' },
        's': { radicals: ['木', '丁', '西'], pinyin: 'mù dīng xī' },
        'd': { radicals: ['大', '犬', '三', '古'], pinyin: 'dà quǎn sān gǔ' },
        'f': { radicals: ['土', '士', '二', '干'], pinyin: 'tǔ shì èr gān' },
        'g': { radicals: ['王', '一', '五', '戋'], pinyin: 'wáng yī wǔ jiān' },
        'h': { radicals: ['目', '上', '止', '卜'], pinyin: 'mù shàng zhǐ bo' },
        'j': { radicals: ['日', '早', '虫', '刂'], pinyin: 'rì zǎo chóng lì' },
        'k': { radicals: ['口', '川'], pinyin: 'kǒu chuān' },
        'l': { radicals: ['田', '甲', '力', '四'], pinyin: 'tián jiǎ lì sì' },
        'z': { radicals: ['学习键'], pinyin: 'xué xí jiàn' },
        'x': { radicals: ['纟', '弓', '匕', '母'], pinyin: 'sī gōng bǐ mǔ' },
        'c': { radicals: ['又', '巴', '马', '厶'], pinyin: 'yòu bā mǎ sī' },
        'v': { radicals: ['女', '刀', '九', '臼'], pinyin: 'nǚ dāo jiǔ jiù' },
        'b': { radicals: ['子', '耳', '了', '也'], pinyin: 'zǐ ěr le yě' },
        'n': { radicals: ['已', '己', '巳', '心'], pinyin: 'yǐ jǐ sì xīn' },
        'm': { radicals: ['山', '由', '贝', '几'], pinyin: 'shān yóu bèi jǐ' }
    },

    // 拼音练习字库
    pinyinChars: [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        ',', '.', '?', '!', ';', ':'
    ],

    // 常见拼音词汇
    pinyinWords: [
        'zhong', 'guo', 'ni', 'hao', 'wo', 'ta', 'men', 'de', 'shi', 'you',
        'bu', 'zai', 'zhe', 'na', 'lai', 'qu', 'shang', 'xia', 'qian', 'hou',
        'jin', 'chu', 'kai', 'guan', 'da', 'xiao', 'duo', 'shao', 'xin', 'jiu',
        'hao', 'huai', 'kuai', 'man', 'gao', 'di', 'chang', 'duan', 'mei', 'you'
    ],

    // 五笔单字字库（按键对应的字）
    wubiSingleChars: {
        'q': '我', 'w': '人', 'e': '有', 'r': '的', 't': '和',
        'y': '主', 'u': '产', 'i': '不', 'o': '为', 'p': '这',
        'a': '工', 's': '要', 'd': '在', 'f': '地', 'g': '一',
        'h': '上', 'j': '是', 'k': '中', 'l': '国',
        'x': '经', 'c': '以', 'v': '发', 'b': '了', 'n': '民', 'm': '同',
        'z': '学习键'
    },

    // 评分配置
    scoring: {
        correct: 10,           // 正确得分
        wrong: -5,             // 错误扣分
        comboBonus: 5,         // 连击奖励
        speedBonus: 2,         // 速度奖励（每字/分钟）
        perfectBonus: 50       // 完美完成奖励
    },

    // 音效配置
    audio: {
        enabled: true,
        volume: 0.5
    },

    // 存储键名
    storage: {
        stats: 'typingStats',
        errors: 'typingErrors',
        history: 'typingHistory'
    }
};

// 游戏状态
const GAME_STATE = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    ENDED: 'ended'
};
