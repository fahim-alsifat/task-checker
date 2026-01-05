'use client';

import React from 'react';
import { useChecklist } from '@/context/ChecklistContext';

// Toggle switch icon
const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const ProgressSummary: React.FC = () => {
    const { activeChecklist, clearCompletedTasks, toggleAutoReset } = useChecklist();

    if (!activeChecklist) return null;

    const totalTasks = activeChecklist.tasks.length;
    const completedTasks = activeChecklist.tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // Get time-based greeting
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="card p-6 mb-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-zinc-500 text-sm mb-1">{dateStr}</p>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span
                            className="w-3 h-3 rounded-full shadow-lg"
                            style={{ backgroundColor: activeChecklist.color, boxShadow: `0 0 12px ${activeChecklist.color}50` }}
                        />
                        {activeChecklist.name}
                    </h2>
                </div>
                {completedTasks > 0 && (
                    <button
                        onClick={() => {
                            if (confirm(`Clear ${completedTasks} completed task${completedTasks !== 1 ? 's' : ''}?`)) {
                                clearCompletedTasks();
                            }
                        }}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-500/10 rounded-lg"
                    >
                        Clear completed
                    </button>
                )}
            </div>

            {/* Stats */}
            {totalTasks > 0 ? (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-5">
                        <div className="text-center p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                            <div className="text-3xl font-bold">{totalTasks}</div>
                            <div className="text-xs text-zinc-500 mt-1 font-medium">Total</div>
                        </div>
                        <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <div className="text-3xl font-bold text-emerald-400">{completedTasks}</div>
                            <div className="text-xs text-emerald-400/70 mt-1 font-medium">Complete</div>
                        </div>
                        <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <div className="text-3xl font-bold text-amber-400">{pendingTasks}</div>
                            <div className="text-xs text-amber-400/70 mt-1 font-medium">Pending</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-5">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2.5 text-sm">
                            <span className="text-zinc-500 font-medium">{progressPercent}% complete</span>
                            {pendingTasks === 0 ? (
                                <span className="text-emerald-400 font-semibold">All done! 🎉</span>
                            ) : (
                                <span className="text-zinc-500">{pendingTasks} remaining</span>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-6 text-zinc-400 mb-5">
                    <p className="text-lg">{greeting}! ✨</p>
                    <p className="text-sm text-zinc-500 mt-1">Ready to add some tasks?</p>
                </div>
            )}

            {/* Auto-reset toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeChecklist.autoReset ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                        <RefreshIcon />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Daily Reset</p>
                        <p className="text-xs text-zinc-500">Auto-reset all tasks at midnight</p>
                    </div>
                </div>
                <button
                    onClick={() => toggleAutoReset(activeChecklist.id)}
                    className={`toggle ${activeChecklist.autoReset ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                    <span className={`toggle-thumb ${activeChecklist.autoReset ? 'left-6' : 'left-1'}`} />
                </button>
            </div>

            {activeChecklist.autoReset && (
                <p className="text-xs text-emerald-400/80 mt-3 text-center font-medium">
                    ✓ Tasks will automatically reset every day at 12:00 AM
                </p>
            )}
        </div>
    );
};

export default ProgressSummary;
