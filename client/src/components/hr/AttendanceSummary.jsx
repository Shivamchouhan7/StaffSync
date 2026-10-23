const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
const formatTime = (value) => (value ? new Date(value).toLocaleTimeString() : '—');

const AttendanceSummary = ({ attendance = [] }) => (
  <section className="staff-panel">
    <h2>Attendance Records</h2>
    {attendance.length === 0 ? (
      <p className="staff-feedback">No attendance records found.</p>
    ) : (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.name || '—'}</td>
                <td>{formatDate(item.date)}</td>
                <td>{formatTime(item.checkIn)}</td>
                <td>{formatTime(item.checkOut)}</td>
                <td>{item.status || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default AttendanceSummary;