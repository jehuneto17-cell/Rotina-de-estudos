import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

WebBrowser.maybeCompleteAuthSession();

/** Cria usuarios/{uid} na primeira vez que a pessoa loga (DATABASE.md §2.1). */
async function garantirPerfil(uid: string, nome: string, email: string, fotoUrl: string | null) {
  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(ref, {
    nome,
    email: email.toLowerCase(),
    fotoUrl,
    exame: null,
    banca: null,
    onboardingConcluido: false,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

// Web usa o popup nativo do Firebase (reaproveita o client OAuth que o próprio
// Firebase já cadastrou com localhost/firebaseapp.com autorizados — zero config
// extra). Mobile usa expo-auth-session, que exige Client ID iOS/Android próprios
// (ainda não configurados — ver ESTADO.md).
export function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });

  useEffect(() => {
    if (Platform.OS === 'web' || response?.type !== 'success') return;
    const { id_token } = response.params;
    signInWithCredential(auth, GoogleAuthProvider.credential(id_token)).then((resultado) => {
      const { uid, displayName, email, photoURL } = resultado.user;
      garantirPerfil(uid, displayName ?? '', email ?? '', photoURL);
    });
  }, [response]);

  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState(false);

  async function entrarComGoogle() {
    setErro(false);
    setEntrando(true);
    try {
      if (Platform.OS === 'web') {
        const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
        const { uid, displayName, email, photoURL } = resultado.user;
        await garantirPerfil(uid, displayName ?? '', email ?? '', photoURL);
      } else {
        await promptAsync();
      }
    } catch {
      setErro(true);
    } finally {
      setEntrando(false);
    }
  }

  const pronto = (Platform.OS === 'web' || !!request) && !entrando;
  return { pronto, entrando, erro, entrarComGoogle };
}
