const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'dbt-lectures.json'), // Make sure this file exists
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendToSheet(email, githubUser) {
  try {
    console.log("Authenticating...");
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    console.log("Authenticating Success...");

    const spreadsheetId = '13NTXPuCsvwEQBecVAPWOvt-nOBl166hcLqcu5tjuZw0';
    const range = 'FormResponses!A:C';
    console.log("Append to range");
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
      values: [[new Date().toISOString(), githubUser, email]],
      },
    });
    console.log("Data loaded to sheet", result.data);


  } catch (error) {
    console.error("Error in gsheet", error.message);

  }
  
  
  // https://docs.google.com/spreadsheets/d/13NTXPuCsvwEQBecVAPWOvt-nOBl166hcLqcu5tjuZw0/edit?pli=1&gid=0#gid=0
   // Replace with your actual sheet ID
  

  
}

module.exports = appendToSheet;
