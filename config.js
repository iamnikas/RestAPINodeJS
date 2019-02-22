var config = {
  db: {
    name: '',
    username: '',
    password: '',
    dialect: 'mssql', // also could be mysql, mssql, sqlite
    options: {
      host: ''
    },
  },
  debug: true,
  sentryUrl: 'put some url here',
  jwtSecret: 'put some secret here',
  expressSecret: 'put some secret here',

}

module.exports = config;
