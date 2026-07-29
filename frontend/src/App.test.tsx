import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ChatHub title', () => {
  render(<App />);
  const titleElement = screen.getByText(/ChatHub/i);
  expect(titleElement).toBeInTheDocument();
});
