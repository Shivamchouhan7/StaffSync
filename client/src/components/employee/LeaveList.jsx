const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const LeaveList = ({ leaves = [] }) => (
  <section className="employee-panel">
    <h2>My Leaves</h2>
    {leaves.length === 0 ? (
      <p className="employee-muted">No leave applications found.</p>
    ) : (
      <div className="employee-list">
        {leaves.map((leave) => (
          <article className="employee-leave-item" key={leave._id}>
            <div>
              <strong>{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</strong>
              <p>{leave.reason}</p>
            </div>
            <span className={`employee-status status-${leave.status}`}>{leave.status}</span>
          </article>
        ))}
      </div>
    )}
  </section>
);

export default LeaveList;