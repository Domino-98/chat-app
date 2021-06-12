const express = require('express');
const path = require('path');
const app = express();

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Tablica zawierająca obiekty wiadomości
const messages = [];

// Funkcja pozwala zdefiniować routing dla żądań GET do danego URL
app.get('/messages', (req, res) => {
    res.send(messages);
});

// Obsłużenie żądania POST dla URL localhost:3000/messages. Do tablicy 'messages' jest przesyłany obiekt wiadomości z właściwościami name oraz message
app.post('/messages', (req, res) => {
    messages.push(req.body);
    res.sendStatus(200);
});

const port = 3000;

// Uruchomienie aplikacji nasłuchującej na porcie 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});