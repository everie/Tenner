/*
TENSION 2 - By Hans Elley
Helper functions
 */

window.onresize = function() {
    Emit('ReSize');
};

// GROUP BY Y
function GroupByY(arr) {
    return arr.reduce((group, e) => {
        const { Y } = e;
        group[Y] = group[Y] ?? [];
        group[Y].push(e);
        return group;
    }, {});
}

function ObjAsArray(obj) {
    var Arr = [];
    Object.keys(obj).forEach(key => {
        Arr.push(obj[key])
    });

    return Arr;
}

// https://stackoverflow.com/a/1527820
function Random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/a/28933315
function RandomByProbability(Options) {
    let num = Math.random(),
        s = 0,
        lastIndex = Options.length - 1;

    for (let i = 0; i < lastIndex; ++i) {
        s += Options[i]['Weight'];
        if (num < s) {
            return Options[i]['Value'];
        }
    }

    return Options[lastIndex]['Value'];
}

// https://stackoverflow.com/a/2901298
function FormatNumber(x, round = true) {
    if (round)
        x = Math.round(x);

    switch (GetSetting('NumberFormat')) {
        case 'COMMAS': return x.toLocaleString('en-GB');
        case 'DOTS': return x.toLocaleString('da');
    }
    //return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
}

function GetLocalItem(Name) {
    let Obj = localStorage.getItem(Name);

    try {
        if (Obj !== undefined && Obj !== null) {
            return JSON.parse(Obj);
        }
    } catch (err) {
        // do nothing
    }

    return null;
}

function SortByKey(Arr, Key, Direction) {
    Arr.sort((a, b) => {
        if (Direction)
            return a[Key] - b[Key]; // Direction === true => Descending
        else
            return b[Key] - a[Key]; // Direction === false => Ascending
    });

    return Arr;
}

// https://stackoverflow.com/a/1349426
function MakeGameID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function First(Arr) {
    if (!Array.isArray(Arr))
        return null;

    if (Arr.length < 1)
        return null;

    return Arr[0];
}

function GetTimestamp() {
    return Date.now();
}

function GetReadableTimestamp(Time, Short = false) {
    if (Time === undefined || Time === null || Time.toString().length < 1)
        return '<#NoTime>';

    let D = new Date(Time);
    let S = GetDateSeparator(GetSetting('DateSeparator'));

    let Year = D.getFullYear();
    let Month = D.getMonth() + 1;
    let Day = D.getDate();

    let d = '';

    switch (GetSetting('DateFormat')) {
        case 'DDMMYYYY':
            d = Pad(Day) + S + Pad(Month) + S + Year;
            break;

        case 'MMDDYYYY':
            d = Pad(Month) + S + Pad(Day) + S + Year;
            break;

        case 'YYYYMMDD':
            d = Year + S + Pad(Month) + S + Pad(Day);
            break;
    }

    if (Short)
        return d;

    let Hour = D.getHours();
    let Minute = D.getMinutes();
    let Second = D.getSeconds();

    return d + ' ' + Pad(Hour) + ':' + Pad(Minute) + ':' + Pad(Second);
}

function Pad(Number, N = 2) {
    return Number.toString().padStart(N, '0');
}

function SetStyle(Element, Style) {
    Object.keys(Style).forEach(a => {
        Element['style'][a] = Style[a];
    });

    return Element;
}

function GetSize(selector) {
    const element = document.querySelector(selector);
    if (element === null)
        return null;

    const positionInfo = element.getBoundingClientRect();

    return {
        width: positionInfo.width,
        height: positionInfo.height
    };
}

function GetSize2(element) {
    const positionInfo = element.getBoundingClientRect();

    return {
        width: positionInfo.width,
        height: positionInfo.height
    };
}

function Shuffle(arr) {
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function IsMobile() {
    return window.screen.width < 1024 || navigator.userAgent.indexOf("Mobi") > -1;
}