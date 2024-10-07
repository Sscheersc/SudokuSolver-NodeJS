'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route('/api/solve')
    .post((req, res) => {
      try {
        let { puzzle } = req.body;

        if (!puzzle) {
          return res.json({ error: 'Required field missing' });
        }

        if (!/^[1-9.]+$/.test(puzzle)) {
          return res.json({ error: 'Invalid characters in puzzle' });
        }

        // Validate puzzle length
        if (puzzle.length !== 81) {
          return res.json({ error: 'Expected puzzle to be 81 characters long' });
        }

        let validation = solver.validate(puzzle);
        if (validation !== true) {
          return res.json(validation); // Make sure this is only for validation errors
        }

        let solution = solver.solve(puzzle);
        if (solution.error) {
          return res.json(solution);
        }

        res.json({ solution });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

  app.route('/api/check')
    .post((req, res) => {
      try {
        let { puzzle, coordinate, value } = req.body;
  
        // Check if required fields are provided
        if (!puzzle || !coordinate || !value) {
          return res.json({ error: 'Required field(s) missing' });
        }
  
        // Validate puzzle and value characters
        if (!/^[1-9.]+$/.test(puzzle) || !/^[1-9]$/.test(value)) {
          return res.json({ error: 'Invalid characters in puzzle' });
        }
  
        // Validate puzzle length
        if (puzzle.length !== 81) {
          return res.json({ error: 'Expected puzzle to be 81 characters long' });
        }
  
        // Validate coordinate format (A1 to I9)
        if (!/^[A-I][1-9]$/.test(coordinate)) {
          return res.json({ error: 'Invalid coordinate' });
        }
  
        // Validate puzzle (grid formation and overall structure)
        let validation = solver.validate(puzzle);
        if (validation !== true) {
          return res.json(validation);
        }
  
        // Convert puzzle string to grid format
        let grid = solver.convertToGrid(puzzle);
  
        // Convert coordinate to row and column indices
        let row = coordinate.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1, ..., 'I' -> 8
        let col = parseInt(coordinate[1], 10) - 1; // '1' -> 0, '9' -> 8
  
        // Collect conflicts for row, column, and region placements
        const conflicts = [];
        if (!solver.checkRowPlacement(grid, row, col, value)) conflicts.push('row');
        if (!solver.checkColPlacement(grid, row, col, value)) conflicts.push('column'); // corrected to row, col in this line
        if (!solver.checkRegionPlacement(grid, row, col, value)) conflicts.push('region');
  
        // If there are conflicts, return them
        if (conflicts.length > 0) {
          return res.json({ valid: false, conflict: conflicts });
        } else{
          // Otherwise, return valid
          res.json({ valid: true });
        }
  
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
};
