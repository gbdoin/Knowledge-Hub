"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { uploadFile, chat } from '@/lib/api';
import { Send, Upload, FileText, ArrowLeft, Bot, User } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function HubChat() {
    const params = useParams();
    const hubName = params.name as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const data = await chat(hubName, userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error("Chat failed", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadFile(hubName, file);
            alert("File uploaded and processed successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                            <Bot className="w-5 h-5" />
                        </span>
                        {hubName}
                    </h1>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.txt,.csv,.xlsx"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Processing...' : 'Upload Document'}
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                        <Bot className="w-16 h-16 text-gray-700" />
                        <p className="text-lg">Start chatting with your documents in <span className="font-bold text-gray-400">{hubName}</span></p>
                        <p className="text-sm">Upload a PDF, Word doc, or Text file to get started.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            "flex w-full",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={clsx(
                                "max-w-[80%] rounded-2xl p-4 shadow-sm",
                                msg.role === 'user'
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase tracking-wider font-bold">
                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                {msg.role}
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-gray-800 text-gray-100 border border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                            <Bot className="w-4 h-4 animate-pulse" />
                            <span className="text-sm text-gray-400 animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask something about your documents..."
                        className="w-full bg-gray-900 text-white pl-6 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 shadow-inner transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
