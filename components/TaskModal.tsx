'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskPriority, CATEGORY_COLORS, PRIORITY_CONFIG } from '@/types';
import { useChecklist } from '@/context/ChecklistContext';

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingTask: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
    const { addTask, updateTask, activeChecklist, addCategory, deleteCategory } = useChecklist();
    const inputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [scheduledTime, setScheduledTime] = useState('09:00');
    const [categoryId, setCategoryId] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('normal');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<{ name?: string }>({});

    // Time limit
    const [hasTimeLimit, setHasTimeLimit] = useState(false);
    const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes

    // New category form
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

    // Reset or populate form
    useEffect(() => {
        if (isOpen && activeChecklist) {
            if (editingTask) {
                setName(editingTask.name);
                setScheduledTime(editingTask.scheduledTime);
                setCategoryId(editingTask.categoryId);
                setPriority(editingTask.priority || 'normal');
                setNotes(editingTask.notes || '');
                setHasTimeLimit(!!editingTask.timeLimit);
                setTimeLimit(editingTask.timeLimit || 30);
            } else {
                setName('');
                setScheduledTime('09:00');
                setCategoryId(activeChecklist.categories[0]?.id || '');
                setNotes('');
                setHasTimeLimit(false);
                setTimeLimit(30);
            }
            setErrors({});
            setShowNewCategory(false);
            setNewCategoryName('');

            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [editingTask, isOpen, activeChecklist]);

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

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            const newId = addCategory(newCategoryName.trim(), newCategoryColor);
            if (newId) {
                setCategoryId(newId);
            }
            setNewCategoryName('');
            setShowNewCategory(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const taskData = {
            name: name.trim(),
            scheduledTime,
            categoryId,
            priority,
            notes: notes.trim() || undefined,
            timeLimit: hasTimeLimit ? timeLimit : undefined,
            status: editingTask?.status || 'pending' as const,
        };

        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }

        onClose();
    };

    if (!isOpen || !activeChecklist) return null;

    const categories = activeChecklist.categories || [];

    return (
        <div className="modal-backdrop animate-fadeIn" onClick={onClose}>
            <div
                className="modal-content animate-scaleIn"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800">
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
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="input cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Time Limit */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-white/60">
                                Time Limit <span className="text-white/30">(optional)</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setHasTimeLimit(!hasTimeLimit)}
                                className={`
                                    relative w-10 h-5 rounded-full transition-colors
                                    ${hasTimeLimit ? 'bg-blue-600' : 'bg-white/20'}
                                `}
                            >
                                <span
                                    className={`
                                        absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform
                                        ${hasTimeLimit ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </button>
                        </div>
                        {hasTimeLimit && (
                            <div className="flex items-center gap-3 animate-fadeIn">
                                <input
                                    type="number"
                                    min="1"
                                    max="480"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(Math.max(1, Math.min(480, parseInt(e.target.value) || 1)))}
                                    className="input w-24 text-center"
                                />
                                <span className="text-sm text-white/60">minutes</span>
                                <div className="flex gap-2 ml-auto">
                                    {[15, 30, 60].map(mins => (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setTimeLimit(mins)}
                                            className={`
                                                px-2 py-1 rounded text-xs font-medium transition-all
                                                ${timeLimit === mins
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            {mins}m
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Priority selector */}
                    <div>
                        <label className="block text-sm text-white/60 mb-2">
                            Priority <span className="text-white/30">(affects notification timing)</span>
                        </label>
                        <div className="flex gap-2">
                            {(['normal', 'medium', 'high'] as TaskPriority[]).map(p => {
                                const config = PRIORITY_CONFIG[p];
                                const isSelected = priority === p;
                                const notifyText = config.notifyMinutesBefore.map(m => m === 0 ? 'on time' : `${m}m before`).join(', ');
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`
                                            flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                                            ${isSelected
                                                ? 'border-white/30 bg-white/10'
                                                : 'border-transparent bg-white/5 opacity-60 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: config.color }}
                                            />
                                            <span>{config.label}</span>
                                        </div>
                                        <div className="text-[10px] text-white/40">
                                            {notifyText}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category chips */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                className={`
                                    group relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer
                                    ${categoryId === cat.id
                                        ? 'ring-2 ring-white/30 bg-white/10'
                                        : 'bg-white/5 opacity-60 hover:opacity-100'
                                    }
                                `}
                                onClick={() => setCategoryId(cat.id)}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                                {/* Delete button - only show if more than 1 category */}
                                {categories.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete category "${cat.name}"?`)) {
                                                deleteCategory(cat.id);
                                                // If deleted category was selected, select first remaining
                                                if (categoryId === cat.id) {
                                                    const remaining = categories.find(c => c.id !== cat.id);
                                                    if (remaining) setCategoryId(remaining.id);
                                                }
                                            }
                                        }}
                                        className="ml-1 w-4 h-4 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                        title="Delete category"
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowNewCategory(true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
                        >
                            <PlusIcon />
                            Add
                        </button>
                    </div>

                    {/* New Category Form */}
                    {showNewCategory && (
                        <div className="p-3 bg-zinc-800/50 rounded-lg space-y-3 animate-fadeIn">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category name"
                                    className="input flex-1 py-2 text-sm"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    disabled={!newCategoryName.trim()}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCategory(false)}
                                    className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {CATEGORY_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewCategoryColor(color)}
                                        className={`w-6 h-6 rounded-full transition-all ${newCategoryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-800' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

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
