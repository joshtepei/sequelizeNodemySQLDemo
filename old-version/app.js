const AUTH_SECRET = process.env.AUTH_SECRET || '2C44-4D44-WppQ38S';

const session = require('express-session');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

const seq = require('../sequelizeDefinitions');
const {
  Charity,
  CharityCategory,
  Category,
  seed
} = seq;

app.use(bodyParser.json());

CharityCategory.belongsTo(Charity);
CharityCategory.belongsTo(Category);
Charity.hasMany(CharityCategory);

seed().then(() => {
  Charity.findAll({
    include: [{
      model: CharityCategory,
      include: [{
        model: Category,
        where: { name: 'army' }
      }]
    }]
  }).then((charities) => {
    charities.forEach(charity => {
      console.log(charity);
    });
  })
});

const seed = () => {
  return sequelize.sync({ force: true })
  .then(() => {
    return Promise.all([
      Charity.create({ name: 'Salvation Army' }),
      Charity.create({ name: 'Toys For Tots'}),
      Category.create({ name:  'army'}),
      Category.create({ name: 'toys'})
    ])
    .then(result => {
      const salvationArmy = result[0];
      const toysForTots = result[1];
      const army = result[2];
      const toys = result[3];
      return Promise.all([
        CharityCategory.create({ charityId: salvationArmy.id, categoryId:  army.id }),
        CharityCategory.create({ charityId: toysForTots.id, categoryId: toys.id })
      ]);
    });
  })
}

app.listen(3000, (err) => {
  console.log('Listening on port 3000');
});
