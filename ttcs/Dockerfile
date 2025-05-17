FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .

COPY src ./src
RUN mvn package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar



ENTRYPOINT ["java", "-jar", "app.jar"]