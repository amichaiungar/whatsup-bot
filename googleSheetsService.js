const { google } = require('googleapis');
//const excelJS = require('exceljs');
//const fs = require('fs');
const soldiers=require('./soldiers.json');
const sheets = google.sheets('v4');
process.env.GCLOUD_PROJECT='whatsupbot-416123;'
process.env.GOOGLE_APPLICATION_CREDENTIALS='./service_account_credentials.json';
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

const constants = require('./constants');
const moment = require('moment-timezone');
const ISRAEL_TIMEZONE = 'Asia/Jerusalem';
const locale = 'he-IL'; // Hebrew (Israel) locale
const dateOptions = {
    timeZone: ISRAEL_TIMEZONE,
    month: '2-digit',
    day: '2-digit'
};
const spreadsheetId = constants.SPREADSHEET_ID;
// Specify the desired timezone (Israel)

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

async function downloadFileToLocal(auth) {
    const drive = google.drive({ version: 'v3', auth });
    const fileId = '1KTxm8NdCqu09znBRnZqAy-0dJHUFYryJnmbVTHgxMMY'; // Replace with your actual Google Sheet ID

    const response = await drive.files.export({
        fileId,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }, { responseType: 'stream' });

    const dest = fs.createWriteStream('output.xlsx'); // Specify your desired local file path
    response.data.pipe(dest);

    return new Promise((resolve, reject) => {
        dest.on('finish', () => {
            console.log('Google Sheet saved to output.xlsx');
            resolve();
        });
        dest.on('error', (err) => {
            console.error('Error saving Google Sheet:', err);
            reject(err);
        });
    });
}

async function updateCacheWithSpreadSheet(){
    const auth = await getAuthToken();
    spreadSheetTabCache = await sheets.spreadsheets.get({
        spreadsheetId,
        auth
    });
    tabs = spreadSheetTabCache.data.sheets.map(sheet => sheet.properties.title);
    tabs = tabs.filter(item => item !== "private");
    tabs = tabs.filter(item => item !== "סיכום שבוע");

    //todo await downloadFileToLocal(auth);

    tabs = removeOldTabs(tabs);

    for(const sheetName of tabs) {
        let tabData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            auth,
            range: sheetName
        })
        tabValues[sheetName] = tabData;

    }
}

function removeOldTabs(tabs) {
    let onlyNewTabs = [];
    const todayDate = new Date();
    let date = new Date();
    for (let i = 0; i<14;i++){
        date.setDate(todayDate.getDate() + i);
        let currentDate = date.toLocaleDateString(locale, dateOptions);
        let [day, month] = currentDate.split('.');
        // Remove leading zeros using parseInt
        let formattedDay = parseInt(day, 10).toString();
        let formattedMonth = parseInt(month, 10).toString();

        // Combine the formatted day and month
        let formattedDate = `${formattedDay}.${formattedMonth}`;
        for(const sheetName of tabs) {
            if (sheetName.includes(formattedDate)) {
                onlyNewTabs.push(sheetName);
                break;
            }
        }
    }
    return onlyNewTabs;
    //console.info("current tabs: " + onlyNewTabs);
}
async function getSpreadSheetTabs() {
    return tabs;
}

async function getSpreadSheetValues(sheetName) {
    return tabValues[sheetName];
}

function getPlace(sheetName, column) {
    return tabValues[sheetName].data.values[0][column-1];
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
    const row = rows[getTimeRow(currentHour)-1];
    return   "עכשיו שומרים: " + translateRow(sheet, row);
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
    const row = rows[timeRow];
    return "בשעה הבאה שומרים: " + translateRow(sheet, row);
}

async function whoIsNextShift() {
    // Get the current time in Israel timezone
    const currentTime = moment().tz(ISRAEL_TIMEZONE);
    // Round to the nearest hour
    const currentHour = currentTime.format('HH:00');
    getTimeRow(currentHour);
    let timeRow = getNextTimeRow(getTimeRow(currentHour));
    let  isToday = true;
    if (timeRow > 25){
        timeRow = 2;
        isToday = false;
    }
    let sheet = findSheet(isToday);
    if (sheet == null)
        return "לא מצאתי את הטאב של היום הבא"

    const spreadSheetValues = await getSpreadSheetValues(sheet);
    const rows = spreadSheetValues.data.values;
    const row = rows[timeRow-1];
    return "במשמרת הבאה שומרים: " + translateRow(sheet, row);
}
function getNextTimeRow(currentTimeRow) {
    switch (currentTimeRow) {
        case 2:
        case 3:
        case 4:
            return 5;
        case 5:
        case 6:
        case 7:
            return 8;
        case 8:
        case 9:
        case 10:
            return 11;
        case 11:
        case 12:
        case 13:
            return 14;
        case 14:
        case 15:
        case 16:
            return 18;
        case 17:
            return 20;
        case 18:
        case 19:
            return 21;
        case 20:
            return 23;
        case 21:
        case 22:
            return 24;
        case 23:
        case 24:
        case 25:
            return 26;
    }
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
            let rowNum = i+1
            let colNum = columnIndex+1;
            let withMe = whoIsWithMe(rows[i][columnIndex], valueToFind);
            result.push({rowNum,colNum, withMe});
        }
    }
    return {sheetName, result};
}
 function whoIsWithMe(guards, valueToFind){
    let guardsList = guards.split(",");
    if (guardsList.length === 2){
        let guard = guardsList[0];
        if (guard.includes(valueToFind))
            return guardsList[1];
        else
            return guard;
    }
    else //guarding alone
        return null;
 }

function convertFromIndexToTimeAndPlaceInWhatsupFormat(schedule){
    let conversion = "";
    schedule.forEach((item) => {
        const { sheetName, result } = item;
        conversion =  conversion + "*" + sheetName + "* ";
        let tabData = "";
        let firstTime =null;
        let lastTime = null;
        let where = null;
        let lastRowNum = null;
        let myBuddy = null
        result.forEach(({ rowNum, colNum , withMe}) => {
            if (firstTime===null) {
                firstTime = time[rowNum];
                where = getPlace(sheetName, colNum);
                myBuddy = withMe;
            }
            if (where!==getPlace(sheetName, colNum)){//same person, different location
                if (firstTime != null && where!=null) {
                    if (myBuddy)
                        tabData = firstTime + "-" + lastTime + ":" + where +"(" + myBuddy + ")";
                    else
                        tabData = firstTime + "-" + lastTime + ":" + where;
                    conversion = conversion + tabData + "\r\n";
                }
                else
                    conversion = conversion + firstTime + "-" + lastTime + ":" + "חופש" + "\r\n";
                firstTime = time[rowNum];
                where = getPlace(sheetName, colNum);
                myBuddy = withMe;
            }
            else if (lastRowNum!= null && (lastRowNum +1 !== rowNum)){//same place but not the next shift
                if (myBuddy)
                    tabData = firstTime + "-" + lastTime + ":" + where +"(" + myBuddy + ")";
                else
                    tabData = firstTime + "-" + lastTime + ":" + where;
                conversion = conversion + tabData + "\r\n";
                firstTime = time[rowNum];
                myBuddy = withMe;
            }
            lastRowNum = rowNum;
            lastTime = time[rowNum + 1];

        });
        //console.log("firstTime:" + firstTime + " where:"+ where);
        if (firstTime != null && where!=null) {//in case you have a free day, tab exists but no duties on this day
            if (myBuddy)
                tabData = firstTime + "-" + lastTime + ":" + where +"(" + myBuddy + ")";
            else
                tabData = firstTime + "-" + lastTime + ":" + where;
            conversion = conversion + tabData + "\r\n";
        }
        else
            conversion = conversion + "חופשי" + "\r\n";
    });
    return conversion;
}

function convertFromIndexToTimeAndPlace(schedule){
    let convertion = [];
    schedule.forEach((item) => {
        const { sheetName, result } = item;
        let tabData = [];
        result.forEach(({ rowNum, colNum }) => {
            tabData.push({where: getPlace(sheetName, colNum), when : time[rowNum]});
        });
        convertion.push({tab: sheetName, tabData})
    });
    return convertion;
}

function searchSoldierAtListByPhone(phone) {
    return soldiers.soldiers.find((s) => s.phone === phone);
}

function getTimeRow(hour){
    return timeToRowObj[hour];
}

function translateRow(sheetName, row) {
    let result = "";
    for (let i = 1; i < row.length; i++) {
        let name = row[i];
        if (name!= null && name.length>0) {
            if (getPlace(sheetName, i + 1))
                result = result + name + "(" + getPlace(sheetName, i + 1) + "), ";
        }
    }
    return result;
}

const time = {
    2: '00:00',
    3: '01:00',
    4: '02:00',
    5: '03:00',
    6: '04:00',
    7: '05:00',
    8: '06:00',
    9: '07:00',
    10: '08:00',
    11: '09:00',
    12: '10:00',
    13: '11:00',
    14: '12:00',
    15: '13:00',
    16: '14:00',
    17: '15:00',
    18: '16:00',
    19: '17:00',
    20: '18:00',
    21: '19:00',
    22: '20:00',
    23: '21:00',
    24: '22:00',
    25: '23:00',
    26: '00:00'
};

const timeToRowObj = {
    '00:00' :2,
    '01:00' :3,
    '02:00' :4,
    '03:00' :5,
    '04:00' :6,
    '05:00' :7,
    '06:00' :8,
    '07:00' :9,
    '08:00' :10,
    '09:00' :11,
    '10:00' :12,
    '11:00' :13,
    '12:00' :14,
    '13:00' :15,
    '14:00' :16,
    '15:00' :17,
    '16:00' :18,
    '17:00' :19,
    '18:00' :20,
    '19:00' :21,
    '20:00' :22,
    '21:00' :23,
    '22:00' :24,
    '23:00' :25
};

module.exports = {
    updateCacheWithSpreadSheet,
    whoIsNow,
    whoIsLater,
    whoIsNextShift,
    getSpreadSheetValues,
    getSpreadSheetTabs,
    findMeInAllTabs,
    findMeInInASpecificTab,
    findSheet,
    searchSoldierAtListByPhone,
    convertFromIndexToTimeAndPlaceInWhatsupFormat
}