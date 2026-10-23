const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const emptyTraining = {
  title: '',
  description: '',
  category: 'General',
  trainer: '',
  startDate: '',
  endDate: '',
};

const TrainingManagement = ({
  trainings = [],
  value = emptyTraining,
  editingId,
  onChange,
  onSubmit,
  onEdit,
  onCancel,
}) => (
  <>
    <h2>Training &amp; Development</h2>
    <form className="training-form" onSubmit={onSubmit}>
      <input
        placeholder="Training Title"
        value={value.title}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
        required
      />
      <div className="training-dates">
        <input
          aria-label="Start date"
          type="date"
          value={value.startDate}
          onChange={(event) => onChange({ ...value, startDate: event.target.value })}
          required
        />
        <input
          aria-label="End date"
          type="date"
          value={value.endDate}
          onChange={(event) => onChange({ ...value, endDate: event.target.value })}
          required
        />
      </div>
      <textarea
        placeholder="Description"
        value={value.description}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
        required
      />
      <input
        placeholder="Trainer Name"
        value={value.trainer}
        onChange={(event) => onChange({ ...value, trainer: event.target.value })}
        required
      />
      <input
        placeholder="Category"
        value={value.category}
        onChange={(event) => onChange({ ...value, category: event.target.value })}
        required
      />
      <div className="training-form-actions">
        <button type="submit">{editingId ? 'Update Training' : 'Create Training'}</button>
        {editingId && (
          <button type="button" className="training-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
    <div className="training-list">
      {trainings.map((item) => (
        <article className="training-card" key={item._id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <small>
            Date: {formatDate(item.startDate)} - {formatDate(item.endDate)}
            <br />
            Trainer: {item.trainer}
            <br />
            Category: {item.category}
          </small>
          <button type="button" className="training-edit" onClick={() => onEdit(item)}>
            Edit
          </button>
        </article>
      ))}
    </div>
  </>
);

export default TrainingManagement;