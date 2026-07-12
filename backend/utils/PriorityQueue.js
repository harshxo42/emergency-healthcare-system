/**
 * Custom Binary Heap Priority Queue implementation.
 * Prioritizes: Critical (1) > High (2) > Normal (3)
 * For identical severities, acts as FIFO (using creation timestamp).
 */
export class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Returns the parent index
  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  // Returns the left child index
  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  // Returns the right child index
  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  // Swaps two elements in the heap
  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  // Converts severity string to priority number (lower is higher priority)
  getSeverityPriority(severity) {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 1;
      case 'high':
        return 2;
      case 'normal':
      default:
        return 3;
    }
  }

  // Compare two elements. Returns true if element A has higher priority than element B
  hasHigherPriority(a, b) {
    const pA = this.getSeverityPriority(a.severity);
    const pB = this.getSeverityPriority(b.severity);

    if (pA !== pB) {
      return pA < pB; // Lower priority number is higher severity
    }
    
    // Tiebreaker: earlier timestamp comes first
    return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime();
  }

  // Inserts a new emergency case into the priority queue
  enqueue(item) {
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  // Helper to maintain heap property upwards
  heapifyUp(index) {
    while (
      index > 0 &&
      this.hasHigherPriority(this.heap[index], this.heap[this.getParentIndex(index)])
    ) {
      const parent = this.getParentIndex(index);
      this.swap(index, parent);
      index = parent;
    }
  }

  // Removes and returns the highest priority emergency case
  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return root;
  }

  // Helper to maintain heap property downwards
  heapifyDown(index) {
    let highest = index;
    const left = this.getLeftChildIndex(index);
    const right = this.getRightChildIndex(index);
    const size = this.heap.length;

    if (left < size && this.hasHigherPriority(this.heap[left], this.heap[highest])) {
      highest = left;
    }

    if (right < size && this.hasHigherPriority(this.heap[right], this.heap[highest])) {
      highest = right;
    }

    if (highest !== index) {
      this.swap(index, highest);
      this.heapifyDown(highest);
    }
  }

  // Peeks at the highest priority element
  peek() {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  // Returns all elements in the priority queue ordered by their current heap positions
  // For standard presentation in lists, we'll sort a copy of the array by priority
  getOrderedList() {
    return [...this.heap].sort((a, b) => {
      if (this.hasHigherPriority(a, b)) return -1;
      if (this.hasHigherPriority(b, a)) return 1;
      return 0;
    });
  }
}
