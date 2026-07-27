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

const API_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [room, setRoom] = useState('general');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Not connected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  // Connect to WebSocket when logged in and room changes
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const wsUrl = `${WS_URL}/chat/ws/${room}?token=${token}`;
    const socket = new WebSocket(wsUrl);
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

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Connection error');
    };

    socket.onclose = () => {
      setStatus(`Disconnected from room: ${room}`);
    };

    return () => {
      socket.close();
    };
  }, [isLoggedIn, token, room]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setAuthError(error.detail || 'Login failed');
        return;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('username', authUsername);
      setToken(data.access_token);
      setUsername(authUsername);
      setIsLoggedIn(true);
      setAuthPassword('');
    } catch (error) {
      setAuthError('Network error. Please try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          email: authEmail,
          password: authPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setAuthError(error.detail || 'Signup failed');
        return;
      }

      // Auto-login after signup
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
        }),
      });

      if (!loginResponse.ok) {
        setAuthError('Signup successful! Please login.');
        setAuthMode('login');
        return;
      }

      const loginData = await loginResponse.json();
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('username', authUsername);
      setToken(loginData.access_token);
      setUsername(authUsername);
      setIsLoggedIn(true);
      setAuthPassword('');
    } catch (error) {
      setAuthError('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    setIsLoggedIn(false);
    setMessages([]);
    socketRef.current?.close();
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setStatus('Type a message before sending.');
      return;
    }

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ sender: username, text: trimmed }));
      setInput('');
      setStatus(`Sent to room: ${room}`);
    } else {
      setStatus('Socket is not connected yet.');
    }
  };

  if (!isLoggedIn) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '400px', margin: '3rem auto' }}>
        <h1>ChatHub</h1>
        <p>Real-time chat platform</p>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setAuthMode('login')}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: authMode === 'login' ? '#007bff' : '#f0f0f0',
                color: authMode === 'login' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: authMode === 'signup' ? '#007bff' : '#f0f0f0',
                color: authMode === 'signup' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Enter username"
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            {authMode === 'signup' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Enter email"
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Enter password"
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
              />
            </div>

            {authError && (
              <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>ChatHub</h1>
          <p style={{ margin: '0' }}>Logged in as: <strong>{username}</strong></p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

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
