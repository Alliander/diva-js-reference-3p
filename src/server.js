const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const diva = require('diva-irma-js');
const simpleSession = require('./modules/simple-session');

// TODO: get these from config
const port = 4000;
const cookieSecret = 'StRoNGs3crE7';
const app = express();
app.use(cookieParser(cookieSecret));
app.use(cookieEncrypter(cookieSecret));

app.use(simpleSession);

app.use(bodyParser.text()); // TODO: restrict to one endpoint

app.get('/api/get-session', require('./actions/get-session'));
app.get('/api/deauthenticate', require('./actions/deauthenticate'));
app.post('/api/complete-disclosure-session/:sessionToken', require('./actions/complete-disclosure-session'));

app.get('/api/start-disclosure-session', require('./actions/start-disclosure-session'));

app.use('/api/only-for-x', diva.requireAttribute('pbdf.pbdf.idin.gender'), require('./actions/only-for-x'));

app.listen(port, () => {
  console.log(`Diva Reference Third Party backend listening on port ${port} !`); // eslint-disable-line no-console
  console.log(`Diva version ${diva.version()}`); // eslint-disable-line no-console
});
