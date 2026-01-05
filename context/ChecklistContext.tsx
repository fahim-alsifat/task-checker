'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Checklist, Task, generateId, getRandomColor, getTodayDate } from '@/types';

const STORAGE_KEY = 'task-checker-v2';

interface ChecklistContextType {
    // State
    checklists: Checklist[];
    activeChecklistId: string | null;
    activeChecklist: Checklist | null;
    isLoading: boolean;

    // Checklist operations
    addChecklist: (name: string) => void;
    deleteChecklist: (id: string) => void;
    renameChecklist: (id: string, name: string) => void;
    duplicateChecklist: (id: string) => void;
    setActiveChecklist: (id: string | null) => void;
    clearCompletedTasks: () => void;
    toggleAutoReset: (id: string) => void;
    toggleNotifications: (id: string) => void;

    // Task operations
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    toggleTaskStatus: (taskId: string) => void;
    reorderTasks: (taskIds: string[]) => void;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export const useChecklist = () => {
    const context = useContext(ChecklistContext);
    if (!context) {
        throw new Error('useChecklist must be used within a ChecklistProvider');
    }
    return context;
};

interface ChecklistProviderProps {
    children: ReactNode;
}

export const ChecklistProvider: React.FC<ChecklistProviderProps> = ({ children }) => {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check and perform auto-reset for checklists
    const performAutoReset = useCallback((checklistsData: Checklist[]): Checklist[] => {
        const today = getTodayDate();

        return checklistsData.map(checklist => {
            // Skip if auto-reset is disabled or already reset today
            if (!checklist.autoReset || checklist.lastResetDate === today) {
                return checklist;
            }

            // Reset all completed tasks to pending
            const resetTasks = checklist.tasks.map(task => ({
                ...task,
                status: 'pending' as const,
                completedAt: undefined,
            }));

            return {
                ...checklist,
                tasks: resetTasks,
                lastResetDate: today,
            };
        });
    }, []);

    // Load from localStorage and perform auto-reset
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Migrate old checklists without autoReset property
                const migratedChecklists = (data.checklists || []).map((c: Checklist) => ({
                    ...c,
                    autoReset: c.autoReset ?? false,
                    notifications: true, // Force enable all notifications as per user request
                }));
                // Perform auto-reset check
                const resetChecklists = performAutoReset(migratedChecklists);
                setChecklists(resetChecklists);
                setActiveChecklistId(data.activeChecklistId || null);
            }
        } catch (e) {
            console.error('Failed to load data:', e);
        }
        setIsLoading(false);
    }, [performAutoReset]);

    // Check for midnight reset periodically (every minute)
    useEffect(() => {
        const checkMidnightReset = () => {
            const now = new Date();
            // Check if it's around midnight (within first minute of the day)
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                setChecklists(prev => performAutoReset(prev));
            }
        };

        // Check every minute
        const interval = setInterval(checkMidnightReset, 60000);
        return () => clearInterval(interval);
    }, [performAutoReset]);

    // Save to localStorage
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ checklists, activeChecklistId }));
            } catch (e) {
                console.error('Failed to save data:', e);
            }
        }
    }, [checklists, activeChecklistId, isLoading]);

    const activeChecklist = checklists.find(c => c.id === activeChecklistId) || null;

    // Checklist operations
    const addChecklist = useCallback((name: string) => {
        const newChecklist: Checklist = {
            id: generateId(),
            name: name.trim() || 'Untitled',
            tasks: [],
            createdAt: new Date().toISOString(),
            color: getRandomColor(),
            autoReset: false, // Default to off
            notifications: true, // Default to on
        };
        setChecklists(prev => [...prev, newChecklist]);
        setActiveChecklistId(newChecklist.id);
    }, []);

    const deleteChecklist = useCallback((id: string) => {
        setChecklists(prev => {
            const filtered = prev.filter(c => c.id !== id);
            if (activeChecklistId === id) {
                const remaining = filtered.find(c => c.id !== id);
                setActiveChecklistId(remaining?.id || null);
            }
            return filtered;
        });
    }, [activeChecklistId]);

    const renameChecklist = useCallback((id: string, name: string) => {
        setChecklists(prev => prev.map(c => c.id === id ? { ...c, name: name.trim() || 'Untitled' } : c));
    }, []);

    const duplicateChecklist = useCallback((id: string) => {
        const original = checklists.find(c => c.id === id);
        if (!original) return;

        const duplicated: Checklist = {
            ...original,
            id: generateId(),
            name: `${original.name} (Copy)`,
            createdAt: new Date().toISOString(),
            autoReset: original.autoReset,
            lastResetDate: undefined, // Reset the last reset date for the copy
            tasks: original.tasks.map(t => ({
                ...t,
                id: generateId(),
                status: 'pending' as const,
                completedAt: undefined,
            })),
        };
        setChecklists(prev => [...prev, duplicated]);
        setActiveChecklistId(duplicated.id);
    }, [checklists]);

    const setActiveChecklist = useCallback((id: string | null) => {
        setActiveChecklistId(id);
    }, []);

    const clearCompletedTasks = useCallback(() => {
        if (!activeChecklistId) return;
        setChecklists(prev => prev.map(c =>
            c.id === activeChecklistId
                ? { ...c, tasks: c.tasks.filter(t => t.status !== 'completed') }
                : c
        ));
    }, [activeChecklistId]);

    // Toggle auto-reset for a checklist
    const toggleAutoReset = useCallback((id: string) => {
        setChecklists(prev => prev.map(c =>
            c.id === id ? { ...c, autoReset: !c.autoReset } : c
        ));
    }, []);

    // Toggle notifications for a checklist
    const toggleNotifications = useCallback((id: string) => {
        setChecklists(prev => prev.map(c =>
            c.id === id ? { ...c, notifications: !c.notifications } : c
        ));
    }, []);

    // Task operations
    const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
        if (!activeChecklistId) return;

        const newTask: Task = {
            ...task,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        setChecklists(prev => prev.map(c =>
            c.id === activeChecklistId
                ? { ...c, tasks: [...c.tasks, newTask] }
                : c
        ));
    }, [activeChecklistId]);

    const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
        if (!activeChecklistId) return;

        setChecklists(prev => prev.map(c =>
            c.id === activeChecklistId
                ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }
                : c
        ));
    }, [activeChecklistId]);

    const deleteTask = useCallback((taskId: string) => {
        if (!activeChecklistId) return;

        setChecklists(prev => prev.map(c =>
            c.id === activeChecklistId
                ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) }
                : c
        ));
    }, [activeChecklistId]);

    const toggleTaskStatus = useCallback((taskId: string) => {
        if (!activeChecklistId) return;

        setChecklists(prev => prev.map(c =>
            c.id === activeChecklistId
                ? {
                    ...c,
                    tasks: c.tasks.map(t =>
                        t.id === taskId
                            ? {
                                ...t,
                                status: t.status === 'pending' ? 'completed' : 'pending',
                                completedAt: t.status === 'pending' ? new Date().toISOString() : undefined,
                            }
                            : t
                    ),
                }
                : c
        ));
    }, [activeChecklistId]);

    const reorderTasks = useCallback((taskIds: string[]) => {
        if (!activeChecklistId) return;

        setChecklists(prev => prev.map(c => {
            if (c.id !== activeChecklistId) return c;

            const taskMap = new Map(c.tasks.map(t => [t.id, t]));
            const reordered = taskIds.map(id => taskMap.get(id)).filter((t): t is Task => t !== undefined);
            return { ...c, tasks: reordered };
        }));
    }, [activeChecklistId]);

    return (
        <ChecklistContext.Provider
            value={{
                checklists,
                activeChecklistId,
                activeChecklist,
                isLoading,
                addChecklist,
                deleteChecklist,
                renameChecklist,
                duplicateChecklist,
                setActiveChecklist,
                clearCompletedTasks,
                toggleAutoReset,
                toggleNotifications,
                addTask,
                updateTask,
                deleteTask,
                toggleTaskStatus,
                reorderTasks,
            }}
        >
            {children}
        </ChecklistContext.Provider>
    );
};
