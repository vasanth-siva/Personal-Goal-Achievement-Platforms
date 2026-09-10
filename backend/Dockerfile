# ==============================================================================
# GoalForge Backend - Production Dockerfile
# Multi-stage build for optimal performance and minimal attack surface
# ==============================================================================

# Stage 1: Build JAR package using Maven & Eclipse Temurin JDK 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy Maven POM and dependency definitions for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build production executable JAR (skipping test suite during container packaging)
RUN mvn clean package -DskipTests -B

# Stage 2: Ultra-lightweight JRE 17 runtime container
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create unprivileged system user for container security
RUN addgroup -S goalforge && adduser -S goalforge -G goalforge
USER goalforge

# Copy compiled artifact from builder stage
COPY --from=builder --chown=goalforge:goalforge /build/target/*.jar app.jar

# Configuration defaults
ENV SERVER_PORT=8080 \
    JAVA_OPTS="-XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Xms256m -Xmx512m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
