# Technologies Used and Rationale

## 1. Overall Technology Strategy

For this cardiovascular risk pre‑screening system, the technology stack was chosen to satisfy four main goals: (1) accurate and explainable machine‑learning predictions, (2) a responsive and accessible web user interface, (3) a clean separation between clinical logic, AI advice, and presentation, and (4) ease of deployment and future extension. To achieve this, the project combines a React‑based frontend, a Node.js/Express backend with a MySQL relational database, a separate FastAPI microservice hosting the trained ensemble of ML models, and an external integration with Google’s Gemini generative‑AI API for text advice. Each layer focuses on a single responsibility: the frontend handles user interaction and validation, the Node.js backend manages authentication, persistence, and orchestration, the FastAPI service focuses purely on numerical risk prediction, and Gemini provides natural‑language guidance with strong medical disclaimers. The following sections explain, in detail, why each technology was selected over common alternatives, what advantages it brings, and how it is used correctly in the system.

---

## 2. Frontend Technology – React

### 2.1 Why React instead of plain HTML/CSS/JS or other frameworks

React was selected as the frontend framework in preference to plain HTML/CSS/JavaScript and to alternatives such as Angular or Vue for several reasons:

- **Component‑based architecture:** React’s component model is well‑suited to a form‑heavy application with multiple views (Home, Input Form, Login, Signup, History, Suggestions, Profile). Each page can be built as a reusable component, and shared pieces like navigation bars, buttons, and cards can be defined once and reused consistently. This would be significantly more error‑prone with ad‑hoc DOM manipulation in plain JavaScript.
- **One‑way data flow and state management:** The cardiovascular risk form involves multiple fields (age, blood pressure, cholesterol category, glucose category, lifestyle toggles) whose values must be validated, encoded, and submitted together. React’s unidirectional data flow and `useState`/`useEffect` hooks provide a clean way to track the current form state, show validation errors, and render results without manual DOM updates. In contrast, jQuery or vanilla JS approaches would make the code harder to maintain and reason about.
- **Ecosystem and learning curve:** Compared with Angular, React has a lighter core and allows using only the pieces needed. For a single‑page medical pre‑screening app, a full Angular framework (with its more rigid module system and steeper learning curve) would be overkill. React is also widely adopted, with strong community support and extensive documentation, reducing long‑term maintenance risk.
- **Performance and user experience:** React’s virtual DOM and diffing mechanism allow efficient re‑rendering when form fields change or results arrive from the backend. This is important when showing loading states, risk results, and AI advice in a way that feels responsive and modern.

### 2.2 Advantages React gives this project

Using React gives several concrete benefits in this context:

- **Clear page structure:** Pages like Home, Input Form, Login, Signup, History, Suggestions, and Profile are each implemented as separate components under `src/pages`. Routing between them can be handled consistently, and each page encapsulates its own layout and logic.
- **Declarative validation and feedback:** The Input Form page can declare the current input state and show helper text, error messages, and disclaimers in response to state changes, instead of manually manipulating HTML. This improves reliability and reduces the chance of UI bugs.
- **Simple integration with APIs:** React components can call the Node.js backend using `fetch` or Axios inside `useEffect` or event handlers. Asynchronous requests to the prediction, login, signup, and history endpoints are easy to coordinate, and responses map directly into component state.

### 2.3 How React is used properly in the application

React is used with good practices in several ways:

- **Separation of concerns by page:** Each major feature corresponds to a well‑named component: the Home page focuses on explanation and disclaimers, the Input Form focuses on data entry and risk visualization, History and Suggestions focus on past data and advice, and Login/Signup handle authentication. This keeps each file focused and easier to understand.
- **State and side‑effects:** Hooks like `useState` and `useEffect` are used to manage local state (such as form values, loading flags, and fetched records) and side‑effects (such as API calls on page load). This aligns with React’s recommended functional‑component approach.
- **Visual consistency and accessibility:** Shared CSS (for example, the classic card style and dark medical background) ensures consistent appearance across pages. Input labels, helper text, and disclaimers are rendered clearly around form controls, improving usability and accessibility.

---

## 3. Backend Web Service – Node.js with Express

### 3.1 Why Node.js/Express instead of other backend stacks

The backend web service is implemented in Node.js using the Express framework, rather than Python/Django, Java/Spring, or PHP/Laravel, for several reasons:

- **Single‑language full‑stack development:** Using JavaScript on the server as well as the client allows a more uniform development experience. Data structures (like JSON for predictions and history records) map naturally between frontend and backend without conversion overhead.
- **Lightweight and flexible:** Express is a minimalistic framework that provides routing, middleware, and HTTP handling with very little overhead. For an API‑centric application that primarily exposes JSON endpoints (login, signup, predict, history, suggestions), this simplicity is an advantage over heavier frameworks that enforce rigid patterns not needed here.
- **High concurrency:** Cardiovascular risk assessments and history queries are short‑lived, I/O‑bound operations (calling the ML service, querying the database, calling Gemini). Node.js’s event‑driven, non‑blocking I/O model is ideal for this pattern and can handle multiple requests efficiently.
- **Ecosystem for integration:** Node.js has mature libraries for HTTP requests, authentication, and logging, and it integrates naturally with both MySQL drivers and external HTTP AI services.

### 3.2 Advantages Node.js gives this project

- **Efficient API gateway:** The Node.js layer acts as a central API gateway that receives user requests, validates and normalizes inputs, coordinates calls to the ML microservice and the Gemini API, persists data into MySQL, and returns unified JSON responses.
- **Easy JSON handling:** All communication between layers uses JSON—frontend to backend, backend to ML service, backend to Gemini. Because Node.js is optimized around JSON handling, this reduces transformation code and potential bugs.
- **Rapid development:** Making changes to endpoints or adding new ones (for example, adding a new history filter or a profile update route) is straightforward using Express’s simple route syntax.

### 3.3 How Node.js/Express is used properly in the application

- **Clear route handlers:** The backend defines specific routes for login, signup, predictions, and history retrieval. Each route focuses on a single responsibility: for the prediction route, the flow is validate inputs → compute or fetch derived features (like BMI) → call the ML service → call the LLM advice client → save and return a combined result.
- **Middleware and validation:** Input validation and business rules are kept near the route logic, ensuring that only correctly shaped and sensible data is sent to the ML service and stored in the database. This protects against invalid or malicious requests and matches good API design practice.
- **Orchestration of external services:** Node.js is used to coordinate calls to the ML microservice and Gemini (with proper error handling and fallbacks), acting as an orchestration layer rather than embedding ML or LLM logic directly in the UI.

---

## 4. Machine‑Learning Microservice – Python with FastAPI

### 4.1 Why Python and FastAPI instead of doing ML inside Node

The ML prediction engine is packaged as a separate Python FastAPI service, rather than embedding models directly in the Node.js backend, for the following reasons:

- **Python is the de‑facto ML ecosystem:** The models used (such as CatBoost, LightGBM, Logistic Regression, Random Forest, XGBoost, and a stacking ensemble) are trained and persisted using Python libraries like scikit‑learn and gradient‑boosting frameworks. Keeping serving logic in Python avoids complex cross‑language model loading or fragile reimplementation of preprocessing pipelines.
- **FastAPI performance and type support:** FastAPI is a modern Python web framework designed specifically for fast, JSON‑based APIs. It automatically generates OpenAPI documentation, validates request bodies using Pydantic models, and is highly performant when run under ASGI servers. This is ideal for a small, focused prediction service.
- **Separation of concerns and deployment flexibility:** Putting the ML service in its own microservice makes it easier to scale, retrain, or even replace the model stack without touching the Node.js business logic or the frontend. For example, a new version of the ensemble can be deployed behind the same `/predict` endpoint.

### 4.2 Advantages FastAPI gives this project

- **Strict input schemas:** FastAPI uses Pydantic models to define the expected request body for predictions (age, blood pressure, cholesterol code, glucose code, etc.), ensuring that the ML pipeline always receives correctly typed inputs.
- **Clear prediction lifecycle:** The ML service implements a standard sequence: receive JSON → validate → apply preprocessing pipeline (scaling/encoding) → load and run the ensemble models → compute risk probability and label → return a clean JSON response. This structure is clear and testable.
- **Performance and async support:** FastAPI’s asynchronous capability and tight integration with modern Python async features make it possible to handle multiple prediction requests efficiently, which is important if user volume grows.

### 4.3 How the ML service is used properly

- **Single, well‑defined endpoint:** The service exposes a `POST /predict` endpoint that takes the normalized feature set and returns a response containing the risk label (for example, Low/Moderate/High) and the associated probability. This follows good REST principles and keeps the interface stable.
- **Pre‑trained, serialized models:** Models are pre‑trained offline and saved as joblib files, then loaded at startup. This means the production system does not train models on live user data, which reduces computation overhead and risk of data leakage.
- **Post‑processing inside the service:** The logic that maps raw probabilities to user‑friendly risk categories is implemented in the ML service, ensuring consistent behavior regardless of how many clients use it.

---

## 5. Database Layer – MySQL

### 5.1 Why MySQL instead of a NoSQL database

A relational database (MySQL) was chosen instead of a NoSQL solution such as MongoDB or DynamoDB for several reasons:

- **Structured and relational data:** The core entities—users, assessment records, and possibly other tables—fit naturally into relational schemas with clear relationships (for example, each assessment record belongs to a specific user). MySQL’s relational model makes it straightforward to enforce referential integrity through foreign keys.
- **ACID guarantees:** For a health‑related application, data consistency is crucial. When an assessment is stored, it must not be partially written. MySQL’s ACID compliance helps ensure that login records, assessment records, and histories are stored reliably.
- **Familiarity and portability:** MySQL and compatible variants are widely used and supported in hosting environments, making deployment simpler and giving the project long‑term portability.

### 5.2 Advantages MySQL gives this project

- **Easy querying for history and suggestions:** History and Suggestions pages rely heavily on querying past records. SQL makes it very easy to filter by user, sort by date, or select only records that include AI advice text.
- **Structured schema design:** A well‑designed MySQL schema, with typed fields for blood pressure, BMI, risk label, and probabilities, matches the data dictionary and makes it easier to write reports or export data later.

### 5.3 How MySQL is used properly

- **Clear table separation:** User accounts are stored in a users table, with hashed passwords and unique usernames; assessment records are stored in a separate table linked by a user reference. This separation follows security best practices and avoids duplication.
- **Typed columns and constraints:** Columns such as age, blood pressure, BMI, and risk probability are typed appropriately (INT or DECIMAL), which enforces valid ranges at the database level and supports numeric operations if needed.
- **Indexing for performance:** Indexes on user identifiers and timestamps allow quick retrieval of a user’s history, which is crucial for the History and Suggestions pages.

---

## 6. Generative‑AI Integration – Google Gemini API

### 6.1 Why an external LLM instead of rule‑based text only

The system integrates with the Google Gemini API to generate personalized lifestyle and follow‑up advice, instead of relying purely on fixed templates or rule‑based messages, because:

- **Richer, more personalized language:** A large language model can translate numeric risk factors and history into natural, supportive language that is easier for non‑technical users to understand. It can highlight progress, suggest practical lifestyle changes, and phrase warnings in a human‑friendly manner.
- **Context‑aware suggestions:** By providing structured context (age, BMI, blood pressure, cholesterol category, history comparisons, and risk changes), the model can adapt its advice to different situations, such as risk improving versus worsening.
- **Flexibility for future changes:** Prompt design can be updated without retraining models or shipping new code to the frontend, as long as the API contract remains the same.

### 6.2 Advantages Gemini gives this project

- **High‑quality natural language output:** The Gemini model is capable of generating explanations and suggestions that feel conversational and empathetic, which is important for user engagement in a health application.
- **External compute:** Running the model on Google’s infrastructure means the project does not need to host or manage large language‑model resources, simplifying deployment.

### 6.3 How Gemini is used properly and safely

- **Backend‑only integration:** The Gemini API is called only from the backend, not directly from the browser. This keeps API keys secure and avoids exposing sensitive model parameters to clients.
- **Structured prompts:** The backend constructs a careful prompt that includes only the relevant, anonymized health metrics and risk outputs. It instructs the model to produce a concise assessment, three practical lifestyle recommendations, and guidance on when to see a doctor.
- **Error handling and fallbacks:** If the Gemini API key is missing or the model returns an error (for example, overloaded 503), the backend falls back to a deterministic, rule‑based advice template. This ensures the user always receives some advice and the application fails gracefully.
- **Strong disclaimers:** Every piece of AI‑generated advice is appended with a clear medical disclaimer, stating that the text is informational only, not medical advice, and that users must consult healthcare professionals for diagnosis and treatment decisions. This is an essential safety measure when using generative AI in a health context.

---

## 7. Overall Integration and Correct Usage

Across all layers, the technologies have been chosen and used in a way that complements their strengths:

- The React frontend focuses on user experience, accessibility, and clear medical disclaimers, making it easy to input data correctly and understand outputs.
- The Node.js/Express backend acts as a robust gateway that validates inputs, orchestrates ML and LLM calls, and manages persistence, taking advantage of non‑blocking I/O and JSON‑friendly design.
- The FastAPI ML microservice encapsulates all model‑specific logic, leveraging Python’s mature ML ecosystem while maintaining a clean, typed API for predictions.
- The MySQL database ensures structured, consistent storage of user accounts and assessment histories, supporting the History and Suggestions pages.
- The Gemini LLM integration adds human‑readable, contextual advice on top of numerical risk scores, while being carefully controlled via backend prompts, error handling, and medical disclaimers.

Together, these choices create a system that is modular, maintainable, medically cautious, and ready for future enhancements (such as more complex histories, additional risk factors, or expanded advice prompts), without locking the project into a single monolithic technology.
