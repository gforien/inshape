require('dotenv-safe').config();


//      dependancies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rp = require('request-promise');


//     get token
function getToken(code, clientId) {
  const uri = `https://api.miro.com/v1/oauth/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${process.env.CLIENT_SECRET}&code=${code}&redirect_uri=${process.env.BASE_URL}/oauth`;
  const options = {method: 'POST', uri: uri};

  return rp(options)
    .then((res) => JSON.parse(res))
    .catch((error) => {
      console.error(`\n\nError for ${options.uri}`);
      console.error(`Status code:`, error.statusCode);
      throw error;
    });
}


//      app
const app = express();
const port = 8080;
app.use(cors());
app.use('/static', express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.status(200).send(`
    <h3>Status 200 OK</h3>
    <h4>OAuth redirect uri</h4>
    <p>${process.env.BASE_URL}/oauth</p>
    <h4>Web-plugin iframe uri</h4>
    <p>${process.env.BASE_URL}/static/index.html</p>`);
});

app.get('/oauth', async (req, res) => {
  const response = await oAuth.getToken(req.query.code, req.query.client_id);
  res.send(`App has been installed<br>response:<br><pre>${JSON.stringify(response, null, 2)}</pre>`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});