const {
    getSpreadSheetTabs,
    getSpreadSheetValues,
    findMeInInASpecificTab,
    findMeInAllTabs,
    updateCacheWithSpreadSheet,
    whoIsNow,
    whoIsLater,
    whoIsNextShift,
    searchSoldierAtListByPhone,
    convertFromIndexToTimeAndPlaceInWhatsupFormat
} = require('./googleSheetsService.js');

const constants = require('./constants');
const sheetName = constants.TEST_SHEET;

async function testGetSpreadSheetValues() {
    try {
        const response = await getSpreadSheetValues(sheetName)
        console.log('output for getSpreadSheetValues', JSON.stringify(response.data, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testGetSpreadSheetTabs() {
    try {
        const response = await getSpreadSheetTabs();
        console.log('output for getSpreadSheetTabs', JSON.stringify(response, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testFindMeInInASpecificTab() {
    try {
        const valueToFind = "אונגר";
        const response = await findMeInInASpecificTab({
            valueToFind,
            sheetName
        })
        console.log('output for getSpreadSheetTabs', JSON.stringify(response, null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}
async function setUp() {
    try {
        await updateCacheWithSpreadSheet();
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function testFindMe() {
    try {
        await updateCacheWithSpreadSheet();
        const valueToFind = "מלכא";
        const response = await findMeInAllTabs({
            valueToFind
        })
        console.log('output for getSpreadSheetTabs', JSON.stringify(response), null, 2);

        console.log('output for getSpreadSheetTabs', JSON.stringify(convertFromIndexToTimeAndPlaceInWhatsupFormat(response), null, 2));
    } catch(error) {
        console.log(error.message, error.stack);
    }
}

async function now() {
    await whoIsNow();
}

function testSearchSoldierAtListByPhone(){
    console.log(searchSoldierAtListByPhone("972556618842").name);
}

async function main() {
    //setUp().then(r => testFindMe().then(testGetSpreadSheetValues()));
    //setUp().then(r => testFindMe());
    await setUp();
    let now = await whoIsNow();
    console.log("now:" + now);
    let later = await whoIsLater();
    console.log("later:" + later);
    let after = await whoIsNextShift();
    console.log("after:" + after);

    //setUp().then(r => console.log("now:" + whoIsNow())).then(r => console.log("later " + whoIsLater()));
 //   testGetSpreadSheetTabs();


 //   testFindMeInInASpecificTab();
 //   testSearchSoldierAtListByPhone();
}

main()