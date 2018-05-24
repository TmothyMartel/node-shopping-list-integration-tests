'use strict'
const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;


chai.use(chaiHttp);

describe('recipes', function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  // test for GET request
  it('should list items on GET', function() {
    return chai.request(app)
    .get('/recipes')
    .then(res => {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.a('array');
      expect(res.body.length).to.be.at.least(1);
      const expectedKeys = ['id', 'name', 'ingredients'];
      res.body.forEach(item => {
        expect(item).to.be.a('object');
        expect(item).to.include.keys(expectedKeys);
      });
    });
  });

  // test for POST request
  it('should add an item on POST', function() {
    const newRecipe = {name: 'pancakes', ingredients: ['flour', 'sugar', 'eggs', 'milk'] };
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(res => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'name', 'ingredients');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
      });
  });

  // test for PUT request
  it('should update items on PUT', function() {
    const updateRecipe = {
      name: 'milkshake',
      ingredients: ['3 tbsp cocoa', '2 and a half cups vanilla ice cream', '1 cup milk']
    };

    return chai.request(app)
      .get('/recipes')
      .then(res => {
        updateRecipe.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateRecipe.id}`)
          .send(updateRecipe);
    })
    .then(res => {
      expect(res).to.have.status(204);
    });
  });

  // test for DELETE request
  it('should delete items on DELETE', function() {
    return chai.request(app)
    .get('/recipes')
    .then(res => {
      return chai.request(app)
        .delete(`/recipes/${res.body[0].id}`);
    })
    .then(res => {
      expect(res).to.have.status(204);
    });
  });
});