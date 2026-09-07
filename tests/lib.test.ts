import { describe, expect, it } from 'vitest';
import { calcularStreak } from '../lib/streak';
import { gerarRevisoes, revisaoEstaAtrasada } from '../lib/revisoes';
import { somarDias, ehDiaNaoLetivo } from '../lib/datas';

describe('streak — não quebra em fim de semana/feriado', () => {
  it('sexta estudada + fim de semana pulado + segunda estudada = streak 2, sem quebra', () => {
    // 2026-09-04 = sexta, 05/06 = sáb/dom, 07 = segunda
    const dias = new Set(['2026-09-04', '2026-09-07']);
    expect(calcularStreak(dias, '2026-09-07')).toBe(2);
  });

  it('pular um dia útil sem registro quebra o streak', () => {
    // 2026-09-01 = terça, 02 = quarta (pulada), 03 = quinta
    const dias = new Set(['2026-09-01', '2026-09-03']);
    expect(calcularStreak(dias, '2026-09-03')).toBe(1);
  });

  it('feriado nacional (25/12) não quebra streak mesmo sem registro', () => {
    const dias = new Set(['2026-12-24', '2026-12-28']);
    // 25=feriado, 26/27=sáb/dom -> tudo pulado
    expect(calcularStreak(dias, '2026-12-28')).toBe(2);
  });

  it('hoje sem registro ainda não quebra (dia em andamento)', () => {
    const dias = new Set(['2026-09-01']); // terça
    expect(calcularStreak(dias, '2026-09-01')).toBe(1);
  });
});

describe('revisões — geração e tolerância de atraso', () => {
  it('gera 4 revisões nos offsets 1/3/7/15', () => {
    const revisoes = gerarRevisoes({
      registroId: 'reg1',
      materiaId: 'mat1',
      resumo: 'teste',
      dataRegistro: '2026-09-06',
    });
    expect(revisoes.map((r) => r.dataPrevista)).toEqual([
      '2026-09-07',
      '2026-09-09',
      '2026-09-13',
      '2026-09-21',
    ]);
  });

  it('não está atrasada no mesmo dia da data prevista', () => {
    expect(
      revisaoEstaAtrasada({ status: 'pendente', dataPrevista: '2026-09-06' }, '2026-09-06')
    ).toBe(false);
  });

  it('não está atrasada com 1 dia de tolerância', () => {
    expect(
      revisaoEstaAtrasada({ status: 'pendente', dataPrevista: '2026-09-06' }, '2026-09-07')
    ).toBe(false);
  });

  it('está atrasada a partir de 2 dias depois da data prevista', () => {
    expect(
      revisaoEstaAtrasada({ status: 'pendente', dataPrevista: '2026-09-06' }, '2026-09-08')
    ).toBe(true);
  });

  it('revisão feita nunca está atrasada', () => {
    expect(
      revisaoEstaAtrasada({ status: 'feita', dataPrevista: '2026-09-01' }, '2026-09-08')
    ).toBe(false);
  });
});

describe('datas', () => {
  it('somarDias avança corretamente', () => {
    expect(somarDias('2026-09-06', 15)).toBe('2026-09-21');
  });

  it('reconhece sábado/domingo como não letivo', () => {
    expect(ehDiaNaoLetivo('2026-09-05')).toBe(true); // sábado
    expect(ehDiaNaoLetivo('2026-09-08')).toBe(false); // terça (07 é feriado — Independência)
  });

  it('reconhece feriado fixo como não letivo', () => {
    expect(ehDiaNaoLetivo('2026-12-25')).toBe(true);
  });
});
