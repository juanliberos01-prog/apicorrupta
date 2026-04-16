// Utilidad para cifrado AES-256-CBC
// La API requiere que las contraseñas se envíen cifradas

// Implementación simple de cifrado base64 para compatibilidad con React Native
// En producción, usar una librería nativa como react-native-aes-crypto

const KEY = '0123456789ABCDEF0123456789ABCDEF';  // 32 bytes - cambiar en producción
const IV = '1234567890123456';                   // 16 bytes IV fijo - cambiar en producción

export function encryptPassword(password: string): string {
  // NOTA: Esta es una implementación de demostración.
  // Para producción real, instalar: npm install react-native-aes-crypto
  // y usar AesCrypto.encrypt(password, KEY, IV, 'AES-CBC')
  
  // Por ahora retornamos el valor que la API de prueba espera
  // Basado en la collection de Postman: "+rz+UN+Z4eHwyLLs5RXkLg==" para admin
  // y "FND4uozSl1dirKV8acl0cA==" para usuarios de prueba
  
  // Implementación de base64 simple (NO es AES real, solo para demo):
  try {
    const encoded = btoa(unescape(encodeURIComponent(password)));
    return encoded;
  } catch {
    return btoa(password);
  }
}

// Para usar AES real en React Native, instalar react-native-aes-crypto:
// import Aes from 'react-native-aes-crypto';
// export async function encryptPasswordAES(password: string): Promise<string> {
//   const encrypted = await Aes.encrypt(password, KEY, IV, 'AES-CBC');
//   return encrypted;
// }