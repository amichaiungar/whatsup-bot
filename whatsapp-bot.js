const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require("qrcode-terminal");
//const fs = require('fs');

const {
    searchSoldierAtListByPhone
} = require('./ourExcelUtils.js')
const {getAuthToken, findMeInAllTabs} = require("./googleSheetsService");
const {convertFromIndexToTimeAndPlaceInWhatsupFormat} = require("./ourExcelUtils");

const constants = require('./constants');

const spreadsheetId = constants.SPREADSHEET_ID;

//const client = new Client({ session: sessionData });
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one"
    })
});

// Event: When the client is ready
client.on('ready', () => {
    console.log('WhatsApp bot is ready!!');
});

// Event: When a new message arrives
client.on('message', async (msg) => {
    if (msg.body === 'מתי') {
        const chat = await msg.getChat();
        var number = chat.id.user;
        var valueToFind = searchSoldierAtListByPhone(number).name;
        console.log("number is:" + number);
        const auth = await getAuthToken();
        let response = await findMeInAllTabs({
            spreadsheetId,
            auth,
            valueToFind
        })
        console.log('output for getSpreadSheetTabs', JSON.stringify(convertFromIndexToTimeAndPlaceInWhatsupFormat(response), null, 2));
        await msg.reply(JSON.stringify(convertFromIndexToTimeAndPlaceInWhatsupFormat(response)));
    }
    else{
        console.log(msg.body);
        const chat = await msg.getChat();
        var number = chat.id.user;
        console.log(number);
        console.log("****");
    }
});

// Event: Save session data when it changes
client.on('authenticated', (session) => {

});

// Log in to WhatsApp Web
client.initialize();

client.on('qr', (qr) => {
    //console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});