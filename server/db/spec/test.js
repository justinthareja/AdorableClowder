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

// var allOffers = Collections.allOffers;


// // Query to add a new user with username and password:
// User.forge({
//   username: 'mario',
//   password: 'luigi'
// }).save().then(function (user) {
//   console.log('mario successfully saved');
// });


// // Query to find a user from the DB with username 'mario'
// // require set to true to trigger error if user is not found
// User.forge({
//   username: 'mario'
// }).fetch({
//   require: true
// })
//   .then(function (foundUser) {
//     console.log('found user', foundUser);
//   })
//   .catch(function () {
//     console.log('error finding user');
//   });


// // Query to create two random skills offered
// Offer.forge({
//   skill: 'cooking'
// }).save().then(function (offer) {
//   console.log('cooking saved as a skill offered');
// });

// Offer.forge({
//   skill: 'javascript'
// }).save().then(function (offer) {
//   console.log('javascript saved as a skill offered');
// });


// // Query to create a new user and attach offer_id = 1 and offer_id = 2 to it
// User.forge({
//   username: 'spiderman',
//   password: 'pewpewwebs'
// }).save().then(function (user) {
//   user.related('offers').attach([1, 2]);
// });

// Offers.add({ skill: 'javascript'});


// TODO:
// Create the "sign up" massive query that does the following:
// var offeredSkills = ['bowling', 'archery', 'sailing'];
// var convertToModels = function (skills) {
//   return skills.map(function (skill) {
//     return {skill: skill};
//   });
// };

// Offers.forge();

// allOffers.create({skill: 'cooking'}).then(function (skill) {
//   console.log('skill added');
// });

// var skill = 'sailing';

// allOffers.create({skill: skill});

// Offer.forge({ skill: skill }).fetch().then(function(skillExists) {
//   if(!skillExists) {
//     Offer.forge({ skill: skill }).then(function (skill) {
//       console.log('skill added!');
//     });
//   }
// });


// getAllSkillIds accepts an array of skill strings, adds them to the db if not already there
// and returns an array of id's associated with the corresponding skill
// ex: getAllSkillIds(['skyrim', 'yoga', 'surfing']) => [4, 12, 6]

var getAllSkillIds = function (skills) {
  return new Promise (function (resolve, reject) {

    var newSkillIds = [];
    
    async.each(skills, function (skill, callback) {

      console.log('getting skill ID for', skill);
      getSkillId(skill).then(function(skillId) {
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



// getSkillId is a promise that accepts a raw skill string (eg: 'cooking')
// and passes it's corresponding id from the DB to the then function
// if the skill is not already in the db, getSkillId will add it to the db before resolving
var getSkillId = function (skill) {
  return new Promise(function (resolve, reject) {
    Offer.forge({ skill: skill }).fetch()
      .then(function (skillExists) {
        if (!skillExists) {
          Offer.forge({ skill: skill}).save()
            .then(function (savedSkill) {
              console.log(savedSkill.get('skill'), 'saved successfully in offers table');
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

getAllSkillIds(['snowboarding', 'reading', 'eating pizza']).then(function (ids) {
  console.log('new skill ids from promise:', ids);
});


// then (new promiste)
  // grab the array of related id's and save a new user by attaching the indicies to the appropriate table 
  // (eg: 'wants', 'offers')
  // v2 = modularize functionality to handle different charts




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
