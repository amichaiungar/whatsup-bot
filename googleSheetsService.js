const { google } = require('googleapis');
const sheets = google.sheets('v4');
const {
    transalteRow,
    getTimeRow
} = require('./ourExcelUtils.js')
process.env.GCLOUD_PROJECT='whatsupbot-416123;'
process.env.GOOGLE_APPLICATION_CREDENTIALS='./service_account_credentials.json';
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

const constants = require('./constants');
const moment = require('moment-timezone');

const spreadsheetId = constants.SPREADSHEET_ID;
// Specify the desired timezone (Israel)
const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

let spreadSheetTabCache;
let tabs;
let tabValues = {}

async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "service_account_credentials.json",
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
async function updateCacheWithSpreadSheet(){
    const auth = await getAuthToken();
    spreadSheetTabCache = await sheets.spreadsheets.get({
        spreadsheetId,
        auth
    });
    tabs = spreadSheetTabCache.data.sheets.map(sheet => sheet.properties.title);
    tabs = tabs.filter(item => item !== "private");

    for(const sheetName of tabs) {
        let tabData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            auth,
            range: sheetName
        })
        tabValues[sheetName] = tabData;
    }
}
async function getSpreadSheetTabs() {
    return tabs;
}

async function getSpreadSheetValues(sheetName) {
    return tabValues[sheetName];
}

async function findMeInAllTabs({valueToFind}) {
    let result = [];
    for(const sheetName of tabs) {
        //console.log("looking for " + valueToFind + " in " + sheetName);
        result.push(await findMeInInASpecificTab({valueToFind, sheetName}));
    }
    return result;
}

function findSheet(today){
    const locale = 'he-IL'; // Hebrew (Israel) locale
    const dateOptions = {
        timeZone: ISRAEL_TIMEZONE,
        month: '2-digit',
        day: '2-digit'
    };
    const todayDate = new Date();
    let currentDate;
    if (today){
        currentDate = todayDate.toLocaleDateString(locale, dateOptions);
    } else {
        todayDate.setDate(todayDate.getDate() + 1);
        currentDate = todayDate.toLocaleDateString(locale, dateOptions);
    }
    const [day, month] = currentDate.split('.');
    // Remove leading zeros using parseInt
    const formattedDay = parseInt(day, 10).toString();
    const formattedMonth = parseInt(month, 10).toString();

    // Combine the formatted day and month
    const formattedDate = `${formattedDay}.${formattedMonth}`;
    for(const sheetName of tabs) {
        if (sheetName.includes(formattedDate))
            return sheetName;
    }
    console.error("didnt find the tab for today: " + formattedDate);
    return null;
}
async function whoIsNow() {
    // Get the current time in Israel timezone
    const currentTime = moment().tz(ISRAEL_TIMEZONE);
    // Round to the nearest hour
    const currentHour = currentTime.format('HH:00');

    let sheet = findSheet(true);
    if (sheet == null)
        return "לא מצאתי את הטאב של היום הנוכחי"

    const spreadSheetValues = await getSpreadSheetValues(sheet);
    const rows = spreadSheetValues.data.values;
    return   "עכשיו שומרים: " + transalteRow(rows, getTimeRow(currentHour));
}

async function whoIsLater() {
    // Get the current time in Israel timezone
    const currentTime = moment().tz(ISRAEL_TIMEZONE);
    // Round to the nearest hour
    const currentHour = currentTime.format('HH:00');
    let timeRow = getTimeRow(currentHour) + 1;
    let today = true;
    if (timeRow > 25){
        timeRow = 2;
        today = false;
    }
    let sheet = findSheet(today);
    if (sheet == null)
        return "לא מצאתי את הטאב של היום הבא"

    const spreadSheetValues = await getSpreadSheetValues(sheet);
    const rows = spreadSheetValues.data.values;

    return "בשעה הבאה שומרים: " + transalteRow(rows, timeRow);
}

async function findMeInInASpecificTab({valueToFind, sheetName}) {

    const spreadSheetValues = await getSpreadSheetValues(sheetName);
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
    updateCacheWithSpreadSheet,
    whoIsNow,
    whoIsLater,
    getSpreadSheetValues,
    getSpreadSheetTabs,
    findMeInAllTabs,
    findMeInInASpecificTab,
    findSheet
}