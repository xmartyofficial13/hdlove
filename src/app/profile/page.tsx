"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit2 } from 'lucide-react';

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'Your Name';
    const storedImageUrl = localStorage.getItem('userImageUrl') || '';
    setName(storedName);
    setImageUrl(storedImageUrl);
    setTempName(storedName);
    setTempImageUrl(storedImageUrl);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setName(tempName);
    setImageUrl(tempImageUrl);
    localStorage.setItem('userName', tempName);
    localStorage.setItem('userImageUrl', tempImageUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setTempImageUrl(imageUrl);
    setIsEditing(false);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTempImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Profile</span>
            {!isEditing && (
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Edit2 className="h-5 w-5" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>View and edit your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={isEditing ? tempImageUrl : imageUrl} alt={name} />
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
               {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="image-upload" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
                       <Edit2 className="h-5 w-5" />
                    </Label>
                    <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                )}
            </div>

            {isEditing ? (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (or upload)</Label>
                  <Input
                    id="imageUrl"
                    value={tempImageUrl}
                    placeholder="Enter image URL or upload a file"
                    onChange={(e) => setTempImageUrl(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold">{name}</h2>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
