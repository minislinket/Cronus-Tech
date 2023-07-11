module.exports = {
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      definitions[0]['process.env']['PACKAGE_VERSION'] = JSON.stringify(require('./package.json').version);
      return definitions;
    });
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/firebase-messaging-sw.js',
      exclude: [/\.htaccess/],
      globDirectory: "public/",
      globPatterns: [
          "**/*.{js,css,ico,woff2,webmanifest}",
          "**/images/icons/*",
          "**/images/*",
          "**/img/*",
          "**/img/icons/*",
      ],
      // 15mb max file size
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      globIgnores: [
          // '**/mix-manifest.json',
          // '**/js/{manifest,vendor}.js',
          // '**/js/chunks/*',
          '**/.htaccess/*',
      ],
    },
    name: 'Cronus Tech',
    themeColor: '#1C6EA8',
    manifestOptions: {
      orientation: 'portrait',
      display: 'standalone',
      start_url: '/cronus-tech/',
      lang: 'en-GB',
    }
  },

  publicPath: '/cronus-tech/',
  outputDir: 'dist/cronus-tech'
}