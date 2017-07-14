require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: '蜂度社区Beegree Community',
    description: 'All the modern best practices in one example.',
    head: {
      // titleTemplate: '蜂度社区Beegree Community: %s',
      meta: [
        { name: 'description', content: 'All the modern best things in one community.' },
        { charset: 'utf-8' },
        { property: 'og:site_name', content: '蜂度社区Beegree Community' },
        { property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: '蜂度社区Beegree Community' },
        { property: 'og:description', content: 'All the modern best things in one community.' },
        { property: 'og:card', content: 'summary' },
        { property: 'og:site', content: '@Javen' },
        { property: 'og:creator', content: '@Javen' },
        { property: 'og:image:width', content: '200' },
        { property: 'og:image:height', content: '200' }
      ]
    }
  },

}, environment);
