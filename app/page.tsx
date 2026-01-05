'use client';

import React, { useState, useEffect } from 'react';
import Sidebar, { MenuIcon } from '@/components/Sidebar';
import ProgressSummary from '@/components/ProgressSummary';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import { useChecklist } from '@/context/ChecklistContext';
import { useTaskNotifications } from '@/hooks/useNotifications';
import { Task } from '@/types';

// Icons
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function Home() {
    const { activeChecklist, checklists, isLoading } = useChecklist();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Initialize task notifications monitoring
    const { permission, isSupported, requestPermission } = useTaskNotifications(checklists);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Enable notification function - requests permission and sends test
    const enableNotifications = async () => {
        if (!isSupported) {
            alert('Browser does not support notifications!');
            return;
        }
        if (permission !== 'granted') {
            const granted = await requestPermission();
            if (!granted) {
                alert('Please allow notifications!');
                return;
            }
        }
        setNotificationsEnabled(true);
        // Send test notification
        new Notification('✅ Notifications Enabled!', {
            body: 'You will now receive notifications for your scheduled tasks.',
            icon: '/favicon.ico'
        });
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingTask(null);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-30 glass border-b border-zinc-800/50">
                    <div className="flex items-center justify-between px-4 py-4 max-w-4xl mx-auto w-full">
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2.5 hover:bg-zinc-800 rounded-xl transition-colors"
                                aria-label="Open menu"
                            >
                                <MenuIcon />
                            </button>

                            {/* Title - visible on mobile */}
                            <div className="lg:hidden flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <CheckIcon />
                                </div>
                                <span className="font-bold text-lg">TaskChecker</span>
                            </div>

                            {/* Breadcrumb - visible on desktop when checklist selected */}
                            {activeChecklist && (
                                <div className="hidden lg:flex items-center gap-2.5 text-zinc-400">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shadow-lg"
                                        style={{ backgroundColor: activeChecklist.color, boxShadow: `0 0 10px ${activeChecklist.color}40` }}
                                    />
                                    <span className="text-sm font-medium">{activeChecklist.name}</span>
                                    {activeChecklist.autoReset && (
                                        <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                            Auto-reset
                                        </span>
                                    )}
                                    {activeChecklist.notifications && (
                                        <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 flex items-center gap-1">
                                            🔔 Notifications
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right side - Add task button */}
                        {activeChecklist && (
                            <div className="flex items-center gap-2">
                                {!notificationsEnabled && permission !== 'granted' ? (
                                    <button
                                        onClick={enableNotifications}
                                        className="btn btn-secondary text-xs px-3"
                                        title="Enable notifications"
                                    >
                                        🔔 Enable Notifications
                                    </button>
                                ) : (
                                    <span className="text-xs text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        ✅ Notifications On
                                    </span>
                                )}
                                <button onClick={handleAddTask} className="btn btn-primary">
                                    <PlusIcon />
                                    <span className="hidden sm:inline">Add Task</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-3xl mx-auto">
                        {activeChecklist ? (
                            <>
                                <ProgressSummary />
                                <TaskList onEditTask={handleEditTask} />
                            </>
                        ) : (
                            /* Welcome screen */
                            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                                {/* Logo */}
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-glow">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-600/20 to-cyan-400/20 blur-2xl -z-10" />
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                    Welcome to <span className="gradient-text">TaskChecker</span>
                                </h1>
                                <p className="text-zinc-400 max-w-md mb-10 text-lg">
                                    Your personal productivity companion. Organize tasks, track progress, and achieve your goals.
                                </p>

                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="btn btn-primary px-8 py-3 text-base"
                                >
                                    <PlusIcon />
                                    Create Your First Checklist
                                </button>

                                {/* Features */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl">
                                    {[
                                        { icon: '📋', title: 'Multiple Lists', desc: 'Organize different projects separately' },
                                        { icon: '⏰', title: 'Time Scheduling', desc: 'Plan your day with time slots' },
                                        { icon: '🔄', title: 'Daily Reset', desc: 'Auto-reset tasks at midnight' },
                                    ].map((feature, i) => (
                                        <div key={i} className="feature-card">
                                            <div className="text-3xl mb-3">{feature.icon}</div>
                                            <div className="font-semibold mb-1">{feature.title}</div>
                                            <div className="text-xs text-zinc-500">{feature.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FAB for mobile */}
                {activeChecklist && (
                    <button
                        onClick={handleAddTask}
                        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/40 flex items-center justify-center hover:from-blue-500 hover:to-blue-400 active:scale-95 transition-all z-20"
                        aria-label="Add task"
                    >
                        <PlusIcon />
                    </button>
                )}
            </main>

            {/* Modal */}
            <TaskModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                editingTask={editingTask}
            />
        </div>
    );
}
