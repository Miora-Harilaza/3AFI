import { supabase } from '@/lib/supabase';

export const uploadService = {
  // Upload d'un avatar
  uploadAvatar: async (file: File, userId: string): Promise<string | null> => {
    try {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP.');
      }

      // Vérifier la taille (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Fichier trop volumineux. Maximum 5MB.');
      }

      // Créer un nom de fichier unique (sans répéter 'avatars')
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = fileName; // Ne pas mettre 'avatars/' ici car le bucket est déjà 'avatars'

      console.log('Uploading to path:', filePath); // Debug

      // Upload vers Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars') // Nom du bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl); // Debug
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  // Supprimer un avatar
  deleteAvatar: async (avatarPath: string): Promise<boolean> => {
    try {
      if (!avatarPath) return true;
      
      // Extraire le nom du fichier de l'URL complète si nécessaire
      let path = avatarPath;
      if (avatarPath.includes('/avatars/')) {
        path = avatarPath.split('/avatars/')[1];
      } else if (avatarPath.includes('avatars/')) {
        path = avatarPath.split('avatars/')[1];
      }
      
      console.log('Deleting avatar at path:', path); // Debug

      const { error } = await supabase.storage
        .from('avatars')
        .remove([path]);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  },

  // Mettre à jour l'avatar
  updateAvatar: async (file: File, userId: string, oldAvatarPath?: string): Promise<string | null> => {
    try {
      // Supprimer l'ancien avatar si existe
      if (oldAvatarPath) {
        await uploadService.deleteAvatar(oldAvatarPath);
      }

      // Upload du nouvel avatar
      return await uploadService.uploadAvatar(file, userId);
    } catch (error) {
      console.error('Error updating avatar:', error);
      return null;
    }
  }
};