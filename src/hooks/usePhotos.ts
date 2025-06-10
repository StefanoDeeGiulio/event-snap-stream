
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Photo } from '@/types/Photo';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      if (data) {
        const photosWithUrls = await Promise.all(
          data.map(async (photo) => {
            const { data: urlData } = supabase.storage
              .from('event-photos')
              .getPublicUrl(photo.file_path);

            return {
              id: photo.id,
              url: urlData.publicUrl,
              timestamp: new Date(photo.uploaded_at).getTime(),
              filename: photo.filename,
              size: photo.file_size
            };
          })
        );
        setPhotos(photosWithUrls);
      }
    } catch (error) {
      console.error('Error in fetchPhotos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<Photo | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading file:', fileName, file.type, file.size);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Insert photo metadata into database
      const { data: photoData, error: insertError } = await supabase
        .from('photos')
        .insert({
          filename: file.name,
          file_path: filePath,
          file_size: file.size
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-photos')
        .getPublicUrl(filePath);

      const newPhoto: Photo = {
        id: photoData.id,
        url: urlData.publicUrl,
        timestamp: new Date(photoData.uploaded_at).getTime(),
        filename: photoData.filename,
        size: photoData.file_size
      };

      console.log('Photo uploaded successfully:', newPhoto.id);
      return newPhoto;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      // Get photo data to get file path
      const { data: photoData, error: fetchError } = await supabase
        .from('photos')
        .select('file_path')
        .eq('id', photoId)
        .single();

      if (fetchError) {
        console.error('Error fetching photo for deletion:', fetchError);
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('event-photos')
        .remove([photoData.file_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return;
      }

      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error in deletePhoto:', error);
    }
  };

  const clearAllPhotos = async () => {
    try {
      // Get all photos to delete their files
      const { data: allPhotos } = await supabase
        .from('photos')
        .select('file_path');

      if (allPhotos && allPhotos.length > 0) {
        // Delete all files from storage
        const filePaths = allPhotos.map(photo => photo.file_path);
        const { error: storageError } = await supabase.storage
          .from('event-photos')
          .remove(filePaths);

        if (storageError) {
          console.error('Error deleting files from storage:', storageError);
        }
      }

      // Delete all records from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (dbError) {
        console.error('Error clearing database:', dbError);
        return;
      }

      setPhotos([]);
    } catch (error) {
      console.error('Error in clearAllPhotos:', error);
    }
  };

  useEffect(() => {
    fetchPhotos();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos'
        },
        () => {
          console.log('Real-time update detected, refetching photos');
          fetchPhotos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    photos,
    isLoading,
    uploadPhoto,
    deletePhoto,
    clearAllPhotos,
    refetch: fetchPhotos
  };
};
