const matrix = {
    A: ['0', '0', '2', 'X', 'S', 'N', '6'],
    B: ['S', 'I', '0', 'G', '4', 'G', '5'],
    C: ['0', 'V', 'R', 'U', 'W', 'U', '4'],
    D: ['2', '9', 'P', 'M', 'L', '0', 'X'],
    E: ['0', 'U', '7', 'X', '0', 'S', '1'],
    F: ['M', '9', '1', '5', 'G', '5', '6'],
    G: ['C', '9', 'V', 'X', 'K', '8', 'K']
};

type MatrixRow = keyof typeof matrix;
type MatrixCoord = `${MatrixRow}${1 | 2 | 3 | 4 | 5 | 6 | 7}`;

/**
 * Get matrix code for a given coordinate
 * @param coord - Coordinate in format 'A1', 'B2', etc.
 * @returns The matrix value at the given coordinate
 */
function getMatrixCode(coord: string): string {
    if (!coord || coord.length !== 2) {
        throw new Error(`Invalid coordinate format: ${coord}. Expected format like 'A1', 'B2', etc.`);
    }

    const row = coord[0].toUpperCase() as MatrixRow;
    const colStr = coord[1];

    if (!matrix[row]) {
        throw new Error(`Invalid row: ${coord[0]}. Valid rows are: ${Object.keys(matrix).join(', ')}`);
    }

    const col = parseInt(colStr) - 1;
    if (isNaN(col) || col < 0 || col >= matrix[row].length) {
        throw new Error(`Invalid column: ${colStr}. Valid columns are: 1-${matrix[row].length}`);
    }

    return matrix[row][col];
}

/**
 * Get multiple matrix codes for an array of coordinates
 * @param coords - Array of coordinates
 * @returns Array of matrix values
 */
function getMatrixCodes(coords: string[]): string[] {
    return coords.map(coord => getMatrixCode(coord.trim()));
}

/**
 * Validate if a coordinate is valid
 * @param coord - Coordinate to validate
 * @returns True if valid, false otherwise
 */
function isValidCoordinate(coord: string): boolean {
    try {
        getMatrixCode(coord);
        return true;
    } catch {
        return false;
    }
}

export { getMatrixCode, getMatrixCodes, isValidCoordinate, matrix };