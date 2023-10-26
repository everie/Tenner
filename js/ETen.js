(function () {
    Current.High = Defaults.Start;
    Current.Blocks = [];

    ReSize();
    SetUpReset();

    let LastBlocks = LoadLastState();

    if (LastBlocks !== undefined && LastBlocks !== null) {
        PopulateLoaded(LastBlocks);
    } else {
        Current.Start = GetTimestamp();
        Populate();
    }

    UpdateScore();
})();

window.onresize = function() {
    ReSize();
};

function SetUpReset() {
    let Resets = document.querySelectorAll('.ResetGame');
    let End = document.querySelector('#InnerGameOverlay');

    Resets.forEach(element => {
        element.onclick = function() {
            localStorage.setItem('GAME', '');

            Current['High'] = Defaults.Start;
            Current['Blocks'] = [];
            Current['Selected'] = [];
            Current['Score'] = 0;
            Current['Move'] = 0;
            Current['Merges'] = {};
            Current['Start'] = GetTimestamp();

            End.style.display = 'none';

            Populate();
            UpdateScore();
        };
    });
}

function Populate() {
    const Inner = document.querySelector('#InnerGame');
    Inner.innerHTML = '';

    for (let y = 0; y < Defaults.Size; y++) {
        for (let x = 0; x < Defaults.Size; x++) {
            let div = CreateGameSquare(x, y, SquareChoice());

            Current.Blocks.push(div);
            Inner.appendChild(div);
        }
    }

    CalculateOptions(false);
}

function PopulateLoaded(LastBlocks) {
    const Inner = document.querySelector('#InnerGame');

    LastBlocks.forEach(function(Block) {
        let div = CreateGameSquare(Block.X - 1, Block.Y - 1, Block.Num, Block.B);

        Current.Blocks.push(div);
        Inner.appendChild(div);
    });

    CalculateOptions(false);
}

function CreateGameSquare(x, y, num, b = null) {
    const Size = SquareSize();

    let div = document.createElement('div');
    let overlay = document.createElement('div');

    div.className = 'InnerSquare';
    div.style.height = Size + 'px';
    div.style.width = Size + 'px';

    div.style.left = x * Size + 'px';
    div.style.top = y * Size + 'px';

    let X = x + 1;
    let Y = y + 1;

    div.dataset.x = X;
    div.dataset.y = Y;
    div.dataset.num = num;
    div.dataset.id = 'X' + X + 'Y' + Y;

    SetBonusOverlay(div, b);

    overlay.className = 'InnerOverlay';
    //overlay.style.backgroundColor = GetNumColour(num);
    overlay.style.background = 'linear-gradient(0deg, ' + GetNumColour2(num) + ' 0%, ' + GetNumColour(num) + ' 100%)';
    overlay.style.color = GetNumColour3(num);
    overlay.innerHTML = num;

    div.appendChild(overlay);

    if (num < 10) {
        div.onclick = function() {
            if (!Current.Busy) {
                if (Current.HasSelect()) {
                    if (Current.Selected.filter(a => a.ID === this.dataset.id).length > 0) {
                        // REMOVE SELECTED
                        RemoveAllFriends(this);
                    } else {
                        // DESELECT - CLICKED OUTSIDE
                        SelectDeselect(Current.Selected, false, function() {
                            //console.log('done deselected');
                        });
                    }

                } else {
                    // SELECT
                    GetAllFriends(this);
                }
            }
        }
    }

    return div;
}

function ReSize() {
    const GameContainer = document.querySelector('#GameContainer');
    const GameProgress = document.querySelector('#GameProgress');
    const GameProgressBottom = document.querySelector('#GameProgressBottom');
    const GameBonus = document.querySelector('.BonusOverlayText');

    const WindowHeight = window.innerHeight;
    const WindowWidth = GetSize('#Game').width;

    let Size = WindowHeight > WindowWidth ? WindowWidth : WindowHeight * 0.7;

    let AvailableSize = Size;
    let MaxSize = 800;
    let GameSize = AvailableSize > MaxSize ? MaxSize : AvailableSize;
    Current.GameSize = GameSize;
    Current.FontSize = (GameSize / Defaults.Size) * 0.5;
    Current.ScoreSize = (GameSize / Defaults.Size) * 0.25;

    GameContainer.style.height = GameSize + 'px';
    GameContainer.style.width = GameSize  + 'px';
    GameProgress.style.width = GameSize + 'px';
    GameProgressBottom.style.width = GameSize + 'px';


    GameContainer.style.fontSize = Current.FontSize + 'px';

    ResizeSquares();
}

function SquareSize() {
    const Inner = document.querySelector('#InnerGame');

    return GetSize2(Inner).width / Defaults.Size;
}

function ResizeSquares() {
    const Squares = document.querySelectorAll('.InnerSquare');
    let Square = SquareSize();

    Current.BlockSize = Square;

    Squares.forEach((S) => {
        let ds = S.dataset;

        S.style.width = Square + 'px';
        S.style.height = Square + 'px';
        S.style.left = ((ds.x - 1) * Square) + 'px';
        S.style.top = ((ds.y - 1) * Square) + 'px';
    });
}

function GetFriends(element, matching) {
    let x = parseInt(element.dataset.x);
    let y = parseInt(element.dataset.y);
    let num = parseInt(element.dataset.num);

    let numCheck = '';

    if (matching)
        numCheck = '[data-num="' + num + '"]';

    return {
        Self: element,
        ID: 'X' + x + 'Y' + y,
        Num: num,
        Left: document.querySelector('.InnerSquare[data-x="' + (x - 1) + '"][data-y="' + y + '"]' + numCheck),
        Right: document.querySelector('.InnerSquare[data-x="' + (x + 1) + '"][data-y="' + y + '"]' + numCheck),
        Over: document.querySelector('.InnerSquare[data-y="' + (y - 1) + '"][data-x="' + x + '"]' + numCheck),
        Under: document.querySelector('.InnerSquare[data-y="' + (y + 1) + '"][data-x="' + x + '"]' + numCheck),
        X: x,
        Y: y
    };
}

function TraverseFriends(element, arr) {
    let F = GetFriends(element, true);

    if (arr.filter(a => a.ID === F.ID).length < 1) {
        arr.push(F);
    }

    ValidateFriend(F.Left, arr);
    ValidateFriend(F.Right, arr);
    ValidateFriend(F.Over, arr);
    ValidateFriend(F.Under, arr);
}

function ValidateFriend(element, arr) {
    if (element !== null) {
        let F = GetFriends(element, true);

        if (arr.filter(a => a.ID === F.ID).length < 1) {
            arr.push(F);
            TraverseFriends(element, arr);
        }
    }
}

function GetAllFriends(element) {
    let Friends = [];
    TraverseFriends(element, Friends);

        if (Friends.length > 1) {
            Current.Selected = Friends;

            SelectDeselect([...Current.Selected], true, function() {
                //console.log('done selected');
            });
        } else {
            Current.Selected = [];
        }
}

function RemoveAllFriends(element) {
    Current.Busy = true;
    let Bonus = (element.dataset.bonus ? parseInt(element.dataset.bonus) : 1);

    ClearBonusBlock();

    let Friends = [];
    TraverseFriends(element, Friends);

    if (Friends.length > 1) {
        Current.Empties = [];

        Current.Selected = Friends;
        let SelectedBlocks = Current.Selected.length;
        let Score = CalcScore(Bonus);
        UpdateMergeStats(element.dataset.num, SelectedBlocks);

        let Blocks = [Current.Selected[0], ...Shuffle(Current.Selected.slice(1))];

        MergeSynced(element, Blocks, function() {
            //console.log('done merged', Score);
            Current.Selected = [];

            UpdateScore(Score, true);
            ShowScoreAnimation(element, Score, function() {
               //console.log('showed score.');
            });

            CreateNewBlock(element, function() {
                // FIND GAPS
                let Gaps = FindGaps(Current.Empties);

                // FIND BLOCKS ON TOP
                let Stacks = FindStacked(Gaps);

                FillGapsSynced(Stacks, function() {
                    FillEmptySquares(function() {

                        let Groups = CalculateOptions();
                        SetBonusBlock(Groups, SelectedBlocks);
                        StoreCurrentState();

                        //console.log('all dropped.');
                        Current.Busy = false;
                    });
                });
            });
        });
    } else {
        Current.Selected = [];
    }
}

function SetBonusBlock(Groups, Selected) {
    let Pct = Selected / Math.pow(Defaults.Size, 2);
    let Bonus = BonusChoice(Pct);

    if (Bonus > 1) {
        let G = Random(0, Groups.length - 1);
        let B = Random(0, Groups[G].length - 1);

        //let Group = Shuffle(Groups).pop();
        //let Block = Shuffle(Group).shift();

        let Block = Groups[G][B];

        SetBonusOverlay(Block.Self, Bonus);

        Block.Self.dataset.bonus = Bonus;
    }
}

function SetBonusOverlay(Element, Bonus) {
    if (Bonus !== undefined && Bonus !== null) {
        Element.dataset.bonus = Bonus;

        let overlay = document.createElement('div')
        let bonus = document.createElement('div');

        overlay.className = 'BonusOverlay X' + Bonus;
        bonus.className = 'BonusOverlayText X' + Bonus;

        bonus.innerHTML = 'x' + Bonus;

        Element.appendChild(bonus);
        Element.appendChild(overlay);
    }
}

function ClearBonusBlock() {
    let Block = document.querySelector('.InnerSquare[data-bonus]');

    if (Block !== undefined && Block !== null) {
        delete Block.dataset.bonus;

        let Overlays = document.querySelectorAll('.BonusOverlay, .BonusOverlayText');
        Overlays.forEach(a => {
            a.remove();
        })
    }
}

function UpdateMergeStats(Num, Count) {
    if (Current.Merges === undefined || Current.Merges === null)
        Current.Merges = {};

    let N = Current.Merges[Num];

    if (N !== undefined && N !== null) {
        Current.Merges[Num]['Amount']++;
        Current.Merges[Num]['Blocks'] += Count;
    }
    else
        Current.Merges[Num] = {
            Amount: 1,
            Blocks: Count
        };
}

function UpdateScore(Score = 0, Animate = false) {
    let Points = document.querySelector('#Points');
    let Moves = document.querySelector('#Moves');
    let OldPoints = Current.Score;

    if (Score > 0) {
        Current.Score += Score;
        Current.Move++;
    }

    if (Animate) {
        ScoreCountUpAnimation(Points, OldPoints, Current.Score);
    } else {
        Points.innerHTML = FormatNumber(Current.Score);
    }

    Moves.innerHTML = FormatNumber(Current.Move);
}

function CalculateOptions(Update = true) {
    let Seen = [];
    let Groups = [];
    let Options = 0;

    Current.Blocks.forEach(function(Block) {
        if (Seen.filter(a => a.ID === Block.dataset.id).length < 1) {
            let Friends = [];
            TraverseFriends(Block, Friends);

            if (Friends.length > 1) {
                Options++;
                Seen.push(...Friends);
                Groups.push(Friends);
            }
        }
    });

    let Opts = document.querySelector('#Options');
    Current.Options = Options;

    if (Options < 1) {
        EndGame(Update);
    }

    Opts.innerHTML = FormatNumber(Options);

    return Groups;
}

function EndGame(Update) {
    let End = document.querySelector('#InnerGameOverlay');
    let GamePos = document.querySelector('#GamePosition');
    let GamePosCont = document.querySelector('#GamePositionContainer');
    End.style.display = 'flex';

    if (Update) {
        let Position = SaveLastStateOnEnd();

        if (Position < 1) {
            GamePos.innerHTML = "None";
        } else {
            GamePos.innerHTML = Position;
        }

        GamePosCont.style.display = 'block';
    } else {
        GamePosCont.style.display = 'none';
    }
}

function FillEmptySquares(callback) {
    const Inner = document.querySelector('#InnerGame');

    const EmptyRows = ObjAsArray(GroupByY(GetAllEmptySquares())).reverse();

    async.eachSeries(EmptyRows, function(Empties, NextRow) {

        let Last = Empties[Empties.length - 1];

        async.eachSeries(Shuffle(Empties), function(Block, Next) {
            let div = CreateGameSquare(Block.X, Block.Y, SquareChoice());

            Current.Blocks.push(div);
            Inner.appendChild(div);

            SinkNewBlockAnimation(div, Block, function() {
                if (Block.ID === Last.ID)
                    Next();
            });

            // TIME BETWEEN BLOCK DROPS
            setTimeout(function() {
                if (Block.ID !== Last.ID)
                    Next();
            }, 40);

        }, function(err) {
            if (err)
                console.log(err);

            // ROW NEXT
            NextRow();
        });



    }, function(err) {
        if (err)
            console.log(err);

        callback();
    });

}

function ScoreCountUpAnimation(Container, From, To) {
    let Timer = 200;
    let Steps = 8;

    let Difference = To - From;
    let PrStep = Difference / Steps;

    ScoreCounter(Container, From, To, Steps, PrStep, Timer / Steps);
}

function ScoreCounter(Container, Value, ValueEnd, Step, StepAmount, Timer) {
    if (Step > 0) {
        setTimeout(function() {
            Value += StepAmount;
            Step--;

            Container.innerHTML = FormatNumber(Value);

            ScoreCounter(Container, Value, ValueEnd, Step, StepAmount, Timer);
        }, Timer);
    } else {
        Container.innerHTML = FormatNumber(ValueEnd);
    }
}

function SinkNewBlockAnimation(Div, Block, Callback) {
    let Y1 = -Current.BlockSize;
    let Y2 = Block.Y * Current.BlockSize;

    Div.style.opacity = '0';
    Div.style.top = Y1 + 'px';

    let a1 = Div.animate([
        { top: Y1 + 'px', opacity: 0 },
        { top: Y2 + 'px', opacity: 1 },
    ], {
        duration: 150 * Math.pow((1 + Block.Y), 0.25),
        easing: 'ease-out',
        fill: 'forwards'
    });

    a1.onfinish = function() {
        a1.commitStyles();
        // Cancel the animation
        a1.cancel();

        Callback();
    }
}

function ShowScoreAnimation(Block, Score, Callback) {
    let Inner = document.querySelector('#InnerGameMessages');

    let Rise = Current.BlockSize * 0.5;

    let X = parseInt(Block.dataset.x) - 1;
    let Y = parseInt(Block.dataset.y) - 1;
    let Top1 = ((Current.BlockSize * Y));
    let Top2 = ((Current.BlockSize * Y)) - (Rise * 0.6);
    let Top3 = ((Current.BlockSize * Y)) - Rise;

    let F1 = Current.ScoreSize * 0.5;
    let F2 = Current.ScoreSize;
    let F3 = Current.ScoreSize * 1.5;

    let Div = document.createElement('div');
    Div.className = 'ScoreDisplay';
    Div.style.width = (Current.BlockSize * 2) + 'px';
    Div.style.height = (Current.BlockSize) + 'px';

    Div.style.left = ((Current.BlockSize) * X - (Current.BlockSize / 2)) + 'px';
    Div.style.top = Top1 + 'px';

    Div.style.fontSize = Current.ScoreSize + 'px';

    Div.innerHTML = '+' + FormatNumber(Score);
    Inner.appendChild(Div);

    let a1 = Div.animate([
        { top: Top1 + 'px', opacity: 0, fontSize: F1 + 'px' },
        { top: Top2 + 'px', opacity: 1, fontSize: F2 + 'px' },
    ], {
        duration: 300,
        easing: 'ease-in',
        fill: 'forwards'
    });

    a1.onfinish = function() {
        a1.commitStyles();
        // Cancel the animation
        a1.cancel();


        let a2 = Div.animate([
            { top: Top2 + 'px', opacity: 1, fontSize: F2 + 'px' },
            { top: Top3 + 'px', opacity: 0, fontSize: F3 + 'px' },
        ], {
            duration: 250,
            easing: 'ease-out',
            fill: 'forwards'
        });

        a2.onfinish = function() {
            a2.commitStyles();
            // Cancel the animation
            a2.cancel();

            Div.remove();

            Callback();
        }

    }
}

function CreateNewBlock(source, callback) {
    const Inner = document.querySelector('#InnerGame');

    let x = source.dataset.x - 1;
    let y = source.dataset.y - 1;
    let num = parseInt(source.dataset.num);

    num++;

    if (num > Current.High)
        Current.High = num;

    let div = CreateGameSquare(x, y, num);

    Current.Blocks.push(div);
    Inner.appendChild(div);

    div.style.opacity = '0';

    SpawnBlockAnimation(div, callback);
}

function SelectDeselect(arr, on, callback) {
    if (arr.length > 0) {
        if (on) {
            let a = arr.shift();
            a.Self.classList.add('Selected');

            /*
            if (a.Left === null) a.Self.style.borderLeftWidth = '1px';
            if (a.Right === null) a.Self.style.borderRightWidth = '1px';
            if (a.Over === null) a.Self.style.borderTopWidth = '1px';
            if (a.Under === null) a.Self.style.borderBottomWidth = '1px';
            */
        } else {
            let a = arr.pop();

            a.Self.style.borderWidth = '0';

            a.Self.classList.remove('Selected');
        }

        setTimeout(function() {
            SelectDeselect(arr, on, callback);
        }, 14);
    } else {
        callback();
    }
}

function FillGapsSynced(Stacks, callback) {
    let ID = 0;
    const End = Stacks.length;

    if (Stacks.length > 0) {
        async.eachSeries(Stacks, function(Stack, Next) {

            SinkStackAnimation({ ID: ID, Stack: Stack }, function() {
                ID++;

                if (ID === End)
                    callback();
            });

            setTimeout(function() {
                Next();
            }, 30);

        }, function(err) {
            if (err)
                console.log(err);
        });
    } else {
        callback();
    }
}

function MergeSynced(source, arr, callback) {
    const Last = arr[arr.length - 1];

    async.eachSeries(arr, function(a, next) {

        if (source.dataset.id !== a.ID) {
            Current.Empties.push({
                X: a.X,
                Y: a.Y
            });
        }

        MergeAnimation(source, a, function() {
            if (a.ID === Last.ID) {
                next();
            }

        });

        setTimeout(function() {
            if (a.ID !== Last.ID) {
                next();
            }

        }, 40);

    }, function(err) {
        if (err)
            console.log(err);

        callback();
    });

}

function MergeAnimation(Source, Element, Callback) {
    const Inner = document.querySelector('#InnerGame');

    let Copy = Element.Self.cloneNode(true);

    Inner.appendChild(Copy);
    Element.Self.remove();
    Current.Blocks = Current.Blocks.filter(a => a.dataset.id !== Element.ID);

    Copy.style.zIndex = '5';

    const To = GetXY(Source);
    const From = {
        X: Element.X,
        Y: Element.Y,
        BX: (Element.X - 1) * Current.BlockSize,
        BY: (Element.Y - 1) * Current.BlockSize
    };

    let Size1 = Current.BlockSize;
    let Size2 = Current.BlockSize * 1.4;
    let Size3 = Size2 * 0.5;
    let SizeDelta = Size2 - Size1;
    let SizeAdjust = SizeDelta / 2;

    let FS1 = Current.FontSize;
    let FS2 = FS1 * 1.3;
    let FS3 = FS2 * 0.6;

    let Size3Adjust = (Size1 - Size3) / 2;

    const ToX = (To.X - 1) * Current.BlockSize + Size3Adjust;
    const ToY = (To.Y - 1) * Current.BlockSize + Size3Adjust;

    let a1 = Copy.animate([
        { width: Size1 + 'px', height: Size1 + 'px', left: (From.BX) + 'px', top: (From.BY) + 'px', fontSize: FS1 + 'px' },
        { width: Size2 + 'px', height: Size2 + 'px', left: (From.BX - SizeAdjust) + 'px', top: (From.BY - SizeAdjust) + 'px', fontSize: FS2 + 'px' }
    ], {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards'
    });

    a1.onfinish = function() {
        let a2 = Copy.animate([
            { left: (From.BX - SizeAdjust) + 'px', top: (From.BY - SizeAdjust) + 'px', opacity: 1, width: Size2 + 'px', height: Size2 + 'px', fontSize: FS2 + 'px' },
            { left: (ToX) + 'px', top: (ToY) + 'px', opacity: 0.4, width: Size3 + 'px', height: Size3 + 'px', fontSize: FS3 + 'px' }
        ], {
            duration: 100,
            easing: 'ease-out',
            fill: 'forwards'
        });

        a2.onfinish = function() {
            let a3 = Copy.animate([
                { opacity: 0.4 },
                { opacity: 0 },
            ], {
                duration: 40,
                easing: 'ease-in',
                fill: 'forwards'
            });

            Copy.remove();
            a3.onfinish = Callback;
        }
    }
}

function SpawnBlockAnimation(source, callback) {
    let Size1 = Current.BlockSize;
    let Size2 = Current.BlockSize * 1.3;
    let Size3 = Size2 * 0.5;
    let SizeDelta = Size2 - Size1;
    let SizeAdjust = SizeDelta / 2;

    let FS1 = Current.FontSize;
    let FS2 = FS1 * 1.3;
    let FS3 = FS2 * 0.6;

    const To = GetXY(source);
    const From = {
        X: To.X,
        Y: To.Y,
        BX: (To.X - 1) * Current.BlockSize,
        BY: (To.Y - 1) * Current.BlockSize
    };

    let Size3Adjust = (Size1 - Size3) / 2;

    const ToX = (To.X - 1) * Current.BlockSize + Size3Adjust;
    const ToY = (To.Y - 1) * Current.BlockSize + Size3Adjust;

    source.style.left = ToX + 'px';
    source.style.top = ToY + 'px';

    let a1 = source.animate([
        { width: Size3 + 'px', height: Size3 + 'px', left: ToX + 'px', top: ToY + 'px', fontSize: FS3 + 'px', opacity: 0 },
        { width: Size2 + 'px', height: Size2 + 'px', left: (From.BX - SizeAdjust) + 'px', top: (From.BY - SizeAdjust) + 'px', fontSize: FS2 + 'px', opacity: 1 }
    ], {
        duration: 120,
        easing: 'ease-out',
        fill: 'forwards'
    });

    a1.onfinish = function() {

        a1.commitStyles();
        // Cancel the animation
        a1.cancel();

        let a2 = source.animate([
            { width: Size2 + 'px', height: Size2 + 'px', left: (From.BX - SizeAdjust) + 'px', top: (From.BY - SizeAdjust) + 'px', fontSize: FS2 + 'px' },
            { width: Size1 + 'px', height: Size1 + 'px', left: From.BX + 'px', top: From.BY + 'px', fontSize: FS1 + 'px' }
        ], {
            duration: 40,
            easing: 'ease-in',
            fill: 'forwards'
        });

        a2.onfinish = function() {
            a2.commitStyles();
            // Cancel the animation
            a2.cancel();

            // clear font-size
            source.style.fontSize = '';

            callback();
        }

    }
}

function SinkStackAnimation(StackObj, Callback) {
    const Stack = StackObj.Stack;
    const Last = Stack[Stack.length - 1];

    async.eachSeries(Stack, function(Block, Next) {

        SinkBlockAnimation(Block, function() {
            if (Block.ID === Last.ID)
                Next();
        });

        if (Block.ID !== Last.ID) {
            setTimeout(function() {
                Next();
            }, 40);
        }

    }, function(err) {
        if (err)
            console.log(err);

        Callback();
    });
}

function SinkBlockAnimation(Block, Callback) {
    let P1 = Block.Y - 1;
    let P2 = P1 + Block.Distance;

    let Y1 = P1 * Current.BlockSize;
    let Y2 = P2 * Current.BlockSize;

    let EndY = P2 + 1;

    let Element = Block.Self;

    Element.dataset.y = EndY;
    Element.dataset.id = 'X' + Block.X + 'Y' + EndY;

    let a1 = Element.animate([
        { top: Y1 + 'px' },
        { top: Y2 + 'px' },
    ], {
        duration: 100 * Math.pow(Block.Distance, 0.8),
        easing: 'ease-in-out',
        fill: 'forwards'
    });

    a1.onfinish = function() {
        a1.commitStyles();
        // Cancel the animation
        a1.cancel();

        Callback();
    }
}

function CalcScore(Bonus) {
    let P = [...Current.Selected];
    let Count = P.length;
    let First = (Count > 0 ? P[0] : null);

    if (First === null)
        return 0;

    let Num = First.Num;

    return CalculatePoints(Num, Count, Bonus);
}

function ScoreTable() {
    for (let i = 1; i < 10; i++) {
        let arr = [];
        for (let j = 2; j < 20; j++) {
            arr.push(CalculatePoints(i, j));
        }

        console.log(arr);
    }
}

function CalculatePoints(Num, Count, Bonus) {
    let Blocks = Count * Math.pow((Num * 1.1) + 0.25, 1.8);
    let Multiplier = Math.pow(Count * 0.32, 1.25);

    let Total = Math.round(Blocks * Multiplier + (Num * 1.4));

    return Total * Bonus;
}

function FindGaps(Empties) {
    let Hanging = [];

    Current.Blocks.forEach((B) => {
        let F = GetFriends(B, false);

        if (Empties.filter(a => a.X === F.X && a.Y === F.Y).length < 1) {
            let U = CheckUnder(F);

            if (U !== null)
                Hanging.push(U);
        }
    });

    return Hanging;
}

function CheckUnder(F) {
    if (F.Y !== Defaults.Size && F.Under === null) {
        return {
            Element: F.Self,
            Distance: CheckDistanceUnder(F)
        }
    }

    return null;
}

function CheckDistanceUnder(F) {
    let Distance = 0;

    for (let i = F.Y + 1; i <= Defaults.Size; i++) {
        if (!CheckXY(F.X, i)) {

            Distance++;
        }
    }

    return Distance;
}

function FindStacked(arr) {
    let Stacks = [];

    arr.forEach(function(s) {
        let F = GetFriends(s.Element);

        Stacks.push(TraverseOvers(F, s.Distance, []));
    });

    return Stacks;
}

function TraverseOvers(F, Distance, Arr) {
    F['Distance'] = Distance;
    Arr.push(F);

    if (F.Over !== null) {
        let OF = GetFriends(F.Over);

        return TraverseOvers(OF, Distance, Arr);
    } else {
        return Arr;
    }
}

function CheckXY(x, y) {
    let obj = document.querySelector('.InnerSquare[data-x="' + x + '"][data-y="' + y + '"]');

    return obj !== null;
}

function GetXY(element) {
    if (element === null)
        return null;

    try {
        return {
            X: parseInt(element.dataset.x),
            Y: parseInt(element.dataset.y)
        }
    } catch (err) {
        return null;
    }
}

function GetAllEmptySquares() {
    let Arr = [];

    for (let y = 1; y <= Defaults.Size; y++) {
        for (let x = 1; x <= Defaults.Size; x++) {
            if (!CheckXY(x, y))
                Arr.push({
                    X: x - 1,
                    Y: y - 1,
                    ID: 'X' + x + 'Y' + y
                });
        }
    }

    return Arr;
}

