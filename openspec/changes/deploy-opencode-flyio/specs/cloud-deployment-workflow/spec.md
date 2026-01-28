## ADDED Requirements

### Requirement: Fly.io Deployment Support

The cloud deployment workflow SHALL support deployment to Fly.io as a primary cloud platform, enabling remote access to OpenCode agents via SSH.

#### Scenario: Initial Fly.io deployment
- **WHEN** user runs the deployment script for the first time
- **THEN** the script SHALL check for flyctl installation
- **AND** prompt for Fly.io authentication if not logged in
- **AND** create a new Fly.io app with unique name
- **AND** create a persistent volume for workspace data
- **AND** prompt for required API secrets (ANTHROPIC_API_KEY)
- **AND** deploy the containerized OpenCode environment

#### Scenario: Subsequent Fly.io deployment
- **WHEN** user runs the deployment script with existing app
- **THEN** the script SHALL detect the existing app configuration
- **AND** rebuild and deploy the updated container image
- **AND** preserve the existing persistent volume data
- **AND** display SSH connection instructions

### Requirement: Container Configuration

The deployment SHALL use a Docker container optimized for OpenCode agent execution with all required dependencies.

#### Scenario: Container includes required dependencies
- **WHEN** the container image is built
- **THEN** it SHALL include Node.js 20 LTS runtime
- **AND** include git for repository operations
- **AND** include the OpenCode CLI installed globally
- **AND** include bash for script execution
- **AND** include curl for API operations

#### Scenario: Container startup
- **WHEN** the container starts on Fly.io
- **THEN** it SHALL keep running to accept SSH connections
- **AND** have the repository code available at /app
- **AND** have environment variables set from Fly secrets

### Requirement: Persistent Storage

The deployment SHALL use a Fly.io persistent volume to preserve workspace state across deployments and restarts.

#### Scenario: Volume mount configuration
- **WHEN** the Fly.io Machine starts
- **THEN** the persistent volume SHALL be mounted at /app/.opencode
- **AND** beads database SHALL be preserved across restarts
- **AND** Ralph session state SHALL be preserved
- **AND** OpenSpec changes in progress SHALL be preserved

#### Scenario: Volume backup and recovery
- **WHEN** user needs to backup volume data
- **THEN** flyctl volumes snapshots SHALL create point-in-time backup
- **AND** snapshots SHALL be restorable to new volumes
- **AND** backup procedures SHALL be documented

### Requirement: Secure Remote Access

The deployment SHALL provide secure access to the OpenCode environment without exposing unnecessary network services.

#### Scenario: SSH-only access
- **WHEN** the deployment is complete
- **THEN** access SHALL be available only via flyctl ssh console
- **AND** no HTTP/HTTPS ports SHALL be exposed
- **AND** SSH connection SHALL be encrypted end-to-end

#### Scenario: Secrets management
- **WHEN** API keys are required for LLM providers
- **THEN** secrets SHALL be stored via flyctl secrets
- **AND** secrets SHALL be encrypted at rest
- **AND** secrets SHALL be injected as environment variables
- **AND** secrets SHALL NOT appear in container image layers

### Requirement: Cost-Effective Resource Allocation

The deployment SHALL use minimal resources appropriate for CLI workloads while allowing easy scaling.

#### Scenario: Default resource allocation
- **WHEN** deploying with default configuration
- **THEN** Machine size SHALL be shared-cpu-1x with 512MB RAM
- **AND** persistent volume SHALL be 1GB
- **AND** total monthly cost SHALL be approximately $5-10

#### Scenario: Resource scaling
- **WHEN** user needs more resources
- **THEN** memory SHALL be adjustable via fly.toml
- **AND** CPU SHALL be upgradeable to dedicated cores
- **AND** volume size SHALL be expandable

### Requirement: Deployment Script

The deployment workflow SHALL include a script that automates the entire deployment process.

#### Scenario: Script prerequisites check
- **WHEN** deployment script is run
- **THEN** it SHALL verify flyctl is installed
- **AND** verify user is authenticated to Fly.io
- **AND** display helpful error messages if prerequisites missing

#### Scenario: Script operations
- **WHEN** deployment script completes successfully
- **THEN** it SHALL have created/updated the Fly.io app
- **AND** created the persistent volume if needed
- **AND** set required secrets if missing
- **AND** deployed the container image
- **AND** displayed SSH connection instructions

#### Scenario: Script utility functions
- **WHEN** user runs script with utility flags
- **THEN** `--stop` SHALL stop the Machine to pause billing
- **AND** `--start` SHALL start a stopped Machine
- **AND** `--status` SHALL display current Machine state
- **AND** `--help` SHALL display usage instructions
