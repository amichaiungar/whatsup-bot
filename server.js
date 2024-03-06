const express = require('express');
const {google} = require('googleapis');
const sheetId = '1za3XJpXT2cvM-JYZyvRyaCRtC5ueJUPSxfgFrUdi7zY'
const app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
app.use(express.json())

app.listen(3000, ()=> console.log('Server is running on port 3000'))

const authentication = async () =>
{
    const auth = new google.auth.GoogleAuth({
        keyFile: "service_account_credentials.json",
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });

    const client = await auth.getClient();

    const sheets = google.sheets({
        version: 'v4',
        auth: client
    });
    return {sheets}
}

app.get('/', async (req, res) => {
    try {
        const {sheets} = await authentication();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: '29.2'
        })
        res.send(response.data)
    }catch (e){
        console.log(e);
        res.status(500).send();
    }
})