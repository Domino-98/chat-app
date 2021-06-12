const express = require('express');
const app = express();
const path = require('path');

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;

// Uruchomienie aplikacji nasłuchującej na porcie 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});