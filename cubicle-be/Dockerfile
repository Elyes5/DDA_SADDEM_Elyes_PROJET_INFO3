# On utilise une image légère de Python
FROM python:3.12-slim
# On va travailler sur le répertoire app au niveau du conteneur
WORKDIR /app
# Copie de requirements.txt vers le conteneur
COPY requirements.txt .
# Installation des dépendances
RUN pip install --no-cache-dir -r requirements.txt
# Copie des fichiers
COPY . .
# Lancement du serveur
CMD ["python", "app.py"]