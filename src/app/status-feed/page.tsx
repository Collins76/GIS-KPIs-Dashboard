
"use client";

import { useState, useEffect } from 'react';
import withAuth from '@/components/auth/with-auth';
import { getStatusPosts } from '@/lib/realtimedb';
import type { StatusPost } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle } from 'lucide-react';

function StatusFeedPage() {
    const [posts, setPosts] = useState<StatusPost[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const fetchedPosts = await getStatusPosts();
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Failed to fetch status posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-orbitron text-white">Status Feed</h1>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/')} variant="outline" className="glow-button !bg-gray-700 hover:!bg-gray-600">
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                    </Button>
                     <Button onClick={fetchPosts} disabled={loading} className="glow-button">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Feed
                    </Button>
                </div>
            </header>
            
            <main className="max-w-2xl mx-auto space-y-6">
                {loading ? (
                     <div className="flex justify-center items-center h-64">
                        <RefreshCw className="w-12 h-12 animate-spin text-yellow-400" />
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <Card key={post.id} className="glow-container">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={post.avatar} alt={post.username} />
                                    <AvatarFallback><UserCircle/></AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-white">{post.username}</p>
                                    <p className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300 whitespace-pre-wrap">{post.status}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-16">
                        <h2 className="text-2xl font-bold">No statuses yet.</h2>
                        <p>Be the first to post an update from the dashboard!</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default withAuth(StatusFeedPage);
