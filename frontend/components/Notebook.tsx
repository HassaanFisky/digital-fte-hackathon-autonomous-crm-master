"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Edit3, Plus, FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export function Notebook() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("panaversity-companion-notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }

    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-notebook", handleToggle);
    return () => window.removeEventListener("toggle-notebook", handleToggle);
  }, []);

  useEffect(() => {
    localStorage.setItem("panaversity-companion-notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Untitled Insight",
      content: "",
      timestamp: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, timestamp: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      setIsEditing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9000]"
          />
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-bg-base/95 backdrop-blur-3xl shadow-float z-[9001] border-l border-border-fine flex flex-col"
          >
            <div className="px-8 py-8 border-b border-border-fine flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Strategy Ledger</h2>
                  <p className="text-[9px] uppercase tracking-widest text-text-muted">Digital FTE Command Logs</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {!activeNote ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60">Your Insights</span>
                    <button 
                      onClick={addNote}
                      className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                      <Plus size={14} /> NEW ENTRY
                    </button>
                  </div>
                  {notes.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center opacity-30 text-center px-10">
                      <FileText size={48} className="mb-4" />
                      <p className="font-serif italic text-sm">Empty ledger. Record your observations of the autonomous agents here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {notes.map(note => (
                        <div 
                          key={note.id}
                          onClick={() => { setActiveNote(note); setIsEditing(false); }}
                          className="document-card p-6 cursor-pointer group hover:border-accent transition-all animate-fade-in"
                        >
                          <h3 className="font-serif text-lg mb-2 text-text-primary group-hover:text-accent transition-colors">{note.title}</h3>
                          <p className="text-sm text-text-muted line-clamp-2 italic mb-4">{note.content || "Empty protocol..."}</p>
                          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-text-muted uppercase tracking-widest">
                              {new Date(note.timestamp).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="p-2 hover:bg-red-50 text-red-400 rounded-lg">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={() => setActiveNote(null)}
                      className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-accent transition-colors flex items-center gap-2"
                    >
                      ← BACK TO LEDGER
                    </button>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="btn-primary py-2 px-4 flex items-center gap-2"
                        >
                          <Save size={14} /> SAVE
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="btn-secondary py-2 px-4 flex items-center gap-2"
                        >
                          <Edit3 size={14} /> EDIT
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <input 
                        className="w-full bg-transparent border-none text-2xl font-serif text-text-primary focus:outline-none placeholder:opacity-30"
                        placeholder="Entry Title..."
                        value={activeNote.title}
                        onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                        autoFocus
                      />
                      <textarea 
                        className="w-full flex-1 bg-transparent border-none text-base font-serif italic text-text-secondary focus:outline-none resize-none leading-relaxed placeholder:opacity-20"
                        placeholder="Begin ledger entry..."
                        value={activeNote.content}
                        onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-3xl font-serif text-text-primary">{activeNote.title}</h2>
                      <div className="h-px bg-border-fine w-12" />
                      <p className="text-lg font-serif italic text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {activeNote.content || "Empty entry..."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-border-fine flex justify-between items-center opacity-30">
               <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Ledger v1.2</span>
               <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Local Storage</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
