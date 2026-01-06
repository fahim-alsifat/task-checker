'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChecklist } from '@/context/ChecklistContext';
import { useNotifications } from '@/hooks/useNotifications';

// Icons
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ChecklistIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const BellIcon = ({ active }: { active?: boolean }) => (
    <svg className="w-4 h-4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const {
        checklists,
        activeChecklistId,
        setActiveChecklist,
        addChecklist,
        deleteChecklist,
        duplicateChecklist,
        toggleNotifications,
        isLoading
    } = useChecklist();

    const [newListName, setNewListName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Notification permission hook
    const { permission, requestPermission, isSupported } = useNotifications();

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    const handleAddChecklist = () => {
        if (newListName.trim()) {
            addChecklist(newListName.trim());
            setNewListName('');
            setIsAdding(false);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddChecklist();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewListName('');
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky inset-y-0 left-0 z-50 lg:top-0 lg:h-screen
          sidebar transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#252525]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <ChecklistIcon />
                        </div>
                        <span className="font-semibold">Task Checker</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Checklists section */}
                <div className="flex-1 overflow-y-auto p-3">
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                            My Checklists
                        </span>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                            title="New checklist"
                        >
                            <PlusIcon />
                        </button>
                    </div>

                    {/* Add new checklist input */}
                    {isAdding && (
                        <div className="mb-2 animate-slideDown">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => {
                                    if (!newListName.trim()) {
                                        setTimeout(() => setIsAdding(false), 100);
                                    }
                                }}
                                placeholder="Checklist name..."
                                className="input"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleAddChecklist}
                                    className="btn btn-primary flex-1 py-1.5 text-xs"
                                    disabled={!newListName.trim()}
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => { setIsAdding(false); setNewListName(''); }}
                                    className="btn btn-secondary flex-1 py-1.5 text-xs"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton h-10 rounded-lg" />
                            ))}
                        </div>
                    )}

                    {/* Checklist items */}
                    {!isLoading && (
                        <div className="space-y-1">
                            {checklists.map((checklist) => {
                                const isActive = activeChecklistId === checklist.id;
                                const completedCount = checklist.tasks.filter(t => t.status === 'completed').length;
                                const totalCount = checklist.tasks.length;

                                return (
                                    <div
                                        key={checklist.id}
                                        onClick={() => {
                                            setActiveChecklist(checklist.id);
                                            onClose();
                                        }}
                                        className={`
                      group sidebar-item
                      ${isActive ? 'sidebar-item-active' : 'text-white/60'}
                    `}
                                    >
                                        {/* Color indicator */}
                                        <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: checklist.color }}
                                        />

                                        {/* Name */}
                                        <span className="flex-1 truncate text-sm">{checklist.name}</span>

                                        {/* Task count */}
                                        <span className="text-xs text-white/30">
                                            {completedCount}/{totalCount}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    // If enabling and permission not granted, request it first
                                                    if (!checklist.notifications && isSupported) {
                                                        if (permission !== 'granted') {
                                                            const granted = await requestPermission();
                                                            if (!granted) {
                                                                alert('Please allow notifications in your browser to enable this feature!');
                                                                return;
                                                            }
                                                        }
                                                    }
                                                    toggleNotifications(checklist.id);
                                                }}
                                                className={`p-1 hover:bg-white/10 rounded transition-colors ${checklist.notifications ? 'text-amber-400' : 'text-white/40 hover:text-white'}`}
                                                title={checklist.notifications ? 'Disable notifications' : 'Enable notifications'}
                                            >
                                                <BellIcon active={checklist.notifications} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    duplicateChecklist(checklist.id);
                                                }}
                                                className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                                                title="Duplicate"
                                            >
                                                <CopyIcon />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Delete "${checklist.name}"?`)) {
                                                        deleteChecklist(checklist.id);
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && checklists.length === 0 && !isAdding && (
                        <div className="text-center py-8">
                            <div className="text-3xl mb-3 opacity-30">📋</div>
                            <p className="text-sm text-white/40 mb-3">No checklists yet</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="btn btn-primary text-xs"
                            >
                                <PlusIcon />
                                Create First Checklist
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#252525]">
                    <div className="text-xs text-white/30 text-center">
                        {checklists.length} checklist{checklists.length !== 1 ? 's' : ''} • {
                            checklists.reduce((acc, c) => acc + c.tasks.length, 0)
                        } tasks
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
