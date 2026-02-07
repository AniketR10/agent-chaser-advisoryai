# Agentic Chaser – AdvisoryAI Hackathon Challenge

Agentic Chaser is an intelligent dashboard designed for financial advisors to automate client chasing, track case progress, and generate AI-driven action scripts. It creates a timeline-based workflow to demonstrate agentic behavior in financial advisory contexts.

![Agentic Chaser Dashboard](dashboard.png)

## 🚀 Features

### 1. Active Case Dashboard

- **Real-time Table**  
  Displays a list of active client cases sorted by the most recent import or creation date.

- **Status Tracking**  
  Visual badges showing the latest completed action (e.g., _"Eligible for spousal ISA transfer"_) or a fallback **"No Activity"** status.

- **Dynamic Columns**
  - Client Name & Client ID badges  
  - Latest Action with AI-cleaned text (removes technical prefixes)  
  - Last Update time using real-world relative time (e.g., _"less than a minute ago"_)

- **Case Management**  
  Trash button to delete cases directly from the table row.

---

### 2. Case Details & AI Scripting

- **Comprehensive Client View**  
  A centered modal displaying detailed case information.

- **Header Information**
  - Client Name  
  - Client ID  
  - Provider  

- **Client Intelligence**  
  Three-column layout showing:
  - Identified Risks  
  - Goals  
  - Financial Summary (Net Worth)

- **Activity Timeline**  
  A sorted history of interactions, ensuring the latest actions appear at the top.

- **Agentic Script Generator**
  - Select an **Upcoming Action** to generate a tailored call/email script using **Groq (GPT OSS/120B open source free model)**  
  - **Mark as Done** instantly updates the timeline, marks the action as complete, and refreshes the data



## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)  
- **Database:** Postgres (Neon)  
- **AI / LLM:** Groq SDK (openai/gpt-oss-120b)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **UI Components:** shadcn/ui  
- **Icons:** Lucide React  

---

## ⚙️ Setup Instructions

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agent-chaser-advisoryai.git
cd agent-chaser
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables
Create a .env file in the root directory and add the following keys as it is:
```bash
GROQ_API_KEY="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"

DATABASE_URL="postgresql://neondb_owner:npg_nTe3sJIQAB2g@ep-rough-shadow-a1049bzc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

```

### 4. Run the Application

```bash
npm run dev
```

## 📂 How to Test (Test Files)

This repository includes a `testfiles/` folder containing sample client data.

### ⚠️ Important: File Support

- The system **ONLY accepts `.txt` files**
- Do **NOT** upload PDFs or Word documents

### Testing Workflow

1. Navigate to the dashboard  
2. Click **Import Client**
3. Select a file from the `testfiles/` folder (e.g., `client_a.txt`)  

The AI will automatically extract:

- Client ID  
- Goals  
- Risks  
- Next Actions etc.

…and populate the dashboard accordingly.

