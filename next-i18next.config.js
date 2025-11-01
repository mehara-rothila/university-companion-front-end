const path = require('path');

module.exports = {
  i18n: {
    defaultLanguage: 'en',
    languages: ['en', 'si', 'ta'],
  },
  localePath: path.resolve('./public/locales'),
  ns: [
    'common',
    'auth',
    'chatbot',
    'dashboard',
    'uploads',
    'navigation',
    'errors',
  ],
  defaultNS: 'common',
};
