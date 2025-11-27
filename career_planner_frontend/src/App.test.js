import { render, screen } from '@testing-library/react';
import App from './App';

// Basic smoke test that renders without crashing.
test('renders login button or dashboard shell', () => {
  render(<App />);
  const maybeDashboard = screen.queryByText(/Dashboard/i);
  // In unauthenticated mode, login page is visible
  expect(maybeDashboard || screen.getByText(/Sign In/i)).toBeTruthy();
});
