# Task Checker ✅

A beautiful, modern productivity app for managing daily tasks and checklists. Built with Next.js 14, TypeScript, and Tailwind CSS.

![Task Checker](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

- **Multiple Checklists** - Create and manage multiple task lists
- **Time Scheduling** - Assign specific times to tasks
- **Category Tags** - Organize tasks by category (News, Solution, Image, Prompt, Other)
- **Daily Reset** - Auto-reset completed tasks at midnight
- **Progress Tracking** - Visual progress bar and statistics
- **Dark Mode** - Beautiful dark theme with modern UI
- **Mobile Responsive** - Works great on all devices
- **Local Storage** - Data persists in browser

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/task-checker.git

# Navigate to project
cd task-checker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context
- **Storage**: LocalStorage

## 📁 Project Structure

```
task-checker/
├── app/
│   ├── globals.css    # Global styles & animations
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/
│   ├── Sidebar.tsx    # Checklist navigation
│   ├── ProgressSummary.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── TaskModal.tsx
├── context/
│   └── ChecklistContext.tsx
└── types.ts           # TypeScript definitions
```

## 📝 License

MIT License - feel free to use this project!

---

Made with ❤️ using Next.js and Tailwind CSS
