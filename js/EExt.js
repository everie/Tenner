/*
TENSION 1 - By Hans Elley
Extensions
 */

HTMLElement.prototype.Animate = function(From, To, Settings, Callback) {
    let e = this;

    let anim = e.animate([
        From,
        To,
    ], Settings);

    anim.onfinish = function() {
        anim.commitStyles();
        anim.cancel();

        if (Callback)
            Callback();
    }
}

Array.prototype.EachAsync = async function(Delay, Handler, Callback) {
    let arr = this;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const asyncFunc = async (item) => {
        Handler(item, () => { return true; });
    };

    for (const item in arr) {
        await asyncFunc(item);
        await delay(Delay);
    }

    Callback();
}

Array.prototype.First = function() {
    if (this.length < 1)
        return null;

    return this[0];
}

Array.prototype.Last = function() {
    if (this.length < 1)
        return null;

    return this[this.length - 1];
}

HTMLElement.prototype.Style = function(Style) {
    Object.keys(Style).forEach(a => {
        this['style'][a] = Style[a];
    });

    return this;
}


const Emit = function(Name) {
    window.dispatchEvent(new Event(Name));
}

const Listen = function(Name, Event) {
    window.addEventListener(Name, Event);
}

const Unlisten = function(Name, Event) {
    window.removeEventListener(Name, Event);
}

const Events = {};

HTMLElement.prototype.Emit = function(Name) {
    let e = this;
    let evt = Events[Name].Event;

    if (evt !== undefined && evt !== null)
        e.dispatchEvent(evt);
}

HTMLElement.prototype.Listen = function(Name, Event) {
    let e = this;
    let evt = new CustomEvent(Name, {
        bubbles: true
    });

    e.addEventListener(Name, Event, false);

    Events[Name] = {
        Element: e,
        Event: evt
    };
}

HTMLElement.prototype.Unlisten = function(Name) {
    delete Events[Name];
}