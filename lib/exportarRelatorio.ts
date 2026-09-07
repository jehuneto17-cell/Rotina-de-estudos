import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface DadosRelatorio {
  mesNome: string;
  diasEstudados: number;
  minutosTotal: number;
  revisoesFeitas: number;
  revisoesTotal: number;
  porDisciplina: Array<{ nome: string; sessoes: number; minutos: number }>;
}

function montarTexto(d: DadosRelatorio): string {
  let txt = `RELATÓRIO MENSAL — ${d.mesNome}\n${'='.repeat(40)}\n\n`;
  txt += `Dias estudados: ${d.diasEstudados}\n`;
  txt += `Tempo total: ${d.minutosTotal} min (${Math.floor(d.minutosTotal / 60)}h${d.minutosTotal % 60 ? (d.minutosTotal % 60) + 'm' : ''})\n`;
  txt += `Revisões concluídas: ${d.revisoesFeitas} de ${d.revisoesTotal}\n\n`;
  txt += `POR DISCIPLINA:\n`;
  if (!d.porDisciplina.length) txt += 'Nenhum dado este mês.\n';
  d.porDisciplina.forEach((p) => {
    txt += `- ${p.nome}: ${p.sessoes} sessão(ões), ${p.minutos} min\n`;
  });
  return txt;
}

/** Exporta como .txt — no navegador baixa direto; no nativo abre a folha de compartilhar. */
export async function exportarTexto(d: DadosRelatorio) {
  const texto = montarTexto(d);
  const nomeArquivo = `relatorio-${d.mesNome.replace(/\s+/g, '-').toLowerCase()}.txt`;

  if (Platform.OS === 'web') {
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const { File, Paths } = await import('expo-file-system');
  const arquivo = new File(Paths.cache, nomeArquivo);
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(texto);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(arquivo.uri);
}

function montarHtml(d: DadosRelatorio): string {
  const linhas = d.porDisciplina
    .map((p) => `<li>${p.nome}: ${p.sessoes} sessão(ões), ${p.minutos} min</li>`)
    .join('');
  return `
    <html><body style="font-family: serif; padding: 24px;">
      <h1>Relatório Mensal — ${d.mesNome}</h1>
      <p>Dias estudados: ${d.diasEstudados}</p>
      <p>Tempo total: ${d.minutosTotal} min (${Math.floor(d.minutosTotal / 60)}h${d.minutosTotal % 60 ? (d.minutosTotal % 60) + 'm' : ''})</p>
      <p>Revisões concluídas: ${d.revisoesFeitas} de ${d.revisoesTotal}</p>
      <h2>Por disciplina</h2>
      ${d.porDisciplina.length ? `<ul>${linhas}</ul>` : '<p>Nenhum dado este mês.</p>'}
    </body></html>
  `;
}

/** Exporta como PDF via expo-print — abre diálogo de impressão/salvar nos três alvos (web/iOS/Android). */
export async function exportarPdf(d: DadosRelatorio) {
  const html = montarHtml(d);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
}
