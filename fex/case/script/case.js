void function(){
	window.addEventListener("DOMContentLoaded", function(){
		var images = document.querySelectorAll(".item img"),
			eventIn = "ontouchstart" in window ? "touchstart" : "mouseover",
			eventOut = "ontouchend" in window ? "touchend" : "mouseout",
		eventHandler = function(e){
			if(e.type == eventIn)
				e.target.classList.add("active");
			else
				e.target.classList.remove("active");
		};
		
		
		Array.prototype.forEach.call(images, function(image){
			image.addEventListener(eventIn, eventHandler);
			image.addEventListener(eventOut, eventHandler);
		});
	});
}.call();
