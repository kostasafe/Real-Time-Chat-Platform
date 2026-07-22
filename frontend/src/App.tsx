import { useEffect, useRef, useState } from 'react';

type ChatMessage = {
  id: number;
  sender: string;
  text: string;
};

type IncomingMessage = {
  sender: string;
  text: string;
};

function App() {
  const [room, setRoom] = useState('general');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/chat/ws/${room}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus(`Connected to room: ${room}`);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as IncomingMessage;
        if (payload.text) {
          setMessages((current) => [
            ...current,
            {
              id: Date.now() + Math.random(),
              sender: payload.sender || 'system',
              text: payload.text,
            },
          ]);
        }
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + Math.random(),
            sender: 'system',
            text: event.data,
          },
        ]);
      }
    };

    socket.onerror = () => {
      setStatus('Connection error');
    };

    socket.onclose = () => {
      setStatus(`Disconnected from room: ${room}`);
    };

    return () => {
      socket.close();
    };
  }, [room]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setStatus('Type a message before sending.');
      return;
    }

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ sender: 'me', text: trimmed }));
      setInput('');
      setStatus(`Sent to room: ${room}`);
    } else {
      setStatus('Socket is not connected yet.');
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1>ChatHub</h1>
      <p>Welcome to your real-time chat platform foundation.</p>

      <div style={{ marginTop: '1.5rem' }}>
        <label htmlFor="room-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Room name
        </label>
        <input
          id="room-input"
          value={room}
          onChange={(event) => setRoom(event.target.value || 'general')}
          placeholder="Enter a room"
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
        />

        <div style={{ marginBottom: '0.75rem' }}>
          <strong>Status:</strong> {status}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message"
            style={{ flex: 1, padding: '0.6rem' }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
              }
            }}
          />
          <button type="button" onClick={sendMessage} style={{ padding: '0.6rem 1rem' }}>
            Send
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', minHeight: '220px' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#666' }}>No messages yet. Start the conversation.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} style={{ marginBottom: '0.75rem' }}>
                <strong>{message.sender}:</strong> {message.text}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
