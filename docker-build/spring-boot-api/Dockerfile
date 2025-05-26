# backend/Dockerfile
FROM eclipse-temurin:17-jdk-alpine

# JAR 파일 복사
COPY target/road-risk-monitoring-0.0.1-SNAPSHOT.jar app.jar

# 컨테이너 시작 시 실행
ENTRYPOINT ["java","-jar","/app.jar"]

