// File: web/src/pages/Assistant.tsx
import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User, Lightbulb, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { assistantAPI } from '../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  evidence?: Array<{ source: string; snippet: string }>;
}

const Assistant = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${user?.name}! I'm your Climate-Health AI Assistant. I can help you with questions about climate conditions, health risks, safety precautions, and eco-friendly lifestyle tips. What would you like to know?`,
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantAPI.chat({
        message: input,
        conversationId,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(response.data.timestamp),
        evidence: response.data.evidence,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationId(response.data.conversationId);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: `Starting a new conversation. How can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  };

  const suggestedQuestions = [
    'Is it safe to jog outside today?',
    'What precautions should I take for high air quality index?',
    'Tips for staying healthy during a heatwave?',
    'How can I reduce my carbon footprint?',
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col fade-in">
      {/* Header */}
      <div className="bg-gray-900 rounded-t-2xl border border-yellow-400/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">AI Health Assistant</h1>
              <p className="text-sm text-gray-400">Climate-smart health guidance</p>
            </div>
          </div>
          <button
            onClick={handleNewConversation}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-yellow-400/20 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-black border-x border-yellow-400/20 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex space-x-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-yellow-400'
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-black" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-900 border border-yellow-400/20 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {/* Evidence */}
                {message.evidence && message.evidence.length > 0 && (
                  <div className="space-y-2 ml-2">
                    {message.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs"
                      >
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-blue-300">{ev.source}</p>
                            <p className="text-blue-200 mt-1">{ev.snippet}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 px-2">
                  {format(new Date(message.timestamp), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-900 border border-yellow-400/20 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="bg-black border-x border-yellow-400/20 px-6 pb-4">
          <p className="text-sm text-gray-400 mb-3">Suggested questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-left text-sm bg-gray-900 border border-yellow-400/20 rounded-lg px-4 py-3 hover:bg-gray-800 hover:border-yellow-400/40 transition-all text-gray-300"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-gray-900 rounded-b-2xl border border-yellow-400/20 p-6">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about climate and health..."
            rows={1}
            className="flex-1 resize-none bg-black border border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-yellow-400 text-black px-6 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-yellow-400/40 shadow-md"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Assistant;