const AUTH_SECRET = process.env.AUTH_SECRET || '2C44-4D44-WppQ38S';

const session = require('express-session');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

const seq = require('./sequelizeDefinitions');
const {
  Charity,
  DonationCategory,
  User,
  populateTables,
  sequelize
} = seq;

app.use(bodyParser.json());

//creates a charityId in DonationCategory
DonationCategory.hasMany(Charity, {
  constraints: false
});

// TODO: Using 'through' will allow a many to many association
// and create a join table called Charity_Category

// Charity.belongsToMany(Category, {
//   through: 'Charity_Category'
// });
//
// Category.belongsToMany(Charity, {
//   through: 'Charity_Category'
// })

sequelize.sync().then(() => {
  populateTables();
});

app.use(session({
  secret: AUTH_SECRET,
  resave: true,
  saveUninitialized: true,
  expires: new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)),
}));

const auth = (req, res, next) => {
  console.log(req.session.userId);
  if (req.session && req.session.userId === 1) {
    return next();
  } else {
    return res.sendStatus(401);
  }
}

app.post('/signup', (req, res) => {
  const { firstName, lastName } = req.body;

  User.sync()
  .then(() => {
    return User.create({ firstName, lastName, childId: null })
    .then( () => {
      res.send('User ' + firstName + ' ' + lastName + ' has been created.');
    });
  });
});

app.post('/signin', (req, res) => {
  const { firstName, lastName } = req.body;

  if (firstName === 'Josh' && lastName === 'Tepei') {
    req.session.userId = 1;
    res.send('SignIn successful!');
  } else {
    res.sendStatus(401);
  }
});

app.post('/logout', (req, res) => {
  // normally you would just destroy the session
  delete req.session.userId;
  res.send("Logout sucessful!");
});

// Charity.findAll({ include: [DonationCategory] })
// User.findById(id, { include: [DonationCategory] })

// Search for any charities with the keyword sent in the params
app.get('/charity/search/:keyword', auth, (req, res) => {
  const { keyword } = req.params;
  const { offset = 0, limit = 10 } = req.query;

  /**
   * TODO: Once belongsToMany gets implemented,
   * and a correlation between cahrities and categories is set up,
   * do something like this:
  */

  // Charity.findAll({
  //   include: [{
  //     model: CharityCategory,
  //     include: [{
  //       model: Category,
  //       where: { name: 'army' }
  //     }]
  //   }]
  // }).then((charities) => {
  //   charities.forEach(charity => {
  //     console.log(charity);
  //   });
  // })

  // pre-category implementaiton of the search that searches based on the title name
  Charity.findAndCountAll({
    where: {
      title: {
        $like: '%' + keyword + '%'
      }
    },
    offset: Math.max(0, offset),
    limit: Math.min(10, limit),
    order: ['title']
  })
  .then(charities => {
    res.status(200).json(charities);
  })
  .catch(err => {
    res.status(500).send(err);
  });
});

// Create a donation category tied to a user and a charity
app.post('/donation-category', auth, (req, res) => {
  const { title, charityId } = req.body;

  DonationCategory.create({
    title, charityId, userId: req.session.userId
  })
  .then(() => {
    res.status(200).send('It works');
  })
  .catch(err => {
    res.status(500).send('Something broke!');
  });
});

app.listen(3000, (err) => {
  console.log('Listening on port 3000');
});

/**
 * CURL COMMANDS
 */

// Signup
// curl -d '{"firstName": "Josh", "lastName": "Tepei"}' -H "Content-Type: application/json" http://127.0.0.1:3000/signup -b cookies.txt -c cookies.txt

// Login
// curl -d '{"firstName": "Josh", "lastName": "Tepei"}' -H "Content-Type: application/json" http://127.0.0.1:3000/signin -b cookies.txt -c cookies.txt

// Logout
// curl -d '{}' -H "Content-Type: application/json" http://127.0.0.1:3000/logout -b cookies.txt -c cookies.txt

// Create a donation category
// curl -d '{"title": "army", "charityId": 1}' -H "Content-Type: application/json" http://127.0.0.1:3000/donation-category -b cookies.txt -c cookies.txt

// Search
// curl -i -H "Accept: application/json" http://127.0.0.1:3000/charity/search/Davis -b cookies.txt -c cookies.txt
