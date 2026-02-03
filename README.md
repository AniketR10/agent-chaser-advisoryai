# Agentic Chaser - AdvisoryAI Hackathon Challenge

**Agentic Chaser** is an intelligent dashboard designed for financial advisors to automate client chasing, track case progress, and generate AI-driven action scripts. It simulates a timeline-based workflow (virtual date) to demonstrate agentic behavior in financial advisory contexts.

![Agentic Chaser Dashboard](https://via.placeholder.com/1200x600?text=Agentic+Chaser+Dashboard+Preview)

## 🚀 Features

### 1. **Active Case Dashboard**
* **Real-time Table**: Displays a list of active client cases sorted by the most recent import or creation date.
* **Status Tracking**: Visual badges showing the latest completed action (e.g., *"Eligible for spousal ISA transfer"*) or a fallback "No Activity" status.
* **Dynamic Columns**: 
    * **Client Name** & **Policy ID** badges.
    * **Latest Action** with AI-cleaned text (removes technical prefixes).
    * **Last Update** time using real-world relative time (e.g., "less than a minute ago").
* **Case Management**: Integrated "Trash" button to delete cases directly from the table row.

### 2. **Case Details & AI Scripting (Popup)**
* **Comprehensive Client View**: A centered modal displaying detailed case information.
    * **Header**: Client Name, Policy ID, Urgency, Provider, and **Next Review Date**.
    * **Client Intelligence**: Three-column layout showing Identified Risks, Goals, and Financial Summary (Net Worth).
* **Activity Timeline**: A sorted history of interactions (Agent vs. Client vs. Provider), ensuring the latest actions appear at the top.
* **Agentic Script Generator**:
    * Select an "Upcoming Action" to generate a tailored call/email script.
    * **Mark as Done**: Instantly updates the timeline, marks the action as complete, and refreshes the data via Server Actions.

### 3. **Virtual Time Simulation**
* The app operates on a "Virtual Date" (e.g., `2026-02-02`), allowing users to simulate future scenarios and track how long cases have been stagnant relative to the simulation.

## 🛠️ Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Dialog, Table, Badges, Buttons, Cards)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Date Management**: `date-fns`
