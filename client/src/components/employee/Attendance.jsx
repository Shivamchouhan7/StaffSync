const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

const Attendance = ({ records = [], today, loading = false, onAttendance }) => (
  <section className="employee-panel">
    <div className="employee-panel-heading">
      <h2>Attendance</h2>
      {today?.checkOut ? (
        <span className="employee-action-state">Checked Out</span>
      ) : today ? (
        <button type="button" onClick={() => onAttendance('checkOut')} disabled={loading}>
          Check Out
        </button>
      ) : (
        <button type="button" onClick={() => onAttendance('checkIn')} disabled={loading}>
          Check In
        </button>
      )}
    </div>
    {records.length === 0 ? (
      <p className="employee-muted">No attendance records found.</p>
    ) : (
      <div className="employee-list">
        {records.map((record) => (
          <article className="employee-attendance-item" key={record._id}>
            <div>
              <strong>{formatDate(record.date)}</strong>
              <p>In: {formatTime(record.checkIn)} | Out: {formatTime(record.checkOut)}</p>
            </div>
            <span className={`employee-status status-${record.status}`}>{record.status}</span>
          </article>
        ))}
      </div>
    )}
  </section>
);

export default Attendance;