FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build  # Vite 빌드

# NGINX 단계
FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

# 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

