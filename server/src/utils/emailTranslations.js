/**
 * Email translations for price alerts
 * Supports multiple languages with fallback to English
 */

const translations = {
  en: {
    priceAlert: {
      subject: 'Price Alert Triggered',
      greeting: 'Hello',
      title: 'Price Alert!',
      message: 'Your price alert has been triggered',
      assetLabel: 'Asset',
      currentPrice: 'Current Price',
      targetPrice: 'Target Price',
      alertType: 'Alert Type',
      assetType: 'Asset Type',
      triggeredAt: 'Triggered At',
      priceAbove: 'Price above',
      priceBelow: 'Price below',
      cryptocurrency: 'Cryptocurrency',
      stock: 'Stock',
      viewDashboard: 'View in Cryptalyst',
      disclaimer: 'This alert has been marked as triggered and will no longer send notifications. You can create a new alert from your dashboard if you\'d like to continue monitoring this asset.',
      footer: 'This is an automated message from Cryptalyst. Please do not reply to this email.',
      copyright: 'Cryptalyst. All rights reserved.',
      hasRisen: 'has risen above',
      hasFallen: 'has fallen below',
    }
  },
  ka: {
    priceAlert: {
      subject: 'ფასის შეტყობინება გააქტიურდა',
      greeting: 'გამარჯობა',
      title: 'ფასის შეტყობინება!',
      message: 'თქვენი ფასის შეტყობინება გააქტიურდა',
      assetLabel: 'აქტივი',
      currentPrice: 'მიმდინარე ფასი',
      targetPrice: 'სამიზნე ფასი',
      alertType: 'შეტყობინების ტიპი',
      assetType: 'აქტივის ტიპი',
      triggeredAt: 'გააქტიურების დრო',
      priceAbove: 'ფასი ზემოთ',
      priceBelow: 'ფასი ქვემოთ',
      cryptocurrency: 'კრიპტოვალუტა',
      stock: 'აქცია',
      viewDashboard: 'ნახვა Cryptalyst-ში',
      disclaimer: 'ეს შეტყობინება მონიშნულია როგორც გააქტიურებული და აღარ გამოგიგზავნით შეტყობინებებს. შეგიძლიათ შექმნათ ახალი შეტყობინება თქვენი დეშბორდიდან, თუ გსურთ აქტივის მონიტორინგის გაგრძელება.',
      footer: 'ეს არის ავტომატური შეტყობინება Cryptalyst-დან. გთხოვთ არ უპასუხოთ ამ ელფოსტას.',
      copyright: 'Cryptalyst. ყველა უფლება დაცულია.',
      hasRisen: 'აიწია',
      hasFallen: 'დაეცა',
    }
  }
};

/**
 * Get translated text for a given key and language
 * @param {String} lang - Language code (en, ka, etc.)
 * @param {String} category - Category (priceAlert, etc.)
 * @param {String} key - Translation key
 * @returns {String} Translated text
 */
function getTranslation(lang, category, key) {
  // Fallback to English if language not found
  const langData = translations[lang] || translations.en;

  // Get category data
  const categoryData = langData[category];
  if (!categoryData) {
    return translations.en[category]?.[key] || key;
  }

  // Get translation with fallback to English
  return categoryData[key] || translations.en[category]?.[key] || key;
}

/**
 * Get all translations for a category and language
 * @param {String} lang - Language code
 * @param {String} category - Category
 * @returns {Object} Translation object
 */
function getCategoryTranslations(lang, category) {
  const langData = translations[lang] || translations.en;
  return langData[category] || translations.en[category];
}

module.exports = {
  translations,
  getTranslation,
  getCategoryTranslations
};
