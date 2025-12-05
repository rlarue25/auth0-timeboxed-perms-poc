require('dotenv').config();
const express = require('express');
const { auth  } = require('express-openid-connect');
const { ManagementClient } = require('auth0');
const session = require('express-session');

const app = express();

const auth0ManagementClient = new ManagementClient({
    domain: process.env.AUTH0_MGMT_CLIENT_DOMAIN,
    clientId: process.env.AUTH0_MGMT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
});

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,

  },
};

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


app.get('/', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
      return res.redirect('/login');
    }

    // Check if the session has expired.
    if (req.session.accessExpiresAt && Date.now() >= req.session.accessExpiresAt) {
      try {
        const userId = req.oidc.user.sub;

        await auth0ManagementClient.users.roles.delete(userId, {roles: ["rol_xAmC4cCVlFVtQ8r4"]})
        console.log(`service-pulse-temp-user removed for user ${userId} due to session expiration.`);

      } catch (error) {
        console.error('service-pulse-temp-user Error removing permissions on session expiration:', error);
      }

      // Clear the expiration and log the user out.
      delete req.session.accessExpiresAt;
      return res.redirect('/logout');
    }

    const decodeJWT = (token) => {
        if (!token) return null;
        try {
          const parts = token.split('.');
          if (parts.length !== 3) return null;

          return {
            header: JSON.parse(Buffer.from(parts[0], 'base64').toString()),
            payload: JSON.parse(Buffer.from(parts[1], 'base64').toString()),
            signature: parts[2]
          };
        } catch (e) {
          return null;
        }
      };

    const accessToken = req.oidc.accessToken?.access_token;
    const decodedToken = decodeJWT(accessToken);
    const permissions = decodedToken?.payload?.permissions || [];

    // If the user doesn't have the 'see:stuff' permission, log them out immediately.
    if (!permissions.includes('see:stuff')) {
        console.log(`User ${req.oidc.user.sub} lacks 'see:stuff' permission. Logging out.`);
        return res.redirect('/logout');
    }

    // If the user doesn't have the 'ttl:infinite' permission and no expiry is set,
    // set an expiry on their session for 10 seconds from now.
    if (!permissions.includes('ttl:infinite') && !req.session.accessExpiresAt) {
      req.session.accessExpiresAt = Date.now() + 10000; // 10-second lifetime
      console.log(`Session expiration set for user ${req.oidc.user.sub}`);
    }

  const data = {
    user: req.oidc.user,
    accessToken: {
      encoded: req.oidc.accessToken?.access_token,
      decoded: decodeJWT(req.oidc.accessToken?.access_token)
    },
    idToken: {
      encoded: req.oidc.idToken,
      decoded: decodeJWT(req.oidc.idToken)
    },
    refreshToken: req.oidc.refreshToken
  };

  res.send('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
