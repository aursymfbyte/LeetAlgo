FROM node:22-slim AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
RUN npm run build -- --base=/

FROM nginx:alpine
COPY --from=build /src/dist /usr/share/nginx/html
