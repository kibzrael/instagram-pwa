module.exports = {
  globDirectory: "public/",
  globPatterns: ["**/*.{ico,html,json,css,js}", "src/images/*.{png,jpg}"],
  swSrc: "public/sw-base.js",
  swDest: "public/service-worker.js",
  globIgnores: ["**/node_modules/**/*", "../workbox-config.cjs", "help/**"],
};
