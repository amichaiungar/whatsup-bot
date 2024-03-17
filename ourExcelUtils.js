const soldeirs=require('./soldiers.json');
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
        conversion =  conversion + "*" + sheetName + "* ";
        let tabData = "";
        let firstTime =null;
        let lastTime = null;
        let where = null;
        let lastRowNum = null;
        result.forEach(({ rowNum, colNum }) => {
            if (firstTime===null) {
                firstTime = time[rowNum];
                where = place[colNum];
            }
            if (where!==place[colNum]){//same person, different location
                if (firstTime != null && where!=null) {
                    tabData = firstTime + "-" + lastTime + ":" + where;
                    conversion = conversion + tabData + "\r\n";
                }
                else
                    conversion = conversion + firstTime + "-" + lastTime + ":" + "חופש" + "\r\n";
                firstTime = time[rowNum];
                where = place[colNum];
            }
            else if (lastRowNum!= null && (lastRowNum +1 !== rowNum)){//same place but not the next shift
                tabData = firstTime + "-" + lastTime + ":" + where;
                conversion = conversion + tabData + "\r\n";
                firstTime = time[rowNum];
            }
            lastRowNum = rowNum;
            lastTime = time[rowNum + 1];

        });
        //console.log("firstTime:" + firstTime + " where:"+ where);
        if (firstTime != null && where!=null) {//in case you have a free day, tab exists but no duties on this day
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
            tabData.push({where: place[colNum], when : time[rowNum]});
        });
        convertion.push({tab: sheetName, tabData})
    });
    return convertion;
}

function searchSoldierAtListByPhone(phone) {
    return soldeirs.soldiers.find((s) => s.phone === phone);
}

function getTimeRow(hour){
    return timeToRowObj[hour];
}

function transalteRow(rows, rowNum) {
    const row = rows[rowNum-1];
    let result = "";
    for (let i = 1; i < row.length; i++) {
        let name = row[i];
        if (name!= null && name.length>0) {
            if (place[i + 1])
                result = result + name + "(" + place[i + 1] + "), ";
        }
    }
    return result;
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
    getTimeRow,
    searchSoldierAtListByPhone,
    transalteRow,
    convertFromIndexToTimeAndPlaceInWhatsupFormat
}