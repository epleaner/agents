---
description: Deploy and manage the OpenCode agent framework on Fly.io
---
Manage the Fly.io deployment of this agent framework. Use the `flyio` skill to handle deployment, Machine lifecycle, secrets, and SSH access.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. If no action specified, show current status
2. For first-time setup, guide through: deploy → set secrets → connect
3. Always check prerequisites (flyctl installed, authenticated) before operations
4. Remind about cost savings: stop Machines when not in use

**Common Actions**
- `/flyio deploy` - Deploy or update the app
- `/flyio status` - Check Machine status
- `/flyio start` - Start stopped Machine
- `/flyio stop` - Stop Machine (pause billing)
- `/flyio ssh` - Connect via SSH
- `/flyio logs` - View recent logs
- `/flyio secrets set OPENROUTER_API_KEY=...` - Configure secrets

**Output**
- Deployment status and connection instructions
- Machine state and resource usage
- Troubleshooting guidance for errors
