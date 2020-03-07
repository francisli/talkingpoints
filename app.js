require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const path = require('path');

const NodeCache = require( "node-cache" );
const cache = new NodeCache();

const {google} = require('googleapis');
const sheets = google.sheets({version: 'v4', auth: process.env.GOOGLE_API_KEY});

const app = express();

app.use(logger('dev'));

app.get('/api/data', function(req, res) {
  let data = cache.get('data');
  if (data) {
    res.json(data);
  } else {
    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A1:B1000'
    }, (err, apires) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      data = apires.data.values.map((row, index) => ({id: index, topic: row[0], content: row[1]}));
      cache.set('data', data, 60)
      res.json(data);
    });
  }
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

module.exports = app;
