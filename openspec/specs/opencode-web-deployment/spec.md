# OpenCode Web Runtime

## Purpose
Define the supported local Docker runtime, host persistence, and network boundary for OpenCode Web.

## Requirements

### Requirement: Local Docker Web Runtime
The repository SHALL provide a Docker image that runs OpenCode Web for a host-mounted checkout on port 4096 without a cloud deployment or authentication proxy.

#### Scenario: Local startup
- **WHEN** the user builds the image, mounts the checkout at `/app/workspace`, and publishes port 4096 on host loopback
- **THEN** OpenCode Web SHALL start in that checkout and be reachable at `http://127.0.0.1:4096`

### Requirement: Persistent Local Storage
The Docker workflow SHALL mount a host directory for OpenCode configuration, sessions, state, and cache while keeping repository and Beads changes in the host checkout.

#### Scenario: Container replacement
- **WHEN** the user recreates the container with the same checkout and OpenCode data mounts
- **THEN** the checkout and OpenCode data SHALL remain available from their host directories

### Requirement: Loopback-Only Access
The documented Docker workflow SHALL publish the OpenCode Web port on host loopback only and SHALL not require remote hosting credentials or an OAuth proxy.

#### Scenario: Starting without hosting credentials
- **WHEN** the user starts the local Docker container without remote hosting or OAuth credentials
- **THEN** startup SHALL not depend on those credentials, a remote deployment, or an auth proxy
