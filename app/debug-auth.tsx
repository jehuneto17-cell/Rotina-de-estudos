import { useEffect, useState } from 'react';
import { Text, View, Pressable, ScrollView } from 'react-native';
import { GoogleAuthProvider, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Rota temporária de diagnóstico — remover depois de achar o bug do login web.
export default function DebugAuth() {
  const [log, setLog] = useState<string[]>([]);

  function add(msg: string) {
    setLog((l) => [...l, `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  }

  useEffect(() => {
    add('montou, currentUser=' + (auth.currentUser?.email ?? 'null'));
    add('chamando getRedirectResult...');
    getRedirectResult(auth)
      .then((r) => add('getRedirectResult OK: ' + (r ? r.user.email : 'null (sem redirect pendente)')))
      .catch((e) => add('getRedirectResult ERRO: ' + e.code + ' ' + e.message));

    const unsub = auth.onAuthStateChanged((u) => {
      add('onAuthStateChanged: ' + (u ? u.email : 'null'));
    });
    return unsub;
  }, []);

  return (
    <ScrollView className="flex-1 bg-white p-4 pt-16">
      <Pressable
        className="bg-black p-4 rounded mb-4"
        onPress={() => {
          add('clicou, chamando signInWithRedirect...');
          signInWithRedirect(auth, new GoogleAuthProvider());
        }}
      >
        <Text className="text-white text-center">Testar signInWithRedirect</Text>
      </Pressable>
      {log.map((l, i) => (
        <Text key={i} className="text-xs font-mono mb-1">{l}</Text>
      ))}
    </ScrollView>
  );
}
