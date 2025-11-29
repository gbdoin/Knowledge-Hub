# Local Knowledge Hub

A fully local knowledge hub application that allows you to index various documents (PDF, Word, Excel, etc.) and chat with them using a local LLM.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

*   **Node.js** (v18 or higher) & **npm**: [Download Node.js](https://nodejs.org/)
*   **Python** (v3.10 or higher) & **pip**: [Download Python](https://www.python.org/)
*   **Ollama**: [Download Ollama](https://ollama.com/)

## Getting Started

### 1. Setup Ollama (Local LLM)

1.  Install and run **Ollama**.
2.  Pull the required models (you can change these in the configuration later if needed):

    ```bash
    ollama pull qwen2.5:7b
    ollama pull nomic-embed-text
    ```

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  (Optional but recommended) Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Start the backend server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend API will be available at `http://localhost:8000`.

### 3. Frontend Setup

1.  Open a new terminal window and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Usage

1.  Open your browser and go to `http://localhost:3000`.
2.  Upload your documents to create a knowledge base.
3.  Start chatting with your documents!

## Configuration

The backend configuration can be customized using environment variables. You can create a `.env` file in the `backend` directory.

Default values:
*   `OLLAMA_BASE_URL`: `http://localhost:11434`
*   `DEFAULT_LLM_MODEL`: `qwen2.5:7b`
*   `EMBEDDING_MODEL`: `nomic-embed-text`
