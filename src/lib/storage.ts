import { supabase } from './supabase';

const BUCKET = 'event-images';

// ✅ Vérifier si le bucket est accessible (safe frontend)
export const checkStorage = async () => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 1 });

    if (error) {
      console.error("Storage non accessible:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erreur storage:", err);
    return false;
  }
};

// ✅ Upload image PRO
export const uploadImageToStorage = async (
  file: File
): Promise<{ url: string; path: string }> => {
  try {
    // ✔ validation
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Max 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExt}`;

    const filePath = `events/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("UPLOAD ERROR:", error);
      throw error;
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath, // 🔥 IMPORTANT (chemin complet)
    };
  } catch (error: any) {
    console.error("Erreur upload:", error);
    throw error;
  }
};

// ✅ Delete image PRO
export const deleteImageFromStorage = async (path: string) => {
  if (!path) return;

  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path]); // ✔ direct

    if (error) {
      console.error("Erreur suppression:", error.message);
    }
  } catch (err) {
    console.error("Erreur suppression:", err);
  }
};