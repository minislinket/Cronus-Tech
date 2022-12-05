module.exports = {
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
      start_url: '/cronus-tech/'
    }
  },

  publicPath: '/cronus-tech/',
  outputDir: 'dist/cronus-tech'
}