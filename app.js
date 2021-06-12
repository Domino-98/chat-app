const express = require('express');
const app = express();
const path = require('path');

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

// Tablica zawierająca obiekty wiadomości
const messages = [
    {
        name: "Dominik",
        message: "Witam"
    },
    {
        name: "Piotr",
        message: "Cześć"
    },
]

// Funkcja pozwala zdefiniować routing dla żądań GET do danego URL.
app.get('/messages', (req, res) => {
    res.send(messages);
});

const port = 3000;

// Uruchomienie aplikacji nasłuchującej na porcie 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});