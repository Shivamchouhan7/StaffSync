const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const Announcements = ({ announcements = [], trainings = [] }) => (
  <div className="employee-columns">
    <section className="employee-panel">
      <h2>Announcements</h2>
      {announcements.length === 0 ? (
        <p className="employee-muted">No announcements available.</p>
      ) : (
        <div className="employee-list">
          {announcements.map((announcement) => (
            <article className="employee-announcement" key={announcement._id}>
              <div>
                <h3>{announcement.title}</h3>
                <p>{announcement.content}</p>
              </div>
              <time>{formatDate(announcement.createdAt)}</time>
            </article>
          ))}
        </div>
      )}
    </section>
    <section className="employee-panel">
      <h2>Trainings</h2>
      {trainings.length === 0 ? (
        <p className="employee-muted">No trainings available.</p>
      ) : (
        <div className="employee-list">
          {trainings.map((training) => (
            <article className="employee-announcement" key={training._id}>
              <div>
                <h3>{training.title}</h3>
                <p>{training.description}</p>
              </div>
              <time>{formatDate(training.startDate)}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  </div>
);

export default Announcements;