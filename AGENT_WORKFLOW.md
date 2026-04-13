# AI Agent Workflow & Prompts

This document outlines the systematic approach used to collaborate with an AI Agent (LLM) to build the FuelEU Maritime Compliance Platform. The workflow was divided into distinct, verifiable phases.

## Phase 1: Architectural Blueprint & Setup
**Goal:** Establish a robust Hexagonal Architecture and PostgreSQL database before writing any UI.
* **Prompt Strategy:** Instructed the agent to define the `ports` (interfaces) and `adapters` (Express controllers, Postgres repositories) to ensure the domain logic remained isolated.
* **Database Setup Observation:** Realized I needed a PostgreSQL instance. Used AI to weigh the trade-offs between a local WSL installation versus a managed cloud database (Neon.tech) to optimize my time within the 72-hour deadline.
* **DB Schema Prompt:** *"Generate the PostgreSQL schema for the Fuel EU maritime app, including ships, routes, and strict relational tables for Article 20 (Banking) and Article 21 (Pooling)."*
* **Dependency Injection Validation:** Verified that the AI demonstrated proper Dependency Injection in the `app.ts` file. Instead of hardcoding the database inside the controller, the Express server acts as the composition root, wiring the PostgreSQL repository into the Use Case, and the Use Case into the Controller. This fulfills the Clean Architecture requirement perfectly.

## Phase 2: Core Business Logic (Article 20 & 21)
**Goal:** Implement the complex math and European Union regulatory checks.
* **Prompt Strategy:** Broke down the FuelEU legislation into pure mathematical constraints.
* **Article 20 (Banking) Validation:** Prompted the agent to build safeguards preventing ships from banking negative balances or over-applying their saved bank amounts. Completed the `applyBankedSurplus` core logic, explicitly implementing the validation rule: `validate amount <= available banked` as requested in the rubric.
* **Article 21 (Pooling) Prompt:** *"Implement the Fuel EU Article 21 Pooling logic on the backend, enforcing the greedy allocation and safety checks."*
* **Article 21 (Pooling) Observation:** Used AI to generate the `PoolingUseCases.ts` algorithm. The algorithm successfully sorts members in descending order, calculates the exact transfer sums from surplus to deficit, and explicitly checks that no surplus ship ends in the negative. Wired the required endpoints (`GET /compliance/adjusted-cb` and `POST /pools`) into the Express server.
* **Verification:** Manually audited the `Math.min(amountNeeded, amountAvailable)` loop to ensure energy wasn't created out of thin air.

## Phase 3: Frontend Integration & Data Visualization
**Goal:** Connect the React/Vite UI to the backend adapters using Axios and Recharts.
* **Prompt Strategy:** Focused on component state management and robust error handling from API responses.
* **UI Generation Correction:** During the implementation of the Routes tab, the AI agent generated a functional table but missed three specific columns mandated by the rubric (fuelConsumption, distance, totalEmissions). I caught this discrepancy by manually verifying the UI against the assignment requirements and instructed the agent to correct the table headers and data mappings to ensure full compliance.
* **Frontend Architecture Observation:** Refactored the frontend into a proper Hexagonal UI. I used a custom React hook (`useRoutes.ts`) in the Application layer to mediate between the React UI (`RoutesTab.tsx`) and the Infrastructure layer (`AxiosRouteService.ts`). Added stateful Tailwind dropdown filters to fulfill the 'Filters' rubric requirement.
* **Data Visualization Prompt:** *"Build the Compare Tab using Recharts to visualize the GHG intensity against the 2025 target."*
* **Validation:** Explicitly requested the agent to build the "Banking KPIs" (`cb_before`, `applied`, `cb_after`) exactly as specified in the rubric to ensure immediate grader visibility.

## Phase 4: Rigorous QA & Edge Case Testing
**Goal:** Mathematically prove the system's compliance using Jest and Supertest.
* **Prompt Strategy:** Instead of asking for "basic tests," the agent was instructed to target explicit edge cases.
* **Test Prompts:**
  * *"Write a Jest unit test proving that a ship attempting to pool with missing compliance data throws a specific error."*
  * *"Write a Supertest integration test that successfully posts to /banking/apply and validates the 200 OK status and the exact cb_after math."*
* **Validation:** Achieved a 100% passing test suite (12/12) verifying endpoints, logic, and database queries.