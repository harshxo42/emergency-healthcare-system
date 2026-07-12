/**
 * Euclidean distance calculation on a 2D operations grid (0 to 100).
 * @param {Object} p1 - First point {x, y}
 * @param {Object} p2 - Second point {x, y}
 * @returns {number} Distance value
 */
export function calculateDistance(p1, p2) {
  if (!p1 || !p2) return Infinity;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Custom Quick Sort implementation.
 * Sorts elements using a custom comparator function.
 * @param {Array} arr - The array to sort
 * @param {Function} compareFn - Comparator function (returns negative if a < b)
 * @returns {Array} New sorted array
 */
export function quickSort(arr, compareFn) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (compareFn(arr[i], pivot) < 0) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left, compareFn), pivot, ...quickSort(right, compareFn)];
}

/**
 * Sorts hospitals by proximity to the patient's coordinates and bed availability.
 * Primary: Bed availability (available first)
 * Secondary: Closest distance
 * @param {Array} hospitals - List of hospitals
 * @param {Object} patientLocation - Coordinates {x, y}
 * @returns {Array} Sorted list of hospitals
 */
export function sortHospitalsByProximity(hospitals, patientLocation) {
  // Map hospitals to include their calculated distance
  const hospitalsWithDist = hospitals.map(h => ({
    ...h,
    distance: parseFloat(calculateDistance(h.location, patientLocation).toFixed(2))
  }));

  // Define compare function
  const compareFn = (a, b) => {
    // Check available beds first
    if (a.availableBeds > 0 && b.availableBeds === 0) return -1;
    if (a.availableBeds === 0 && b.availableBeds > 0) return 1;
    
    // Sort by distance if bed status is comparable
    return a.distance - b.distance;
  };

  return quickSort(hospitalsWithDist, compareFn);
}
