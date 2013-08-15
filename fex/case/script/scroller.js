void function(){
	var styleStr = [".scroller{",
						 "height: 100%;",
						 "overflow: auto;",
						 "-webkit-overflow-scrolling: touch;",
					 "}",
					 "html,body{height:100%}"
					],
	style = document.createElement( "style" );
	
	style.appendChild(document.createTextNode( styleStr.join( "" )));
	(document.head || document.body).appendChild(style);
		
	if(/(iPad|iPhone)/i.test(navigator.userAgent)){
		window.addEventListener("DOMContentLoaded", function(){
		    var scroller = document.querySelector(".scroller"),
		    scrollContent = document.querySelector(".scrollContent");
		    scroller.addEventListener("touchstart", function(e){
		        if(this.scrollTop == 0){
		            this.scrollTop = 1;
		        }else if(this.scrollTop == scrollContent.clientHeight - scroller.clientHeight){
		            this.scrollTop = this.scrollTop - 1;
		        }
		    }, false);
		});
	}
}.call();
