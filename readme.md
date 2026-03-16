# 🎫 Buyer-Vendor Ticket Hub

**Buyer-Vendor Ticket Hub** is a centralized platform designed to streamline communication between service seekers (Buyers) and service providers (Vendors). 

By moving away from fragmented communication, this system provides a single source of truth for tracking, managing, and resolving technical issues with an integrated **AI Priority Engine**.

## ✨ Key Features (Current Status)
* **Secure Authentication**: Robust login and registration system using Django's industry-standard `auth_user` security.
* **Role-Based Access**: Dedicated workflows and views tailored for both Buyer and Vendor personas.
* **Modern Interface**: A clean, responsive dashboard styled with Tailwind CSS for high-performance user experience.
* **Scalable Architecture**: A hybrid "Decoupled" design featuring a Django 6.0 backend ready for React API integration.

## 🛠️ Tech Stack
* **Backend:** Python 3.x, Django 6.0, Django REST Framework.
* **Frontend:** React (SPA), Tailwind CSS.
* **Database:** SQLite (Development) / PostgreSQL (Production ready).🛠️ Installation & Setup
Backend (Django)
Navigate to the /backend directory.

Install dependencies: pip install -r requirements.txt.

Apply migrations: python manage.py migrate.

Start the server: python manage.py runserver.

Frontend (React + Vite)
Navigate to the /frontend directory.

Install dependencies: npm install.

Start the dev server: npm run dev.
