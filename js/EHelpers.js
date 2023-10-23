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
function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
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
            return b[Key] - a[Key]; // Direction === true => Ascending
    })
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

function GetReadableTimestamp(Time) {
    if (Time === undefined || Time === null || Time.toString().length < 1)
        return '<#NoTime>';

    let D = new Date(Time);

    let Year = D.getFullYear();
    let Month = D.getMonth();
    let Day = D.getDate();

    let Hour = D.getHours();
    let Minute = D.getMinutes();
    let Second = D.getSeconds();

    return Pad(Day) + '-' + Pad(Month) + '-' + Year + ' ' + Pad(Hour) + ':' + Pad(Minute) + ':' + Pad(Second);
}

function Pad(Number, N = 2) {
    return Number.toString().padStart(N, '0');
}