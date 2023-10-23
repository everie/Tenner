const Params = new URLSearchParams(window.location.search);
const ParamID = Params.get('id');

(function () {
    let Scores = GetLocalItem('HIGH').Top;
    let Container = document.querySelector('#HighScoreContainer');

    if (ParamID !== undefined && ParamID !== null) {
        let State = First(Scores.filter(a => a.ID === ParamID));

        let Row = document.createElement('div');
        let Row2 = document.createElement('div');

        Row.innerHTML = State.Score + ' -- ' + State.Move;
        Row2.innerHTML = 'Started: ' + GetReadableTimestamp(State.Start) + ' Ended: ' + GetReadableTimestamp(State.End);

        Container.appendChild(Row).appendChild(Row2);
    } else {
        Scores.forEach(a => {
            let Row = document.createElement('div');

            Row.innerHTML = '<a href="score.html?id=' + a.ID + '">' + a.Score + '</a>, ' + a.High + ', ' + a.Move;

            Container.appendChild(Row);
        });
    }
})();