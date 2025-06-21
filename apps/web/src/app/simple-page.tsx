'use client';

import { useState, useRef } from 'react';

export default function SimplePage() {
  const [childName, setChildName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (file: File) => {
    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoSelect(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoSelect(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!childName || !selectedPhoto) {
      alert('Please enter a name and upload a photo');
      return;
    }

    try {
      // Create a FormData object to upload the photo
      const formData = new FormData();
      formData.append('file', selectedPhoto);

      // Upload the photo
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo');
      }

      const { url: photoUrl } = await uploadResponse.json();

      // Create the storybook
      const storybookResponse = await fetch('/api/storybook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childName, childPhotoUrl: photoUrl }),
      });

      if (!storybookResponse.ok) {
        throw new Error('Failed to create storybook');
      }

      const storybook = await storybookResponse.json();
      
      alert(`Storybook created for ${childName}! This would normally redirect to the story viewer.`);
      console.log('Storybook created:', storybook);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create storybook. Please try again.');
    }
  };

  const isValid = childName.trim().length > 0 && selectedPhoto !== null;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #dbeafe, #fae8ff)',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            ✨ If I Were an Animal... ✨
          </h1>
          <p style={{ 
            fontSize: '1.125rem',
            color: '#6b7280'
          }}>
            Create a magical personalized storybook for your child
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Create Your Magical Storybook
          </h2>
          <p style={{ color: '#6b7280' }}>
            Upload a photo and enter a name to create a personalized adventure
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            Child's Name
          </label>
          <input
            type="text"
            placeholder="Enter the child's name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            Child's Photo
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {!photoPreview ? (
            <div 
              onClick={handleDropZoneClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>📸</div>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Drag & drop your child's photo here, or click to select
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Supports: JPG, PNG, WebP
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={photoPreview}
                alt="Child's photo preview"
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <button
                onClick={removePhoto}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            width: '100%',
            backgroundColor: isValid ? '#3b82f6' : '#9ca3af',
            color: 'white',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: isValid ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
        >
          ✨ Generate Storybook
        </button>
      </div>
    </div>
  );
}