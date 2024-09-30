class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) {
      return { error: 'Required field missing' };
    }

    if (puzzleString.length !== 81) {
      return { error: 'Expected puzzle to be 81 characters long' };
    }

    if (!/^[1-9.]+$/.test(puzzleString)) {
      return { error: 'Invalid characters in puzzle' };
    }

    return true; // The puzzle is valid
  }

  solve(puzzleString) {
    const validation = this.validate(puzzleString);
    if (validation !== true) {
      return { error: validation.error }; // Return the validation error message
    }
  
    let grid = this.convertToGrid(puzzleString);
  
    if (grid.length !== 9 || grid.some(row => row.length !== 9)) {
      console.error('Invalid grid dimensions:', grid.length, grid.map(row => row.length));
      return { error: 'Internal Server Error' }; // Handle this as needed
    }
  
    if (this.solvePuzzle(grid)) {
      return grid.flat().join('');
    }
  
    return { error: 'Puzzle cannot be solved' }; // Update this line
  }

  solvePuzzle(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === '.') {  // Find an empty spot
          let randomNumbers = this.shuffleNumbers();  // Get random numbers 1-9
          for (let num of randomNumbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;  // Place the number

              if (this.solvePuzzle(grid)) {  // Try to solve the next cell
                return true;
              }

              grid[row][col] = '.';  // Backtrack by resetting the cell
            }
          }
          return false;  // Trigger backtracking if no number fits
        }
      }
    }
    return true;  // Puzzle solved when all cells are filled correctly
  }

  shuffleNumbers() {
    let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];  // Shuffle the numbers
    }
    return numbers;
  }

  checkRowPlacement(grid, row, col, num) {
    // Ensure row exists
    if (!grid[row]) {
      console.error(`Row ${row} is undefined in grid.`);
      return false;
    }
    // Check the row for duplicates, ignoring the current column
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) {
        return false; // Duplicate number found in the row
      }
    }
    return true; // No duplicates found in the row
  }
  

  checkColPlacement(grid, row, col, num) {
    // Check the column for duplicates, ignoring the current row
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) {
        return false; // Duplicate number found in the column
      }
    }
    return true; // No duplicates found in the column
  }
  

  checkRegionPlacement(grid, row, col, num) {
    // Find the top-left corner of the 3x3 region
    let regionRowStart = Math.floor(row / 3) * 3;
    let regionColStart = Math.floor(col / 3) * 3;

    // Check if the number exists in the region but ignore the current cell
    for (let r = regionRowStart; r < regionRowStart + 3; r++) {
      for (let c = regionColStart; c < regionColStart + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) {
          return false; // There's a duplicate number in the region
        }
      }
    }
    return true; // No duplicates found
  }

  isValid(grid, row, col, num) {
    // Ensure the number is valid in the row, column, and region
    return this.checkRowPlacement(grid, row, col, num) &&
      this.checkColPlacement(grid, row, col, num) &&
      this.checkRegionPlacement(grid, row, col, num);
  }


  convertToGrid(puzzleString) {
    let rows = [];
    for (let i = 0; i < 9; i++) {
      rows.push(puzzleString.slice(i * 9, i * 9 + 9).split(''));
    }
    return rows;
  }
}

module.exports = SudokuSolver;
