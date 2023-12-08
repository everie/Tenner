/*
TENSION - By Hans Elley
Settings View
 */

(function () {
    GetSettings();
    CreateForm();
    FillForm();
})();

function CreateForm() {
    let Form = document.querySelector('#SettingsForm');

    let N = CreateRadio('Number format', 'number-format', Current.Settings.Options.NumberFormat);
    let D = CreateRadio('Date format', 'date-format', Current.Settings.Options.DateFormat);
    let S = CreateRadio('Date Separator', 'date-separator', Current.Settings.Options.DateSeparator);

    let DateTitle = document.createElement('div');
    let DateExample = document.createElement('div');
    DateExample.className = 'date-example';
    DateExample.innerHTML = GetReadableTimestamp(Date.now(), true);
    DateTitle.className = 'radio-title';
    DateTitle.innerHTML = 'Date example';

    Form.append(N, D, S, DateTitle, DateExample);
}

function CreateRadio(Title, ID, Choices) {
    let container = document.createElement('div');
    let title = document.createElement('div');
    let radios = document.createElement('div');

    container.className = 'radio-container';

    title.className = 'radio-title';
    title.innerHTML = Title;
    
    Choices.forEach(a => {
        let label = document.createElement('label');
        let radio = document.createElement('input');

        label.className = 'radio-label';

        radio.type = 'radio';
        radio.name = ID;
        radio.className = 'radio-field';
        radio.value = a.Value;

        label.append(radio, a.Text);
        radios.append(label);
    });

    container.append(title, radios);
    return container;
}

function FillForm() {
    let NumberFormat = document.querySelectorAll('.radio-field[name="number-format"]');
    let DateFormat = document.querySelectorAll('.radio-field[name="date-format"]');
    let DateSeparator = document.querySelectorAll('.radio-field[name="date-separator"]');

    let DateExample = document.querySelector('.date-example');
    //let NumberExample = document.querySelector('.number-example');

    DateExample.innerHTML = GetReadableTimestamp(Date.now(), true);
    //NumberExample.innerHTML = FormatNumber(1234567.89, false);


    DateFormat.forEach(a => {
        if (a.value === Current.Settings.DateFormat)
            a.checked = true;

        a.addEventListener('change', function( ) {
            let e = this;
            let val = e.value;

            if (Current.Settings.Options.DateFormat.some(a => a.Value === val))
                SetSetting('DATE', val);

            DateExample.innerHTML = GetReadableTimestamp(Date.now(), true);
        });
    });

    DateSeparator.forEach(a => {
        if (a.value === Current.Settings.DateSeparator)
            a.checked = true;

        a.addEventListener('change', function( ) {
            let e = this;
            let val = e.value;

            if (Current.Settings.Options.DateSeparator.some(a => a.Value === val))
                SetSetting('SEPARATOR', val);

            DateExample.innerHTML = GetReadableTimestamp(Date.now(), true);
        });
    });

    NumberFormat.forEach(a => {
        if (a.value === Current.Settings.NumberFormat)
            a.checked = true;

        a.addEventListener('change', function( ) {
            let e = this;
            let val = e.value;

            if (Current.Settings.Options.NumberFormat.some(a => a.Value === val))
                SetSetting('NUMBER', val);

            //NumberExample.innerHTML = FormatNumber(1234567.89, false);
        });
    });
}