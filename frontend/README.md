🎫 TicketHub Pro | Enterprise Incident Management System
TicketHub Pro is a high-fidelity, high-contrast technical support pipeline designed for modern enterprise environments. Built with a decoupled architecture using Django REST Framework and React (Vite), it provides a secure, role-based ecosystem for raising, managing, and resolving technical incidents with massive visibility and real-time analytics.

🏗️ System Architecture
The platform is built on the DRF-React-Postgres stack, ensuring high performance and data integrity.

Frontend: React 18+ (Vite), Tailwind CSS (Massive Typography Design), Lucide Icons.

Backend: Django 5.0, Django REST Framework (Token Auth).

Database: PostgreSQL v16 Engine.

Reporting: Matplotlib & Seaborn for automated analytical visualization.

🚀 Key Modules
👤 Buyer Module (Dispatch Engine)
The entry point for end-users to report issues.

Locked Identity: Securely pulls user profile data from localStorage to prevent forged records.

Massive Form UI: High-visibility inputs for Ticket Subjects and Contextual Documentation.

Smart Triage: Priority-based SLA calculation (Auto-calculates due dates on the backend).

🛠️ Vendor Module (Expert Interface)
The resolution console for department-specific agents.

Targeted Queue: Filters "Master Points" based on the agent's assigned category.

Resolution Console: A specialized slate-themed environment for committing technical fixes.

Volume Analytics: Sticky sidebar featuring real-time workload and priority density charts.

👑 Admin Module (Full Oversight)
The master dashboard for system-wide orchestration.

Global Master Feed: Bypasses department filters for total system transparency.

Workload Share: Dynamic pie-chart visualizations of departmental efficiency.

Emergency Controls: Ability to manually reassign or override ticket statuses.

🔧 Technical Logic Highlights
Auto-Assignment: New tickets are automatically routed to the first available Vendor in the chosen category via the model's save() method.

SLA Calculation: Due dates are logically calculated:

HIGH: 2 Days

MEDIUM: 5 Days

LOW: 10 Days

Role-Based Access Control (RBAC): UI themes shift dynamically:

Blue: Buyer

Slate: Vendor

Red: Admin

🛠️ Installation & Setup
Backend (Django)
Navigate to the /backend directory.

Install dependencies: pip install -r requirements.txt.

Apply migrations: python manage.py migrate.

Start the server: python manage.py runserver.

Frontend (React + Vite)
Navigate to the /frontend directory.

Install dependencies: npm install.

Start the dev server: npm run dev.

📈 Future Roadmap
[ ] AI Integration: Automated ticket tagging and priority suggestions.

[ ] Push Notifications: Real-time WebSocket alerts for status changes.

[ ] Mobile Hub: Native mobile expansion of the massive UI design language.