/**
 * Template content for configuration files
 * These are clean templates with placeholder values for sensitive data
 */

export const OPENCODE_JSON_TEMPLATE = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "exa": {
      "type": "remote",
      "url": "https://mcp.exa.ai/mcp",
      "headers": {
        "exaApiKey": "YOUR_EXA_API_KEY_HERE"
      },
      "enabled": true
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  },
  "agent": {
    "build": {
      "disable": true
    },
    "plan": {
      "disable": true
    }
  }
}
`;

/**
 * Returns the template content for a config file
 */
export function getConfigTemplate(filename: string): string | null {
  switch (filename) {
    case 'opencode.json':
      return OPENCODE_JSON_TEMPLATE;
    default:
      return null;
  }
}
