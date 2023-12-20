import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Allow any origin to access your server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.post('/send-email', async (req, res) => {
  try {
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
      },
      body: JSON.stringify(req.body),
      mode: 'cors',
    });

    // If the Content-Type header is missing, assume 'application/json'
    const contentType = sendGridResponse.headers.get('content-type') || 'application/json';

    // Check if the assumed Content-Type is valid
    if (contentType.includes('application/json')) {
      // Check if the response status is okay
      if (sendGridResponse.ok) {
        // Ensure that the response body is not empty before parsing it as JSON
        const responseBody = await sendGridResponse.text();
        console.error('SendGrid response body:', responseBody);

        if (responseBody) {
          const sendGridData = JSON.parse(responseBody);
          res.json(sendGridData);
        } else {
          console.error('Empty response body from SendGrid');
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        // Log the error status and additional details
        console.error('SendGrid response not okay:', sendGridResponse.status);
        console.error('SendGrid response headers:', sendGridResponse.headers.raw());

        const responseBody = await sendGridResponse.text();
        console.error('SendGrid response body:', responseBody);

        res.status(sendGridResponse.status).json({ error: 'SendGrid API Error' });
      }
    } else {
      // Log an error if the assumed Content-Type is invalid
      console.error('Invalid Content-Type in the response:', contentType);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
