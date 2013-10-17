/**
 * @require Event.js
 */

function Animator() {
    Event.apply(this);

    var frameNumber = 0;
    var lastFrameTime;
    var requestAnimationFrame = window.requestAnimationFrame;

    function ts() { return +new Date(); }
    this.start = function() {
        var that = this;
        lastFrameTime = ts();
        requestAnimationFrame(function onframe(){           
            frameNumber++;
            var last = lastFrameTime,
                current = ts(),
                delta = current - last;
            lastFrameTime = current;
            that.fire('frame', [{
                time: current,
                lastTime: last,
                deltaTime: delta
            }]);
            requestAnimationFrame(onframe);
        });
    }
}