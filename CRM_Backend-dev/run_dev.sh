#!/bin/bash
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@21/21.0.10/libexec/openjdk.jdk/Contents/Home"
echo "Using JAVA_HOME for CLEAN build: $JAVA_HOME"
$JAVA_HOME/bin/java -version
mvn clean spring-boot:run
