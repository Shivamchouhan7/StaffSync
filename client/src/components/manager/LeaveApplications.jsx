const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const LeaveApplications = ({ leaves = [], onReview }) => (
  <>
    <h2>Leave Applications</h2>
    {leaves.length === 0 ? (
      <p className="staff-feedback">No leave applications found.</p>
    ) : (
      <div className="leave-grid">
        {leaves.map((item) => (
          <article className="leave-card" key={item._id}>
            <strong>Employee: {item.user?.name || '—'}</strong>
            <p>({item.user?.email || '—'})</p>
            <p>
              <b>From:</b> {formatDate(item.startDate)}
              <br />
              <b>To:</b> {formatDate(item.endDate)}
              <br />
              <b>Reason:</b> {item.reason || '—'}
              <br />
              <b>Status:</b>{' '}
              <span className={`status-${item.status}`}>{item.status}</span>
              <br />
              <b>Approved/Rejected By:</b> {item.reviewedBy?.name || '—'}
            </p>
            {item.status === 'pending' && (
              <div>
                <button type="button" onClick={() => onReview(item._id, 'approved')}>
                  Approve
                </button>
                <button type="button" onClick={() => onReview(item._id, 'rejected')}>
                  Reject
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </>
);

export default LeaveApplications;