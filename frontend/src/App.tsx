import { useEffect, useState } from 'react';

type ChatResponse = {
  status: string;
  received: {
    sender: string;
    text: string;
  };
  info: string;
};

function App() {
  const [message, setMessage] = useState('Loading...');
  const [input, setInput] = useState('');
  const [sendStatus, setSendStatus] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Backend unavailable'));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) {
      setSendStatus('Please enter a message.');
      return;
    }

    setSendStatus('Sending...');

    try {
      const response = await fetch('http://localhost:8000/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'web', text: input }),
      });
      const data = (await response.json()) as ChatResponse;
      setResponse(data);
      setSendStatus('Message sent successfully');
      setInput('');
    } catch {
      setSendStatus('Failed to send message');
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>ChatHub</h1>
      <p>Welcome to your real-time chat platform foundation.</p>
      <p>Backend status: {message}</p>

      <div style={{ marginTop: '1.5rem' }}>
        <label htmlFor="chat-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Send a test chat message:
        </label>
        <div>
          <input
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message"
            style={{ width: '60%', padding: '0.5rem' }}
          />
          <button
            type="button"
            onClick={sendMessage}
            style={{ marginLeft: '0.75rem', padding: '0.55rem 1rem' }}
          >
            Send
          </button>
        </div>
        <p style={{ marginTop: '0.75rem' }}>{sendStatus}</p>
        {response ? (
          <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '0.75rem', borderRadius: '6px' }}>
            <strong>Response:</strong>
            <p>{response.info}</p>
            <pre style={{ margin: 0 }}>{JSON.stringify(response.received, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;
