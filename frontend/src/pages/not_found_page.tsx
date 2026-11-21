import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <section className="status-page">
    <h1>This page isn't on the shelf</h1>
    <p>The address may be mistyped, or the book was moved.</p>
    <div className="status-page__actions">
      <Link to="/" className="btn btn--primary">Back to Discover</Link>
      <Link to="/shelf" className="btn">Open My Shelf</Link>
    </div>
  </section>
);
