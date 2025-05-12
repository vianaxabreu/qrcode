const express = require('express');
const path = require('path');
const app = express();

const CLIENT_ID = 'Ov23liKCfP18ezZGnfV3';
const CLIENT_SECRET = 'd696f47fa6323bd4b204a553ae0640502038d2ac';

app.use(express.static(path.join(__dirname, 'public')));

// GitHub OAuth callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).send('No access token received');
    }

    // 2. Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'OAuth App'
      }
    });
    const userData = await userRes.json();

    // 3. Get user email(s)
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'OAuth App'
      }
    });
    const emails = await emailRes.json();
    const primaryEmail = emails.find(e => e.primary)?.email || 'Not found';

    res.send(`Hello ${userData.login}, your email is ${primaryEmail}`);

    const appendToSheet = require('./sheets');
    await appendToSheet(primaryEmail, userData.login);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('GitHub login failed.');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
