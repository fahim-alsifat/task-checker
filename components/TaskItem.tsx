'use client';

import React from 'react';
import { Task, CATEGORY_CONFIG, formatTime } from '@/types';
import { useChecklist } from '@/context/ChecklistContext';

// Icons
const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface TaskItemProps {
    task: Task;
    onEdit: (task: Task) => void;
    isCurrentTask?: boolean;
    isUpcoming?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, isCurrentTask, isUpcoming }) => {
    const { toggleTaskStatus, deleteTask } = useChecklist();
    const isCompleted = task.status === 'completed';
    const categoryConfig = CATEGORY_CONFIG[task.category];

    // Build class names
    let containerClasses = 'task-item group';
    if (isCompleted) containerClasses += ' task-completed';
    else if (isCurrentTask) containerClasses += ' task-current';
    else if (isUpcoming) containerClasses += ' task-upcoming';

    return (
        <div className={containerClasses}>
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`
            checkbox mt-0.5 flex-shrink-0
            ${isCompleted ? 'checkbox-checked animate-checkPop' : ''}
          `}
                    aria-label={isCompleted ? 'Mark as pending' : 'Mark as complete'}
                >
                    {isCompleted && <CheckIcon />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Task name and badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`task-name font-medium ${isCompleted ? 'text-white/50' : 'text-white'}`}>
                            {task.name}
                        </span>

                        {/* Category badge */}
                        <span className={`badge ${categoryConfig.bgColor} ${categoryConfig.color} ${categoryConfig.borderColor}`}>
                            {categoryConfig.label}
                        </span>

                        {/* Current indicator */}
                        {isCurrentTask && !isCompleted && (
                            <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                Now
                            </span>
                        )}
                    </div>

                    {/* Time and meta */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                            <ClockIcon />
                            {formatTime(task.scheduledTime)}
                        </span>

                        {isCompleted && task.completedAt && (
                            <span className="text-emerald-400/60">
                                ✓ Completed
                            </span>
                        )}
                    </div>

                    {/* Notes */}
                    {task.notes && (
                        <p className="text-xs text-white/30 mt-2 line-clamp-2">
                            {task.notes}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        title="Edit task"
                    >
                        <EditIcon />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this task?')) {
                                deleteTask(task.id);
                            }
                        }}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                        title="Delete task"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
