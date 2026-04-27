# Byg-fase: kompiler JAR med Maven og Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Kørsel-fase: slim JRE-image med kun det der skal bruges
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/vurdering-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
