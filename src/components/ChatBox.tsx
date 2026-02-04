'use client';

import { useState, useRef } from 'react';
import { Mic, Send, Loader2, Maximize2, X, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { chat } from '@/lib/ai';
import { createEntry } from '@/lib/supabase';
import { Entry } from '@/types';

interface ChatBoxProps {
  entries?: Entry[];
  onEntryCreated?: () => void;
  compact?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recorded?: boolean;
}

export function ChatBox({ entries = [], onEntryCreated, compact = false }: ChatBoxProps) {
  const { language } = useI18n();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    setIsProcessing(true);
    try {
      const response = await chat(userMessage, language, entries);

      // Create multiple entries if needed
      if (response.entries && response.entries.length > 0) {
        for (const entry of response.entries) {
          await createEntry(user.id, entry.type, entry.content, entry.parsed_data);
        }
        onEntryCreated?.();
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        recorded: response.entries.length > 0
      }]);
    } catch (error) {
      console.error('Failed to process:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'zh' ? '抱歉，出了点问题' : 'Sorry, something went wrong'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'zh' ? '您的浏览器不支持语音识别' : 'Speech recognition is not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: { results: { transcript: string; isFinal?: boolean }[][]; resultIndex: number }) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0];
        if (event.results[i] && (event.results[i] as unknown as { isFinal: boolean }).isFinal) {
          finalTranscript += result.transcript;
        } else {
          interim += result.transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      recognitionRef.current = null;
      if (event.error === 'not-allowed') {
        alert(language === 'zh' ? '请允许麦克风权限' : 'Please allow microphone access');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // 全屏模式
  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-zinc-50 z-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-zinc-100 px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 -ml-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">SimpliDay</h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-zinc-400 mt-20">
              <p>{language === 'zh' ? '跟我聊聊你的一天' : 'Tell me about your day'}</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-100 text-zinc-900'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                {msg.recorded && (
                  <p className="text-xs mt-2 opacity-60">
                    {language === 'zh' ? '已记录' : 'Recorded'}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="px-4 py-3 bg-white border border-zinc-100 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-zinc-100 p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={language === 'zh' ? '输入消息...' : 'Type a message...'}
              className="flex-1 px-4 py-3 bg-zinc-100 rounded-full text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              disabled={isProcessing}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="p-3 bg-zinc-900 text-white rounded-full disabled:opacity-40 transition-opacity"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compact 模式（首页）
  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      {/* 聊天记录区域 */}
      {messages.length > 0 && (
        <div className="max-h-48 overflow-y-auto p-3 space-y-2 border-b border-zinc-50">
          {messages.slice(-4).map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="px-3 py-2 bg-zinc-100 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-3 flex items-center gap-2">
        <button
          onClick={toggleRecording}
          className={`p-2 rounded-full transition-colors ${
            isRecording
              ? 'bg-red-500 text-white'
              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={language === 'zh' ? '跟我聊聊...' : 'Chat with me...'}
          className="flex-1 px-3 py-2 bg-zinc-50 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          disabled={isProcessing}
        />
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className="p-2 bg-zinc-900 text-white rounded-lg disabled:opacity-40 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
