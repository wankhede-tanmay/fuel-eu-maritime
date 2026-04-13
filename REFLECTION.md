# Developer Reflection

Building the FuelEU Maritime Compliance Platform was a massive learning experience that bridged the gap between strict legal regulations and complex software architecture. 

## Architectural Decisions
I chose to build this project using **Hexagonal Architecture**. While it required more boilerplate code upfront (setting up ports and adapters), it was the perfect choice for an application so heavily reliant on strict business logic. By keeping the FuelEU calculations (like the Greedy Algorithm for pooling) completely separated from Express.js and the database, it made the code significantly easier to test and debug. 

## Major Challenges & Solutions
The hardest part of this assignment was implementing **Article 21 (Pooling)**. The European Union regulations dictate that you can pool ships together, but the total pool cannot be negative, a deficit ship cannot exit worse than it started, and a surplus ship cannot be pushed into a deficit. 
* **The Struggle:** Initially, figuring out how to distribute energy fairly without breaking those safety rules was difficult. 
* **The Solution:** I implemented a Greedy Algorithm that sorts ships by their surplus amounts (highest first) and systematically transfers energy to deficit ships until either the deficit is covered or the surplus runs out, wrapped in strict error-handling checks before committing anything to the database.

## Working with AI & Future Improvements
Using an AI agent as a pair-programmer was incredibly effective, but it required strict management. 
* **What went well:** The AI was excellent at scaffolding the repetitive boilerplate code (like Express controllers and basic React components) and helping write comprehensive Jest tests for highly specific edge cases.
* **Where I had to step in:** I couldn't just blindly copy-paste. I had to actively manage the prompt structure, specifically regarding TypeScript errors and ensuring the AI's method names exactly matched my actual application code during the testing phase.
* **What can be done better (Lessons Learned):** Moving forward, I learned that **attacking one component at a time** is the absolute most efficient way to use AI. Trying to generate or refactor too much code at once often causes LLMs to lose context or hallucinate incorrect variables. By breaking the system down into bite-sized, isolated components (e.g., building just the database schema, then just the domain math, then just the tests), it saves massive amounts of debugging time and keeps the AI's output highly accurate.