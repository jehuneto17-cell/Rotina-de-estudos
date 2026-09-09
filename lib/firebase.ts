import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserPopupRedirectResolver, browserLocalPersistence } from 'firebase/auth';
// @ts-expect-error — só existe no build resolvido por Metro para React Native
// (package.json "react-native" export condition); tsc usa a condição "node".
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Nenhum segredo aqui — ARCHITECTURE.md §7: proteção do dado é a Security Rule,
// não a obscuridade da chave. Tudo com prefixo EXPO_PUBLIC_ por design.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persistência de sessão via AsyncStorage no nativo. Na web, resolver explícito:
// getAuth(app) sozinho não registra o browserPopupRedirectResolver de forma
// confiável com o bundler do Expo web, e sem ele signInWithRedirect nunca grava
// o estado pendente no sessionStorage antes de navegar — o retorno do Google
// então não encontra nada e getRedirectResult sempre resolve null.
export const auth =
  Platform.OS === 'web'
    ? initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      })
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
// Sem Firebase Storage no MVP — Cloudinary assume os anexos (ver lib/anexos.ts).
