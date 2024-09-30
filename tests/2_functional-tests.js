const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  test('Solve a puzzle with valid puzzle string: POST request to /api/solve', done => {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: puzzlesAndSolutions[0][0] })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { solution: puzzlesAndSolutions[0][1] });
        done();
      });
  });

  test('Solve a puzzle with missing puzzle string: POST request to /api/solve', done => {
    chai.request(server)
      .post('/api/solve')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field missing' });
        done();
      });
  });

  test('Solve a puzzle with invalid characters: POST request to /api/solve', done => {
    const invalidPuzzle = '1.5..2.84..63.X2.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'; // X instead of 1
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: invalidPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Solve a puzzle with incorrect length: POST request to /api/solve', done => {
    const shortPuzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72..'; // 80 characters
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: shortPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Check a puzzle placement with all valid data: POST request to /api/check', done => {
    const puzzle = puzzlesAndSolutions[0][0];
    const coordinate = 'A2';
    const value = '3';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate, value })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { valid: true });
        done();
      });
  });

  test('Check a puzzle placement with conflict in the row: POST request to /api/check', done => {
    const puzzle = '1.5..2.84..63.12.7.2..5..1..9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'; // Conflict in row
    const coordinate = 'A2';
    const value = '1'; // This should conflict with an existing number in the row
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate, value })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.include(res.body.conflict, 'row');
        done();
      });
  });

  test('Check a puzzle placement with conflict in the column: POST request to /api/check', done => {
    const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...5'; // Conflict in column
    const coordinate = 'B2';
    const value = '5'; // This should conflict with an existing number in the column
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate, value })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.include(res.body.conflict, 'column');
        done();
      });
  });

  test('Check a puzzle placement with conflict in the region: POST request to /api/check', done => {
    const puzzle = '..839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492..71'; // Conflict in region
    const coordinate = 'C3';
    const value = '7'; // This should conflict with an existing number in the region
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate, value })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.include(res.body.conflict, 'region');
        done();
      });
  });

  test('Check a puzzle placement with multiple conflicts: POST request to /api/check', done => {
    const puzzle = '82..4..6...16..89...98315.749.157...9.......753..4...96.415..81..7632..3...28.51.'; // Multiple conflicts
    const coordinate = 'B1';
    const value = '9'; // This should conflict with row, column, and region
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate, value })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { valid: false, conflict: ['row', 'column', 'region'] });
        done();
      });
  });

});
