'use client';

import React, { useState } from 'react';
import Sidebar, { MenuIcon } from '@/components/Sidebar';
import ProgressSummary from '@/components/ProgressSummary';
import TaskList from '@/components/TaskList';
import TaskModal from '@/components/TaskModal';
import { useChecklist } from '@/context/ChecklistContext';
import { useTaskNotifications } from '@/hooks/useNotifications';
import { Task } from '@/types';

// Icons
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const BellIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export default function Home() {
    const { activeChecklist, checklists, isLoading, toggleNotifications } = useChecklist();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Initialize task notifications monitoring
    const { permission, isSupported, requestPermission } = useTaskNotifications(checklists);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // Enable notification function
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
        if (activeChecklist && !activeChecklist.notifications) {
            toggleNotifications(activeChecklist.id);
        }
        setNotificationsEnabled(true);
        new Notification('✅ Notifications Enabled!', {
            body: 'You will now receive notifications for your scheduled tasks.',
            icon: '/favicon.ico'
        });
    };

    // Test notification
    const sendTestNow = () => {
        if (!activeChecklist) return;
        const pendingTasks = activeChecklist.tasks.filter(t => t.status !== 'completed');
        if (pendingTasks.length === 0) {
            alert('No pending tasks!');
            return;
        }
        const task = pendingTasks[0];
        new Notification(`🔔 TEST: ${task.name}`, {
            body: `Scheduled: ${task.scheduledTime}`,
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
                <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/50">
                    <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3">
                        {/* Left side */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                                aria-label="Open menu"
                            >
                                <MenuIcon />
                            </button>

                            {/* Breadcrumb */}
                            {activeChecklist && (
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: activeChecklist.color }}
                                    />
                                    <span className="text-sm font-medium text-white/90 truncate">{activeChecklist.name}</span>
                                    {/* Hide badges on very small screens */}
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        {activeChecklist.autoReset && (
                                            <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded whitespace-nowrap">
                                                Auto-reset
                                            </span>
                                        )}
                                        {activeChecklist.notifications && (
                                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded flex items-center gap-1 whitespace-nowrap">
                                                <BellIcon />
                                                <span className="hidden md:inline">Notifications</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right side */}
                        {activeChecklist && (
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                {!notificationsEnabled && permission !== 'granted' ? (
                                    <button
                                        onClick={enableNotifications}
                                        className="text-xs px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <BellIcon />
                                        <span className="hidden sm:inline">Enable</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={sendTestNow}
                                        className="text-xs px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                                    >
                                        Test
                                    </button>
                                )}
                                <button
                                    onClick={handleAddTask}
                                    className="text-sm px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                                >
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
