'use client';

import React, { useState, useMemo } from 'react';
import { useChecklist } from '@/context/ChecklistContext';
import { Task, getTimePeriod, TimePeriod, TIME_PERIOD_CONFIG, sortTasksByTime, formatTime } from '@/types';
import TaskItem from './TaskItem';

const PERIOD_ORDER: TimePeriod[] = ['morning', 'afternoon', 'evening', 'night'];

// Copy icon
const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

// Check icon for copied state
const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

interface TaskListProps {
    onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
    const { activeChecklist } = useChecklist();
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showCompleted, setShowCompleted] = useState(true);
    const [copied, setCopied] = useState(false);

    // Get category name by id
    const getCategoryName = (categoryId: string): string => {
        if (!activeChecklist) return 'Unknown';
        const cat = activeChecklist.categories.find(c => c.id === categoryId);
        return cat?.name || 'Unknown';
    };

    // Copy all tasks status to clipboard
    const copyAllStatus = async () => {
        if (!activeChecklist || activeChecklist.tasks.length === 0) return;

        const sortedTasks = sortTasksByTime(activeChecklist.tasks);

        // Format: ✓ Task Name (Category) - 9:00 AM or ○ Task Name (Category) - 9:00 AM
        const statusText = sortedTasks.map(task => {
            const statusIcon = task.status === 'completed' ? '✓' : '○';
            const categoryName = getCategoryName(task.categoryId);
            const timeStr = formatTime(task.scheduledTime);
            return `${statusIcon} ${task.name} (${categoryName}) - ${timeStr}`;
        }).join('\n');

        const header = `📋 ${activeChecklist.name}\n${'─'.repeat(30)}\n`;
        const completedCount = sortedTasks.filter(t => t.status === 'completed').length;
        const footer = `\n${'─'.repeat(30)}\n✅ ${completedCount}/${sortedTasks.length} completed`;

        try {
            await navigator.clipboard.writeText(header + statusText + footer);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Get current time for highlighting
    const currentTime = useMemo(() => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }, []);

    // Filter and group tasks
    const { groupedTasks, filteredCount } = useMemo(() => {
        const groups: Record<TimePeriod, Task[]> = {
            morning: [],
            afternoon: [],
            evening: [],
            night: [],
        };

        if (!activeChecklist) return { groupedTasks: groups, filteredCount: 0 };

        let tasks = [...activeChecklist.tasks];

        // Apply filters
        if (categoryFilter !== 'all') {
            tasks = tasks.filter(t => t.categoryId === categoryFilter);
        }
        if (!showCompleted) {
            tasks = tasks.filter(t => t.status !== 'completed');
        }

        // Sort and group
        tasks = sortTasksByTime(tasks);
        tasks.forEach(task => {
            const period = getTimePeriod(task.scheduledTime);
            groups[period].push(task);
        });

        return { groupedTasks: groups, filteredCount: tasks.length };
    }, [activeChecklist, categoryFilter, showCompleted]);

    // Find current and upcoming tasks
    const { currentTaskId, upcomingTaskIds } = useMemo(() => {
        if (!activeChecklist) return { currentTaskId: null, upcomingTaskIds: [] as string[] };

        const pendingTasks = sortTasksByTime(
            activeChecklist.tasks.filter(t => t.status === 'pending')
        );

        // Find tasks at or after current time
        const futureOrCurrent = pendingTasks.filter(t => t.scheduledTime >= currentTime);
        const tasksToHighlight = futureOrCurrent.length > 0 ? futureOrCurrent : pendingTasks;

        return {
            currentTaskId: tasksToHighlight[0]?.id || null,
            upcomingTaskIds: tasksToHighlight.slice(1, 3).map(t => t.id),
        };
    }, [activeChecklist, currentTime]);

    if (!activeChecklist) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">Select a checklist</div>
                <div className="empty-state-desc">Choose a checklist from the sidebar or create a new one to get started.</div>
            </div>
        );
    }

    const categories = activeChecklist.categories || [];
    const completedCount = activeChecklist.tasks.filter(t => t.status === 'completed').length;
    const hasFilters = categoryFilter !== 'all' || !showCompleted;

    return (
        <div className="animate-fadeIn">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                {/* Category filters */}
                <div className="flex gap-1 flex-wrap">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${categoryFilter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                            }
                        `}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`
                                px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                                ${categoryFilter === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                                }
                            `}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Show/hide completed toggle */}
                {completedCount > 0 && (
                    <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${showCompleted
                                ? 'bg-white/5 text-white/50 hover:bg-white/10'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }
                        `}
                    >
                        {showCompleted ? `Hide completed (${completedCount})` : `Show completed (${completedCount})`}
                    </button>
                )}

                {/* Copy All Status button */}
                {activeChecklist.tasks.length > 0 && (
                    <button
                        onClick={copyAllStatus}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${copied
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                            }
                        `}
                        title="Copy all tasks status to clipboard"
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        {copied ? 'Copied!' : 'Copy All'}
                    </button>
                )}
            </div>

            {/* Task groups */}
            {PERIOD_ORDER.map(period => {
                const tasks = groupedTasks[period];
                if (tasks.length === 0) return null;

                const config = TIME_PERIOD_CONFIG[period];

                return (
                    <div key={period} className="mb-6 animate-slideUp">
                        {/* Period header */}
                        <div className="time-period">
                            <span className="time-period-icon">{config.icon}</span>
                            <span className="time-period-label">{config.label}</span>
                            <span className="time-period-count">{tasks.length}</span>
                        </div>

                        {/* Tasks */}
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onEdit={onEditTask}
                                    isCurrentTask={task.id === currentTaskId}
                                    isUpcoming={upcomingTaskIds.includes(task.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Empty states */}
            {activeChecklist.tasks.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <div className="empty-state-title">No tasks yet</div>
                    <div className="empty-state-desc">Click the "Add Task" button to create your first task.</div>
                </div>
            )}

            {activeChecklist.tasks.length > 0 && filteredCount === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">No matching tasks</div>
                    <div className="empty-state-desc">
                        {hasFilters ? (
                            <button
                                onClick={() => { setCategoryFilter('all'); setShowCompleted(true); }}
                                className="text-blue-400 hover:underline"
                            >
                                Clear filters
                            </button>
                        ) : (
                            'Try adjusting your filters.'
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;
