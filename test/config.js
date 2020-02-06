module.exports = {
  description: 'Database configuration for unit tests',
  instructions: 'Customize this file with credentials to your test MySQL server',

  db: {
    logging: false,
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'testuser',
    password: '',
    database: 'myapp_test',
    // operatorsAliases: false,  // include this when testing against Sequelize v4
  },
};
