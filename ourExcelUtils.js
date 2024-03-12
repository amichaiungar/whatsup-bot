var soldeirs=require('./soldiers.json');
function getRow(rowNum) {
    return rowNum;
}

function getColumn(column) {
    return column;
}

function reverseString(str) {
    return str.split('').reverse().join('');
}

function convertFromIndexToTimeAndPlaceInWhatsupFormat(schedule){
    let conversion = "";
    schedule.forEach((item) => {
        const { sheetName, result } = item;
        conversion =  conversion + " *" + sheetName + "* ";
        let tabData = "";
        result.forEach(({ rowNum, colNum }) => {
            tabData = tabData + "(" + time[rowNum] + ")" + place[colNum] + ",";
        });
        conversion = conversion + tabData;
    });
    return conversion;
}

function convertFromIndexToTimeAndPlace(schedule){
    let convertion = [];
    schedule.forEach((item) => {
        const { sheetName, result } = item;
        let tabData = [];
        result.forEach(({ rowNum, colNum }) => {
            //if (result.empty())
            //  console.log(`no schedule for Sheet: ${sheetName}`);

            tabData.push({where: place[colNum], when : time[rowNum]});
        });
        convertion.push({tab: sheetName, tabData})
    });
    return convertion;
}

function searchSoldierAtListByPhone(phone) {
    return soldeirs.soldiers.find((s) => s.phone === phone);
}


const place = {
        2: 'מצפה איתמר',
        3: 'סיור רכוב',
        4:'ירידה לוואדי',
        5:'תל חמד',
        6:'שג'
};

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
    25: '23:00'
};

module.exports = {
    convertFromIndexToTimeAndPlace,
    searchSoldierAtListByPhone,
    reverseString,
    convertFromIndexToTimeAndPlaceInWhatsupFormat
}