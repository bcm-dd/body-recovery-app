'use client';

import { useState } from 'react';

export default function Home() {
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testChat = async () => {
    if (!chatInput.trim()) return;

    setIsLoading(true);
    setChatResponse('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token', // Would be real token in production
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: chatInput }],
          context: {
            currentWorkout: 'Upper Body',
            readinessScore: 75,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setChatResponse(`Error: ${error.error?.message || 'Request failed'}`);
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setChatResponse(result);
      }
    } catch (error) {
      setChatResponse(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Movement & Recovery Companion
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          AI-driven movement coaching with clinical context
        </p>
      </header>

      {/* Status Section */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          System Status
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="status-badge status-online">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            API Online
          </div>
          <div className="status-badge status-online">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            AI Gateway Connected
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          API Endpoints
        </h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <EndpointRow
            method="POST"
            path="/api/health/sync"
            description="Sync health data from mobile device"
          />
          <EndpointRow
            method="POST"
            path="/api/workouts/generate"
            description="Generate AI-powered workout with constraints"
          />
          <EndpointRow
            method="POST"
            path="/api/ai/chat"
            description="Streaming conversational AI for workout adjustments"
          />
        </div>
      </div>

      {/* Chat Test */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Test AI Chat
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && testChat()}
            placeholder="Try: 'My shoulder hurts during bench press'"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '1rem',
            }}
          />
          <button
            className="btn btn-primary"
            onClick={testChat}
            disabled={isLoading}
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
        {chatResponse && (
          <div style={{
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}>
            {chatResponse}
          </div>
        )}
      </div>

      {/* Mobile App */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Mobile App
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          The full experience is available on the React Native mobile app for iOS and Android.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary">
            📱 iOS App
          </button>
          <button className="btn btn-secondary">
            🤖 Android App
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
      }}>
        Movement & Recovery Companion • Powered by Claude 4.5
      </footer>
    </div>
  );
}

function EndpointRow({ method, path, description }: {
  method: string;
  path: string;
  description: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        background: '#DBEAFE',
        color: '#1E40AF',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        fontFamily: 'monospace',
      }}>
        {method}
      </span>
      <code style={{
        flex: 1,
        fontFamily: 'monospace',
        fontSize: '0.875rem',
      }}>
        {path}
      </code>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {description}
      </span>
    </div>
  );
}
