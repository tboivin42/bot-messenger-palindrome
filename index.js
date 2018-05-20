import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import http from 'http';
import request from 'request';

const app = express();

app.set('port', 8080);
app.use(bodyParser.json());

const URL = 'https://graph.facebook.com/v2.6/me/messages';
const VALIDATION_TOKEN = 'kayak';
const ACCESS_TOKEN = 'EAAC1rHGLqDkBACeZAl9fraHgIcPOFBnIVgJtRntt0OtQwq4NpaSyKYlmA3ZCaWFyXjmUHFIH36LSxo4idW5LRSlHrL9aO7aud4T7cTX4zXK84iiT5Cp8om5UiSarZCX9H0OJDJWZCBHFJ6urYQP3ZBC1NnkrtZCD3etac0pqquNAZDZD';

/* --------------------------------------------------Configuration d'authentification au WEBHOOK-------------------------------------------------- */
app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === VALIDATION_TOKEN){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
})

/* -----------------------------------------------------Gestion des evenements (envoie de message)------------------------------------------------- */
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

/* ----------------------------------------------------Definition de plusieurs figures de style---------------------------------------------------- */
const askQuestions = (str) => ({
    attachment: {
          type: "template",
          payload: {
            template_type: "generic",
              elements: [{
                  title: "Anacyclique",
                  subtitle: "Phrase que l’on peut lire dans le sens normal de lecture ou dans le sens inverse.",
                }, {
                  title: "Ambigramme",
                  subtitle: "un mot (ou d'un groupe de mots) dont la représentation suscite une double lecture",
                }, {
                  title: "Mot d'une lettre",
                  subtitle: "mot composé d'une seule lettre",
                }, {
                    title: "Nombre palindrome",
                  subtitle: "un nombre symétrique écrit dans une certaine base a",
                }, {
                  title: "Carré magique (lettres)",
                  subtitle: "est une forme de mots croisés disposé en carré",
                }]
          }
      }
    })

/* --------------------------------------------------Fonction servant a la reconnaissance de palindrome-------------------------------------------- */
const isPalindrome = (str) => {
  const lowRegStr = str.toLowerCase().replace(/[\W_]/g, ''); // Convertit une phrase ou un mot en minuscule et supprime les espaces
  const reverseStr = lowRegStr.split('').reverse().join(''); // Separe les caracteres les uns des autres dans un tableau pour ensuite reverse l'ordre de ce meme tableau et joint le tout
  return reverseStr === lowRegStr; // Compare le premier et le nouveau mot
}

/* ----------------------------------------------------------Analyse le message-------------------------------------------------------------------- */
const sendMessage = (event) => {
  const sender = event.sender;
  const text = event.message.text;
  let data = {};

  console.log('Message recu: ', text);

  if (text.includes('?')) {
    if (text.toLowerCase().includes('palindrome')) // Retourne la definition d'un palindrome
      data.text = 'Mot ou groupe de mots qui peut se lire indifféremment de gauche à droite ou de droite à gauche en gardant le même sens (ex. la mariée ira mal ; Roma Amor).';
    else 
      data = askQuestions(text); // Renvoie vers les definitions de figure de style
  } else {
    data.text = isPalindrome(text).toString();
  }
  Request(sender, data);
}

/* -----------------------------------------------------------Envoie le message-------------------------------------------------------------------- */
const Request = (sender, data) => {
  request({
    url: URL,
    qs: {access_token: ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender.id},
      message: data
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