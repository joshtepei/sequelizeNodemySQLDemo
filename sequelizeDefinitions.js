const Sequelize = require('sequelize');
const faker = require('faker');

const sequelize = new Sequelize('greenlight_demo', 'root', null, {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: false
  }
});

const Charity = sequelize.define('Charity', {
  title: {
    type: Sequelize.STRING,
    unique: 'unique \n unique'
  }
});

const DonationCategory = sequelize.define('DonationCategory', {
  title: {
    type: Sequelize.STRING
  },
  charityId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

const User = sequelize.define('User', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
});

const populateTables = () => {
  // sequelize.sync({ force: true })
  //   .then(() => {
  //     User.create({ firstName: 'Josh', lastName: 'Tepei' });
  //     Charity.bulkCreate(
  //       new Array(50).fill().map(() => ({
  //         title: faker.company.companyName()
  //       }))
  //     );
  //   });
  Promise.resolve()
  .then(() => Promise.all([
    DonationCategory.drop(),
    Charity.drop(),
    User.drop()
  ]))
  .then(() => sequelize.sync({ force: true }))
  .then(() => Promise.all([
    Charity.count(),
    User.count(),
  ]))
  .then(([charityCount, userCount]) => {
    return Promise.all([
      userCount ? Promise.resolve(userCount) : User.create({ firstName: 'Josh', lastName: 'Tepei' }),
      charityCount ? Promise.resolve(charityCount) : Charity.bulkCreate(
        new Array(50).fill().map(() => ({
          title: faker.company.companyName()
        }))
      )
    ])
  })
  .catch(console.error);
}

module.exports = {
  Sequelize,
  Charity,
  DonationCategory,
  User,
  populateTables,
  sequelize
};
