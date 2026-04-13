content = """# FuelEU Maritime Compliance Platform

A full-stack web application designed to help maritime fleets track, manage, and optimize their greenhouse gas (GHG) emissions to comply with the strict **FuelEU Maritime regulations** taking effect in 2025.

## 🏗️ Architecture
This project is strictly built using **Hexagonal Architecture (Ports and Adapters)**. 
* **Core Domain:** All FuelEU business logic (Article 20 Banking, Article 21 Pooling, CB calculations) is completely isolated from the framework.
* **Ports:** Interfaces define how the application interacts with the outside world.
* **Adapters:** PostgreSQL databases, Express.js controllers, and external APIs are treated as easily swappable plugins.

## 🚀 Features
1. **Routes & Ship Fleet:** View ships, fuel consumption, and individual GHG intensities.
2. **Compare (Dashboard):** Visual data representations (Recharts) comparing fleet performance against the strict 2025 EU target (89.3368 gCO2eq/MJ).
3. **Article 20 (Banking):** Stateful ledger allowing ships with a surplus to "bank" clean energy for future years, or apply past banked energy to cover current deficits.
4. **Article 21 (Pooling):** Advanced Greedy Algorithm that dynamically sorts and transfers energy between multiple ships to save deficit ships from legal fines without pushing surplus ships into the red.

## 💻 Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Vite.
* **Backend:** Node.js, Express, TypeScript, Jest (Testing).
* **Database:** PostgreSQL.

---

## 🛠️ Setup & Installation

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is installed and running on your machine.



### 2.Backend Initialization
Navigate to the backend folder, install dependencies, and run the database migration/seed scripts.


cd backend
npm install
# Initializes tables and seeds the database with initial maritime data
npm run db:init 
# Start the backend server
npm run dev


### 3.Frontend Initialization
In a new terminal, navigate to the frontend folder and start the Vite development server.


cd frontend
npm install
npm run dev

# Testing
The core business logic is heavily tested to ensure strict adherence to EU regulations (handling negative CBs, over-applying banked energy, and enforcing safe pooling rules).

To run the Jest test suite:


cd backend
npm run test