var db = require('../config.js');
var Promise = require('bluebird');
var _ = require('underscore');
var async = require('async');
var Models = require('../models.js');
var User = Models.User;
var Offer = Models.Offer;
var Want = Models.Want;

var Collections = require('../collections.js');
var Offers = Collections.Offers;
var Users = Collections.Users;
var Wants = Collections.Wants;



/*
var allOffers = Collections.allOffers;


Query to add a new user with username and password:
User.forge({
  username: 'mario',
  password: 'luigi'
}).save().then(function (user) {
  console.log('mario successfully saved');
});


// Query to find a user from the DB with username 'mario'
// require set to true to trigger error if user is not found
User.forge({
  username: 'mario'
}).fetch({
  require: true
})
  .then(function (foundUser) {
    console.log('found user', foundUser);
  })
  .catch(function () {
    console.log('error finding user');
  });


// Query to create two random skills offered
Offer.forge({
  skill: 'cooking'
}).save().then(function (offer) {
  console.log('cooking saved as a skill offered');
});

Offer.forge({
  skill: 'javascript'
}).save().then(function (offer) {
  console.log('javascript saved as a skill offered');
});


// Query to create a new user and attach offer_id = 1 and offer_id = 2 to it
User.forge({
  username: 'spiderman',
  password: 'pewpewwebs'
}).save().then(function (user) {
  user.related('offers').attach([1, 2]);
});

Offers.add({ skill: 'javascript'});


TODO:
Create the "sign up" massive query that does the following:
var offeredSkills = ['bowling', 'archery', 'sailing'];
var convertToModels = function (skills) {
  return skills.map(function (skill) {
    return {skill: skill};
  });
};

Offers.forge();

allOffers.create({skill: 'cooking'}).then(function (skill) {
  console.log('skill added');
});

var skill = 'sailing';

allOffers.create({skill: skill});

Offer.forge({ skill: skill }).fetch().then(function(skillExists) {
  if(!skillExists) {
    Offer.forge({ skill: skill }).then(function (skill) {
      console.log('skill added!');
    });
  }
});
*/


/*
getAllSkillIds is a promise that accepts an array of skill strings, and a string representing a 
Backbone skill type model and adds them to the db if not already there. an array of id's 
associated with the corresponding skill are passed to the resolve function for .then chaining

ex: getAllSkillIds(['skyrim', 'yoga', 'surfing'], 'Want').then(function (ids) {
  console.log(ids);
}) => [4, 12, 6]
*/
var getAllSkillIds = function (skills, skillType) {
  return new Promise (function (resolve, reject) {

    var newSkillIds = [];

    async.each(skills, function (skill, callback) {
      console.log('getting skill ID for', skill);
      getSkillId(skill, skillType).then(function(skillId) {
        newSkillIds.push(skillId);
        callback();
      });

    }, function (err) {
      if (err) {
        console.log('failed to retreive skill id');
      } else {
        console.log('all new skills added to db');
        resolve(newSkillIds);
      }
    });
  });
};



// getSkillId is a promise that accepts a raw skill string (eg: 'cooking') and a string representing a Backbone class
// and gets the skill's id from the table based on skill type. the found is then passed through the resolve function
// NOTE: if the skill is not already in the db, getSkillId will add it to the db before resolving
var getSkillId = function (skill, skillType) {
  // convert 'skillType' to the actual Backbone class
  var Model = Models[skillType];
  return new Promise(function (resolve, reject) {
    Model.forge({ skill: skill }).fetch()
      .then(function (skillExists) {
        if (!skillExists) {
          Model.forge({ skill: skill}).save()
            .then(function (savedSkill) {
              console.log(savedSkill.get('skill'), 'saved successfully in ' + skillType + 's table');
              console.log('with an id of:', savedSkill.get('id'));
              // pass saved skill id into then function
              resolve(savedSkill.get('id'));
            });
        }
        else {
          console.log(skill, 'already exists in db');
          // pass fetched skill id into then function
          resolve(skillExists.get('id'));
        }
      });
  });
};


// useful when distinguishing between the MySQL table name VS. the Backbone model name
var convertToModelName = function (tableName) {
  return tableName.charAt(0).toUpperCase() + tableName.slice(1, tableName.length-1);
};

// attachSkillsToUser is a promise that takes a backbone User model, an array of skills (as strings), 
// and the corresponding table the skills belong to (eg: 'offers' or 'wants') and creates the Bookstrap version 
// of a join table between the user and the skills on that table
var attachSkillsToUser = function (user, skills, table) {
  return new Promise(function (resolve, reject) {
    getAllSkillIds(skills, convertToModelName(table)).then(function (ids) {
      user.related(table).attach(ids);
      resolve(user);
    });
  });
};



// a function that takes the agreed-upon json user-obj posted to '/signup' (see docs/interface.json for more info)
// adds the user to the database and establishes a link between wanted and offered skills
var createUser = function (jsonUser) {
  var user = JSON.parse(jsonUser);
  User.forge({ username: user.username }).fetch()
    .then(function (userExists) {
      if (!userExists) {
        User.forge({
          username: user.username,
          password: user.password,
          email: user.email
        }).save()
          .then(function (savedUser) {
            attachSkillsToUser(savedUser, user.want, 'wants')
              .then(function (savedUser) {
                console.log('successfully attached skills to wants table');
                attachSkillsToUser(savedUser, user.offer, 'offers');
              })
              .then(function (savedUser) {
                console.log('successfully attached skills to offers table');
                console.log('USER CREATION SUCCESSFULL!!!!!!');
              });
          });
      } else {
        console.log(user.username, 'already exists');
      }
    });
};

var bob = {
  "username": "roberto",
  "password": 1234,
  "offer": ["yoga", "cooking"],
  "want": ["angular"],
  "email": "austin@gmail.com"
};


createUser(JSON.stringify(bob));





// 1) check to see if each skill offered passed from the user is already in the DB
  // create function that converts the list of skills to an array of raw model objects
  // ex: ['yoga', 'flying'] => [{skill: 'yoga'},{skill: 'flying'}]
  // 
// 2) if not, add and save each skill
// 3) repeat for skills wanted
// 4) once all skills are saved, forge a new user with the given username and password
// 5) save the user and then attach the skills to the user model that are related

// Create a "login" massive query that does the following:
// create a query to find all users who have skills wanted that match the logging in user skills offered
// figure out a way to package it nicely
