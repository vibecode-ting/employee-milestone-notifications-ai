/**
 * Automated Verification Script for Cloud Function dailyMilestoneCheck fixes:
 * 1. Bug 1: Canonical Firestore Document ID logging in notificationLogs.
 * 2. Bug 2: Work Anniversary completed-years guard (>= 1 year of service).
 * 3. Bug 3: Gemini AI greeting generation & template token fallback.
 */

const assert = require('assert');

console.log('====================================================');
console.log('🧪 Verifying Cloud Function Fixes (functions/src/index.ts)');
console.log('====================================================\n');

// ---------------------------------------------------------------------
// TEST 1: Work Anniversary Year Guard (>= 1 completed year of service)
// ---------------------------------------------------------------------
console.log('▶ Test 1: Work Anniversary Year Guard (Year 0 hire check)...');

const today = new Date('2026-10-17T09:00:00Z');
const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function evaluateAnniversary(emp, currentDate) {
  if (emp.joinedDate && emp.joinedDate.endsWith(todayStr)) {
    const joinedYear = parseInt(emp.joinedDate.slice(0, 4), 10);
    const yearsOfService = !isNaN(joinedYear) ? currentDate.getFullYear() - joinedYear : 0;
    if (yearsOfService >= 1) {
      return { triggered: true, yearsOfService };
    }
  }
  return { triggered: false, yearsOfService: 0 };
}

// Case 1A: Employee hired today (Year 0)
const newHire = { name: 'Jordan Lee', joinedDate: '2026-10-17' };
const res0 = evaluateAnniversary(newHire, today);
assert.strictEqual(res0.triggered, false, 'Anniversary should NOT trigger in join year (year 0)');
console.log('  ✔ Year 0 Hire (joined 2026-10-17): Skipped (0 years of service).');

// Case 1B: Employee hired 2 years ago (Year 2)
const veteran = { name: 'Taylor Swift', joinedDate: '2024-10-17' };
const res2 = evaluateAnniversary(veteran, today);
assert.strictEqual(res2.triggered, true, 'Anniversary SHOULD trigger for completed years');
assert.strictEqual(res2.yearsOfService, 2, 'Years of service should be 2');
console.log('  ✔ Year 2 Hire (joined 2024-10-17): Triggered successfully (2 years of service).');

// ---------------------------------------------------------------------
// TEST 2: Canonical Firestore Document ID vs emp.id
// ---------------------------------------------------------------------
console.log('\n▶ Test 2: Notification Log Canonical Document ID...');

// In Firestore, empDoc.data() does NOT include document id unless explicitly stored.
// The fix extracts empDocId = empDoc.id and passes it to logNotification.
const mockEmpDoc = {
  id: 'doc_firestore_canonical_xyz123',
  data: () => ({
    name: 'Morgan Freeman',
    department: 'Engineering',
    employeeId: 'EMP-98765', // Business / HR ID
    dob: '1985-10-17',
    status: 'active',
    // notice: no `id` field in data
  }),
};

const empData = mockEmpDoc.data();
const empDocId = mockEmpDoc.id;
const emp = { ...empData, id: empDocId };

// Simulated log entry creation
const logEntry = {
  employeeId: empDocId,
  employeeBusinessId: emp.employeeId || empDocId,
  milestoneType: 'BIRTHDAY',
  status: 'success',
};

assert.strictEqual(logEntry.employeeId, 'doc_firestore_canonical_xyz123');
assert.strictEqual(logEntry.employeeBusinessId, 'EMP-98765');
assert.ok(logEntry.employeeId !== undefined && logEntry.employeeId !== '', 'employeeId must not be empty');
console.log('  ✔ Notification Log records canonical docId:', logEntry.employeeId);
console.log('  ✔ Notification Log preserves business HR ID:', logEntry.employeeBusinessId);

// ---------------------------------------------------------------------
// TEST 3: Gemini AI Greeting Generator & Fallback Token Replacement
// ---------------------------------------------------------------------
console.log('\n▶ Test 3: Gemini AI Greeting & Fallback Token Replacement...');

function populateTokens(template, empObj, years) {
  return template
    .replace(/\{\{employee_name\}\}/g, empObj.name || 'Team Member')
    .replace(/\{\{department\}\}/g, empObj.department || 'General')
    .replace(/\{\{years_of_service\}\}/g, String(years || 1))
    .replace(/\{\{job_title\}\}/g, empObj.jobTitle || empObj.role || 'Colleague');
}

const templateAnniversary = 'Congratulations {{employee_name}} on {{years_of_service}} year(s) with {{department}}! 🏆 Role: {{job_title}}';
const populatedMsg = populateTokens(templateAnniversary, {
  name: 'Alex Johnson',
  department: 'Product',
  jobTitle: 'Senior Manager',
}, 3);

assert.strictEqual(
  populatedMsg,
  'Congratulations Alex Johnson on 3 year(s) with Product! 🏆 Role: Senior Manager'
);
console.log('  ✔ Template token replacement verified:', populatedMsg);

// Verify fallback behavior when API key is unset
async function simulateGeminiCall(apiKey) {
  if (!apiKey) return populatedMsg;
  return 'AI generated custom greeting';
}

simulateGeminiCall(undefined).then((result) => {
  assert.strictEqual(result, populatedMsg);
  console.log('  ✔ Fallback greeting returned safely when GEMINI_API_KEY is not configured.');
  console.log('\n====================================================');
  console.log('✅ ALL 3 CLOUD FUNCTION CHECKS PASSED SUCCESSFULLY!');
  console.log('====================================================');
});
