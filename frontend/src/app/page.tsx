"use client";

import { useState, useEffect } from 'react';
import { getHubs, createHub } from '@/lib/api';
import Link from 'next/link';
import { Plus, MessageSquare, Database } from 'lucide-react';

export default function Home() {
    const [hubs, setHubs] = useState<string[]>([]);
    const [newHubName, setNewHubName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHubs();
    }, []);

    const fetchHubs = async () => {
        try {
            const data = await getHubs();
            setHubs(data);
        } catch (error) {
            console.error("Failed to fetch hubs", error);
        }
    };

    const handleCreateHub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHubName) return;
        setLoading(true);
        try {
            await createHub(newHubName);
            setNewHubName('');
            fetchHubs();
        } catch (error) {
            console.error("Failed to create hub", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                        Local Knowledge Hub
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Your private, local AI knowledge base. Index documents and chat securely.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Create Hub Section */}
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-blue-400" /> Create New Hub
                        </h2>
                        <form onSubmit={handleCreateHub} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Hub Name (e.g., 'FinanceDocs')"
                                value={newHubName}
                                onChange={(e) => setNewHubName(e.target.value)}
                                className="bg-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Hub'}
                            </button>
                        </form>
                    </div>

                    {/* Stats or Info (Placeholder) */}
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col justify-center items-center text-center">
                        <Database className="w-12 h-12 text-purple-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Local & Secure</h3>
                        <p className="text-gray-400">
                            All your data stays on your machine. Powered by Ollama and ChromaDB.
                        </p>
                    </div>
                </div>

                {/* Hubs List */}
                <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Your Knowledge Hubs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hubs.map((hub) => (
                        <Link href={`/hubs/${hub}`} key={hub}>
                            <div className="bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl hover:bg-gray-750 border border-gray-700 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-700 p-3 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <Database className="w-6 h-6 text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{hub}</h3>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Chat now
                                </p>
                            </div>
                        </Link>
                    ))}
                    {hubs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No hubs found. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
