const { google } = require('googleapis');
const sheets = google.sheets('v4');

process.env.GCLOUD_PROJECT='whatsupbot-416123;'
process.env.GOOGLE_APPLICATION_CREDENTIALS='./service_account_credentials.json';
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({
        keyFile:"service_account_credentials.json",
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    return await auth.getClient();
}

async function getSpreadSheet({spreadsheetId, auth}) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    return res;
}

async function getSpreadSheetTabs({spreadsheetId, auth}) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        auth,
    });
    return res.data.sheets.map(sheet => sheet.properties.title);
}

async function getSpreadSheetValues({spreadsheetId, auth, sheetName}) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        auth,
        range: sheetName
    });
    return res;
}

async function findMeInAllTabs({spreadsheetId, auth, valueToFind}) {
    const tabs = await getSpreadSheetTabs({spreadsheetId, auth});
    let result = [];
    for(const sheetName of tabs) {
        //console.log("looking for " + valueToFind + " in " + sheetName);
        result.push(await findMeInInASpecificTab({spreadsheetId, auth, valueToFind, sheetName}));
    }
    return result;
}

async function findMeInInASpecificTab({spreadsheetId, auth, valueToFind, sheetName}) {

    const spreadSheetValues = await getSpreadSheetValues({spreadsheetId, auth, sheetName});
    const rows = spreadSheetValues.data.values;
    let result = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const columnIndex = row.findIndex(cellValue => cellValue.includes(valueToFind));
        if (columnIndex !== -1) {
            //console.log(`Found "${valueToFind}" at Row ${i + 1}, Column ${columnIndex + 1}`);
            rowNum = i+1
            colNum = columnIndex+1;
            result.push({rowNum,colNum});
        }
    }
    return {sheetName, result};
}


module.exports = {
    getAuthToken,
    getSpreadSheet,
    getSpreadSheetValues,
    getSpreadSheetTabs,
    findMeInAllTabs,
    findMeInInASpecificTab
}