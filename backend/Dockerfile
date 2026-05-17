# Stage 1: Build the Spring Boot application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy the Maven project files and download dependencies
COPY pom.xml .
COPY src ./src

# Build the standalone jar file, skipping tests for speed
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Java runtime for execution
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the packaged jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default port (overridden dynamically in production by the PORT env var)
EXPOSE 8080

# Execute the Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]
