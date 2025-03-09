FROM python:3.11-slim

WORKDIR /app

# Install dependencies directly without requirements.txt
RUN pip install flask \
    flask-sqlalchemy \
    email-validator \
    gunicorn

# Copy application files
COPY . .

# Set environment variables
ENV SESSION_SECRET="dev_key"
ENV ALIENS_PER_ROW=8

# Expose port 5000
EXPOSE 5000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--reload", "main:app"]
