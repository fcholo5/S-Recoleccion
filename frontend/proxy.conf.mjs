// proxy.conf.mjs
export default {
  '/api': {
    target: 'https://apirecoleccion.gonzaloandreslucio.com',
    secure: false,
    changeOrigin: true
  }
};