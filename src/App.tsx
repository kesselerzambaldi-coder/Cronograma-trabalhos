/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Search,
  Plus,
  Trash2,
  Download,
  FileJson,
  FileText,
  X,
  Pencil,
  Settings2
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INITIAL_DATA } from './constants';
import { Activity, MaintenanceData } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [data, setData] = useState<MaintenanceData>(() => {
    const saved = localStorage.getItem('disa_maintenance_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migração para incluir títulos se não existirem
      return { 
        title: INITIAL_DATA.title, 
        subtitle: INITIAL_DATA.subtitle, 
        ...parsed 
      };
    }
    return INITIAL_DATA;
  });

  const [activeSectionId, setActiveSectionId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTask, setFormTask] = useState<Partial<Activity>>({
    name: '',
    section: data.sections[0]?.id || '',
    progress: 0,
    material: '',
    pending: '',
    duration: 1,
    who: ''
  });

  useEffect(() => {
    localStorage.setItem('disa_maintenance_data', JSON.stringify(data));
  }, [data]);

  const stats = useMemo(() => {
    const total = data.activities.length;
    const completed = data.activities.filter(a => a.progress === 100).length;
    const avgProgress = total > 0 ? data.activities.reduce((acc, a) => acc + a.progress, 0) / total : 0;
    const daysLeft = differenceInDays(parseISO(data.deadline), new Date());
    
    return { total, completed, avgProgress, daysLeft };
  }, [data]);

  const filteredActivities = useMemo(() => {
    return data.activities.filter(a => {
      const matchesSection = activeSectionId === 'all' || a.section === activeSectionId;
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.who.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [data.activities, activeSectionId, searchQuery]);

  const updateActivityProgress = (id: string, progress: number) => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.map(a => 
        a.id === id ? { ...a, progress: Math.min(100, Math.max(0, progress)) } : a
      )
    }));
  };

  const handleDeleteActivity = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir esta atividade?')) {
      setData(prev => ({
        ...prev,
        activities: prev.activities.filter(a => a.id !== id)
      }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    const defaultSection = (activeSectionId !== 'all' && data.sections.some(s => s.id === activeSectionId)) 
      ? activeSectionId 
      : (data.sections[0]?.id || '');

    setFormTask({
      name: '',
      section: defaultSection,
      progress: 0,
      material: '',
      pending: '',
      duration: 1,
      who: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    setEditingId(activity.id);
    setFormTask({ ...activity });
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setData(prev => ({
        ...prev,
        activities: prev.activities.map(a => 
          a.id === editingId ? { ...(formTask as Activity), id: editingId } : a
        )
      }));
    } else {
      const activity: Activity = {
        ...(formTask as Activity),
        id: `task-${Date.now()}`,
        date: null
      };
      setData(prev => ({
        ...prev,
        activities: [...prev.activities, activity]
      }));
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    const id = newSectionName.toLowerCase().replace(/\s+/g, '-');
    if (data.sections.some(s => s.id === id)) {
      alert('Esta categoria já existe!');
      return;
    }
    
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, { id, name: newSectionName.toUpperCase() }]
    }));
    setNewSectionName('');
  };

  const handleDeleteSection = (id: string) => {
    if (data.sections.length <= 1) {
      alert('O projeto deve ter pelo menos uma categoria.');
      return;
    }

    if (confirm('Ao excluir esta categoria, todas as atividades vinculadas a ela também serão excluídas. Continuar?')) {
      setData(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== id),
        activities: prev.activities.filter(a => a.section !== id)
      }));
      if (activeSectionId === id) setActiveSectionId('all');
    }
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        // Validação básica
        if (importedData.activities && importedData.sections) {
          setData(importedData);
          alert('Dados importados com sucesso!');
        } else {
          alert('Arquivo JSON inválido para este aplicativo.');
        }
      } catch (error) {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = `${data.title} ${data.subtitle}`.toUpperCase();
    
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Data do Relatorio: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`Progresso Geral: ${stats.avgProgress.toFixed(1)}%`, 14, 36);
    doc.text(`Dias para o Prazo: ${stats.daysLeft}`, 14, 42);

    const tableData = data.activities.map(item => [
      data.sections.find(s => s.id === item.section)?.name || '',
      item.name,
      `${item.progress}%`,
      item.who,
      item.material || '-',
      item.pending || '-',
      `${item.duration}d`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Secao', 'Atividade', '%', 'Responsavel', 'Material', 'Pendencia', 'Dur.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 }
    });

    doc.save(`${data.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-line px-5 md:px-6 py-8 md:py-10 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="group relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
              PROJETO MODULARIZAÇÃO
            </span>
          </div>
          <div className="flex items-start gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-slate-900">
              {data.title} <br />
              <span className="text-blue-600 italic">{data.subtitle}</span>
            </h1>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 bg-slate-50 md:bg-transparent hover:bg-slate-100 rounded-xl transition-colors mt-1"
              title="Editar Título"
            >
              <Settings2 className="w-5 h-5 text-slate-400 hover:text-blue-600" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase transition-all rounded-xl hover:bg-blue-600 hover:text-white cursor-pointer touch-manipulation">
              <Download className="w-4 h-4 rotate-180" />
              Importar
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
            <button 
              onClick={exportToJSON}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase transition-all rounded-xl hover:bg-blue-600 hover:text-white touch-manipulation"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            <button 
              onClick={exportToPDF}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase shadow-lg shadow-blue-200 transition-all rounded-xl hover:bg-blue-700 touch-manipulation"
            >
              <FileText className="w-4 h-4" />
              Relatório PDF
            </button>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full md:text-right flex md:flex-col justify-between items-center md:items-end p-4 bg-blue-600 md:bg-transparent rounded-2xl border-2 border-blue-700 md:border-none hover:bg-blue-700 md:hover:bg-blue-50 active:scale-[0.98] transition-all group/header shadow-lg shadow-blue-200 md:shadow-none"
          >
            <div className="flex items-center gap-2 text-xl md:text-2xl font-mono font-black text-white md:text-slate-800 group-hover/header:text-white md:group-hover/header:text-blue-700 transition-colors">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-200 md:text-blue-600 animate-pulse" />
              <span>{stats.daysLeft} DIAS</span>
            </div>
            <div className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-blue-100 md:text-slate-600 font-bold min-w-max flex items-center gap-1 bg-blue-800/20 md:bg-slate-100 px-2 py-1 rounded-lg border border-blue-400/30 md:border-slate-200">
              META: {format(parseISO(data.deadline), 'dd/MM/yyyy', { locale: ptBR })}
              <Pencil className="w-2.5 h-2.5 text-white md:text-blue-600 ml-1" />
            </div>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-brand-line bg-white shadow-sm mx-4 md:mx-6 mt-[-1.5rem] md:mt-[-2rem] rounded-2xl md:rounded-3xl overflow-hidden z-10 relative">
        <div className="p-6 md:p-8 md:border-r border-brand-line">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 md:mb-4 font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> 01. PROGRESSO TOTAL
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-blue-600">{stats.avgProgress.toFixed(1)}</span>
            <span className="text-xl md:text-2xl font-bold text-slate-300">%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 mt-4 md:mt-6 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.avgProgress}%` }}
              className="bg-blue-600 h-full rounded-full"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 md:border-r border-brand-line">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 md:mb-4 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 02. ENTREGAS CONCLUÍDAS
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-slate-900">{stats.completed}</span>
            <span className="text-xl md:text-2xl font-bold text-slate-300">/ {stats.total}</span>
          </div>
          <p className="mt-3 md:mt-4 text-[9px] md:text-[10px] font-mono text-slate-400 uppercase tracking-widest">Em campo: {stats.total - stats.completed}</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 md:mb-4 font-bold">03. STATUS CRONOGRAMA</div>
          <div className="flex flex-col gap-3 md:gap-4">
            {stats.daysLeft < 15 ? (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 font-bold border border-red-100">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm">ALERTA CRÍTICO</span>
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 font-bold border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm">NO PRAZO / EM DIA</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-900 text-white text-[8px] md:text-[9px] font-mono rounded">VERSÃO v2.0</span>
              <span className="px-2 py-1 bg-white border border-slate-200 text-[8px] md:text-[9px] font-mono text-slate-500 rounded uppercase">SINC: {format(new Date(), 'HH:mm')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-0 bg-slate-50/90 backdrop-blur-xl z-20 border-b border-slate-200 px-4 md:px-6 py-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between mt-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide no-scrollbar">
          <button 
            onClick={() => setActiveSectionId('all')}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm border touch-manipulation",
              activeSectionId === 'all' 
                ? "bg-blue-600 text-white border-blue-600 shadow-blue-200" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            TODAS
          </button>
          {data.sections.map(section => (
            <button 
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm border touch-manipulation",
                activeSectionId === section.id 
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-200" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              {section.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white group focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-10 py-3 text-xs md:text-sm font-medium focus:outline-none transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Table Section (Desktop) / Card Section (Mobile) */}
      <main className="px-4 md:px-6 py-4 md:py-8">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="text-[9px] font-bold uppercase tracking-widest text-left py-5 px-6 text-slate-400">Status</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-left py-5 px-6 text-slate-400">Atividade</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-left py-5 px-6 text-slate-400 w-48">Progresso</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-left py-5 px-6 text-slate-400">Equipe</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-left py-5 px-6 text-slate-400">Insumos e Notas</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-right py-5 px-6 text-slate-400">H-H</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-right py-5 px-6 text-slate-400 w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((item) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={item.id}
                    className="group hover:bg-blue-50/30 transition-all"
                  >
                    <td className="py-6 px-6">
                      {item.progress === 100 ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm border-2 border-emerald-300">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                      ) : item.progress > 0 ? (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 relative overflow-hidden border-2 border-blue-300 shadow-sm">
                           <div className="absolute inset-0 bg-blue-600/20 animate-pulse" />
                           <Clock className="w-5 h-5 z-10" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200 shadow-sm">
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-blue-600 mb-1 opacity-60">
                          {data.sections.find(s => s.id === item.section)?.name}
                        </span>
                        <span className="font-bold text-sm text-slate-900 tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-200 h-4 rounded-full overflow-hidden border-2 border-slate-300 shadow-inner">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-700 shadow-lg",
                              item.progress === 100 ? "bg-emerald-500 shadow-emerald-500/40" : "bg-blue-600 shadow-blue-600/40"
                            )}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <input 
                            type="range" min="0" max="100" step="5" value={item.progress} 
                            onChange={(e) => updateActivityProgress(item.id, parseInt(e.target.value))}
                            className="hidden group-hover:block w-16 accent-blue-700 h-2 cursor-pointer"
                          />
                          <span className={cn(
                            "text-sm font-mono font-black w-12 text-right",
                            item.progress === 100 ? "text-emerald-700" : "text-slate-900"
                          )}>
                            {item.progress}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className="text-[10px] font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                        {item.who || 'Pendente'}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        {item.material && (
                           <div className="flex items-center gap-2 bg-blue-100 px-2 py-1.5 rounded-lg border-2 border-blue-200 shadow-sm">
                             <LayoutGrid className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                             <span className="text-[11px] font-bold leading-tight text-blue-900">{item.material}</span>
                           </div>
                        )}
                        {item.pending && item.pending !== 'ok' && (
                          <div className="flex items-center gap-2 text-red-800 bg-red-100 px-2 py-2 rounded-xl border-2 border-red-300 shadow-md animate-pulse">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span className="text-[10px] font-black uppercase leading-tight tracking-tighter">{item.pending}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6 text-right font-mono text-xs font-bold text-slate-500">
                      {item.duration}d
                    </td>
                    <td className="py-6 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => handleEditClick(e, item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteActivity(e, item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                      {data.sections.find(s => s.id === item.section)?.name}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleEditClick(e, item)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteActivity(e, item.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Progresso da Obra</span>
                    <motion.div 
                      key={item.progress}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "px-4 py-2 rounded-xl font-mono font-black text-xl shadow-lg border-2",
                        item.progress === 100 
                          ? "bg-emerald-500 text-white border-emerald-600" 
                          : "bg-blue-600 text-white border-blue-700"
                      )}
                    >
                      {item.progress}%
                    </motion.div>
                  </div>

                  <div className="relative pt-2 pb-6">
                    <div className="w-full bg-slate-200 h-16 rounded-3xl overflow-hidden border-4 border-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] relative">
                      <motion.div 
                        initial={false}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
                        className={cn(
                          "h-full rounded-r-2xl shadow-[6px_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden",
                          item.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                        )}
                      >
                         {/* Efeito de brilho na barra */}
                         <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                         <div className="h-full flex items-center justify-end pr-4">
                           <div className="w-4 h-10 bg-white/50 rounded-full blur-[1px] shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                         </div>
                      </motion.div>
                      
                      {/* Marcador Central de 50% */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-slate-300/40 z-0" />
                    </div>
                    
                    {/* Slider Invisível mas super responsivo */}
                    <input 
                      type="range" min="0" max="100" step="1" value={item.progress} 
                      onChange={(e) => updateActivityProgress(item.id, parseInt(e.target.value))}
                      className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] opacity-0 cursor-pointer touch-none z-20"
                    />

                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mt-4 font-mono">
                      <span>Início</span>
                      <div className="flex items-center gap-2 text-blue-500 animate-bounce">
                        <span className="text-[8px]">←</span>
                        <span>AJUSTAR AQUI</span>
                        <span className="text-[8px]">→</span>
                      </div>
                      <span>Concluído</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1 font-mono">Resposável</span>
                    <span className="text-slate-700">{item.who || '---'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1 font-mono">Duração (H-H)</span>
                    <span className="text-slate-700">{item.duration} DIAS</span>
                  </div>
                </div>

                {(item.material || (item.pending && item.pending !== 'ok')) && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    {item.material && (
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                        <LayoutGrid className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-[11px] font-bold text-blue-900">{item.material}</span>
                      </div>
                    )}
                    {item.pending && item.pending !== 'ok' && (
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="text-[11px] font-bold text-red-900">{item.pending}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredActivities.length === 0 && (
          <div className="py-20 md:py-32 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 mt-4">
            <p className="font-mono text-xs text-slate-400 font-bold uppercase tracking-widest bg-white px-6 py-3 border border-slate-200 inline-block rounded-2xl shadow-sm italic">
              Nenhuma atividade localizada
            </p>
          </div>
        )}
      </main>

      {/* Botão Flutuante */}
      <motion.button 
        whileHover={{ scale: 1.05, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenAddModal}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-300 flex items-center justify-center hover:bg-blue-700 transition-all z-40 border-4 border-white touch-manipulation"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Modal Configurações do Projeto */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 1, y: '100%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative bg-white w-full max-w-lg border-t md:border border-slate-200 shadow-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 max-h-[90vh] overflow-y-auto scrollbar-hide no-scrollbar">
               <div className="flex items-center justify-between mb-6 md:mb-8">
                 <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono italic">Painel de Controle</h2>
                 <button onClick={() => setIsSettingsOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                 </button>
               </div>

               <div className="flex flex-col gap-8">
                  {/* Identidade */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">01. IDENTIDADE</h3>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Título Principal</label>
                      <input type="text" value={data.title} onChange={(e) => setData({...data, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Subtítulo / Especialidade</label>
                      <input type="text" value={data.subtitle} onChange={(e) => setData({...data, subtitle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-blue-600" />
                    </div>
                  </div>

                  {/* Gerenciar Categorias */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">02. CATEGORIAS (SESSÕES)</h3>
                    
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        placeholder="Nova categoria..." 
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium" 
                       />
                       <button 
                        onClick={handleAddSection}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                       >
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                      {data.sections.map(section => (
                        <div key={section.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                           <span className="text-xs font-bold text-slate-700 uppercase">{section.name}</span>
                           <button 
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                    Fechar Configurações
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar/Editar Atividade */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 1, y: '100%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative bg-white w-full max-w-xl overflow-hidden border-t md:border border-slate-200 shadow-2xl rounded-t-[2.5rem] md:rounded-[2.5rem]">
              <div className="px-6 md:px-8 py-5 md:py-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-[10px] md:text-xs font-black uppercase font-mono tracking-widest text-slate-800 italic">
                  {editingId ? 'Editar Atividade' : 'Nova Atividade'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveTask} className="p-6 md:p-8 flex flex-col gap-5 md:gap-6 bg-white overflow-y-auto max-h-[85vh] no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Nome da Atividade</label>
                    <input required type="text" value={formTask.name} onChange={(e) => setFormTask({ ...formTask, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all placeholder:text-slate-300" placeholder="Ex: Montagem do Quadro" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Sessão / Módulo</label>
                    <select value={formTask.section} onChange={(e) => setFormTask({ ...formTask, section: e.target.value })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all appearance-none">
                      {data.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Célula / Equipe</label>
                    <input type="text" value={formTask.who} onChange={(e) => setFormTask({ ...formTask, who: e.target.value })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all" placeholder="Responsável" />
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Estimativa (Dias)</label>
                      <input type="number" step="0.5" value={formTask.duration} onChange={(e) => setFormTask({ ...formTask, duration: parseFloat(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Progresso (%)</label>
                      <input type="number" min="0" max="100" value={formTask.progress} onChange={(e) => setFormTask({ ...formTask, progress: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Materiais</label>
                    <input type="text" value={formTask.material} onChange={(e) => setFormTask({ ...formTask, material: e.target.value })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block ml-1">Pendências</label>
                    <input type="text" value={formTask.pending} onChange={(e) => setFormTask({ ...formTask, pending: e.target.value })} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all" placeholder="'ok' se limpo" />
                  </div>
                </div>
                <button type="submit" className="mt-4 w-full bg-blue-600 text-white font-black uppercase text-[10px] md:text-xs py-5 rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 tracking-[0.2em] touch-manipulation">
                  {editingId ? 'Salvar Alterações' : 'Criar Nova Atividade'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
