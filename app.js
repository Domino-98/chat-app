if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Załadowanie wszystkich modułów. Require przyjmuje string, który określa nazwę biblioteki lub ścieżkę, a zwraca to co eksportuje dany moduł
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const dateFormat = require('dateformat');
dateFormat.i18n = {
    monthNames: ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru", "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
    ],
}  

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/chat-app';

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());


// Utworzenie modelu wiadomości
const Message = mongoose.model('Message', {
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: String
});

// Funkcja pozwala zdefiniować routing dla żądań GET do danego URL. Wiadomości wyszukane w bazie danych są przesyłane do danego URL z którego są pobierane wiadomości
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

// Obsłużenie żądania POST dla URL localhost:3000/messages. 
app.post('/messages', (req, res) => {
    // Utworzenie aktualnej daty oraz sformatowanie jej
    let now = new Date();
    now = dateFormat(now, "d mmm HH:MM");
    // Utworzenie nowej wiadomości do której przesyłany jest obiekt z żądania oraz aktualna data
    const message = new Message({'name': req.body.name, 'message': req.body.message, 'date': now});

    message.save(err => {
        if (err)
        res.sendStatus(500);
        // Podane req.body (wiadomość) zostanie emitowane do wszystkich userów
        io.emit('message', {
            'name': req.body.name,
            'message': req.body.message,
            'date': message.date
        });
        res.sendStatus(200);
    });
});

// Uruchomi się gdy, klient zostanie połączony
io.on('connection', socket => {
    console.log('User connected');
});

// Połączenie z bazą danych MongoDB
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, err => {
    console.log('Database connected');
});

const port = 3000;
// Uruchomienie aplikacji nasłuchującej na porcie 3000
http.listen(port, () => {
    console.log(`Serving on port ${port}`);
});