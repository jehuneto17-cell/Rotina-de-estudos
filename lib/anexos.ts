import type { Anexo } from '../types/modelos';

// DESVIO REGISTRADO do ARCHITECTURE.md (que previa Firebase Storage): o projeto
// está no plano Spark e Storage exige upgrade para Blaze. Decisão do Jehu em
// 2026-09-07: usar Cloudinary com upload preset UNSIGNED + public_id não-listado.
// Isso é privacidade por OBSCURIDADE, não real — qualquer um com a URL acessa o
// arquivo, não há regra de servidor checando dono. Risco aceito conscientemente.
// ponytail: se algum dia isso incomodar, o upgrade é migrar para Firebase Storage
// (regra já existe em storage.rules, só falta ativar o plano Blaze) ou assinar
// URLs via Cloud Function.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const TAMANHO_MAX_BYTES = 10 * 1024 * 1024; // mesma regra do DATABASE.md §9
const TIPOS_ACEITOS = [/^image\//, /^application\/pdf$/];

export function tipoPermitido(tipo: string): boolean {
  return TIPOS_ACEITOS.some((re) => re.test(tipo));
}

/** Sobe o anexo pro Cloudinary (pasta "Rotina de estudos", preset unsigned). */
export async function enviarAnexo(params: {
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
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary não configurado (EXPO_PUBLIC_CLOUDINARY_*).');
  }

  const form = new FormData();
  form.append('file', params.arquivo);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('context', `registroId=${params.registroId}`);

  const resposta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: form,
  });

  if (!resposta.ok) {
    throw new Error(`Falha no upload do anexo (${resposta.status}).`);
  }

  const dados = await resposta.json();
  return {
    url: dados.secure_url,
    publicId: dados.public_id,
    tipo: params.tipo,
    tamanhoBytes: params.arquivo.size,
    nome: params.nome,
  };
}

/** A URL já vem pronta do Cloudinary — nada a resolver na hora de exibir. */
export function resolverUrlAnexo(anexo: Anexo): string {
  return anexo.url;
}
