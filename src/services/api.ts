import { supabase } from '@/lib/supabase';

export const api = {
  membres: {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('membre')
          .select('*')
          .order('nom', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
      }
    },

    create: async (membreData: any, avatarFile?: File) => {
      try {
        console.log('Creating member with data:', membreData);
        console.log('Avatar file:', avatarFile);
        
        let avatar_url = null;
        let avatar_path = null;

        // Upload de l'avatar si fourni
        if (avatarFile && avatarFile instanceof File) {
          console.log('Uploading avatar file:', avatarFile.name);
          
          // Créer un nom de fichier unique
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          // Upload vers Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          console.log('Upload success:', uploadData);

          // Récupérer l'URL publique
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          avatar_url = publicUrl;
          avatar_path = filePath;
          
          console.log('Avatar URL:', avatar_url);
          console.log('Avatar path:', avatar_path);
        } else {
          console.log('No avatar file provided');
        }

        // Préparer les données d'insertion
        const insertData = {
          nom: membreData.nom,
          poste: membreData.poste || null,
          adresse: membreData.adresse || null,
          date_naissance: membreData.date_naissance || null,
          telephone: membreData.telephone || null,
          sexe: membreData.sexe || null,
          status: membreData.status || 'actif',
          avatar_url: avatar_url,
          avatar_path: avatar_path,
          created_at: new Date().toISOString()
        };

        console.log('Insert data:', insertData);

        // Création du membre
        const { data, error } = await supabase
          .from('membre')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }
        
        console.log('Member created:', data);
        return data;
      } catch (error) {
        console.error('Error creating member:', error);
        throw error;
      }
    },

    update: async (id: string, membreData: any, newAvatarFile?: File) => {
      try {
        console.log('Updating member:', id);
        console.log('New avatar file:', newAvatarFile);
        
        let avatar_url = null;
        let avatar_path = null;

        // Si nouveau fichier avatar, uploader
        if (newAvatarFile && newAvatarFile instanceof File) {
          console.log('Uploading new avatar:', newAvatarFile.name);
          
          // Récupérer l'ancien membre pour supprimer l'ancien avatar
          const oldMember = await api.membres.getById(id);
          
          // Supprimer l'ancien avatar si existe
          if (oldMember.avatar_path) {
            console.log('Deleting old avatar:', oldMember.avatar_path);
            const { error: deleteError } = await supabase.storage
              .from('avatars')
              .remove([oldMember.avatar_path]);
            
            if (deleteError) {
              console.error('Error deleting old avatar:', deleteError);
            }
          }
          
          // Upload du nouvel avatar
          const fileExt = newAvatarFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, newAvatarFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          avatar_url = publicUrl;
          avatar_path = filePath;
          
          console.log('New avatar URL:', avatar_url);
        }

        // Préparer les données de mise à jour
        const updateData: any = {
          updated_at: new Date().toISOString()
        };
        
        if (membreData.nom !== undefined) updateData.nom = membreData.nom;
        if (membreData.poste !== undefined) updateData.poste = membreData.poste;
        if (membreData.adresse !== undefined) updateData.adresse = membreData.adresse;
        if (membreData.date_naissance !== undefined) updateData.date_naissance = membreData.date_naissance;
        if (membreData.telephone !== undefined) updateData.telephone = membreData.telephone;
        if (membreData.sexe !== undefined) updateData.sexe = membreData.sexe;
        if (membreData.status !== undefined) updateData.status = membreData.status;
        
        if (avatar_url) {
          updateData.avatar_url = avatar_url;
          updateData.avatar_path = avatar_path;
        }

        console.log('Update data:', updateData);

        const { data, error } = await supabase
          .from('membre')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Error updating member:', error);
        throw error;
      }
    },

    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('membre')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error fetching member ${id}:`, error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        // Récupérer le membre pour supprimer son avatar
        const member = await api.membres.getById(id);
        
        // Supprimer l'avatar du storage si existe
        if (member.avatar_path) {
          console.log('Deleting avatar:', member.avatar_path);
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([member.avatar_path]);
          
          if (deleteError) {
            console.error('Error deleting avatar:', deleteError);
          }
        }

        // Supprimer le membre
        const { error } = await supabase
          .from('membre')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
      }
    },

    changeStatus: async (id: string, status: 'actif' | 'inactif' | 'suspendu') => {
      try {
        const { data, error } = await supabase
          .from('membre')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error changing member status:', error);
        throw error;
      }
    }
  }
};