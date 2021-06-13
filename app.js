// Załadowanie wszystkich modułów. Require przyjmuje string, który określa nazwę biblioteki lub ścieżkę, a zwraca to co eksportuje dany moduł
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

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
    // Podane req.body (wiadomość) zostanie emitowane do wszystkich userów
    io.emit('message', req.body);
    res.sendStatus(200);
});

// Uruchomi się gdy, klient zostanie połączony
io.on('connection', socket => {
    console.log('User connected');
});

const port = 3000;
// Uruchomienie aplikacji nasłuchującej na porcie 3000
http.listen(port, () => {
    console.log(`Serving on port ${port}`);
});