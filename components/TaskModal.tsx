'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskCategory, CATEGORY_CONFIG } from '@/types';
import { useChecklist } from '@/context/ChecklistContext';

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingTask: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
    const { addTask, updateTask } = useChecklist();
    const inputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [scheduledTime, setScheduledTime] = useState('09:00');
    const [category, setCategory] = useState<TaskCategory>('other');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<{ name?: string }>({});

    // Reset or populate form
    useEffect(() => {
        if (isOpen) {
            if (editingTask) {
                setName(editingTask.name);
                setScheduledTime(editingTask.scheduledTime);
                setCategory(editingTask.category);
                setNotes(editingTask.notes || '');
            } else {
                setName('');
                setScheduledTime('09:00');
                setCategory('other');
                setNotes('');
            }
            setErrors({});

            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [editingTask, isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const validate = (): boolean => {
        const newErrors: { name?: string } = {};
        if (!name.trim()) {
            newErrors.name = 'Task name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const taskData = {
            name: name.trim(),
            scheduledTime,
            category,
            notes: notes.trim() || undefined,
            status: editingTask?.status || 'pending' as const,
        };

        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }

        onClose();
    };

    if (!isOpen) return null;

    const categories: TaskCategory[] = ['news', 'solution', 'image', 'prompt', 'other'];

    return (
        <div className="modal-backdrop animate-fadeIn" onClick={onClose}>
            <div
                className="modal-content animate-scaleIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#333]">
                    <h2 className="text-lg font-semibold">
                        {editingTask ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Task name */}
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">
                            Task Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({});
                            }}
                            placeholder="What needs to be done?"
                            className={`input input-lg ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Time and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">
                                Time
                            </label>
                            <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                                className="input cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {CATEGORY_CONFIG[cat].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category preview */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => {
                            const config = CATEGORY_CONFIG[cat];
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`
                    badge transition-all
                    ${config.bgColor} ${config.color} ${config.borderColor}
                    ${category === cat ? 'ring-2 ring-white/20' : 'opacity-50 hover:opacity-80'}
                  `}
                                >
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">
                            Notes <span className="text-white/30">(optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional details..."
                            rows={3}
                            className="input resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                        >
                            {editingTask ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
