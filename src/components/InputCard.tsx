'use client';

import { useState } from 'react';
import { Mic, MicOff, Send, Loader2, Bot } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { chat } from '@/lib/ai';
import { createEntry } from '@/lib/supabase';
import { Entry } from '@/types';

interface InputCardProps {
  onEntryCreated?: () => void;
  entries?: Entry[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recorded?: boolean;
}

export function InputCard({ onEntryCreated, entries = [] }: InputCardProps) {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');

    // 添加用户消息
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

      // 添加 AI 回复
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        recorded: response.entries.length > 0
      }]);

    } catch (error) {
      console.error('Failed to process:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'zh' ? '抱歉，出了点问题。请再试一次。' : 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: { results: { transcript: string }[][] }) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + ' ' + transcript);
        };

        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);

        recognition.start();
        setIsRecording(true);
      } else {
        alert('Speech recognition not supported in this browser');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* 聊天记录 */}
      {messages.length > 0 && (
        <div className="max-h-80 overflow-y-auto p-4 space-y-3 border-b border-zinc-100 dark:border-zinc-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                }`}
              >
                <div className="text-[15px] leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>
                {msg.recorded && (
                  <p className="text-xs mt-2 opacity-60">
                    ✓ {language === 'zh' ? '已记录' : 'Recorded'}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="px-4 py-2 rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={language === 'zh' ? '跟我聊聊吧...健身、饮食、心情都可以' : 'Chat with me... fitness, diet, mood, anything'}
          className="w-full h-20 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-0 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm"
          disabled={isProcessing}
        />
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={toggleRecording}
            className={`p-2.5 rounded-full transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
            disabled={isProcessing}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-full font-medium transition-colors text-sm"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {language === 'zh' ? '发送' : 'Send'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
