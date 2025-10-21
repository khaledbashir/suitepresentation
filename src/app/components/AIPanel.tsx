'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../services/anythingllm';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onGenerateCode: (code: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hasCode?: boolean;
  error?: string;
}

const AIPanel = ({ isOpen, onClose, selectedText, onGenerateCode }: AIPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string>('');

  useEffect(() => {
    const validateEnvVariables = () => {
      const missingVars = [];
      const baseUrl = process.env.NEXT_PUBLIC_ANYTHINGLLM_BASE_URL?.trim() || '';
      const workspaceSlug = process.env.NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG?.trim() || '';
      // Note: ANYTHINGLLM_API_KEY is server-side only, not available in browser

      if (!baseUrl) missingVars.push('NEXT_PUBLIC_ANYTHINGLLM_BASE_URL');
      if (!workspaceSlug) missingVars.push('NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG');
      // Don't check API key in browser - it's server-side only

      if (missingVars.length > 0) {
        console.warn('[AIPanel] Missing public environment variables:', missingVars);
        setError(`Missing configuration: ${missingVars.join(', ')}`);
        return null;
      }

      try {
        new URL(baseUrl);
      } catch {
        console.error('[AIPanel] Invalid baseUrl format');
        setError('Invalid AnythingLLM base URL configuration');
        return null;
      }

      return { baseUrl, workspaceSlug };
    };

    const envVars = validateEnvVariables();
    if (envVars) {
      setIsConfigured(true);
      console.log('[AIPanel] Successfully configured with AnythingLLM');
    }

    conversationIdRef.current = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  useEffect(() => {
    if (selectedText && isOpen) {
      setInput(`Explain this: "${selectedText}"`);
    }
  }, [selectedText, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isConfigured) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const conversationMessages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear responses. Generate well-formatted HTML/CSS/JS when requested.',
        },
        ...messages
          .filter(m => !m.error)
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        {
          role: 'user',
          content: userInput,
        },
      ];

      // Call the API route instead of using the client directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages,
          metadata: {
            userId: 'browser',
            conversationId: conversationIdRef.current,
            requestId: `req-${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.content;
      const aiMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        hasCode: assistantContent.includes('```html') || assistantContent.includes('<html'),
      };
      setMessages(prev => [...prev, aiMessage]);

      const codeMatch = assistantContent.match(/```html\n?([\s\S]*?)\n?```/);
      if (codeMatch && codeMatch[1]) {
        setTimeout(() => onGenerateCode(`<!DOCTYPE html>\n${codeMatch[1]}`), 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error occurred';
      console.error('[AIPanel]:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error processing request',
        error: errorMessage,
      }]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
      <div className="ai-panel-header">
        <span>✨ AI Assistant {isConfigured ? '🟢' : '🔴'}</span>
        <button className="close-panel" onClick={onClose}>×</button>
      </div>
      
      {error && <div className="ai-error-banner">⚠️ {error}</div>}

      <div className="ai-messages">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">🤖</div>
            <h3>AI Assistant Ready</h3>
            <p>{isConfigured ? 'Connected' : 'Not configured'}</p>
            <div className="ai-suggestions">
              <button onClick={() => setInput('Summarize')}>📝 Summarize</button>
              <button onClick={() => setInput('Improve the writing')}>✍️ Improve</button>
              <button onClick={() => setInput('Explain')}>💡 Explain</button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-message-icon">{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div className="ai-message-content">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message assistant">
                <div className="ai-message-icon">🤖</div>
                <div className="ai-typing"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="ai-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI... (Enter to send)"
          className="ai-input"
          disabled={isLoading || !isConfigured}
          rows={3}
        />
        <div className="ai-input-actions">
          <button 
            className="ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isConfigured}
          >
            {isLoading ? '⏳' : '🚀'} Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
