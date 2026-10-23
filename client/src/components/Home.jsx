import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  CalendarCheck,
  GraduationCap,
  UsersRound,
} from 'lucide-react';

const features = [
  {
    title: 'Employee Management',
    description: 'Manage employee records, roles, and information efficiently.',
    icon: UsersRound,
    className: 'feature-icon-blue',
  },
  {
    title: 'Attendance & Leave',
    description: 'Track attendance and handle leave approvals easily.',
    icon: CalendarCheck,
    className: 'feature-icon-green',
  },
  {
    title: 'HR & Manager Tools',
    description: 'Handle team announcements, performance, and training modules.',
    icon: BriefcaseBusiness,
    className: 'feature-icon-yellow',
  },
  {
    title: 'Employee Growth',
    description: 'Monitor performance and assign development trainings.',
    icon: GraduationCap,
    className: 'feature-icon-pink',
  },
];

const Home = () => (
  <div className="landing-page">
    <header className="landing-header">
      <Link className="landing-brand" to="/">
        HRM Portal
      </Link>
      <Link className="landing-login-button" to="/login">
        Login / Register
      </Link>
    </header>

    <main>
      <section className="landing-hero">
        <h1>
          Empower Your Workforce with <span>HRM Portal</span>
        </h1>
        <p>
          A smart Human Resource Management platform designed to simplify attendance tracking,
          <br className="desktop-break" />
          leave management, employee records, and communication across teams.
        </p>
        <Link className="landing-cta" to="/login">
          Get Started
        </Link>
      </section>

      <section className="feature-grid" aria-label="HRM Portal features">
        {features.map(({ title, description, icon: Icon, className }) => (
          <article className="feature-card" key={title}>
            <Icon className={`feature-icon ${className}`} size={20} strokeWidth={1.8} />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>

    <footer className="landing-footer">
      © 2025 HRM Portal — Empowering Teams, Simplifying Workflows.
    </footer>
  </div>
);

export default Home;