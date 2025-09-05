
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/auth/with-auth';
import { getActivities, updateActivity, deleteActivity } from '@/lib/firestore';
import type { ActivityLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Edit, RefreshCw, Database, Home } from 'lucide-react';
import { format } from 'date-fns';

function AdminPage() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const fetchedActivities = await getActivities();
            setActivities(fetchedActivities);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
            toast({
                title: "Error",
                description: "Failed to load database records.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                await deleteActivity(id);
                toast({ title: "Success", description: "Record deleted successfully." });
                fetchActivities();
            } catch (error) {
                console.error("Failed to delete activity:", error);
                toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
            }
        }
    };
    
    const openEditModal = (activity: ActivityLog) => {
        setSelectedActivity(activity);
        setEditedContent(JSON.stringify(activity, null, 2));
        setEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedActivity) return;
        try {
            const updatedData = JSON.parse(editedContent);
            delete updatedData.id; // Don't try to update the ID
            await updateActivity(selectedActivity.id, updatedData);
            toast({ title: "Success", description: "Record updated successfully." });
            setEditModalOpen(false);
            fetchActivities();
        } catch (error) {
            console.error("Failed to update activity:", error);
            toast({ title: "Update Error", description: "Failed to update record. Check if JSON is valid.", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Database className="w-8 h-8 text-yellow-400" />
                    <div>
                        <h1 className="text-3xl font-bold font-orbitron text-white">Admin Panel</h1>
                        <p className="text-gray-400">Database Management for 'gis-team15'</p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={() => router.push('/')} variant="outline" className="glow-button !bg-gray-700 hover:!bg-gray-600">
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                    </Button>
                    <Button onClick={fetchActivities} disabled={loading} className="glow-button">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                 </div>
            </header>

            <main className="glow-container p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <RefreshCw className="w-12 h-12 animate-spin text-yellow-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Activity Type</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activities.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell>{format(new Date(activity.timestamp), 'PPpp')}</TableCell>
                                        <TableCell>{activity.activityType}</TableCell>
                                        <TableCell>{activity.user.email}</TableCell>
                                        <TableCell>
                                            <pre className="text-xs bg-gray-900 p-2 rounded-md max-w-sm overflow-x-auto">
                                                {JSON.stringify(activity, (key, value) => key === 'id' || key === 'timestamp' || key === 'user' || key === 'activityType' ? undefined : value, 2)}
                                            </pre>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(activity)} title="Edit">
                                                    <Edit className="w-4 h-4 text-blue-400"/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(activity.id)} title="Delete">
                                                    <Trash className="w-4 h-4 text-red-400"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
            
            {selectedActivity && (
                 <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="glow-modal sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Record: {selectedActivity.id}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="json-content">Record Content (JSON)</Label>
                            <Textarea
                                id="json-content"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="glow-input mt-2 h-96 font-mono text-xs"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button className="glow-button" onClick={handleUpdate}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default withAuth(AdminPage);
