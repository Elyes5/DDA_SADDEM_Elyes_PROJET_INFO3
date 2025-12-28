# Use lightweight Python image
FROM python:3.12-slim
# Work on the app directory of the container
WORKDIR /app
# Make a copy of requirements.txt inside the container
COPY requirements.txt .
# Install the requirements using PIP
RUN pip install --no-cache-dir -r requirements.txt
# Copy the files
COPY . .
# Expose port 5000
EXPOSE 5000
# Start the app using guincorn since it's better to use it for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]