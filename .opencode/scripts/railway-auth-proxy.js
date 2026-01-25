/**
 * Railway Auth Proxy for OpenCode Web
 *
 * GitHub OAuth authentication proxy that protects OpenCode Web with username allowlist.
 * Proxies authenticated requests to OpenCode Web running on port 4096.
 *
 * ============================================================================
 * SETUP INSTRUCTIONS
 * ============================================================================
 *
 * 1. CREATE GITHUB OAUTH APP
 *    --------------------------
 *    a) Go to GitHub Settings -> Developer settings -> OAuth Apps
 *    b) Click "New OAuth App"
 *    c) Fill in the details:
 *       - Application name: OpenCode Web (Railway)
 *       - Homepage URL: https://your-app.up.railway.app
 *       - Authorization callback URL: https://your-app.up.railway.app/auth/github/callback
 *    d) Click "Register application"
 *    e) Copy the Client ID and generate a Client Secret
 *
 * 2. SET RAILWAY ENVIRONMENT VARIABLES
 *    -----------------------------------
 *    Run these commands (replace with your actual values):
 *
 *    railway variables set GITHUB_CLIENT_ID=your_client_id
 *    railway variables set GITHUB_CLIENT_SECRET=your_client_secret
 *    railway variables set ALLOWED_GITHUB_USERNAME=your_github_username
 *    railway variables set SESSION_SECRET=$(openssl rand -hex 32)
 *
 * 3. OAUTH FLOW
 *    -----------
 *    User visits / -> Check session -> If not authenticated -> Redirect to /auth/github
 *    -> GitHub OAuth consent screen -> GitHub redirects to /auth/github/callback?code=...
 *    -> Exchange code for access token -> Fetch user profile (username)
 *    -> Check username === ALLOWED_GITHUB_USERNAME -> Create session -> Redirect to /
 *
 * ============================================================================
 */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration from environment variables
const PORT = process.env.PORT || 3000;
const OPENCODE_PORT = 4096;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const ALLOWED_GITHUB_USERNAME = process.env.ALLOWED_GITHUB_USERNAME;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
const requiredEnvVars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'ALLOWED_GITHUB_USERNAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('See the setup instructions at the top of this file.');
  process.exit(1);
}

// Determine callback URL based on environment
const getCallbackURL = (req) => {
  if (NODE_ENV === 'production') {
    // In production, use the host header to determine the callback URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}/auth/github/callback`;
  }
  return `http://localhost:${PORT}/auth/github/callback`;
};

const app = express();

// Trust proxy headers (required for Railway)
app.set('trust proxy', 1);

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback', // Relative URL, will be resolved by passport
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, done) => {
    // Extract username from GitHub profile
    const user = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName || profile.username,
      avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null
    };
    return done(null, user);
  }
));

// Health check endpoint (must be before auth middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GitHub OAuth routes (must be before auth middleware)
app.get('/auth/github', (req, res, next) => {
  // Dynamically set callback URL based on request
  const callbackURL = getCallbackURL(req);
  passport.authenticate('github', {
    scope: ['read:user'],
    callbackURL: callbackURL
  })(req, res, next);
});

app.get('/auth/github/callback',
  (req, res, next) => {
    const callbackURL = getCallbackURL(req);
    passport.authenticate('github', {
      failureRedirect: '/auth/error',
      callbackURL: callbackURL
    })(req, res, next);
  },
  (req, res) => {
    // Check username against allowlist
    if (req.user && req.user.username === ALLOWED_GITHUB_USERNAME) {
      // Store username in session for auth middleware
      req.session.githubUsername = req.user.username;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/auth/error');
        }
        res.redirect('/');
      });
    } else {
      console.log(`Unauthorized login attempt by: ${req.user ? req.user.username : 'unknown'}`);
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
        res.status(403).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Unauthorized</title></head>
          <body style="font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center;">
            <h1>Unauthorized</h1>
            <p>Your GitHub account (${req.user ? req.user.username : 'unknown'}) is not authorized to access this application.</p>
            <p>Only <strong>${ALLOWED_GITHUB_USERNAME}</strong> can access this instance.</p>
            <a href="/auth/github">Try again with a different account</a>
          </body>
          </html>
        `);
      });
    }
  }
);

// Auth error page
app.get('/auth/error', (req, res) => {
  res.status(401).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Authentication Error</title></head>
    <body style="font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center;">
      <h1>Authentication Error</h1>
      <p>Failed to authenticate with GitHub. Please try again.</p>
      <a href="/auth/github">Try again</a>
    </body>
    </html>
  `);
});

// Logout route
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/');
  });
});

// Auth middleware - check GitHub username for all other routes
const authMiddleware = (req, res, next) => {
  if (!req.session.githubUsername) {
    return res.redirect('/auth/github');
  }
  if (req.session.githubUsername !== ALLOWED_GITHUB_USERNAME) {
    return res.status(403).send('Unauthorized');
  }
  next();
};

// Apply auth middleware to all remaining routes
app.use(authMiddleware);

// Proxy authenticated requests to OpenCode Web
const openCodeProxy = createProxyMiddleware({
  target: `http://localhost:${OPENCODE_PORT}`,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Service Unavailable</title></head>
        <body style="font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center;">
          <h1>Service Unavailable</h1>
          <p>OpenCode Web is not responding. Please try again in a moment.</p>
          <p>If the problem persists, check the Railway logs.</p>
          <button onclick="location.reload()">Retry</button>
        </body>
        </html>
      `);
    }
  },
  onProxyReq: (proxyReq, req) => {
    // Add authenticated user info to proxied request headers
    if (req.session && req.session.githubUsername) {
      proxyReq.setHeader('X-GitHub-Username', req.session.githubUsername);
    }
  }
});

// Proxy all authenticated requests to OpenCode Web
app.use('/', openCodeProxy);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth proxy listening on port ${PORT}`);
  console.log(`Proxying authenticated requests to OpenCode Web on port ${OPENCODE_PORT}`);
  console.log(`Allowed GitHub username: ${ALLOWED_GITHUB_USERNAME}`);
  console.log(`Environment: ${NODE_ENV}`);
});
