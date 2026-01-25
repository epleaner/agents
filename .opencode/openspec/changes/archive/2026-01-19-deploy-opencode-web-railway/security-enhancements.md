# Security Enhancements for OpenCode Web Railway Deployment

## Additional Protections Against Unauthorized Access and Abuse

Beyond the basic GitHub OAuth + username allowlist, here are critical additional security measures to prevent unauthorized access and abuse:

---

## 1. Rate Limiting

### Request Rate Limiting
**Problem:** Attackers could spam requests, causing high costs or service degradation.

**Solution:** Implement rate limiting at multiple levels.

```javascript
// In railway-auth-proxy.js
const rateLimit = require('express-rate-limit');

// Global rate limit: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint rate limit: 5 OAuth attempts per hour per IP
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use(globalLimiter);
app.use('/auth/github', authLimiter);
```

**Environment Variables:**
- `RATE_LIMIT_WINDOW_MS=900000` (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS=100`
- `AUTH_RATE_LIMIT_MAX=5`

---

## 2. IP Allowlist (Optional but Recommended)

### Restrict Access by IP Address
**Problem:** Even with GitHub OAuth, you may want to restrict access to known IPs.

**Solution:** Add IP allowlist middleware.

```javascript
// In railway-auth-proxy.js
const ipAllowlist = process.env.ALLOWED_IPS?.split(',') || [];

function ipAllowlistMiddleware(req, res, next) {
  if (ipAllowlist.length === 0) {
    return next(); // No IP restriction if not configured
  }
  
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (ipAllowlist.includes(clientIp)) {
    return next();
  }
  
  console.warn(`Blocked request from unauthorized IP: ${clientIp}`);
  return res.status(403).send('Access denied: IP not authorized');
}

app.use(ipAllowlistMiddleware);
```

**Environment Variable:**
- `ALLOWED_IPS=1.2.3.4,5.6.7.8` (comma-separated list, optional)

**Note:** This is optional because your IP may change. Use only if you have a static IP or VPN.

---

## 3. Session Security Hardening

### Enhanced Session Configuration
**Problem:** Weak session configuration could allow session hijacking.

**Solution:** Harden session cookies and add session validation.

```javascript
// In railway-auth-proxy.js
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'opencode.sid', // Custom name (don't use default 'connect.sid')
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JavaScript access
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',     // CSRF protection
    domain: process.env.RAILWAY_PUBLIC_DOMAIN, // Restrict to your domain
  },
  // Optional: Use Redis for session storage (more secure than memory)
  // store: new RedisStore({ client: redisClient }),
}));

// Session validation middleware
function validateSession(req, res, next) {
  if (!req.session.githubUsername) {
    return res.redirect('/auth/github');
  }
  
  // Check session age (force re-auth after 7 days)
  const sessionAge = Date.now() - req.session.createdAt;
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  
  if (sessionAge > maxAge) {
    req.session.destroy();
    return res.redirect('/auth/github');
  }
  
  next();
}
```

---

## 4. Request Logging and Monitoring

### Comprehensive Audit Logging
**Problem:** Without logs, you can't detect unauthorized access attempts.

**Solution:** Log all authentication attempts and suspicious activity.

```javascript
// In railway-auth-proxy.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '/app/data/logs/auth.log' }),
    new winston.transports.Console(),
  ],
});

// Log all authentication attempts
app.get('/auth/github/callback', (req, res, next) => {
  logger.info('OAuth callback received', {
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  next();
});

// Log successful authentications
passport.authenticate('github', (err, user, info) => {
  if (user) {
    logger.info('Authentication successful', {
      username: user.username,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.warn('Authentication failed', {
      reason: info?.message || 'Unknown',
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  }
});

// Log unauthorized access attempts
app.use((req, res, next) => {
  if (req.session.githubUsername !== process.env.ALLOWED_GITHUB_USERNAME) {
    logger.warn('Unauthorized access attempt', {
      username: req.session.githubUsername,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }
  next();
});
```

**Review logs regularly:**
```bash
railway run bash -c "tail -f /app/data/logs/auth.log"
```

---

## 5. LLM API Key Protection

### Prevent API Key Leakage and Abuse
**Problem:** If someone gains access, they could abuse your LLM API keys, causing high costs.

**Solution:** Implement API usage monitoring and limits.

```javascript
// In railway-auth-proxy.js or as middleware
const apiUsageTracker = {};

function trackApiUsage(req, res, next) {
  const username = req.session.githubUsername;
  const today = new Date().toISOString().split('T')[0];
  const key = `${username}:${today}`;
  
  apiUsageTracker[key] = (apiUsageTracker[key] || 0) + 1;
  
  // Alert if usage exceeds threshold
  const dailyLimit = parseInt(process.env.DAILY_REQUEST_LIMIT || '1000');
  if (apiUsageTracker[key] > dailyLimit) {
    logger.error('Daily request limit exceeded', {
      username,
      count: apiUsageTracker[key],
      limit: dailyLimit,
    });
    
    // Optional: Block further requests
    return res.status(429).send('Daily request limit exceeded');
  }
  
  next();
}

app.use(trackApiUsage);
```

**Environment Variables:**
- `DAILY_REQUEST_LIMIT=1000` (adjust based on your usage)

**Additional Protection:** Set spending limits in your LLM provider dashboards:
- Anthropic: Set monthly budget limit
- OpenAI: Set hard usage limits
- Google AI: Set quota limits

---

## 6. Automated Alerts

### Real-time Notifications for Suspicious Activity
**Problem:** You won't know about attacks until it's too late.

**Solution:** Send alerts for suspicious activity.

```javascript
// In railway-auth-proxy.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD,
  },
});

function sendAlert(subject, message) {
  if (!process.env.ALERT_EMAIL) return;
  
  transporter.sendMail({
    from: process.env.ALERT_EMAIL,
    to: process.env.ALERT_EMAIL,
    subject: `[OpenCode Security Alert] ${subject}`,
    text: message,
  });
}

// Alert on unauthorized access attempts
app.use((req, res, next) => {
  if (req.session.githubUsername && 
      req.session.githubUsername !== process.env.ALLOWED_GITHUB_USERNAME) {
    sendAlert(
      'Unauthorized Access Attempt',
      `User ${req.session.githubUsername} attempted to access from IP ${req.ip}`
    );
  }
  next();
});

// Alert on rate limit violations
const alertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  handler: (req, res) => {
    sendAlert(
      'Rate Limit Exceeded',
      `IP ${req.ip} exceeded rate limit`
    );
    res.status(429).send('Too many requests');
  },
});
```

**Environment Variables:**
- `ALERT_EMAIL=your-email@gmail.com`
- `ALERT_EMAIL_PASSWORD=app-specific-password`

**Alternative:** Use Railway webhooks or external services like:
- Sentry (error tracking)
- Datadog (monitoring)
- PagerDuty (alerting)

---

## 7. Disable Public Endpoints

### Minimize Attack Surface
**Problem:** Unnecessary endpoints increase attack surface.

**Solution:** Disable or protect all non-essential endpoints.

```javascript
// In railway-auth-proxy.js

// Only expose necessary endpoints
const publicPaths = ['/auth/github', '/auth/github/callback', '/health'];

app.use((req, res, next) => {
  // Allow public paths
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  // Require authentication for all other paths
  if (!req.session.githubUsername) {
    return res.redirect('/auth/github');
  }
  
  // Require username match
  if (req.session.githubUsername !== process.env.ALLOWED_GITHUB_USERNAME) {
    return res.status(403).send('Unauthorized');
  }
  
  next();
});

// Disable directory listing and file browsing
app.disable('x-powered-by'); // Hide Express
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 8. Regular Security Audits

### Automated Security Checks
**Problem:** Vulnerabilities in dependencies could be exploited.

**Solution:** Regular dependency audits and updates.

```bash
# Add to package.json scripts
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix"
  }
}
```

**Set up automated checks:**
1. Enable Dependabot on GitHub (automatic PR for security updates)
2. Run `npm audit` in CI/CD pipeline
3. Use Snyk or similar for continuous monitoring

---

## 9. Emergency Shutdown Mechanism

### Quick Response to Attacks
**Problem:** If under attack, you need to shut down quickly.

**Solution:** Implement emergency shutdown via environment variable.

```javascript
// In railway-auth-proxy.js

// Check emergency shutdown flag
app.use((req, res, next) => {
  if (process.env.EMERGENCY_SHUTDOWN === 'true') {
    return res.status(503).send('Service temporarily unavailable');
  }
  next();
});
```

**Emergency shutdown:**
```bash
# Immediately disable all access
railway variables set EMERGENCY_SHUTDOWN=true

# Re-enable after investigation
railway variables set EMERGENCY_SHUTDOWN=false
```

---

## 10. Cost Protection

### Prevent Runaway Costs
**Problem:** Abuse could lead to unexpected high bills.

**Solution:** Multiple layers of cost protection.

### A. Railway Resource Limits
```bash
# Set memory limit (prevents memory exhaustion attacks)
railway variables set RAILWAY_MAX_MEMORY=1024  # 1GB

# Set CPU limit
railway variables set RAILWAY_MAX_CPU=1
```

### B. LLM API Spending Limits
**Anthropic:**
1. Go to Anthropic Console → Settings → Billing
2. Set "Monthly spending limit" to your budget (e.g., $50)

**OpenAI:**
1. Go to OpenAI Dashboard → Settings → Billing → Usage limits
2. Set "Hard limit" to your budget (e.g., $50)

### C. Railway Spending Alerts
1. Go to Railway Dashboard → Project Settings → Billing
2. Set up spending alerts at thresholds (e.g., $20, $50, $100)

### D. Request Quotas
```javascript
// In railway-auth-proxy.js
const requestQuota = {
  daily: parseInt(process.env.DAILY_REQUEST_QUOTA || '1000'),
  hourly: parseInt(process.env.HOURLY_REQUEST_QUOTA || '100'),
};

// Track and enforce quotas
// (implementation similar to API usage tracking above)
```

---

## Summary: Recommended Security Stack

### Essential (Implement Immediately)
1. ✅ GitHub OAuth + username allowlist (already in proposal)
2. ✅ Rate limiting (global + auth endpoints)
3. ✅ Session security hardening
4. ✅ Request logging
5. ✅ LLM API spending limits

### Highly Recommended
6. ✅ Automated alerts (email or Sentry)
7. ✅ Emergency shutdown mechanism
8. ✅ Security headers (X-Frame-Options, etc.)
9. ✅ Regular dependency audits

### Optional (Based on Threat Model)
10. ⚠️ IP allowlist (only if you have static IP)
11. ⚠️ Redis session store (for multi-instance deployments)
12. ⚠️ WAF (Web Application Firewall) via Cloudflare

---

## Implementation Checklist

Add these tasks to the existing tasks.md:

### Section 9: Security Hardening (NEW)

- [ ] 9.1 Add rate limiting middleware
      Dependencies: express-rate-limit
      Validation: Test with curl in loop, verify 429 after limit
      
- [ ] 9.2 Implement request logging
      Dependencies: winston
      Validation: Check /app/data/logs/auth.log for entries
      
- [ ] 9.3 Add session security hardening
      Update: railway-auth-proxy.js session config
      Validation: Inspect cookies in browser DevTools
      
- [ ] 9.4 Set up automated alerts
      Dependencies: nodemailer (or Sentry)
      Validation: Trigger test alert, verify email received
      
- [ ] 9.5 Configure LLM API spending limits
      Platforms: Anthropic, OpenAI dashboards
      Validation: Verify limits set in provider dashboards
      
- [ ] 9.6 Add emergency shutdown mechanism
      Update: railway-auth-proxy.js
      Validation: Set EMERGENCY_SHUTDOWN=true, verify 503 response
      
- [ ] 9.7 Implement security headers
      Update: railway-auth-proxy.js
      Validation: Check response headers with curl -I
      
- [ ] 9.8 Set up dependency auditing
      Add: npm audit to package.json scripts
      Validation: Run npm audit, verify no critical issues

**Estimated effort:** 4-6 hours

---

## Monitoring Dashboard (Future Enhancement)

Consider building a simple monitoring dashboard:

```javascript
// GET /admin/security-dashboard (authenticated)
app.get('/admin/security-dashboard', requireAuth, (req, res) => {
  res.json({
    rateLimitStatus: getRateLimitStats(),
    recentAuthAttempts: getRecentAuthAttempts(),
    apiUsage: getApiUsageStats(),
    activeSessionCount: getActiveSessionCount(),
    alerts: getRecentAlerts(),
  });
});
```

This gives you visibility into:
- Rate limit violations
- Failed auth attempts
- API usage trends
- Active sessions
- Recent security alerts

---

## Cost Estimate with Security Enhancements

| Item | Monthly Cost |
|------|--------------|
| Railway Pro (1GB RAM, 5GB disk) | $10 |
| Email alerts (Gmail) | $0 |
| Sentry (optional, free tier) | $0 |
| LLM APIs (with spending limits) | $5-20 |
| **Total** | **$15-30/month** |

No additional cost for security features!
