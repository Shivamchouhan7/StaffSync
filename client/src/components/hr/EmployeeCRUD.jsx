const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const EmployeeCRUD = ({
  value,
  employees = [],
  managers = [],
  onChange,
  onSubmit,
  onToggleStatus,
  onAssignManager,
}) => (
  <section className="staff-panel">
    <h2>Employee Management</h2>
    <form className="employee-form" onSubmit={onSubmit}>
      {[
        ['name', 'Name'],
        ['email', 'Email'],
        ['department', 'Department'],
        ['designation', 'Position'],
        ['salary', 'Salary'],
        ['joiningDate', ''],
        ['phone', 'Phone'],
        ['address', 'Address'],
      ].map(([key, label]) => (
        <input
          key={key}
          type={key === 'salary' ? 'number' : key === 'joiningDate' ? 'date' : key === 'email' ? 'email' : 'text'}
          placeholder={label || undefined}
          value={value[key]}
          onChange={(event) => onChange({ ...value, [key]: event.target.value })}
          required={['name', 'email', 'department', 'designation'].includes(key)}
        />
      ))}
      <button type="submit">Add Employee</button>
    </form>
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {['Name', 'Email', 'Department', 'Position', 'Salary', 'Join Date', 'Phone', 'Address', 'Manager', 'Actions'].map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((item) => (
            <tr key={item._id}>
              <td>{item.user?.name || '—'}</td>
              <td>{item.user?.email || '—'}</td>
              <td>{item.department || '—'}</td>
              <td>{item.designation || '—'}</td>
              <td>{item.salary ? `₹${item.salary}` : '—'}</td>
              <td>{formatDate(item.joinDate)}</td>
              <td>{item.phone || '—'}</td>
              <td>{item.address?.street || '—'}</td>
              <td>
                <select
                  className="manager-select"
                  aria-label={`Assign manager to ${item.user?.name || 'employee'}`}
                  value={managers.find((manager) => manager.user?._id === item.manager?._id)?._id || ''}
                  onChange={(event) => onAssignManager(item, event.target.value)}
                >
                  <option value="">Select manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.user?.name} ({manager.department})
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button type="button" className="table-action" onClick={() => onToggleStatus(item)}>
                  {item.user?.isActive === false ? 'Activate' : 'Deactivate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default EmployeeCRUD;