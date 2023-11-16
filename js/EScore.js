const Params = new URLSearchParams(window.location.search);
const ParamID = Params.get('id');

(function () {
    let Container = document.querySelector('#HighScoreContainer');
    let H = GetLocalItem('HIGH');

    if (H == null) {
        Container.innerHTML = 'No scores registered yet. Go play!';
    } else {
        let Scores = H.Top;

        if (ParamID !== undefined && ParamID !== null) {
            let Score = First(Scores.filter(a => a.ID === ParamID));

            ScoreSingle(Container, Score);

            Populate(Score.Blocks);
            ReSize();
        } else {
            ScoreList(Container, Scores);
        }
    }
})();

window.onresize = function() {
    ReSize();
};

function ScoreList(Container, Scores) {
    if (Scores === undefined || Scores === null || Scores.toString().length < 1) {
        Container.innerHTML = 'No scores registered yet. Go play!';

        return;
    }

    let Table = document.createElement('div');

    SetStyle(Table, {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        fontWeight: '100'
    });

    let Header = ScoreListRow({
        Text: 'Score',
        Style: {
            textAlign: 'left',
            fontWeight: '400'
        }
    }, {
        Text: 'Moves',
        Style: {
            textAlign: 'right',
            fontWeight: '400'
        }
    }, {
        Text: 'Date',
        Style: {
            textAlign: 'right',
            fontWeight: '400'
        }
    });

    Table.appendChild(Header);

    Scores.forEach(a => {
        let Row = ScoreListRow({
            Text: '<a href="score.html?id=' + a.ID + '"><img src="imgs/icons/star.svg" width="16" style="margin-right:.5rem;" />' + FormatNumber(a.Score) + '</a>',
            Style: {
                textAlign: 'left'
            }
        }, {
            Text: FormatNumber(a.Move),
            Style: {
                textAlign: 'right',
                fontWeight: '100'
            }
        }, {
            Text: GetReadableTimestamp(a.End, true),
            Style: {
                textAlign: 'right'
            }
        });
        Table.appendChild(Row);
    });

    Container.appendChild(Table);
}

function ScoreSingle(Container, Score) {
    if (Score !== undefined && Score !== null) {
        let Row = document.createElement('div');
        let Row2 = document.createElement('div');
        let Row3 = document.createElement('div');
        let Row4 = document.createElement('div');
        let Board = document.createElement('div');

        SetStyle(Row, {
            fontSize: '1.4rem',
            fontWeight: '400'
        });

        SetStyle(Row2, {
            fontWeight: '200',
            marginTop: '1rem'
        });

        SetStyle(Row3, {
            fontWeight: '100',
        });

        SetStyle(Row4, {
            fontWeight: '100',
            marginTop: '1rem'
        });

        SetStyle(Board, {
            marginTop: '1rem',
            marginBottom: '1rem'
        });

        Row.innerHTML = 'Score: ' + FormatNumber(Score.Score);
        Row2.innerHTML = '<div>Moves: ' + FormatNumber(Score.Move) + '</div><div>Highest: ' + FormatNumber(Score.High) + '</div>';
        Row3.innerHTML = '<div>Start: ' + GetReadableTimestamp(Score.Start) + '</div><div>End: ' + GetReadableTimestamp(Score.End) + '</div>';

        Container.appendChild(Row);
        Container.appendChild(Row3);
        Container.appendChild(Row2);
        Container.appendChild(Board);

        // MERGES
        Object.keys(Score.Merges).forEach(Key => {
            let Div = document.createElement('div');
            let Div2 = document.createElement('div');
            let Obj = Score.Merges[Key];
            //
            // SetStyle(Div, {
            //     fontSize: '1.2rem',
            //     marginTop: '.5rem',
            //     fontWeight: '200'
            // });

            Div.appendChild(CreateGameSquareSingle(parseInt(Key)));
            Div2.innerHTML = '<div>Merges: ' + FormatNumber(Obj.Amount) + ', Blocks: ' + FormatNumber(Obj.Blocks) + '</div><div>Average: ' + FormatNumber(Math.round(Obj.Blocks * 10 / Obj.Amount) / 10, false) + ' b/m</div>';

            let R = document.createElement('div');

            SetStyle(R, {
                display: 'flex',
                marginBottom: '1rem'
            });

            R.appendChild(Div);
            R.appendChild(Div2);

            Row4.appendChild(R);
        });

        Container.appendChild(Row4);

        // BOARD
        //Board.innerHTML = '<div style="font-size:1.4rem;">End Board</div><div id="Game"><div id="GameContainer"><div id="InnerGame"></div></div></div>';
        Board.innerHTML = '<div id="Game"><div id="GameContainer"><div id="InnerGame"></div></div></div>';
        //Container.appendChild(Board);



    } else {
        Container.innerHTML = '<#Broken>';
    }
}

function ScoreListRow(...args) {
    let Row = document.createElement('div');

    SetStyle(Row, {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-evenly',
        flexDirection: 'row'
    });

    args.forEach(a => {
       let Col = document.createElement('div');

       Object.assign(a.Style, {
           display: 'block',
           width: (100 / args.length) + '%'
       });

        SetStyle(Col, a.Style);

       Col.innerHTML = a.Text;
       Row.appendChild(Col);
    });

    return Row;
}

// COPY/PASTE FROM ETen.js
function ReSize() {
    const GameContainer = document.querySelector('#GameContainer');

    const WindowHeight = window.innerHeight;
    const WindowWidth = GetSize('#Game')?.width;

    let Size = WindowHeight > WindowWidth ? WindowWidth : WindowHeight * 0.7;

    let AvailableSize = Size;
    let MaxSize = 400;
    let GameSize = AvailableSize > MaxSize ? MaxSize : AvailableSize;
    Current.GameSize = GameSize;
    Current.FontSize = (GameSize / Defaults.Size) * 0.5;
    Current.ScoreSize = (GameSize / Defaults.Size) * 0.25;

    if (GameContainer !== null) {
        GameContainer.style.height = GameSize + 'px';
        GameContainer.style.width = GameSize  + 'px';
        GameContainer.style.borderRadius = '8px';

        GameContainer.style.fontSize = Current.FontSize + 'px';

        ResizeSquares();
    }
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

function SquareSize() {
    const Inner = document.querySelector('#InnerGame');

    return GetSize2(Inner).width / Defaults.Size;
}

function Populate(Blocks) {
    const Inner = document.querySelector('#InnerGame');

    Blocks.forEach(function(Block) {
        let div = CreateGameSquare(Block.X - 1, Block.Y - 1, Block.Num);

        Current.Blocks.push(div);
        Inner.appendChild(div);
    });
}

function CreateGameSquare(x, y, num) {
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

    div.innerHTML = num;

    div.style.borderColor = GetNumColour(num);

    overlay.className = 'InnerOverlay';
    //overlay.style.backgroundColor = GetNumColour(num);
    overlay.style.background = 'linear-gradient(0deg, ' + GetNumColour2(num) + ' 0%, ' + GetNumColour(num) + ' 100%)';

    div.appendChild(overlay);

    return div;
}

function CreateGameSquareSingle(num) {
    const Size = 50;

    let div = document.createElement('div');
    let overlay = document.createElement('div');

    div.className = 'InnerSquare ScoreSingle';
    div.style.height = Size + 'px';
    div.style.width = Size + 'px';

    div.dataset.num = num;

    div.innerHTML = num;

    overlay.className = 'InnerOverlay';
    //overlay.style.backgroundColor = GetNumColour(num);
    overlay.style.background = 'linear-gradient(0deg, ' + GetNumColour2(num) + ' 0%, ' + GetNumColour(num) + ' 100%)';

    div.appendChild(overlay);

    return div;
}