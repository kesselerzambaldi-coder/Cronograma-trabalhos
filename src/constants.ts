/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaintenanceData } from './types';

export const INITIAL_DATA: MaintenanceData = {
  title: 'Manutenção',
  subtitle: 'Sistemas Elétricos',
  deadline: '2026-06-20',
  sections: [
    { id: 'balanca', name: '1- BALANÇA' },
    { id: 'nitrogenio', name: '2- NITROGÊNIO' },
    { id: 'cabine', name: '3- CABINE' },
    { id: 'skip', name: '4- SKIP' },
    { id: 'limpeza', name: '5- LIMPEZA DO STOPPER' },
    { id: 'quebra_canal', name: '6- QUEBRA CANAL' },
  ],
  activities: [
    // 1- BALANÇA
    { id: 'b1', section: 'balanca', name: 'LIGAR ATERRAMENTO', progress: 0, material: 'Conectores', pending: 'ok', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'b2', section: 'balanca', name: 'FIXAR INDICADOR NO PEDESTAL', progress: 0, material: 'ok', pending: 'Construção do pedestal', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'b3', section: 'balanca', name: 'MONTAR CAIXA DE PASSAGEM CXP2', progress: 0, material: 'ok', pending: 'ok', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'b4', section: 'balanca', name: 'INSTALAR CAIXA DE JUNÇÃO/PASSAGEM CXP2', progress: 0, material: 'ok', pending: 'Montagem CXP2', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'b5', section: 'balanca', name: 'INSTALAR ELETRODUTOS ELÉTRICOS', progress: 0, material: 'ok', pending: 'Posicionamento da cabine', date: null, duration: 1, who: 'EQUIPE_1' },
    { id: 'b6', section: 'balanca', name: 'INSTALAR SINALEIROS', progress: 0, material: 'Sinaleiros', pending: 'Posicionamento da cabine', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'b7', section: 'balanca', name: 'LANÇAR CABO DE ALIMENTAÇÃO/SINAL 4-20mA', progress: 0, material: 'Célula de carga', pending: 'Posicionamento da cabine', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'b8', section: 'balanca', name: 'TESTES', progress: 0, material: 'ok', pending: 'Posicionamento da cabine', date: null, duration: 1, who: 'MADEIRA' },
    { id: 'b9', section: 'balanca', name: 'CALIBRAÇÃO', progress: 0, material: 'ok', pending: 'Agendar pesos padrão', date: null, duration: 0.5, who: 'MADEIRA' },

    // 2- NITROGÊNIO
    { id: 'n1', section: 'nitrogenio', name: 'ATERRAMENTO (OBRA CIVIL)', progress: 10, material: 'ok', pending: 'Obra civil', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'n2', section: 'nitrogenio', name: 'INSTALAR ELETRODUTOS ALIMENTAÇÃO 220V', progress: 0, material: '', pending: 'Definir ponto de derivação', date: null, duration: 1.5, who: 'EQUIPE_1' },
    { id: 'n3', section: 'nitrogenio', name: 'LIGAR ATERRAMENTO DOS EQUIPOS E CERCA', progress: 0, material: 'ok', pending: 'Instalação dos equipos e/ou cerca', date: null, duration: 1, who: 'EQUIPE_1' },
    { id: 'n4', section: 'nitrogenio', name: 'LANÇAMENTO DO CABO 220V', progress: 0, material: '', pending: 'Tubulação concluída', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'n5', section: 'nitrogenio', name: 'INSTALAR ELETRODUTOS ILUMINAÇÃO', progress: 0, material: '', pending: 'Instalação dos equipos e/ou cerca', date: null, duration: 1, who: 'EQUIPE_1' },
    { id: 'n6', section: 'nitrogenio', name: 'INSTALAR LUMINÁRIAS', progress: 0, material: '', pending: 'Instalação dos equipos e/ou cerca', date: null, duration: 0.5, who: 'EQUIPE_1' },

    // 3- CABINE
    { id: 'c1', section: 'cabine', name: 'ATUALIZAÇÃO PROJETO ELÉTRICO', progress: 100, material: 'ok', pending: 'ok', date: null, duration: 10, who: 'MADEIRA' },
    { id: 'c2', section: 'cabine', name: 'LAYOUT DE POSICIONAMENTO DOS PAINÉIS', progress: 0, material: 'ok', pending: 'ok', date: null, duration: 0.5, who: 'MADEIRA' },
    { id: 'c3', section: 'cabine', name: 'PROGRAMAÇÃO PLC', progress: 75, material: 'ok', pending: 'ok', date: null, duration: 5, who: 'MADEIRA' },
    { id: 'c4', section: 'cabine', name: 'PROGRAMAÇÃO IHM', progress: 40, material: 'ok', pending: 'ok', date: null, duration: 5, who: 'MADEIRA' },
    { id: 'c5', section: 'cabine', name: 'TESTE PAINEL ELÉTRICO', progress: 50, material: 'ok', pending: 'ok', date: null, duration: 1, who: 'MADEIRA' },
    { id: 'c6', section: 'cabine', name: 'PROGRAMAÇÃO RELATÓRIO PLC/IHM', progress: 0, material: 'ok', pending: 'Teste do painel', date: null, duration: 3, who: 'MADEIRA' },
    { id: 'c7', section: 'cabine', name: 'LAYOUT CPX1 CABINE', progress: 70, material: 'ok', pending: 'Atualização do projeto elétrico', date: null, duration: 0.5, who: 'MADEIRA' },
    { id: 'c8', section: 'cabine', name: 'MONTAGEM GAVETA CCM ALIMENTAÇÃO 440V', progress: 0, material: '', pending: '', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'c9', section: 'cabine', name: 'MONTAGEM CAIXA DE PASSAGEM CXP1', progress: 0, material: '', pending: '', date: null, duration: 0.5, who: 'EQUIPE_1' },
    { id: 'c10', section: 'cabine', name: 'INSTALAR ELETRODUTOS ALIMENTAÇÃO 440V', progress: 50, material: '', pending: '', date: null, duration: 1, who: 'EQUIPE_1' },
    { id: 'c11', section: 'cabine', name: 'INSTALAR ELETRODUTOS ABORDO DA CABINE', progress: 0, material: '', pending: '', date: null, duration: 2, who: 'EQUIPE_1' },
    { id: 'c15', section: 'cabine', name: 'COMISSIONAMENTO', progress: 0, material: '', pending: '', date: null, duration: 2, who: 'MADEIRA' },

    // 4- SKIP
    { id: 's1', section: 'skip', name: 'LISTA DE MATERIAL ELÉTRICO', progress: 0, material: '', pending: '', date: null, duration: 0.5, who: 'IGOR/MADEIRA' },
    { id: 's2', section: 'skip', name: 'ATUALIZAR PROJETO ELÉTRICO', progress: 0, material: '', pending: '', date: null, duration: 1.5, who: 'MADEIRA' },
    { id: 's3', section: 'skip', name: 'PAINEL DE TESTE DESENHO BASE/ATUALIZAÇÃO', progress: 90, material: '', pending: '', date: null, duration: 0.5, who: '' },

    // 5- LIMPEZA DO STOPPER
    { id: 'l1', section: 'limpeza', name: 'LISTA DE MATERIAL ELÉTRICO', progress: 0, material: '', pending: '', date: null, duration: 0.5, who: 'IGOR/MADEIRA' },
    { id: 'l2', section: 'limpeza', name: 'ATUALIZAR PROJETO ELÉTRICO', progress: 0, material: '', pending: '', date: null, duration: 1, who: 'MADEIRA' },

    // 6- QUEBRA CANAL
    { id: 'q1', section: 'quebra_canal', name: 'ATUALIZAR PROJETO ELÉTRICO', progress: 0, material: '', pending: '', date: null, duration: 0.5, who: 'MADEIRA' },
  ]
};
