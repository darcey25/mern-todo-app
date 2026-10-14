import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// The todo list loads from the API on mount; keep that inside the test.
vi.mock('axios', () => ({
  default: { get: () => Promise.resolve({ data: [] }) },
}));

it('renders the navigation', () => {
  render(<App />);
  expect(screen.getByText('MERN-Stack Todo App')).toBeTruthy();
  expect(screen.getByText('Create Todo')).toBeTruthy();
});
