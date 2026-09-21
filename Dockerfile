FROM python:3.12-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir "setuptools>=68" "uvicorn[standard]>=0.30" "python-multipart>=0.0.9" "sqlalchemy>=2.0" "fastapi>=0.115" "typer>=0.16" "cryptography>=43.0"
ENV MOMTO_DATA_DIR=/data
ENV MOMTO_VAULT_DIR=/data/vault
RUN mkdir -p /data /data/vault
EXPOSE 8000
CMD ["uvicorn","momto.web.app:app","--host","0.0.0.0","--port","8000"]
