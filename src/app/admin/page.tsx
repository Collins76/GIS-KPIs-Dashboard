
"use client";

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/auth/with-auth';
import { getActivities, updateActivity, deleteActivity, testDatabaseConnection } from '@/lib/realtimedb';
import type { ActivityLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Edit, RefreshCw, Database, Home, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import { UserContext } from '@/context/user-context';

function AdminPage() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: userLoading } = useContext(UserContext);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const fetchedActivities = await getActivities();
            setActivities(fetchedActivities);
        } catch (error: any) {
            console.error("Failed to fetch activities:", error);
            toast({
                title: "Error Loading Data",
                description: error.message || "Could not load database records. Please check your internet connection and Realtime Database security rules.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Wait for the user context to be done loading and confirm there's a user.
        if (!userLoading) {
            fetchActivities();
        }
    }, [userLoading]);

    const handleDelete = async (id: string) => {
        try {
            await deleteActivity(id);
            toast({ title: "Success", description: "Record deleted successfully." });
            fetchActivities(); // Refresh the list after deletion
        } catch (error) {
            console.error("Failed to delete activity:", error);
            toast({ title: "Error", description: "Failed to delete record.", variant: "destructive" });
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
            const parsedData = JSON.parse(editedContent);
            
            await updateActivity(selectedActivity.id, parsedData);
            toast({ title: "Success", description: "Record updated successfully." });
            setEditModalOpen(false);
            fetchActivities();
        } catch (error) {
            console.error("Failed to update activity:", error);
            toast({ title: "Update Error", description: "Failed to update record. Please ensure the JSON is valid and you have permission.", variant: "destructive" });
        }
    };


    const handleTestConnection = async () => {
        await testDatabaseConnection();
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Database className="w-8 h-8 text-yellow-400" />
                    <div>
                        <h1 className="text-3xl font-bold font-orbitron text-white">Admin Panel</h1>
                        <p className="text-gray-400">Database Management for 'activities'</p>
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
                    <Button onClick={handleTestConnection} className="glow-button !bg-green-600 hover:!bg-green-700">
                        <Wifi className="w-4 h-4 mr-2"/>
                        Test Connection
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
                                        <TableCell>{activity.timestamp ? format(new Date(activity.timestamp), 'PPpp') : 'N/A'}</TableCell>
                                        <TableCell>{activity.activityType}</TableCell>
                                        <TableCell>{activity.user?.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            <pre className="text-xs bg-gray-900 p-2 rounded-md max-w-sm overflow-x-auto">
                                                {JSON.stringify(activity, (key, value) => ['id', 'timestamp', 'user', 'activityType'].includes(key) ? undefined : value, 2)}
                                            </pre>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(activity)} title="Edit" className="group">
                                                    <Edit className="w-4 h-4 text-blue-400 transition-transform group-hover:scale-125 group-hover:animate-pulse"/>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <Button variant="ghost" size="icon" title="Delete" className="group">
                                                            <Trash className="w-4 h-4 text-red-400 transition-transform group-hover:scale-125 group-hover:animate-pulse"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="glow-modal">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the record from the database.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(activity.id)} className="bg-red-600 hover:bg-red-700">
                                                                Yes, delete record
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
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
