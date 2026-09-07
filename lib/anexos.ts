import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';
import type { Anexo } from '../types/modelos';

const TAMANHO_MAX_BYTES = 10 * 1024 * 1024; // DATABASE.md §9 e storage.rules
const TIPOS_ACEITOS = [/^image\//, /^application\/pdf$/];

export function tipoPermitido(tipo: string): boolean {
  return TIPOS_ACEITOS.some((re) => re.test(tipo));
}

/** Sobe o anexo para o path privado do dono e retorna o metadado a gravar em `registros`. */
export async function enviarAnexo(params: {
  uid: string;
  registroId: string;
  arquivo: Blob;
  nome: string;
  tipo: string;
}): Promise<Anexo> {
  if (params.arquivo.size > TAMANHO_MAX_BYTES) {
    throw new Error('Arquivo maior que 10 MB.');
  }
  if (!tipoPermitido(params.tipo)) {
    throw new Error('Tipo de arquivo não permitido — só imagem ou PDF.');
  }

  const path = `usuarios/${params.uid}/anexos/${params.registroId}/${params.nome}`;
  await uploadBytes(ref(storage, path), params.arquivo, { contentType: params.tipo });

  return { path, tipo: params.tipo, tamanhoBytes: params.arquivo.size, nome: params.nome };
}

/** Resolve a URL de exibição na hora de mostrar — nunca se guarda a URL (DATABASE.md §2.6). */
export function resolverUrlAnexo(anexo: Anexo): Promise<string> {
  return getDownloadURL(ref(storage, anexo.path));
}
