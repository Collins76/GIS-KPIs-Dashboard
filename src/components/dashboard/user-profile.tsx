
"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User, LogOut, Camera, UserCircle, LogIn, ChevronDown } from 'lucide-react';
import type { User as UserType, Role } from '@/lib/types';
import { roles, businessUnits } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFirebase } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { UserContext } from '@/context/user-context';
import { addUserProfileUpdateActivity, addUserSignOutActivity } from '@/lib/firestore';


function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="1em"
        height="1em"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025A20.02 20.02 0 0 0 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303c-.792 2.443-2.212 4.482-4.123 5.962l6.19 5.238C42.012 36.425 44 30.8 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }

export default function UserProfile() {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const { toast } = useToast();

  const handleEditProfile = () => {
    if (user) {
        setEditedUser(user);
        setPreviewAvatar(user.avatar);
        setProfileModalOpen(true);
    }
  };
  
  const handleSaveChanges = () => {
    if (editedUser) {
        const finalUser = {...editedUser, avatar: previewAvatar || editedUser.avatar};
        setUser(finalUser);
        addUserProfileUpdateActivity(finalUser);
        setProfileModalOpen(false);
        toast({ title: "Profile updated successfully!" });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogout = async () => {
    const { auth } = getFirebase();
    if (!auth || !user) {
        toast({ title: "Logout Failed", description: "Firebase not initialized or user not found.", variant: "destructive" });
        return;
    }
    try {
        const signInTime = localStorage.getItem('gis-signin-time');
        if (signInTime) {
            const duration = (new Date().getTime() - new Date(signInTime).getTime()) / (1000 * 60); // minutes
            await addUserSignOutActivity(user, duration);
            localStorage.removeItem('gis-signin-time');
        }

        await signOut(auth);
        setUser(null);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        // Force a hard navigation to the login page to reset all application state.
        window.location.href = '/login';
    } catch (error) {
        console.error("Logout error:", error);
        toast({ title: "Logout Failed", description: "Something went wrong during logout.", variant: "destructive" });
    }
  }

  if (!user) {
    return (
        <Button onClick={() => router.push('/login')} className="glow-button !bg-blue-600 hover:!bg-blue-700">
            <GoogleIcon className="mr-2" />
            Sign in with Google
        </Button>
    )
  }

  return (
    <>
    <div className="flex items-center gap-3">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback><UserCircle/></AvatarFallback>
                </Avatar>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glow-container" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEditProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <div className="text-xs text-gray-400">{user.role}</div>
        </div>
    </div>
      {editedUser && (
        <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={previewAvatar || ''} alt={editedUser.name} />
                    <AvatarFallback><UserCircle className="h-12 w-12" /></AvatarFallback>
                  </Avatar>
                  <Label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                  </Label>
                  <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editedUser.name} onChange={(e) => setEditedUser({...editedUser, name: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={editedUser.role} onValuechange={(value) => setEditedUser({...editedUser, role: value as Role})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Select value={editedUser.location} onValuechange={(value) => setEditedUser({...editedUser, location: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessUnits.map(bu => <SelectItem key={bu.id} value={bu.name}>{bu.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveChanges}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
