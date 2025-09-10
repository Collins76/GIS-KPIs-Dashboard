
"use client";

import { useState, useContext } from 'react';
import { UserContext } from '@/context/user-context';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addStatusPost } from '@/lib/realtimedb';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StatusUpdate() {
    const { user } = useContext(UserContext);
    const [statusText, setStatusText] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handlePostStatus = async () => {
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to post a status.",
                variant: "destructive",
            });
            return;
        }

        if (!statusText.trim()) {
            toast({
                title: "Empty Status",
                description: "Please write something before posting.",
                variant: "destructive",
            });
            return;
        }

        setIsPosting(true);
        try {
            await addStatusPost(user, statusText);
            toast({
                title: "Status Posted!",
                description: "Your status has been saved to the database.",
            });
            setStatusText('');
        } catch (error: any) {
            toast({
                title: "Error Posting Status",
                description: error.message || "An unknown error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsPosting(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="glow-container p-4 mb-6">
            <div className="flex items-start space-x-4">
                <Textarea
                    placeholder={`What's on your mind, ${user.name}?`}
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="glow-input flex-grow"
                    rows={2}
                    maxLength={280}
                />
                <div className="flex flex-col space-y-2">
                    <Button onClick={handlePostStatus} disabled={isPosting} className="glow-button h-auto">
                        {isPosting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                    <Button onClick={() => router.push('/status-feed')} variant="outline" className="glow-button !bg-blue-600 hover:!bg-blue-700 h-auto">
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <p className="text-xs text-right text-gray-400 mt-1 pr-28">
                {statusText.length} / 280
            </p>
        </div>
    );
}
