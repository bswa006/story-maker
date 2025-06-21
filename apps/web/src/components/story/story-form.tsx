'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoUpload } from '@/components/upload/photo-upload';
import { Sparkles } from 'lucide-react';

interface StoryFormProps {
  onSubmit: (data: { childName: string; childPhoto: File }) => void;
}

export function StoryForm({ onSubmit }: StoryFormProps) {
  const [childName, setChildName] = useState('');
  const [childPhoto, setChildPhoto] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !childPhoto) return;

    setIsGenerating(true);
    try {
      await onSubmit({ childName, childPhoto });
    } finally {
      setIsGenerating(false);
    }
  };

  const isValid = childName.trim().length > 0 && childPhoto !== null;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Your Magical Storybook</CardTitle>
        <CardDescription>
          Upload a photo and enter a name to create a personalized adventure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="childName">Child's Name</Label>
            <Input
              id="childName"
              type="text"
              placeholder="Enter the child's name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label>Child's Photo</Label>
            <PhotoUpload onPhotoSelect={setChildPhoto} />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Creating Your Story...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Storybook
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}