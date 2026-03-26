FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source files
COPY generate_dataset.py .
COPY train_model.py .
COPY main.py .

# Generate dataset and train model at build time
RUN python generate_dataset.py && python train_model.py

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
