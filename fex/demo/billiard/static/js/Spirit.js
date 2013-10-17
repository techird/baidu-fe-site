function Spirit () {
	Event.apply(this);

	var _scenes = {};
	var me = this;
	var stoped = false;

	function moment() {
		return +new Date();
	}

	this.addScene = function( name, play, length ) {
		_scenes[name] = { play: play, length: length };
	}
	this.stop = function() {
		stoped = true;
	}
	this.playScene = function( name, states ) {
		var play = _scenes[ name ];
		if( !play ) return;

		var startMoment = moment(),
			elapsed,
			lastElapsed = 0,
			frameLength = 0,
			frameId = 0;
		function frame() {
			elapsed = moment() - startMoment;
			var playReturn = play.play({
				elapsed: elapsed,
				lastFrameLength: elapsed - lastElapsed,
				currentFrame: frameId++,
				percent: play.length ? Math.max(elapsed / play.length, 1) : NaN
			}, states);
			lastElapsed = elapsed;
			if(play.length) {
				if(elapsed >= play.length) stoped = true;
			} else if(!playReturn) {
				stoped = true;
			}
			if(!stoped) requestAnimationFrame(frame);
			else {
				me.fire("stop", [name]);
			}
		}
		stoped = false;
		frame();
	}

}
