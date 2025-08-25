import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard/results">Results</NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <section className="dashboard-content">
        <Outlet />
      </section>
    </div>
  );
};


