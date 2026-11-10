## ADDED Requirements

### Requirement: Railway Platform Deployment

The OpenCode Web deployment SHALL support deployment to Railway as the primary cloud platform, enabling remote browser-based access with GitHub OAuth authentication.

#### Scenario: Initial Railway deployment
- **WHEN** user runs the deployment script for the first time
- **THEN** the script SHALL check for Railway CLI installation
- **AND** prompt for Railway authentication if not logged in
- **AND** create a new Railway project
- **AND** create a persistent volume for workspace data
- **AND** prompt for GitHub OAuth credentials
- **AND** deploy the OpenCode Web application with auth proxy

#### Scenario: Subsequent Railway deployment
- **WHEN** user runs the deployment script with existing project
- **THEN** the script SHALL detect the existing Railway project
- **AND** rebuild and deploy the updated application
- **AND** preserve the existing persistent volume data
- **AND** display the deployment URL

### Requirement: GitHub OAuth Authentication

The deployment SHALL use GitHub OAuth for authentication with username allowlist to restrict access to authorized users only.

#### Scenario: GitHub OAuth flow
- **WHEN** unauthenticated user visits the deployment URL
- **THEN** they SHALL be redirected to GitHub OAuth consent screen
- **AND** after authorization, GitHub SHALL redirect to callback URL
- **AND** the auth proxy SHALL exchange code for access token
- **AND** fetch the user's GitHub username
- **AND** validate username against ALLOWED_GITHUB_USERNAME environment variable

#### Scenario: Authorized user access
- **WHEN** user's GitHub username matches the allowlist
- **THEN** a session SHALL be created with 7-day expiration
- **AND** user SHALL be redirected to OpenCode Web interface
- **AND** all subsequent requests SHALL be authenticated via session

#### Scenario: Unauthorized user access
- **WHEN** user's GitHub username does NOT match the allowlist
- **THEN** access SHALL be denied with 403 Forbidden response
- **AND** user SHALL see "Unauthorized" message
- **AND** no session SHALL be created

### Requirement: Auth Proxy Architecture

The deployment SHALL use an authentication proxy that handles OAuth and forwards authenticated requests to OpenCode Web.

#### Scenario: Auth proxy startup
- **WHEN** the Railway service starts
- **THEN** the auth proxy SHALL start on port 3000
- **AND** OpenCode Web SHALL start on port 4096
- **AND** the auth proxy SHALL wait for OpenCode Web to be ready
- **AND** health check endpoint SHALL be available at /health

#### Scenario: Request proxying
- **WHEN** authenticated user makes a request
- **THEN** the auth proxy SHALL validate the session
- **AND** forward the request to OpenCode Web on port 4096
- **AND** return the response to the user
- **AND** preserve all headers and cookies

#### Scenario: Session management
- **WHEN** user's session is valid
- **THEN** requests SHALL be proxied without re-authentication
- **WHEN** user's session expires (after 7 days)
- **THEN** user SHALL be redirected to GitHub OAuth flow

### Requirement: OpenCode Web Configuration

The deployment SHALL configure OpenCode Web to work with the auth proxy and disable built-in authentication.

#### Scenario: OpenCode Web server configuration
- **WHEN** OpenCode Web starts
- **THEN** it SHALL bind to 0.0.0.0:4096
- **AND** OPENCODE_SERVER_PASSWORD SHALL be empty (auth handled by proxy)
- **AND** CORS SHALL allow requests from auth proxy (localhost:3000)
- **AND** OPENCODE_DATA_DIR SHALL point to persistent volume

#### Scenario: OpenCode Web features
- **WHEN** user accesses OpenCode Web via auth proxy
- **THEN** all standard features SHALL be available:
  - Session management
  - Server status monitoring
  - Terminal attachment
  - Agent execution

### Requirement: Persistent Storage

The deployment SHALL use Railway persistent disk to preserve workspace state across deployments and restarts.

#### Scenario: Volume mount configuration
- **WHEN** the Railway service starts
- **THEN** persistent volume SHALL be mounted at /app/data
- **AND** symlinks SHALL be created:
  - /app/.opencode → /app/data/.opencode
  - /app/workspace → /app/data/workspace
- **AND** directories SHALL be created if not exist:
  - /app/data/.opencode
  - /app/data/workspace
  - /app/data/logs

#### Scenario: Data persistence
- **WHEN** service is redeployed
- **THEN** beads database SHALL be preserved
- **AND** OpenCode session data SHALL be preserved
- **AND** cloned agents repository SHALL be preserved
- **AND** application logs SHALL be preserved

#### Scenario: Volume backup
- **WHEN** user needs to backup volume data
- **THEN** Railway automatic backups SHALL be available
- **AND** backups SHALL be restorable via Railway dashboard
- **AND** backup procedures SHALL be documented

### Requirement: Git Repository Sync

The deployment SHALL automatically clone the agents repository on first deploy and support manual sync operations.

#### Scenario: Initial repository clone
- **WHEN** service starts for the first time
- **THEN** the start script SHALL check if /app/data/workspace/.git exists
- **AND** if not exists, clone the agents repository
- **AND** use AGENTS_REPO_URL environment variable if set
- **AND** otherwise infer from git remote origin
- **AND** use GITHUB_TOKEN for authentication if set

#### Scenario: Manual repository sync
- **WHEN** user runs the git sync helper script
- **THEN** it SHALL pull latest changes from remote
- **AND** stash local changes if any
- **AND** display sync status
- **AND** be accessible via: `railway run bash /app/.opencode/scripts/git-sync.sh`

#### Scenario: Private repository access
- **WHEN** agents repository is private
- **THEN** GITHUB_TOKEN environment variable SHALL be set
- **AND** git clone SHALL use token for authentication
- **AND** git pull SHALL use token for authentication

### Requirement: Shell Access

The deployment SHALL provide shell access via Railway CLI for debugging and git operations.

#### Scenario: Interactive shell access
- **WHEN** user runs `railway run bash`
- **THEN** an interactive bash shell SHALL be provided
- **AND** current directory SHALL be /app
- **AND** all environment variables SHALL be available
- **AND** persistent volume SHALL be accessible at /app/data

#### Scenario: Single command execution
- **WHEN** user runs `railway run bash -c "command"`
- **THEN** the command SHALL execute in the service environment
- **AND** output SHALL be returned to user
- **AND** exit code SHALL be preserved

#### Scenario: Git operations via shell
- **WHEN** user accesses shell and navigates to /app/data/workspace
- **THEN** all git commands SHALL work:
  - git status
  - git pull
  - git commit
  - git push
- **AND** git credentials SHALL be available via GITHUB_TOKEN

### Requirement: Environment Variables Management

The deployment SHALL use Railway environment variables for all secrets and configuration.

#### Scenario: Required environment variables
- **WHEN** deployment is configured
- **THEN** the following variables SHALL be set:
  - GITHUB_CLIENT_ID (GitHub OAuth app client ID)
  - GITHUB_CLIENT_SECRET (GitHub OAuth app client secret)
  - ALLOWED_GITHUB_USERNAME (authorized GitHub username)
  - SESSION_SECRET (random secret for session encryption)
  - ANTHROPIC_API_KEY (Claude API key)
  - NODE_ENV=production

#### Scenario: Optional environment variables
- **WHEN** additional features are needed
- **THEN** the following variables MAY be set:
  - OPENAI_API_KEY (OpenAI API key)
  - GOOGLE_AI_API_KEY (Google AI API key)
  - GITHUB_TOKEN (for private repo access)
  - AGENTS_REPO_URL (custom agents repo URL)

#### Scenario: Secrets security
- **WHEN** environment variables are set
- **THEN** they SHALL be encrypted at rest by Railway
- **AND** never appear in logs or error messages
- **AND** be injectable into service environment
- **AND** be rotatable without code changes

### Requirement: Deployment Script

The deployment workflow SHALL include a script that automates the entire deployment process.

#### Scenario: Script prerequisites check
- **WHEN** deployment script is run
- **THEN** it SHALL verify Railway CLI is installed
- **AND** verify user is authenticated to Railway
- **AND** display helpful error messages if prerequisites missing

#### Scenario: Script deployment operations
- **WHEN** deployment script completes successfully
- **THEN** it SHALL have created/updated the Railway project
- **AND** created the persistent volume if needed
- **AND** set required environment variables if missing
- **AND** deployed the application
- **AND** displayed the deployment URL

#### Scenario: Script utility commands
- **WHEN** user runs script with utility flags
- **THEN** `deploy` SHALL deploy to Railway
- **AND** `status` SHALL show deployment status
- **AND** `logs` SHALL tail application logs
- **AND** `shell` SHALL open interactive shell
- **AND** `domain` SHALL display deployment URL
- **AND** `help` SHALL display usage instructions

### Requirement: Health Monitoring

The deployment SHALL provide health check endpoint for Railway monitoring.

#### Scenario: Health check endpoint
- **WHEN** Railway health check pings /health
- **THEN** auth proxy SHALL respond with 200 OK
- **AND** response SHALL include status: "healthy"
- **AND** response SHALL include timestamp
- **AND** response SHALL verify OpenCode Web is reachable

#### Scenario: Health check failure
- **WHEN** OpenCode Web is not reachable
- **THEN** health check SHALL respond with 503 Service Unavailable
- **AND** Railway SHALL attempt to restart the service
- **AND** restart policy SHALL allow up to 3 retries

### Requirement: Cost Optimization

The deployment SHALL use minimal resources appropriate for personal use while allowing easy scaling.

#### Scenario: Default resource allocation
- **WHEN** deploying with default configuration
- **THEN** Railway Pro plan SHALL be recommended (1GB RAM, 5GB disk)
- **AND** total monthly cost SHALL be approximately $10
- **AND** auto-sleep MAY be enabled for cost savings

#### Scenario: Resource scaling
- **WHEN** user needs more resources
- **THEN** RAM SHALL be adjustable via Railway dashboard
- **AND** disk size SHALL be expandable
- **AND** pricing SHALL scale linearly with resources

### Requirement: Security

The deployment SHALL implement security best practices for authentication, secrets, and network access.

#### Scenario: HTTPS enforcement
- **WHEN** user accesses the deployment URL
- **THEN** Railway SHALL automatically provide HTTPS
- **AND** HTTP requests SHALL redirect to HTTPS
- **AND** TLS certificate SHALL be managed by Railway

#### Scenario: Session security
- **WHEN** user authenticates
- **THEN** session cookie SHALL be httpOnly
- **AND** session cookie SHALL be secure (HTTPS only)
- **AND** session cookie SHALL have sameSite=lax
- **AND** session SHALL expire after 7 days

#### Scenario: Network isolation
- **WHEN** OpenCode Web is running
- **THEN** it SHALL only be accessible via auth proxy
- **AND** port 4096 SHALL not be exposed externally
- **AND** only port 3000 (auth proxy) SHALL be exposed

### Requirement: Documentation

The deployment SHALL include comprehensive documentation for setup, usage, and troubleshooting.

#### Scenario: Setup documentation
- **WHEN** user reads deployment documentation
- **THEN** it SHALL include:
  - Prerequisites (Railway CLI, GitHub OAuth app)
  - Step-by-step setup instructions
  - Environment variable configuration
  - Initial deployment commands

#### Scenario: Usage documentation
- **WHEN** user reads usage documentation
- **THEN** it SHALL include:
  - How to access web UI
  - How to use shell access
  - How to sync git repository
  - How to view logs
  - How to redeploy

#### Scenario: Troubleshooting documentation
- **WHEN** user encounters issues
- **THEN** troubleshooting guide SHALL cover:
  - "Unauthorized after OAuth" - check ALLOWED_GITHUB_USERNAME
  - "Cannot connect to OpenCode Web" - check logs
  - "Session expired" - re-authenticate
  - "Disk full" - clean up logs, expand volume
  - "Git pull fails" - check GITHUB_TOKEN
