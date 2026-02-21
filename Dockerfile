# --- ÉTAPE 1 : Build de l'application ---
FROM node:20-alpine AS build

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Construction de l'application (génère le dossier /dist)
RUN npm run build

# --- ÉTAPE 2 : Serveur de production ---
FROM nginx:stable-alpine

# Copie des fichiers statiques depuis l'étape de build
# Vite génère par défaut ses fichiers dans le dossier 'dist'
COPY --from=build /app/dist /usr/share/nginx/html

# Copie d'une configuration Nginx personnalisée (optionnel mais recommandé pour le routing React)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]