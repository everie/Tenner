const Defaults = {
    Size: 5,
    Start: 3
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
    if (Pct < 0.3) {
        return RandomByProbability([
            {Value: 1, Weight: 0.9},
            {Value: 2, Weight: 0.1}
        ]);
    } else if (Pct >= 0.3 && Pct < 0.5) {
        return RandomByProbability([
            {Value: 1, Weight: 0.75},
            {Value: 2, Weight: 0.25}
        ]);
    } else if (Pct >= 0.5 && Pct < 0.7) {
        return RandomByProbability([
            {Value: 2, Weight: 0.8},
            {Value: 3, Weight: 0.2}
        ]);
    } else if (Pct >= 0.7) {
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
        Start: Current.Start
    };

    return Obj;
}

function StoreCurrentState() {
    let Obj = GetCurrentState();

    localStorage.setItem('GAME', JSON.stringify(Obj));
}

function LoadLastState() {
    let Game = GetLocalItem('GAME');

    if (Game !== null) {
        Current.High = Game.High;
        Current.Move = Game.Move;
        Current.Score = Game.Score;
        Current.Merges = Game.Merges;
        Current.Start = Game.Start;

        return Game.Blocks;
    }

    return null;
}

function SaveLastStateOnEnd() {
    let Scores = GetLocalItem('HIGH');
    let End = GetCurrentState();

    End['ID'] = MakeGameID(20);
    End['End'] = GetTimestamp();

    if (Scores !== null) {
        let Top = Scores.Top;

        Top.push(End);
        SortByKey(Top, 'Score', false);

        if (Top.length > 10)
            Top.pop();

        localStorage.setItem('HIGH', JSON.stringify(Scores));

        return Top.findIndex(a => a.ID === End.ID) + 1;
    } else {
        let Obj = {
            Top: [End]
        };

        localStorage.setItem('HIGH', JSON.stringify(Obj));

        return 1;
    }
}