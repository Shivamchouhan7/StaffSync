const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const AnnouncementsManager = ({
  value,
  announcements = [],
  editingId,
  onChange,
  onSubmit,
  onEdit,
  onDelete,
  onCancel,
  loading = false,
}) => (
  <div className="employee-columns">
    <section className="staff-panel">
      <h2>{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
      <form className="announcement-form" onSubmit={onSubmit}>
        <input
          placeholder="Title"
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          maxLength={150}
          required
        />
        <textarea
          placeholder="Message"
          value={value.content}
          onChange={(event) => onChange({ ...value, content: event.target.value })}
          required
        />
        <select
          value={value.priority}
          onChange={(event) => onChange({ ...value, priority: event.target.value })}
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          value={value.targetRole}
          onChange={(event) => onChange({ ...value, targetRole: event.target.value })}
        >
          <option value="all">All</option>
          <option value="employee">Employees</option>
          <option value="manager">Managers</option>
          <option value="hr">HR</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={value.isPinned}
            onChange={(event) => onChange({ ...value, isPinned: event.target.checked })}
          />
          Pin announcement
        </label>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
    <section className="staff-panel">
      <h2>Published Announcements</h2>
      {announcements.length === 0 ? (
        <p className="employee-muted">No announcements available.</p>
      ) : (
        <div className="employee-list">
          {announcements.map((announcement) => (
            <article className="employee-announcement" key={announcement._id}>
              <div>
                <h3>
                  {announcement.isPinned ? '📌 ' : ''}
                  {announcement.title}
                </h3>
                <p>{announcement.content}</p>
                <small>
                  {announcement.priority} · For {announcement.targetRole}
                </small>
              </div>
              <div>
                <time>{formatDate(announcement.createdAt)}</time>
                <div>
                  <button type="button" onClick={() => onEdit(announcement)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(announcement._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  </div>
);

export default AnnouncementsManager;