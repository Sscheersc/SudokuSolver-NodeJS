const chai = require('chai');
const assert = chai.assert;
const SudokuSolver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

let solver = new SudokuSolver();

suite('Unit Tests', () => {
  
  test('Logic handles a valid puzzle string of 81 characters', () => {
    const validPuzzle = puzzlesAndSolutions[0][0];
    assert.deepEqual(solver.validate(validPuzzle), true);
  });

  test('Logic handles a puzzle string with invalid characters', () => {
    const invalidPuzzle = '1.5..2.84..63.X2.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'; // X instead of 1
    assert.deepEqual(solver.validate(invalidPuzzle), { error: 'Invalid characters in puzzle' });
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const shortPuzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72..'; // 80 characters
    assert.deepEqual(solver.validate(shortPuzzle), { error: 'Expected puzzle to be 81 characters long' });
  });

  test('Logic handles a valid row placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const grid = solver.convertToGrid(puzzle);
    assert.isTrue(solver.checkRowPlacement(grid, 0, '3'));
  });

  test('Logic handles an invalid row placement', function(done) {
    let grid = solver.convertToGrid('..839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492...1');
    let row = 0;
    let num = '3'; // This should be invalid since 3 already exists in row 0
    assert.isFalse(solver.checkRowPlacement(grid, row, num));
    done();
  });
  

  test('Logic handles a valid column placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const grid = solver.convertToGrid(puzzle);
    assert.isTrue(solver.checkColPlacement(grid, 1, '3'));  // Adjust number and column based on your puzzle
  });

  test('Logic handles an invalid column placement', () => {
    const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...5'; // Duplicate '5' in column
    const grid = solver.convertToGrid(puzzle);
    assert.isFalse(solver.checkColPlacement(grid, 0, '5'));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const grid = solver.convertToGrid(puzzle);
    assert.isTrue(solver.checkRegionPlacement(grid, 0, 0, '3'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    const puzzle = '..839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492..71'; // Duplicate '7' in region
    const grid = solver.convertToGrid(puzzle);
    assert.isFalse(solver.checkRegionPlacement(grid, 0, 0, '7'));
  });

  test('Valid puzzle strings pass the solver', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const solvedPuzzle = solver.solve(puzzle);
    assert.equal(solvedPuzzle, puzzlesAndSolutions[0][1]);
  });

  test('Invalid puzzle strings fail the solver', () => {
    const invalidPuzzle = '1.5..2.84..63.X2.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'; // Invalid character 'X'
    assert.isObject(solver.solve(invalidPuzzle));
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const incompletePuzzle = puzzlesAndSolutions[2][0];
    const solvedPuzzle = solver.solve(incompletePuzzle);
    assert.equal(solvedPuzzle, puzzlesAndSolutions[2][1]);
  });

});
