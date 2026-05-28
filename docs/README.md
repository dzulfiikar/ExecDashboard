# Hygieia Executive Dashboard Documentation

This documentation set describes the archived Hygieia Executive Dashboard codebase as it exists in this repository. It covers local use, production-oriented deployment, data model, operations, and contribution rules.

## Project Summary

Hygieia Executive Dashboard is a legacy executive metrics dashboard built from:

- `exec-core` - shared Spring Data MongoDB domain models, repositories, converters, and configuration.
- `exec-analysis` - cron-driven Java/Spark collectors that read Hygieia-style source data and populate executive rollups.
- `exec-api` - Spring Boot REST API served under `/api` on port `8080` by default.
- `exec-ui` - Angular 4 single-page application with hash routing, served on port `4200` in local Docker.
- `exec-db` - MongoDB 4.4 setup container that creates the `analyticsdb` database user used by the local stack.

The upstream project has been archived since June 2023 and uses Java 8, Spring Boot 1.5.9, Angular 4, Node 8, and other outdated dependencies. Treat this as a legacy system and isolate it from modern production workloads unless it has been security-reviewed and patched.

## Recommended Reading Order

1. [Getting Started](getting-started.md) - start-to-finish setup for Docker operators and native developers.
2. [Architecture](architecture.md) - modules, runtime topology, API/UI/data flows, and collector behavior.
3. [Configuration](configuration.md) - API, analysis, MongoDB, UI, and secrets handling.
4. [MongoDB Data Model](mongodb-data-model.md) - database, collections, indexes, and relationships.
5. [External Collector Integration](external-collector-integration.md) - patterns for feeding metrics from Node.js, Go, Python, or other runtimes.
6. [Docker Deployment](docker-deployment.md) - Compose topology, commands, ports, logs, reset, and production notes.
7. [Native Deployment](native-deployment.md) - Java/Maven, MongoDB, API, analysis, and UI setup without Docker.
8. [Operations](operations.md) - health checks, verification, backup, troubleshooting, and legacy risks.
9. [Development Guide](development-guide.md) - workflow, coding standards, testing, linting, and contribution expectations.

## Quick Starts

- Operator or evaluator using containers: start with [Docker quick start](getting-started.md#docker-operator-quick-start).
- Developer working on Java or Angular code: start with [native developer quick start](getting-started.md#native-developer-quick-start).
- Production planner: review [Docker Deployment](docker-deployment.md), [Native Deployment](native-deployment.md), [Configuration](configuration.md), and [Operations](operations.md) before exposing the system.
- Integrator adding non-Java data collection: read [External Collector Integration](external-collector-integration.md) after [MongoDB Data Model](mongodb-data-model.md).

## Important Security Note

Checked-in configuration files under `config/api/application.properties`, `config/analysis/application.properties`, and `exec-db/db-setup.js` contain demo database credentials and a demo JWT secret. They are suitable only for local evaluation. Replace all credentials, JWT secrets, network bindings, and CORS settings before any shared or production deployment.
