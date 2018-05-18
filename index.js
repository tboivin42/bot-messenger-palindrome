import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import http from 'http';
import request from 'request';

const app = express();

app.set('port', 8080);
app.use(bodyParser.json());

const VALIDATION_TOKEN = "kayak";

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === VALIDATION_TOKEN){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
})

app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

const palindrome = (str) => {
  const lowRegStr = str.toLowerCase().replace(/[\W_]/g, '');
  const reverseStr = lowRegStr.split('').reverse().join('');
  return reverseStr === lowRegStr;
}

const sendMessage = (event) => {
  const sender = event.sender.id;
  const text = event.message.text;

  console.log('Message recu: ', text);

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: 'EAAIcxaza46sBAOeO6NsKtsBhWip9UccAqze8sTMOuwoNYdhZBPdR9hHCCNZC9WtcZBBE0KdUEnYhExzxQWHdhxgMFd2yv4TZCe1y45yVrrpJZABGsjiYOtl7wA2vZAglL9iQK92sxZCmzCOlqE4rawBbuaVyZCZBJYyJiuQVfWCnWlwZDZD'},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: palindrome(text).toString()}
    }
  }, (error, response) => {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}

app.listen(app.get('port'), () => {
  console.log('Bot is running on port ', app.get('port'), '\n');
});