// 点击logo
baidu("body").on("click","#logo",function(){

	baidu("#about").css("top","0");

});
baidu("body").on("click","#about",function(){

	baidu(this).css("top","-100%");

});

// END 点击logo
// nav 的点击
baidu(".screen").css("display","none");
baidu("#home").show()
baidu("#menu").on("click","li",function(){

	var num = parseInt(baidu(this).attr("class").substr(1));
	baidu("#menu").find("li").removeClass("current");
	baidu(this).addClass("current");
	baidu(".screen").hide();
	baidu(".screen").eq(num).show();
	if(num === 5){
		baidu("#top-nav").hide();
		baidu("#logo").hide();
		caseshow();
	}
});
baidu("#case").on("click",".return-button",function(){
	baidu("#top-nav").show();
	baidu("#logo").show();
});
// END nav 的点击
// 点击大牛图片
baidu("#head-container").on("mouseenter",".archive-head",function(){
	var num = parseInt(baidu(this).attr("class").slice(-1)) - 1;
	baidu("#word-container").find("img").hide();
	baidu("#archive-container").find("img").hide();
	baidu("#word-container").find("img").eq(num).show();
	baidu("#archive-container").find("img").eq(num).show();

});
// END 点击大牛图片
// 团队的图片
var container = baidu('#team-container');
baidu.ajax({
    url: 'fex/member/data.json',
    dataType: 'json',
    success: init
});

function init( data ) {
	var seq = [],mcount = data.length;
	for(var i = 0; i < mcount; i++) seq.push(i);
        seq.sort(function(){return Math.random() > 0.5 ? 1 : -1;});
	for(var i=0;i<mcount;i++)
		baidu('<div class="team-member" style="background-image: url(fex/member/' + seq[i] + '.png)" index="' + seq[i] + '"></div>').appendTo(container);

	baidu("body").on("mouseenter",".team-member",function(){
		var left = baidu(this).position().left + baidu(this).parent().position().left - 72;
		var num = parseInt(baidu(this).attr("index"));
		var dialog = baidu("#dialog");
		baidu(this).addClass("stand");
		baidu(this).prevAll().addClass('see-right');
		baidu(this).nextAll().addClass('see-left');
		dialog.html('<h1>' + data[num][0] + '</h1><p>' + data[num][1] + '</p>');
		dialog.css("left",left);
		dialog.show();

	});
	baidu("body").on("mouseleave",".team-member",function(){
		var num = parseInt(baidu(this).attr("index"));
		baidu(".team-member").removeClass("stand see-right see-left");
		baidu("#dialog").hide();
	});
	baidu(".prev").hide();
	baidu("body").on("click",".next",function(){

		var nwidth = baidu("#team-container").width() - baidu(window).width() + 100;
		var nleft = baidu("#team-container").position().left;
		var nright = nwidth + nleft;

		if(nright > 500){
			baidu("#team-container").animate({
	        	left: '-=500'
	    	},function(){LRbtnshow(nleft-500,nright);})

		}else{
			baidu("#team-container").animate({
	        	left: '-='+nright
	    	},function(){LRbtnshow(nleft-nright,0);})
		}
	});
	baidu("body").on("click",".prev",function(){

		var nwidth = baidu("#team-container").width() - baidu(window).width() + 100;
		var nleft = baidu("#team-container").position().left;
		var nright = nwidth + nleft;
		if(nleft < -500){
			baidu("#team-container").animate({
	        	left: '+=500'
	    	},function(){LRbtnshow(nleft+500,nright);})

		}else{
			baidu("#team-container").animate({
	        	left: '+=' + (-nleft)
	    	},function(){LRbtnshow(0,nright);})
		}

	});
	var LRbtnshow = function(nleft,nright){

		if (nleft === 0){
			baidu(".prev").hide();
		}else if(nright === 0){
			baidu(".next").hide();
		}else{
			baidu(".prev").show();
			baidu(".next").show();
		}

	}
}
// END 团队的图片
// 精彩案例

var caseshow = function(){

	var productionData = {}, otherData = {};
	var screenContainer = baidu(".case-content");
	var that = this;
	var PRODUCTION_LEVEL = 5;

	this.caseLoaded || loadCases();
	if (!Array.prototype.forEach)
	{
	  Array.prototype.forEach = function(fun /*, thisp*/)
	  {
	    var len = this.length;
	    if (typeof fun != "function")
	      throw new TypeError();

	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++)
	    {
	      if (i in this)
	        fun.call(thisp, this[i], i, this);
	    }
	  };
	}
	function loadCases() {
        baidu.ajax({
            type: 'get',
            url: 'fex/case/list.php?topic=cases',
            success: caseLoaded
        }); 
    }
    function caseLoaded( cases ){

    	initData( productionData, "产品线案例" );
        initData( otherData, "其他案例" );
        dispatchCases( cases );

        [ productionData, otherData ].forEach( function(data) {
            sortCases( data );
            sortTags( data );
            renderTags( data );
            renderCases( data );
        });

        that.caseLoaded = true;

    }
    function initData( data, title ) {
        var fieldset;

        fieldset = baidu('<fieldset></fieldset>').append('<legend>' + title + '</legend>');
        fieldset.appendTo(screenContainer);

        data.tagContainer = baidu('<div class="case-tags"><label>标签: </label></div>').appendTo(fieldset);
        data.caseContainer = baidu('<ul class="case-list"></ul>').appendTo(fieldset);
        data.cases = [];
        data.tags = [];
    }

    function dispatchCases( cases ) {
        var currentData, thecase;
        for( var name in cases ) {         
            thecase = cases[name];

            thecase.name = name;
            thecase.level = thecase.level || 0;
            thecase.visible = true;
            thecase.tags = thecase.tags || "";

            if ( thecase.level > PRODUCTION_LEVEL ) {
                currentData = productionData;
            } else {
                currentData = otherData;
            }

            currentData.cases.push( thecase );
            mergeTags( currentData, thecase );
        }
    }

    function mergeTags( data, thecase ) {
        if(!thecase.tags) return;

        var tags = data.tags;
        var caseTags = thecase.tags.split(' ');

        caseTags.forEach(function(tag) {
            var updated = false;
            tags.forEach( function(exist) {
                if(exist.name == tag) {
                    exist.count++;
                    updated = true;
                }
            });
            updated || tags.push( { name: tag, count: 1 });
        });
    }

    function sortCases( data ) {
        data.cases.sort( function(a, b) { return b.level - a.level; });
    }

    function sortTags( data ) {
        data.tags.sort( function(a, b) { return b.count - a.count; } );
    }

    function renderTags( data ) {
        var tags = data.tags,
            container = data.tagContainer;
        tags.forEach(function(tag) {
            container.append('<a data-tag="' + tag.name + '" class="case-tag">' + tag.name + ' (' + tag.count + ')</a>');
        });
    }
    function renderCases( data ) {
        var container = data.caseContainer,
            cases = data.cases,
            delay = 0;
        container.empty();
        cases.forEach(function(thecase){
            var section = baidu(
                '<li>' 
              + '  <img class="preview" src="fex/case/cases/' + thecase.name + '/preview.png" />'
              + '  <h1 class="title">' + thecase.title + '</h1>'
              + '  <p class="desc">' + thecase.desc + '</p>'
              + '  <div class="tags">' + thecase.tags + '</div>'
              + '  <a class="show-case" case-name="' + thecase.name + '" case-title="' +thecase.title + '" href="fex/case/show.php?name=' + thecase.name + '" target="_blank">查看</a>'
              + '</li>');
            section.appendTo(container);
            
        });
    }
}

// END 精彩案例