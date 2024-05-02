/*
TENSION - By Hans Elley
Settings
 */

const Defaults = {
    Size: 5,
    Start: 3,
    UndoMax: 3,
    UndoIncrease: 100,
    LocalGameData: 'GAME',
    LocalHighScore: 'HIGH',
    LocalLastState: 'LAST'
};

const Current = {
    High: 0,
    Move: 0,
    Score: 0,
    Options: 0,
    Busy: false,
    Blocks: [],
    Selected: [],
    Empties: [],
    GameSize: 0,
    BlockSize: 0,
    FontSize: 0,
    ScoreSize: 0,
    Auto: false,
    AutoTimer: null,
    Undo: {
        Moves: 0,
        Count: 0,
        Can: false
    },
    Merges: {},
    HasSelect: function() {
        return this.Selected.length > 1;
    },
    BlocksAsObj: function() {
        return this.Blocks.map(a => {
            let Obj = {
                //ID: a.dataset.id,
                X: parseInt(a.dataset.x),
                Y: parseInt(a.dataset.y),
                Num: parseInt(a.dataset.num)
            };

            if (a.dataset.bonus)
                Obj['B'] = a.dataset.bonus;

            return Obj;
        })
    },
    BlocksPlayable: function() {
        return this.Blocks.filter(a => parseInt(a.dataset.num) < 10);
    },
    Settings: {
        NumberFormat: 'DOTS', // ['DOTS', 'COMMAS']
        DateFormat: 'DDMMYYYY', // ['DDMMYYYY', 'MMDDYYYY', 'YYYYMMDD']
        DateSeparator: 'DASH', // ['dash', 'slash', 'dot'],
        Options: {
            NumberFormat: [
                {
                    Text: '1.234,5',
                    Value: 'DOTS'
                },
                {
                    Text: '1,234.5',
                    Value: 'COMMAS'
                }
            ],
            DateFormat: [
                {
                    Text: 'Day, Month, Year',
                    Value: 'DDMMYYYY'
                },
                {
                    Text: 'Month, Day, Year',
                    Value: 'MMDDYYYY'
                },
                {
                    Text: 'Year, Month, Day',
                    Value: 'YYYYMMDD'
                }
            ],
            DateSeparator: [
                {
                    Text: 'Dash (-)',
                    Value: 'DASH'
                },
                {
                    Text: 'Slash (/)',
                    Value: 'SLASH'
                },
                {
                    Text: 'Dot (.)',
                    Value: 'DOT'
                }
            ]
        }
    },
    Start: null
};

function GetNumColour(num) {
    switch (num) {
        case 1: return '#3fff00';
        case 2: return '#0099ff';
        case 3: return '#ff7200';
        case 4: return '#ff003b';
        case 5: return '#b71cff';
        case 6: return '#f9ff56';
        case 7: return '#16efff';
        case 8: return '#56ffa2';
        case 9: return '#ff3d81';
        case 10: return '#45484d';
    }
}

function GetNumColour2(num) {
    switch (num) {
        case 1: return '#00a01d';
        case 2: return '#005587';
        case 3: return '#ad4800';
        case 4: return '#a80000';
        case 5: return '#5d009b';
        case 6: return '#bcd100';
        case 7: return '#006b59';
        case 8: return '#00bf5c';
        case 9: return '#af0046';
        case 10: return '#000000';
    }
}

function GetNumColour3(num) {
    switch (num) {
        case 1: return '#c5ffb2';
        case 2: return '#b2e0ff';
        case 3: return '#ffd4b2';
        case 4: return '#ffb2c4';
        case 5: return '#e9baff';
        case 6: return '#fdffcc';
        case 7: return '#b9faff';
        case 8: return '#ccffe3';
        case 9: return '#ffc4d9';
        case 10: return '#c7c8c9';
    }
}

function SquareChoice() {
    switch (Current.High) {
        case 3:
            return RandomByProbability([
                {Value: 1, Weight: 0.65},
                {Value: 2, Weight: 0.35}
            ]);

        case 4:
            return RandomByProbability([
                {Value: 1, Weight: 0.45},
                {Value: 2, Weight: 0.3},
                {Value: 3, Weight: 0.25}
            ]);

        case 5:
            return RandomByProbability([
                {Value: 1, Weight: 0.45},
                {Value: 2, Weight: 0.25},
                {Value: 3, Weight: 0.2},
                {Value: 4, Weight: 0.1}
            ]);

        case 6:
            return RandomByProbability([
                {Value: 1, Weight: 0.45},
                {Value: 2, Weight: 0.3},
                {Value: 3, Weight: 0.2},
                {Value: 4, Weight: 0.1},
                {Value: 5, Weight: 0.05}
            ]);

        case 7:
            return RandomByProbability([
                {Value: 1, Weight: 0.4},
                {Value: 2, Weight: 0.25},
                {Value: 3, Weight: 0.2},
                {Value: 4, Weight: 0.1},
                {Value: 5, Weight: 0.05}
            ]);

        case 8:
            return RandomByProbability([
                {Value: 1, Weight: 0.35},
                {Value: 2, Weight: 0.2},
                {Value: 3, Weight: 0.175},
                {Value: 4, Weight: 0.125},
                {Value: 5, Weight: 0.1},
                {Value: 6, Weight: 0.05}
            ]);

        case 9:
            return RandomByProbability([
                {Value: 1, Weight: 0.3},
                {Value: 2, Weight: 0.275},
                {Value: 3, Weight: 0.15},
                {Value: 4, Weight: 0.125},
                {Value: 5, Weight: 0.075},
                {Value: 6, Weight: 0.05},
                {Value: 7, Weight: 0.025}
            ]);

        case 10:
            return RandomByProbability([
                {Value: 1, Weight: 0.25},
                {Value: 2, Weight: 0.225},
                {Value: 3, Weight: 0.2},
                {Value: 4, Weight: 0.15},
                {Value: 5, Weight: 0.1},
                {Value: 6, Weight: 0.05},
                {Value: 7, Weight: 0.025}
            ]);
    }
}

function BonusChoice(Pct) {
    if (Pct < 0.25) {
        return RandomByProbability([
            {Value: 1, Weight: 0.9},
            {Value: 2, Weight: 0.1}
        ]);
    } else if (Pct >= 0.25 && Pct < 0.4) {
        return RandomByProbability([
            {Value: 1, Weight: 0.8},
            {Value: 2, Weight: 0.2}
        ]);
    } else if (Pct >= 0.4 && Pct < 0.6) {
        return RandomByProbability([
            {Value: 2, Weight: 0.8},
            {Value: 3, Weight: 0.2}
        ]);
    } else if (Pct >= 0.6) {
        return RandomByProbability([
            {Value: 2, Weight: 0.5},
            {Value: 3, Weight: 0.4},
            {Value: 4, Weight: 0.1}
        ]);
    }
}

function GetCurrentState() {
    let Obj = {
        High: Current.High,
        Move: Current.Move,
        Score: Current.Score,
        Blocks: Current.BlocksAsObj(),
        Merges: Current.Merges,
        Start: Current.Start,
        Undo: Current.Undo
    };

    return Obj;
}

function StoreCurrentState() {
    let Obj = GetCurrentState();

    localStorage.setItem(Defaults.LocalGameData, JSON.stringify(Obj));
}

function StoreLastState() {
    let Obj = GetCurrentState();

    localStorage.setItem(Defaults.LocalLastState, JSON.stringify(Obj));
}

function LoadLastState(Key = Defaults.LocalGameData) {
    let Game = GetLocalItem(Key);

    if (Game !== null) {
        Current.High = Game.High;
        Current.Move = Game.Move;
        Current.Score = Game.Score;
        Current.Merges = Game.Merges;
        Current.Start = Game.Start;
        Current.Undo = Game.Undo;

        return Game.Blocks;
    }

    return null;
}

function ClearLastState() {
    localStorage.setItem(Defaults.LocalLastState, '');
}

function SaveLastStateOnEnd() {
    let Scores = GetLocalItem(Defaults.LocalHighScore);
    let End = GetCurrentState();

    End['ID'] = MakeGameID(20);
    End['End'] = GetTimestamp();

    if (Scores !== null) {
        let Top = Scores.Top;

        Top.push(End);
        SortByKey(Top, 'Score', false);

        if (Top.length > 10)
            Top.pop();

        localStorage.setItem(Defaults.LocalHighScore, JSON.stringify(Scores));

        return {
            ID: End.ID,
            Position: Top.findIndex(a => a.ID === End.ID) + 1
        };
    } else {
        let Obj = {
            Top: [End]
        };

        localStorage.setItem(Defaults.LocalHighScore, JSON.stringify(Obj));

        return {
            ID: End.ID,
            Position: 1
        };
    }
}

function SetSetting(Type, Value) {
    switch (Type) {
        case 'NUMBER':
            Current.Settings.NumberFormat = Value;
            break;

        case 'DATE':
            Current.Settings.DateFormat = Value;
            break;

        case 'SEPARATOR':
            Current.Settings.DateSeparator = Value;
            break;
    }

    localStorage.setItem(Defaults.LocalSettings, JSON.stringify(Current.Settings));
}

function GetSettings() {
    let Settings = GetLocalItem(Defaults.LocalSettings);

    if (Settings !== undefined && Settings !== null)
        Current.Settings = Settings;
}

function GetSetting(Key) {
    return Current.Settings[Key];
}

function GetDateSeparator(Value) {
    switch (Value) {
        case 'DASH': return '-';
        case 'SLASH': return '/';
        case 'DOT': return '.';
    }

    return '';
}