import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Backend unavailable'));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>ChatHub</h1>
      <p>Welcome to your real-time chat platform foundation.</p>
      <p>Backend status: {message}</p>
    </main>
  );
}

export default App;
