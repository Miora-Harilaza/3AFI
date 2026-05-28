import emailjs from '@emailjs/browser';

// Récupération des clés
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// Vérification avant initialisation
if (!PUBLIC_KEY) {
  console.error('❌ EmailJS Public Key manquante! Vérifiez votre fichier .env');
} else {
  console.log('✅ EmailJS Public Key chargée:', PUBLIC_KEY.substring(0, 10) + '...');
  emailjs.init(PUBLIC_KEY);
}

export const sendEmail = async (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    // Vérification supplémentaire
    if (!SERVICE_ID || !TEMPLATE_ID) {
      throw new Error('EmailJS: Service ID ou Template ID manquant');
    }

    console.log('📧 Envoi avec:', {
      serviceId: SERVICE_ID,
      templateId: TEMPLATE_ID,
      publicKey: PUBLIC_KEY ? '✅' : '❌'
    });

    const templateParams = {
      to_name: 'Mioramh',
      to_email: 'mioramh@gmail.com',
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      reply_to: formData.email,
      user_subject: formData.subject,
      user_message: formData.message,
      user_name: formData.name,
      user_email: formData.email
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    );

    console.log('✅ EmailJS succès:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ EmailJS Error:', error);
    throw error;
  }
};