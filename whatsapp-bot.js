const { Client } = require('whatsapp-web.js');
const qrcode = require("qrcode-terminal");

const {findMeInAllTabs, updateCacheWithSpreadSheet, whoIsNow, whoIsLater, searchSoldierAtListByPhone, convertFromIndexToTimeAndPlaceInWhatsupFormat} = require("./googleSheetsService");

let answerNum = -1;
const answers = ["חחחח לפחות עד יולי", "מי שלא צם לא משתחרר...", "בפנסיה", "כששפיר ישמור לילות", "כשמוזס יתחיל לזרוק", "הרבנות תדאג לנו ל4 המינים?"];
//const client = new Client({ session: sessionData });
const client = new Client();

// Event: When the client is ready
client.on('ready', async() => {
    await updateCacheWithSpreadSheet();
    console.log('WhatsApp bot is ready!!');
});

function getAnswerForWhenAreWeGettingOut() {
    answerNum ++;
    answerNum = answerNum % answers.length;
    return answers[answerNum];
}

// Event: When a new message arrives
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        let number = chat.id.user;
            let valueToFind = searchSoldierAtListByPhone(number);
            if (valueToFind == null) {
                console.log("number of unlisted is:" + number);
                await msg.reply("נו נו נו. המספר שלך לא מוכר במערכת. עדכן את הקובץ ולאחר מכן עדכן את עמיחי שבוצע");
            } else {
                valueToFind = valueToFind.name;
                let func = msg.body.trim();
                if (func === 'מתי' || func === '1' || func === 'אני') {
                    let response = await findMeInAllTabs({
                        valueToFind
                    })
                    //console.log('output for getSpreadSheetTabs', JSON.stringify(response), null, 2);
                    console.log('output for convertFromIndexToTimeAndPlaceInWhatsupFormat ' + valueToFind + ": ", JSON.stringify(convertFromIndexToTimeAndPlaceInWhatsupFormat(response), null, 2));
                    await msg.reply(convertFromIndexToTimeAndPlaceInWhatsupFormat(response));
                } else if (func === '?') {
                    let text = "אופציות לבוט (שלח הודעה עם המלל המודגש):" + "\r\n" +
                        " המילה *מתי* או *אני* או *1*: מראה לך מתי אתה שומר" + "\r\n" +
                        "*עכשיו* או *2*: מי שומר עכשיו?" + "\r\n" +
                        "*הבא* או *3*: מי במשמרת הבאה?" + "\r\n" +
                        "*עד מתי* או *4*: מתי משתחררים?";
                    await msg.reply(text);
                } else if (func === 'עכשיו' || func === '2') {
                    let text = await whoIsNow();
                    await msg.reply(text);
                } else if (func === 'הבא' || func === '3') {
                    let text = await whoIsLater()
                    await msg.reply(text);
                } else if (func === 'עד מתי' || func === '4' || func === 'עד מתי?') {
                    let text;
                    if  (valueToFind === 'רועי לוי'){
                        text = "1.4.2024";
                    } else
                        text= getAnswerForWhenAreWeGettingOut();
                    await msg.reply(text);
                } else if (func === "007") {
                    console.log("reloading sheet");
                    await updateCacheWithSpreadSheet();
                } else {
                    console.log(valueToFind + " :" + func + " אופציה לא חוקית");
                    await msg.reply(func + " היא אופציה לא חוקית" + "\r\n" +
                        "הקש *?* בשביל תפריט");
                }
            }
    }catch (e){
        console.error(e);
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