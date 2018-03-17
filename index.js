const express = require('express');
const path = require('path');
const request = require('request');
const queryString = require('querystring');
const cookieParser = require('cookie-parser');


var client_id = '63a722619740488e871293e04b610549'; // Your client id
var client_secret = '5828a750641f41b8b90a9bb7aa74b7c3'; // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri


const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.static(path.resolve(__dirname, './client/build'))).use(cookieParser());

const stateKey = 'spotify_auth_state';

generateRandomString = (length) =>{
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i=0; i<length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
};

app.get('/login', (req, res) => {
    let state = generateRandomString(16);
    //first we set random Set-Cookie Header (WHY??)
    res.cookie(stateKey, state);

    //Application requests authorisation
    let scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' + queryString.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    }));
});

app.get('/callback', (req, res) =>{
    //Application requests refresh token and access token after checking state parameter
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if(state == null || state !== storedState){
        res.redirect('/#' + queryString(stringify({error: 'state_mismatch'})));
    }
    else{
        res.clearCookie(stateKey);
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            from: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
              },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
              },
            json: true
        };

        request.post(authOptions, (error, response, body) => {
            if(!error && response.statusCode ===200) {
                let access_token = body.access_token,
                    refresh_token = body.refresh_token;
                let options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                //use access_token to access spotify-api
                request.get(options, (error, response, body) => {
                    console.log(body);
                });
                res.redirect('/#' + queryString.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
            }else{
                res.redirect('/#' + queryString.stringify({
                    error: 'invalid_token'
                }));
            }
        });
    }
});

app.get('/refresh_token', (req, res) => {
    //requesting access_token from refresh_token
    let refresh_token = req.query.refresh_token;
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        from: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            let access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.get('/', (req, res, next) => {
    console.log('*********Server running*********');
    res.send("Server started at http://localhost:" + PORT);
});

app.listen(PORT);