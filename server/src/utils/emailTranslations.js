/**
 * Email translations for price alerts
 * Supports multiple languages with fallback to English
 */

const translations = {
  en: {
    emailVerification: {
      subject: 'Verify Your Email - Cryptalyst',
      title: 'Verify Your Email',
      greeting: 'Hello',
      message: 'Thank you for signing up for Cryptalyst! Please verify your email address by clicking the button below.',
      verifyButton: 'Verify Email',
      expiresIn: 'This link expires in 24 hours.',
      ignoreMessage: 'If you did not create an account, you can safely ignore this email.',
      footer: 'This is an automated message from Cryptalyst. Please do not reply to this email.',
      copyright: 'Cryptalyst. All rights reserved.',
      successTitle: 'Email Verified!',
      successMessage: 'Your email has been successfully verified. You can now log in to your account.',
      alreadyVerified: 'Your email is already verified.',
      invalidToken: 'Invalid or expired verification token.',
      tokenExpired: 'Your verification link has expired. Please request a new one.',
      resendSuccess: 'Verification email has been resent.',
      resendSubject: 'New Verification Link - Cryptalyst'
    },
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
    emailVerification: {
      subject: 'დაადასტურეთ თქვენი ელ-ფოსტა - Cryptalyst',
      title: 'დაადასტურეთ თქვენი ელ-ფოსტა',
      greeting: 'გამარჯობა',
      message: 'გმადლობთ Cryptalyst-ზე რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაწკაპუნებით.',
      verifyButton: 'ელ-ფოსტის დადასტურება',
      expiresIn: 'ეს ბმული მოქმედებს 24 საათის განმავლობაში.',
      ignoreMessage: 'თუ თქვენ არ შექმნეთ ანგარიში, შეგიძლიათ უგულებელყოთ ეს წერილი.',
      footer: 'ეს არის ავტომატური შეტყობინება Cryptalyst-დან. გთხოვთ არ უპასუხოთ ამ ელფოსტას.',
      copyright: 'Cryptalyst. ყველა უფლება დაცულია.',
      successTitle: 'ელ-ფოსტა დადასტურებულია!',
      successMessage: 'თქვენი ელ-ფოსტა წარმატებით დადასტურდა. ახლა შეგიძლიათ შეხვიდეთ თქვენს ანგარიშზე.',
      alreadyVerified: 'თქვენი ელ-ფოსტა უკვე დადასტურებულია.',
      invalidToken: 'არასწორი ან ვადაგასული დადასტურების ტოკენი.',
      tokenExpired: 'თქვენი დადასტურების ბმული ვადაგასულია. გთხოვთ მოითხოვოთ ახალი.',
      resendSuccess: 'დადასტურების ელ-ფოსტა ხელახლა გაიგზავნა.',
      resendSubject: 'ახალი დადასტურების ბმული - Cryptalyst'
    },
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
