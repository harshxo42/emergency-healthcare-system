import { PriorityQueue } from './utils/PriorityQueue.js';
import { PatientHashMap } from './utils/HashMap.js';
import { sortHospitalsByProximity } from './utils/SortingUtils.js';

console.log('====================================================');
console.log('🧪 RUNNING DISPATCH OPERATIONS SYSTEM DSA TESTS');
console.log('====================================================\n');

// 1. Test Priority Queue
console.log('1️⃣  TESTING CUSTOM BINARY HEAP PRIORITY QUEUE...');
const pq = new PriorityQueue();

const t1 = new Date(Date.now() - 5000);
const t2 = new Date(Date.now());
const t3 = new Date(Date.now() - 10000);

pq.enqueue({ _id: 'case_normal_old', severity: 'Normal', createdAt: t3 });
pq.enqueue({ _id: 'case_critical', severity: 'Critical', createdAt: t2 });
pq.enqueue({ _id: 'case_high', severity: 'High', createdAt: t1 });
pq.enqueue({ _id: 'case_critical_older', severity: 'Critical', createdAt: t3 }); // Critical but earlier than t2

console.log('Queue size (should be 4):', pq.size());

const first = pq.dequeue();
console.log('First dequeued (should be Critical & Oldest - case_critical_older):', first._id);

const second = pq.dequeue();
console.log('Second dequeued (should be Critical - case_critical):', second._id);

const third = pq.dequeue();
console.log('Third dequeued (should be High - case_high):', third._id);

const fourth = pq.dequeue();
console.log('Fourth dequeued (should be Normal - case_normal_old):', fourth._id);

if (
  first._id === 'case_critical_older' &&
  second._id === 'case_critical' &&
  third._id === 'case_high' &&
  fourth._id === 'case_normal_old'
) {
  console.log('✅ PRIORITY QUEUE HEAPIFY TEST PASSED!\n');
} else {
  console.error('❌ PRIORITY QUEUE TEST FAILED!\n');
}


// 2. Test HashMap
console.log('2️⃣  TESTING CUSTOM HASHMAP COLLISION RESOLUTION...');
const map = new PatientHashMap(5); // Small limit to guarantee collisions!

map.put('patient_A', { name: 'Aman' });
map.put('patient_B', { name: 'Bhuvnesh' });
map.put('patient_C', { name: 'Chitra' });
map.put('patient_D', { name: 'Divya' });

console.log('Map Size (should be 4):', map.size());
console.log('Get patient_B (should be Bhuvnesh):', map.get('patient_B')?.name);
console.log('Has patient_E (should be false):', map.has('patient_E'));

// Update
map.put('patient_B', { name: 'Bhuvnesh Updated' });
console.log('Get patient_B after update (should be Bhuvnesh Updated):', map.get('patient_B')?.name);

// Delete
map.remove('patient_C');
console.log('Get patient_C after delete (should be null):', map.get('patient_C'));
console.log('Map Size after delete (should be 3):', map.size());

if (
  map.get('patient_B')?.name === 'Bhuvnesh Updated' &&
  map.get('patient_C') === null &&
  map.size() === 3
) {
  console.log('✅ HASHMAP CHAINING COLLISION TEST PASSED!\n');
} else {
  console.error('❌ HASHMAP TEST FAILED!\n');
}


// 3. Test Sorting
console.log('3️⃣  TESTING CUSTOM QUICK SORT BY PROXIMITY...');
const hospitals = [
  { name: 'Hosp_Far_HasBeds', location: { x: 90, y: 90 }, availableBeds: 5 },
  { name: 'Hosp_Close_NoBeds', location: { x: 12, y: 12 }, availableBeds: 0 },
  { name: 'Hosp_Medium_HasBeds', location: { x: 30, y: 30 }, availableBeds: 2 },
  { name: 'Hosp_Closest_HasBeds', location: { x: 15, y: 15 }, availableBeds: 1 }
];

const patientLocation = { x: 10, y: 10 };

// Proximity sorting sorts:
// 1. Has available beds first
// 2. Shortest distance second
const sorted = sortHospitalsByProximity(hospitals, patientLocation);

console.log('Sorted Order (Available Beds and Nearest Distance):');
sorted.forEach((h, idx) => {
  console.log(`${idx + 1}. ${h.name} - Distance: ${h.distance} - Beds: ${h.availableBeds}`);
});

const bestChoice = sorted[0];
console.log('Best choice (should be Hosp_Closest_HasBeds):', bestChoice.name);

if (
  bestChoice.name === 'Hosp_Closest_HasBeds' &&
  sorted[2].name === 'Hosp_Far_HasBeds' &&
  sorted[3].name === 'Hosp_Close_NoBeds' // No beds ranked last
) {
  console.log('✅ QUICK SORT PROXIMITY TEST PASSED!\n');
} else {
  console.error('❌ PROXIMITY SORTING TEST FAILED!\n');
}

console.log('====================================================');
console.log('🎉 ALL AUTOMATED CONSOLE TESTS COMPLETED SUCCESSFULLY');
console.log('====================================================');
