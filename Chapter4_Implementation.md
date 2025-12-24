Chapter 4

Implementation

This chapter presents the technical implementation of the HeartWise application. It explains the technologies and tools used, the coding practices that guided development, the main challenges encountered, and an overview of how the application functions from the user’s point of view.

4.1 Technologies and Tools Used

In developing the HeartWise cardiovascular risk prediction web application, a carefully selected technology stack was adopted to ensure reliability, scalability, and a user‑friendly experience. The system follows a three‑tier architecture consisting of a frontend client, a backend API, and a dedicated machine learning service, all supported by a relational database.

4.1.1 Frontend

The frontend is implemented using modern web technologies to deliver an intuitive and responsive interface for users.

1. React.js

  • React Library: Utilized for building the single‑page application, using a component‑based architecture for modularity and reusability.  
  • State Management: Employed React state and props to manage dynamic content such as forms, validation messages, and fetched prediction results.  
  • Routing: Implemented client‑side routing using React Router to navigate between views such as Home, Login, Signup, Input Form, History, and Suggestions.  
  • Reusability: Common layout elements such as the navigation bar and protected routes are implemented as reusable components.

2. Styling and Layout

  • Tailwind CSS & Custom CSS: Used utility‑first classes and project‑specific styles (in `App.css` and `index.css`) to maintain a clean, consistent, medical‑themed interface.  
  • Classic UI Design: All animations and transitions were consciously removed based on user feedback to provide a stable, distraction‑free experience.  
  • Responsive Design: Ensured that all pages adapt to different screen sizes, allowing the application to be used comfortably on desktops, tablets and mobile devices.

3. Firebase

  • Authentication: Firebase Authentication is used for user sign‑up and login, providing secure handling of credentials and integration with the backend session system.  
  • Client SDK: The frontend uses a small Firebase configuration module (`firebase.js`) to interact with the authentication service.

4. Browser Developer Tools

  • Testing and Debugging: Browser tools such as the Developer Console and Network panel were extensively used to debug API calls, inspect component state, and fine‑tune layout during development.

4.1.2 Backend

The backend leverages Node.js and Express to provide a robust and modular API layer responsible for validation, business logic, communication with the machine learning service, and interaction with the database.

1. Node.js Runtime

  • Server‑Side JavaScript: Node.js provides a non‑blocking, event‑driven runtime suitable for handling concurrent HTTP requests and interacting with external services.  
  • Package Ecosystem: The rich npm ecosystem is used to integrate MySQL, session management, and validation libraries.

2. Express.js Framework

  • Routing: Express is used to define RESTful API endpoints for authentication, prediction requests, profile management and history retrieval.  
  • Middleware: Common cross‑cutting concerns such as CORS handling, JSON parsing, session management, and error handling are encapsulated as middleware in `server.js`.

3. Request Handling and Validation

  • Validators: Custom validation functions in `validators.js` verify that all health features (age, blood pressure, cholesterol, lifestyle factors, etc.) are within acceptable ranges before they are processed.  
  • Feature Engineering: The backend computes additional medical features such as Body Mass Index (BMI), pulse pressure, age groups and BMI groups, ensuring the inputs match the expectations of the ML models.

4. Database Access

  • MySQL Driver: The `mysql2` driver is used to communicate with the relational database.  
  • Connection Pooling: A pooled connection strategy is configured in `server.js` to avoid “connection closed” errors and to improve performance under load.

5. AI Advice Integration

  • LLM Client: The module `llmClient.js` interacts with a large language model API to generate personalized lifestyle and risk‑reduction advice based on the user’s inputs and their historical records.  
  • Error Resilience: Numeric fields such as BMI are carefully converted to the correct type (e.g., using `parseFloat`) to prevent runtime errors and ensure robust prompt construction.

4.1.3 Machine Learning Service

The machine learning service is developed as an independent microservice using FastAPI in Python. It encapsulates all model‑related logic and exposes a simple prediction API to the backend.

1. FastAPI Framework

  • Web Service: FastAPI provides a high‑performance HTTP interface with automatic documentation for the `/predict` and `/health` endpoints implemented in `app.py`.  
  • Data Validation: Request bodies are validated with Pydantic models, guaranteeing that the service receives correctly typed health features.

2. ML Libraries and Models

  • Scikit‑learn and Ensemble Models: Six tuned models—CatBoost, LightGBM, Logistic Regression, Random Forest, XGBoost and a Stacking Ensemble—are stored as `.joblib` pipelines in the `models/` directory.  
  • Joblib: Used for loading serialized model pipelines efficiently at startup.  
  • Numpy and Pandas: Support numerical computation and feature manipulation for inference.

3. Model Management

  • `model_loader.py`: Centralizes model loading, logging and error handling. Each model is loaded independently so that a failure in one does not crash the entire service.  
  • Fallback Mode: When a model is missing or cannot be loaded, the service can continue by either using the remaining models for an ensemble prediction or, if necessary, by returning a conservative fallback estimate.

4.1.4 Database

The application uses a MySQL relational database to persist user accounts, prediction requests and historical results.

1. MySQL

  • Relational Structure: Tables are defined for users, health_predictions, and sessions, allowing strong typing and relational integrity.  
  • Automatic Migrations: SQL migration scripts in the `backend/migrations/` folder create and evolve the schema when the backend starts.  
  • Feature Storage: All engineered features and model probabilities are stored, enabling later analysis of model behaviour and user trends.

4.1.5 Development Tools

1. Visual Studio Code

  • Code Editing: VS Code is used as the primary IDE, providing IntelliSense, integrated terminal support, and Git integration.  
  • Extensions: ESLint, Prettier and Python extensions aid in enforcing consistent style and catching errors early.

2. Git and GitHub

  • Version Control: Git tracks changes to the codebase, while GitHub hosts the remote repository for collaboration and backup.  
  • Branching: Feature branches are used for new functionality, which are then merged into the main branch after testing.

4.2 Coding Practices

Adherence to good coding practices was maintained throughout the development of HeartWise to ensure readability, maintainability and robustness.

1. Modularization

  • Separation of Concerns: The project separates the frontend, backend and machine learning service into distinct folders, and within each layer concerns are further divided into modules (e.g., `validators.js`, `llmClient.js`, `predict.js`).  
  • Component‑Based UI: The React frontend is organised into pages and reusable components, simplifying updates and encouraging reuse.

2. Error Handling

  • Backend Errors: Express middleware captures unexpected errors and returns clear HTTP responses, while logging details for debugging.  
  • ML Service Errors: The FastAPI service wraps model predictions in try–catch blocks and surfaces friendly error messages to the backend, with an option to fall back to approximate predictions.  
  • Frontend Feedback: The React application displays user‑friendly error states (such as invalid input warnings or “service temporarily unavailable”) without exposing internal details.

3. Validation and Data Integrity

  • Input Validation: Both client‑side and server‑side validation guard against malformed or out‑of‑range values for medical metrics such as blood pressure, cholesterol and BMI.  
  • Type Safety: Numeric conversions are handled explicitly to avoid issues such as calling numeric methods on string values.  
  • Database Constraints: Primary keys, foreign keys and suitable data types in the MySQL schema maintain the integrity of stored records.

4. Logging and Monitoring

  • Server Logs: Key events such as prediction requests, model loading outcomes and error traces are logged to assist in diagnosis.  
  • Health Endpoints: The `/health` endpoints on the backend and ML service provide quick insight into service status and model availability.

4.3 Challenges and Solutions

During development several technical challenges were encountered. The most significant ones and their solutions are summarised below.

Challenge 1: Reliable Database Connectivity

The initial implementation sometimes produced errors such as “Can’t add new command when connection is in closed state” because database connections were not being managed efficiently.

Solution:

To address this, a MySQL connection pool was configured in `server.js` with appropriate timeouts and automatic reconnection. The backend now reuses pooled connections instead of opening and closing new ones for every request, greatly improving stability and performance.

Challenge 2: Machine Learning Model Loading and Compatibility

The ML service originally failed to start because of incompatible library versions (most notably an outdated NumPy version) and the large number of models to be loaded.

Solution:

The `requirements.txt` file for the ML service was updated to use `numpy>=1.22.0,<2.0`, which is compatible with scikit‑learn, CatBoost, LightGBM and XGBoost. Model loading was centralised in `model_loader.py`, where each model is loaded independently with detailed error logging. This design allows the service to continue operating even if one model fails and makes it easier to diagnose environment issues.

Challenge 3: Type Conversion Issues in AI Advice Generation

When generating lifestyle advice, the backend attempted to call numeric formatting methods such as `.toFixed()` on values retrieved from the database. Because some values, like BMI, were stored as strings, this caused runtime errors.

Solution:

The `llmClient.js` module was updated to convert database values to numbers using `parseFloat` before any numeric operations. This ensured that prompts for the language model are always constructed with valid numeric values and removed a class of hard‑to‑trace bugs.

Challenge 4: User Experience and UI Animations

User feedback indicated that the default animated transitions made the interface feel distracting and inconsistent with a traditional medical application.

Solution:

All CSS animations, transitions and hover transforms were removed from the React components and stylesheets. The result is a static, clean, “classic” interface that focuses on clarity of information instead of motion effects.

4.4 Application Overview

This section provides a high‑level overview of how a typical user interacts with HeartWise and how the different components collaborate behind the scenes.

From the user’s perspective, the application begins at a welcoming home page that briefly explains the purpose of HeartWise. New users can create an account via the Signup page, while existing users log in through the Login page. Authentication is handled by Firebase and mirrored on the backend using sessions so that subsequent API requests can be associated with the correct user.

Once authenticated, the user navigates to the Input Form page, where they enter medical and lifestyle information such as age, height, weight, blood pressure readings, cholesterol level, smoking status and physical activity. Basic validation is performed in the browser to guide the user, and the complete dataset is then submitted to the backend API.

The backend validates the request again, computes engineered features (for example BMI and pulse pressure), stores the raw and engineered data in the MySQL database, and forwards the relevant features to the machine learning service. The FastAPI service normalises the input, runs the six trained models and aggregates their outputs through a stacking ensemble to estimate the probability of cardiovascular disease.

The prediction result, including individual model probabilities and the final risk category, is returned to the backend. The backend then calls the language‑model client to generate personalised textual advice that interprets the risk level and suggests actionable lifestyle changes. Both the prediction and the generated advice are saved in the `health_predictions` table.

Finally, the frontend receives a concise response containing the risk level, numeric probability and advice. The Suggestions page presents this information using clear typography and colour coding (for example, low/medium/high risk). Users can also review their previous assessments on the History page, which fetches past records from the backend and allows them to observe trends over time.

Through this flow, HeartWise integrates a modern web frontend, a structured backend API, and a dedicated machine learning service into a cohesive application that assists users in understanding and managing their cardiovascular health.
