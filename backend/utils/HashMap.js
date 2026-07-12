/**
 * Custom HashMap implementation with chaining collision resolution.
 * Used for O(1) in-memory cache lookup of patient medical records.
 */
export class PatientHashMap {
  constructor(limit = 53) {
    this.limit = limit;
    this.buckets = Array(limit).fill(null).map(() => []);
    this.count = 0;
  }

  // Simple polynomial hash function
  _hash(key) {
    let hash = 0;
    const strKey = String(key);
    for (let i = 0; i < strKey.length; i++) {
      hash = (hash * 31 + strKey.charCodeAt(i)) % this.limit;
    }
    return hash;
  }

  // Inserts or updates a key-value pair
  put(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    
    // Check if key already exists, update it
    for (let i = 0; i < bucket.length; i++) {
      const pair = bucket[i];
      if (pair[0] === key) {
        pair[1] = value;
        return;
      }
    }
    
    // Insert new pair
    bucket.push([key, value]);
    this.count++;
  }

  // Retrieves value by key. O(1) average time complexity
  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    
    for (let i = 0; i < bucket.length; i++) {
      const pair = bucket[i];
      if (pair[0] === key) {
        return pair[1];
      }
    }
    
    return null;
  }

  // Removes a key-value pair
  remove(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    
    for (let i = 0; i < bucket.length; i++) {
      const pair = bucket[i];
      if (pair[0] === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }

  // Checks if key exists
  has(key) {
    return this.get(key) !== null;
  }

  // Returns total size of the hash map
  size() {
    return this.count;
  }

  // Clears the map
  clear() {
    this.buckets = Array(this.limit).fill(null).map(() => []);
    this.count = 0;
  }
}
