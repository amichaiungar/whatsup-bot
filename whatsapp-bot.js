const { Client } = require('whatsapp-web.js');
const qrcode = require("qrcode-terminal");
const client = new Client();

// Event: When the client is ready
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

// Event: When a new message arrives
client.on('message', async (msg) => {
    if (msg.body === 'Hi') {
        await msg.reply('Hello! I am your WhatsApp bot.');
    }
});

// Log in to WhatsApp Web
client.initialize();

// // Event: When QR code is generated (scan it with your phone)
// client.on('qr', (qr) => {
//     console.log('Scan this QR code with your phone:', qr);
// });
client.on('qr', (qr) => {
    //console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});