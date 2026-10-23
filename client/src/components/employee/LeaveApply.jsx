const LeaveApply = ({ value, loading = false, onChange, onSubmit }) => (
  <section className="employee-panel">
    <h2>Apply for Leave</h2>
    <form className="employee-leave-form" onSubmit={onSubmit}>
      <div className="employee-date-grid">
        <label>
          Start Date
          <input
            type="date"
            value={value.startDate}
            onChange={(event) => onChange({ ...value, startDate: event.target.value })}
            required
          />
        </label>
        <label>
          End Date
          <input
            type="date"
            value={value.endDate}
            onChange={(event) => onChange({ ...value, endDate: event.target.value })}
            required
          />
        </label>
      </div>
      <label>
        Reason
        <textarea
          placeholder="Reason for leave"
          value={value.reason}
          onChange={(event) => onChange({ ...value, reason: event.target.value })}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Applying...' : 'Apply Leave'}
      </button>
    </form>
  </section>
);

export default LeaveApply;