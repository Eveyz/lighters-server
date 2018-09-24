const env = process.env;

module.exports = {
  port: env.PORT || 8080,
  jwtSecret: 'znz@lighters'
};
