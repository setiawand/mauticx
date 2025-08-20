'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function ProfileViewPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSave = () => {
    // TODO: Implement profile update functionality
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className='flex w-full flex-col p-4'>
        <Card>
          <CardContent className='p-6'>
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col p-4 max-w-2xl mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center space-x-4'>
            <UserAvatarProfile
              user={user}
              className='h-20 w-20'
              showInfo={false}
            />
            <div>
              <h3 className='text-lg font-medium'>{user.name}</h3>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className='flex space-x-2'>
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant='outline' onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
