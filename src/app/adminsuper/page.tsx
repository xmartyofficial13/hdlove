
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function AdminSuperPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [newBaseUrl, setNewBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/admin/config');
        const data = await response.json();
        setBaseUrl(data.baseUrl);
        setNewBaseUrl(data.baseUrl);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch current configuration.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [toast]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ baseUrl: newBaseUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setBaseUrl(data.baseUrl);
        toast({
          title: 'Success',
          description: 'Base URL updated successfully.',
        });
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update configuration.',
      });
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Update the base URL for the scraper. This is a hidden page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
                <Label htmlFor="current-url">Current Base URL</Label>
                <p id="current-url" className="text-sm text-muted-foreground break-all">{isLoading ? 'Loading...' : baseUrl}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-url">New Base URL</Label>
              <Input
                id="new-url"
                type="text"
                value={newBaseUrl}
                onChange={(e) => setNewBaseUrl(e.target.value)}
                placeholder="https://new-domain.com"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Save New URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
