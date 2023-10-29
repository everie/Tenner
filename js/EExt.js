HTMLElement.prototype.Animate = function(From, To, Settings, Callback) {
    let e = this;

    let anim = e.animate([
        From,
        To,
    ], Settings);

    anim.onfinish = function() {
        anim.commitStyles();
        anim.cancel();

        Callback();
    }
}