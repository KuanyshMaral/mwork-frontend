// Balance formatting utilities with pluralization and localization support

const LOW_BALANCE_THRESHOLD = 3

// Localization strings
const STRINGS = {
    ru: {
        credit: 'кредит',
        credits: 'кредита',
        credits_many: 'кредитов',
        low_balance: 'Низкий баланс'
    },
    en: {
        credit: 'credit',
        credits: 'credits',
        credits_many: 'credits',
        low_balance: 'Low balance'
    }
}

// Get current locale (simplified - in real app would use i18n library)
function getCurrentLocale() {
    return navigator.language.startsWith('ru') ? 'ru' : 'en'
}

// Pluralization rules for Russian
function getRussianPluralization(count) {
    const lastTwoDigits = count % 100
    const lastDigit = count % 10
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'credits_many'
    }
    
    if (lastDigit === 1) {
        return 'credit'
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'credits'
    }
    
    return 'credits_many'
}

// Pluralization rules for English (simpler)
function getEnglishPluralization(count) {
    return count === 1 ? 'credit' : 'credits'
}

// Format balance with proper pluralization
export function formatBalance(balance, locale = null) {
    const currentLocale = locale || getCurrentLocale()
    const strings = STRINGS[currentLocale]
    
    if (!strings) {
        // Fallback to English if locale not supported
        return `${balance} ${balance === 1 ? 'credit' : 'credits'}`
    }
    
    let pluralKey
    if (currentLocale === 'ru') {
        pluralKey = getRussianPluralization(balance)
    } else {
        pluralKey = getEnglishPluralization(balance)
    }
    
    return `${balance} ${strings[pluralKey]}`
}

// Check if balance is low
export function isLowBalance(balance, threshold = LOW_BALANCE_THRESHOLD) {
    return balance < threshold
}

// Get low balance warning text
export function getLowBalanceWarning(locale = null) {
    const currentLocale = locale || getCurrentLocale()
    return STRINGS[currentLocale]?.low_balance || STRINGS.en.low_balance
}

// Get low balance threshold (can be made configurable)
export function getLowBalanceThreshold() {
    return LOW_BALANCE_THRESHOLD
}
