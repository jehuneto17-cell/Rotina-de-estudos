// Matriz de verificação do item #1 — DATABASE.md §6.
// A = dono, B = visualizador com vínculo ativo, C = terceiro sem vínculo.
// Roda contra o Firestore Emulator: `npm run test:rules` (ver package.json).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const A = 'uid_a_dono';
const B = 'uid_b_visualizador';
const C = 'uid_c_terceiro';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'rotina-estudos-testes',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Estado base: A tem progressoPublico e um registro privado; B tem vínculo ativo com A.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'progressoPublico', A), {
      nome: 'A',
      fotoUrl: null,
      streak: 5,
      ultimoDiaEstudado: '2026-09-06',
      diasEstudadosMes: 5,
      minutosMes: 300,
      revisoesAtrasadas: 1,
      materias: {},
      minutosPorMateriaMes: {},
      evolucaoSemanal: {},
      atualizadoEm: Date.now(),
    });
    await setDoc(doc(db, 'usuarios', A), { nome: 'A' });
    await setDoc(doc(db, 'usuarios', A, 'registros', 'reg1'), { conteudo: 'privado' });
    await setDoc(doc(db, 'usuarios', A, 'blocos', 'bl1'), { titulo: 'bloco' });
    await setDoc(doc(db, 'usuarios', A, 'tarefas', 't1'), { titulo: 'tarefa' });
    await setDoc(doc(db, 'usuarios', A, 'revisoes', 'r1'), { status: 'pendente' });
    await setDoc(doc(db, 'vinculos', A, 'visualizadores', B), {
      nomeVisualizador: 'B',
      criadoEm: Date.now(),
    });
  });
});

function como(uid: string, email?: string) {
  return testEnv.authenticatedContext(uid, email ? { email } : undefined).firestore();
}

describe('item #1 — compartilhamento somente-leitura', () => {
  it('1. B lê progressoPublico/A — PERMITE', async () => {
    await assertSucceeds(getDoc(doc(como(B), 'progressoPublico', A)));
  });

  it('2. B lê usuarios/A — NEGA', async () => {
    await assertFails(getDoc(doc(como(B), 'usuarios', A)));
  });

  it('3. B lista usuarios/A/registros — NEGA', async () => {
    await assertFails(getDocs(collection(como(B), 'usuarios', A, 'registros')));
  });

  it('4. B lê usuarios/A/registros/reg1 — NEGA', async () => {
    await assertFails(getDoc(doc(como(B), 'usuarios', A, 'registros', 'reg1')));
  });

  it('5. B lista usuarios/A/blocos — NEGA', async () => {
    await assertFails(getDocs(collection(como(B), 'usuarios', A, 'blocos')));
  });

  it('6. B lista usuarios/A/tarefas — NEGA', async () => {
    await assertFails(getDocs(collection(como(B), 'usuarios', A, 'tarefas')));
  });

  it('7. B lista usuarios/A/revisoes — NEGA', async () => {
    await assertFails(getDocs(collection(como(B), 'usuarios', A, 'revisoes')));
  });

  // 8. Anexo no Storage — coberto em tests/storage.rules.test.ts (regra diferente).

  it('9. B escreve progressoPublico/A — NEGA (vínculo é somente leitura)', async () => {
    await assertFails(updateDoc(doc(como(B), 'progressoPublico', A), { streak: 999 }));
  });

  it('10. C (sem vínculo) lê progressoPublico/A — NEGA', async () => {
    await assertFails(getDoc(doc(como(C), 'progressoPublico', A)));
  });

  it('11. C cria vinculos/A/visualizadores/C — NEGA (ninguém se autoconcede)', async () => {
    await assertFails(
      setDoc(doc(como(C), 'vinculos', A, 'visualizadores', C), {
        nomeVisualizador: 'C',
        criadoEm: Date.now(),
      })
    );
  });

  it('12. A cria vinculos/A/visualizadores/{novo} — PERMITE (só o dono concede)', async () => {
    // B já tem vínculo criado no beforeEach — usa outro uid para testar CREATE de fato,
    // não UPDATE (que a rule bloqueia por design: vínculo existe ou não existe).
    const D = 'uid_d_novo_visualizador';
    await assertSucceeds(
      setDoc(doc(como(A), 'vinculos', A, 'visualizadores', D), {
        nomeVisualizador: 'D',
        criadoEm: Date.now(),
      })
    );
  });

  it('13. A escreve progressoPublico/A com campo "notas" — NEGA (allowlist hasOnly)', async () => {
    await assertFails(
      setDoc(doc(como(A), 'progressoPublico', A), {
        nome: 'A',
        fotoUrl: null,
        streak: 5,
        ultimoDiaEstudado: '2026-09-06',
        diasEstudadosMes: 5,
        minutosMes: 300,
        revisoesAtrasadas: 1,
        materias: {},
        minutosPorMateriaMes: {},
        evolucaoSemanal: {},
        atualizadoEm: Date.now(),
        notas: 'vazamento',
      })
    );
  });

  it('14. A escreve progressoPublico/A com streak:"muito" — NEGA (tipo inválido)', async () => {
    await assertFails(
      setDoc(doc(como(A), 'progressoPublico', A), {
        nome: 'A',
        fotoUrl: null,
        streak: 'muito',
        ultimoDiaEstudado: '2026-09-06',
        diasEstudadosMes: 5,
        minutosMes: 300,
        revisoesAtrasadas: 1,
        materias: {},
        minutosPorMateriaMes: {},
        evolucaoSemanal: {},
        atualizadoEm: Date.now(),
      })
    );
  });

  it('15. B atualiza convite de outra pessoa — NEGA (e-mail não bate)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'convites', 'conv1'), {
        deUid: A,
        deNome: 'A',
        paraEmail: 'outra-pessoa@example.com',
        status: 'pendente',
        criadoEm: Date.now(),
      });
    });
    await assertFails(
      updateDoc(doc(como(B, 'b@example.com'), 'convites', 'conv1'), { status: 'aceito' })
    );
  });

  it('16. Convidante tenta aceitar o próprio convite — NEGA (só o convidado aceita)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'convites', 'conv2'), {
        deUid: A,
        deNome: 'A',
        paraEmail: 'b@example.com',
        status: 'pendente',
        criadoEm: Date.now(),
      });
    });
    await assertFails(
      updateDoc(doc(como(A, 'a@example.com'), 'convites', 'conv2'), { status: 'aceito' })
    );
  });

  it('17. A revoga o vínculo; B deixa de ler progressoPublico/A', async () => {
    await assertSucceeds(getDoc(doc(como(B), 'progressoPublico', A)));
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), 'vinculos', A, 'visualizadores', B));
    });
    await assertFails(getDoc(doc(como(B), 'progressoPublico', A)));
  });
});
