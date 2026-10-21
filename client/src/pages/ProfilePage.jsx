import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { employeeService, authService } from '../services/api';
import { updateProfileLocally } from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  CheckCircle,
  Building,
  Briefcase,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Edit fields permitted for employee self-service
  const [formFields, setFormFields] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  });

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authService.getMe();
      const u = res.data.user;
      const p = res.data.profile;
      setProfileData(p);

      setFormFields({
        name: u?.name || '',
        phone: p?.phone || '',
        street: p?.address?.street || '',
        city: p?.address?.city || '',
        state: p?.address?.state || '',
        zipCode: p?.address?.zipCode || '',
        country: p?.address?.country || 'USA',
        emergencyName: p?.emergencyContact?.name || '',
        emergencyRelationship: p?.emergencyContact?.relationship || '',
        emergencyPhone: p?.emergencyContact?.phone || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: formFields.name,
        phone: formFields.phone,
        address: {
          street: formFields.street,
          city: formFields.city,
          state: formFields.state,
          zipCode: formFields.zipCode,
          country: formFields.country,
        },
        emergencyContact: {
          name: formFields.emergencyName,
          relationship: formFields.emergencyRelationship,
          phone: formFields.emergencyPhone,
        },
      };

      const res = await employeeService.updateMyProfile(payload);
      dispatch(updateProfileLocally(res.data.data));
      setProfileFeedback({ type: 'success', message: 'Profile information updated successfully!' });
      fetchProfile();
    } catch (err) {
      setProfileFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileFeedback(null), 4000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordFeedback({ type: 'danger', message: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      });
      setPasswordFeedback({ type: 'success', message: 'Password updated successfully!' });
      setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setSavingPassword(false);
      setTimeout(() => setPasswordFeedback(null), 4000);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile credentials..." />;
  }

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">My Account & Profile Settings</h3>
        <p className="text-muted small mb-0">
          Manage your personal contact info, view job credentials, and update security passwords
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Organization Metadata & Security */}
        <div className="col-lg-4">
          {/* Identity Card */}
          <div className="saas-card mb-4 text-center p-4">
            <div
              className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold fs-2 shadow-sm mb-3"
              style={{ width: '80px', height: '80px' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h5 className="fw-bold text-dark mb-1">{user?.name}</h5>
            <p className="text-muted small mb-2">{user?.email}</p>
            <span
              className={`badge ${
                user?.role === 'hr'
                  ? 'badge-soft-danger'
                  : user?.role === 'manager'
                  ? 'badge-soft-primary'
                  : 'badge-soft-success'
              } text-uppercase px-3 py-1 mb-3`}
            >
              {user?.role} Role
            </span>

            <div className="border-top pt-3 text-start small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Staff ID:</span>
                <strong className="font-monospace text-dark">
                  {profileData?.employeeId || 'EMP-1000'}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Department:</span>
                <strong className="text-dark">{profileData?.department || 'General'}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Designation:</span>
                <strong className="text-dark">{profileData?.designation || user?.role?.toUpperCase()}</strong>
              </div>
              {profileData?.manager && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Reports to:</span>
                  <strong className="text-dark">{profileData.manager.name}</strong>
                </div>
              )}
              {user?.role === 'hr' && profileData?.salary !== undefined && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Salary:</span>
                  <strong className="font-monospace">${profileData.salary.toLocaleString()}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Password Security Card */}
          <div className="saas-card p-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Key size={18} className="text-primary" /> Update Password
            </h6>

            {passwordFeedback && (
              <div className={`alert alert-${passwordFeedback.type} py-2 px-3 small rounded-3 mb-3`}>
                {passwordFeedback.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-2">
                <label className="form-label small fw-semibold text-muted">Current Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  required
                  value={passwordFields.currentPassword}
                  onChange={(e) =>
                    setPasswordFields({ ...passwordFields, currentPassword: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-muted">New Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  required
                  minLength={6}
                  value={passwordFields.newPassword}
                  onChange={(e) =>
                    setPasswordFields({ ...passwordFields, newPassword: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  required
                  minLength={6}
                  value={passwordFields.confirmPassword}
                  onChange={(e) =>
                    setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-primary btn-sm w-100"
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Editable Permitted Profile Details */}
        <div className="col-lg-8">
          <div className="saas-card p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-1">Permitted Profile Details</h6>
                <p className="text-muted small mb-0">
                  Update contact numbers, home address, and emergency contact details
                </p>
              </div>
              <span className="badge badge-soft-info">Self-Service</span>
            </div>

            {profileFeedback && (
              <div className={`alert alert-${profileFeedback.type} py-2 px-3 small rounded-3 mb-3`}>
                {profileFeedback.message}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formFields.name}
                    onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+1-555-0100"
                    value={formFields.phone}
                    onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 500 Market St, Suite 400"
                    value={formFields.street}
                    onChange={(e) => setFormFields({ ...formFields, street: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="San Francisco"
                    value={formFields.city}
                    onChange={(e) => setFormFields({ ...formFields, city: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">State / Region</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CA"
                    value={formFields.state}
                    onChange={(e) => setFormFields({ ...formFields, state: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Zip / Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="94105"
                    value={formFields.zipCode}
                    onChange={(e) => setFormFields({ ...formFields, zipCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-top pt-3 mb-4">
                <h6 className="fw-bold text-dark mb-3">Emergency Contact</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Maria Rivera"
                      value={formFields.emergencyName}
                      onChange={(e) =>
                        setFormFields({ ...formFields, emergencyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Spouse / Sibling"
                      value={formFields.emergencyRelationship}
                      onChange={(e) =>
                        setFormFields({ ...formFields, emergencyRelationship: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Emergency Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1-555-0999"
                      value={formFields.emergencyPhone}
                      onChange={(e) =>
                        setFormFields({ ...formFields, emergencyPhone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-semibold"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
