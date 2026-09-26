# =============================================================================
# SIGAI-SES Frontend - Dockerfile Multi-stage (Producción)
# =============================================================================
# Construye el frontend React y lo sirve con Nginx optimizado
# =============================================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files e instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Copiar código y construir
COPY . .
RUN npm run build


# --- Stage 2: Runtime (Nginx) ---
FROM nginx:alpine AS runtime

# Copiar build de React
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx optimizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root para nginx (opcional, nginx ya corre como nginx user)
# RUN adduser -D -H -h /var/www -s /sbin/nologin nginx 2>/dev/null || true

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
