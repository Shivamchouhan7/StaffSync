const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const LeaveApplications = ({ leaves = [], onReview }) => (
  <section className="staff-panel">
    <h2>Leave Applications</h2>
    {leaves.length === 0 ? (
      <p className="staff-feedback">No leave applications found.</p>
    ) : (
      <div className="leave-grid">
        {leaves.map((item) => (
          <article className="leave-card" key={item._id}>
            <strong>{item.user?.name || 'Employee'}</strong>
            <p>{item.user?.email || '—'}</p>
            <p>
              From: {formatDate(item.startDate)}
              <br />
              To: {formatDate(item.endDate)}
              <br />
              Reason: {item.reason || '—'}
            </p>
            <p>
              Status: <b className={`status-${item.status}`}>{item.status}</b>
            </p>
            {item.status === 'pending' && (
              <div>
                <button type="button" onClick={() => onReview(item._id, 'approved')}>Approve</button>
                <button type="button" onClick={() => onReview(item._id, 'rejected')}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
);

export default LeaveApplications;