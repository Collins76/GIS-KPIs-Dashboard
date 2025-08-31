"use client";

import React, { useState, useEffect } from 'react';
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
import { User, LogOut, Camera, UserCircle } from 'lucide-react';
import type { User as UserType, Role } from '@/lib/types';
import { roles, businessUnits } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_USER: UserType = {
  name: "GIS Professional",
  email: "gis.pro@ikejaelectric.com",
  role: "GIS Coordinator",
  location: "CHQ",
  avatar: `https://i.pravatar.cc/150?u=gis.pro@ikejaelectric.com`,
};

export default function UserProfile() {
  const [user, setUser] = useState<UserType>(DEFAULT_USER);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType>(DEFAULT_USER);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('gis-user-profile');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleEditProfile = () => {
    setEditedUser(user);
    setPreviewAvatar(user.avatar);
    setProfileModalOpen(true);
  };
  
  const handleSaveChanges = () => {
    const finalUser = {...editedUser, avatar: previewAvatar || editedUser.avatar};
    setUser(finalUser);
    localStorage.setItem('gis-user-profile', JSON.stringify(finalUser));
    setProfileModalOpen(false);
    toast({ title: "Profile updated successfully!" });
    window.location.reload();
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback><UserCircle/></AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
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
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
               <Select value={editedUser.role} onValueChange={(value) => setEditedUser({...editedUser, role: value as Role})}>
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
               <Select value={editedUser.location} onValueChange={(value) => setEditedUser({...editedUser, location: value})}>
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
    </>
  );
}
