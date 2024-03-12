const {
    getAuthToken,
    getSpreadSheet,
    getSpreadSheetTabs,
    getSpreadSheetValues,
    findMeInInASpecificTab,
    findMeInAllTabs
} = require('./googleSheetsService.js');

const {
    convertFromIndexToTimeAndPlace,
    searchSoldierAtListByPhone,
    convertFromIndexToTimeAndPlaceInWhatsupFormat
} = require('./ourExcelUtils.js')

const constants = require('./constants');

const spreadsheetId = constants.SPREADSHEET_ID;
const sheetName = constants.TEST_SHEET;

async function testGetSpreadSheet() {
    try {
        const auth = await getAuthToken();
        const response = await getSpreadSheet({
            spreadsheetId,
            auth
        })
        console.log('output for getSpreadSheet', JSON.stringify(response.data, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testGetSpreadSheetValues() {
    try {
        const auth = await getAuthToken();
        const response = await getSpreadSheetValues({
            spreadsheetId,
            sheetName,
            auth
        })
        console.log('output for getSpreadSheetValues', JSON.stringify(response.data, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testGetSpreadSheetTabs() {
    try {
        const auth = await getAuthToken();
        const response = await getSpreadSheetTabs({
            spreadsheetId,
            auth
        })
        console.log('output for getSpreadSheetTabs', JSON.stringify(response, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testFindMeInInASpecificTab() {
    try {
        const auth = await getAuthToken();
        const valueToFind = "אונגר";
        const response = await findMeInInASpecificTab({
            spreadsheetId,
            auth,
            valueToFind,
            sheetName
        })
        console.log('output for getSpreadSheetTabs', JSON.stringify(response, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testFindMe() {
    try {
        const auth = await getAuthToken();
        const valueToFind = "עמיחי אונגר";
        const response = await findMeInAllTabs({
            spreadsheetId,
            auth,
            valueToFind
        })
        console.log('output for getSpreadSheetTabs', JSON.stringify(convertFromIndexToTimeAndPlaceInWhatsupFormat(response), null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

function testSearchSoldierAtListByPhone(){
    console.log(searchSoldierAtListByPhone("972556618842").name);
}

function main() {
    //testGetSpreadSheet();
    //testGetSpreadSheetValues();
    //testGetSpreadSheetTabs();
    testFindMe();
    //testFindMeInInASpecificTab();
    //testSearchSoldierAtListByPhone();
}

main()