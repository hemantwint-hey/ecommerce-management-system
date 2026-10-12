# Backend image for Render / Railway / Koyeb (or any Docker host).
# Build stage: compile the Spring Boot jar with the Maven wrapper.
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package

# Run stage: only the JRE and the jar.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# The host injects PORT; application.properties reads it via server.port=${PORT:5000}.
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
