FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for ML packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    cmake \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy models directory first (for better caching)
COPY models/ ./models/

# Copy requirements
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT env variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)" || exit 1

# Start command
CMD ["python", "app.py"]
