const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting StaffSync API Verification Test Suite ---');
  let passCount = 0;
  let failCount = 0;

  const test = (name, condition) => {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name}`);
      failCount++;
    }
  };

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    test('GET /api/health returns 200 and database connected', health.status === 200 && health.body.database.status === 'connected');

    // 2. HR Login
    const hrLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'hr@staffsync.com', password: 'Password@123' }
    );
    test('POST /api/auth/login (HR)', hrLogin.status === 200 && hrLogin.body.user.role === 'hr');
    const hrToken = hrLogin.body.token;

    // 3. Manager Login
    const mgrLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'manager@staffsync.com', password: 'Password@123' }
    );
    test('POST /api/auth/login (Manager)', mgrLogin.status === 200 && mgrLogin.body.user.role === 'manager');
    const mgrToken = mgrLogin.body.token;

    // 4. Employee Login
    const empLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'employee@staffsync.com', password: 'Password@123' }
    );
    test('POST /api/auth/login (Employee)', empLogin.status === 200 && empLogin.body.user.role === 'employee');
    const empToken = empLogin.body.token;

    // 5. RBAC Security: Employee cannot access HR dashboard or HR employee list
    const forbiddenTest = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/hr',
      method: 'GET',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    test('RBAC: Employee blocked from HR dashboard (403)', forbiddenTest.status === 403);

    // 6. HR can access HR dashboard
    const hrDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/hr',
      method: 'GET',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    test('HR Dashboard accessible by HR (200)', hrDash.status === 200 && hrDash.body.stats.totalEmployees >= 3);

    // 7. Manager can access Manager dashboard
    const mgrDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/manager',
      method: 'GET',
      headers: { Authorization: `Bearer ${mgrToken}` },
    });
    test('Manager Dashboard accessible by Manager (200)', mgrDash.status === 200 && mgrDash.body.stats.teamSize >= 1);

    // 8. Public registration enforces Employee role
    const testEmail = `newbie.${Date.now()}@example.com`;
    const regRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'New Trainee',
        email: testEmail,
        password: 'Password@123',
        role: 'hr', // Attempt privilege escalation!
        department: 'Operations',
        designation: 'Operations Associate',
      }
    );
    test(
      'Security: Public registration forces Employee role even if client passes "hr"',
      regRes.status === 201 && regRes.body.user.role === 'employee'
    );

    // 9. Check in duplicate prevention test:
    // Notice empUser1 already has attendance seeded today!
    const dupCheckIn = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/attendance/check-in',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empToken}`,
        },
      },
      { notes: 'Trying duplicate check-in' }
    );
    test('Attendance: Duplicate check-in rejected with 400', dupCheckIn.status === 400);

    // 10. Notifications check
    const notifs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    test('In-app Notifications retrieved successfully', notifs.status === 200 && Array.isArray(notifs.body.data));

    console.log(`\n--- Test Summary: ${passCount} Passed, ${failCount} Failed ---`);
    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
};

runTests();
