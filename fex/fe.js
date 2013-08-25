
baidu(function(){       

    var stage = new Stage();
    var splash = new Splash( stage );
    var control = new Control( stage, splash );

    stage.getScreen('home')

        .on( 'init', function(){
            var screen = this;
            this.down = this.$.find('.nav.down').click(function(){
                stage.slideToScreen(1);
            });
        })

        .on('beforehide', function(){            
            this.down.cssAnimate( { 'translateY': 100 } );
        })

        .on('aftershow', function(){            
            this.down.cssAnimate( { 'translateY': -100 } );
        });

    stage.getScreen('topic')
        .on( 'init', function(){
            baidu.ajax({
                url: 'fex/case/list.php',
                success: function( caseMap ) { 
                    
                }
            })
        });

    stage.getScreen('archive')
        .on( 'init', function(){
            this.heads = this.$.find('.archive-head');
            this.left = function() {
                return (stage.width() - this.heads.outerWidth() * this.heads.length) / 2 + 20
            }
            this.middle = function() {
                return (stage.width() - this.heads.width()) / 2;
            }
            this.layout = function() {
                var s = this;
                s.heads.each(function(index, dom){
                    var m = baidu(dom);
                    m.css({
                        left: s.left() + index * m.width(),
                        opacity: 1
                    }, 300);
                });
            }

            var ss = this.slideShow = new SlideShow({
                container : '#archive-container',
                duration: 500,
                allowFold: true,
                showDelay: 350,
                foldDelay: 350,
                effect: {
                    fold: { ratio: 0.03, both: true },
                    fade: true
                }
            });
            var ws = this.slideShow2 = new SlideShow({
                container : '#word-container',
                duration: 1000,
                direction: '-X',
                allowFold: true,
                showDelay: 350,
                foldDelay: 350,
                effect: {
                    fold: { ratio: 0.03, both: true },
                    fade: true
                }
            })
            var _this = this, index;
            var heads = this.heads
                .on('mouseenter', function(e){
                    _this.$.find('h1').cssAnimate({opacity: 0});
                    var target = baidu(e.target);
                    index = target.prevAll().length;
                    active(index);
                });

            var currentIndex = undefined;
            function active(index) {
                ss.slide(index);
                ws.slide(index);
                heads.filter('.current').removeClass('current');
                heads.eq(index).addClass('current');
                currentIndex = index;
            }

            this.on('navigate', function(e) {
                var index = currentIndex;
                switch(e.direction) {
                    case 'Left':
                        if ( index === undefined || index == 0) active(heads.length - 1);
                        else active( index - 1 );
                        break;
                    case 'Right':
                        if ( index === undefined || index == heads.length - 1 ) active(0);
                        else active( index + 1 );
                        break;
                }
            });

            this.fit('#archive-container');
            this.fit('#word-container');
        })
        .on('resize', function(width){
            this.layout();
        })
        .on('beforeshow', function(){
            this.heads.css( { 'left': this.middle() } );
            this.layout();
        })
        .on('beforehide', function(){
            this.heads.cssAnimate({opacity: 0});
        })
    
    stage.getScreen('team')
        .on( 'init', function(){       
            var container = this.$.find('#team-container');
            var drawing = this.$.find('#drawing-layer');
            var dialog = this.$.find('#dialog');
            var ly = 0, lx = 0;
            var last_index;
            var mcount = 34;     
            var _this = this;
            var prev = _this.prev = _this.$.find('.nav.prev').hide();
            var next = _this.next = _this.$.find('.nav.next');
            var farRatio = this.farRatio = 0.2;

            baidu.ajax({
                url: 'fex/member/data.json',
                dataType: 'json',
                success: init
            });

            function init( data ) {
                var seq = [], mcount = data.length;
                for(var i = 0; i < mcount; i++) seq.push(i);
                seq.sort(function(){return Math.random() > 0.5 ? 1 : -1;});

                for(var i = 0; i < mcount; i++) {
                    baidu('<div class="team-member" style="background-image: url(fex/member/' + seq[i] + '.png)" index="' + seq[i] + '"></div>').appendTo(container);
                }                    
                plan(function(){
                    var sw = stage.width(),
                        cw = baidu('#team-container').outerWidth();
                    baidu('#drawing-layer').css('width', sw + cw * farRatio);
                }, 10);
                var members = _this.$.find('.team-member');
                var stand_timeout = 400, stand_timer;

                container.delegate('.team-member', 'mouseenter', function(e){
                    var target = baidu(e.target);
                    var index = +target.attr('index');

                    members.removeClass('stand see-left see-right');
                    target.prevAll().addClass('see-right');
                    target.nextAll().addClass('see-left');


                    var left = target.position().left - target.width() / 2 + target.parent().position().left - 10;


                    dialog.html('<h1>' + data[index][0] + '</h1><p>' + data[index][1] + '</p>');
                    dialog.cssAnimate( { 
                        translateX: left,
                        opacity: 1,
                        translateY: 0 
                    }, 600);

                    clearTimeout(stand_timer);
                    stand_timer = setTimeout(function(){
                        target.addClass('stand');
                    }, stand_timeout);
                });

                container.on('mouseleave', function(e){             
                    members.removeClass('stand see-left see-right');
                    dialog.cssAnimate({
                        opacity: 0,
                        translateY: -100
                    });
                    clearTimeout(stand_timer);                
                });


                var translateX = 0, bodyWidth = members.width();

                function hasNext(sw, cw) {
                    sw = sw || stage.width();
                    cw = cw || container.outerWidth();
                    return translateX + sw < cw;
                }
                function hasPrev() {
                    return translateX > 0;
                }
                function go ( sw, cw ) {
                    sw = sw || stage.width();
                    cw = cw || container.outerWidth();
                    container.stop().cssAnimate({ translateX: -translateX }, 1600 );
                    dialog.cssAnimate({opacity: 0, translateY: -100});
                    drawing.cssAnimate({
                        translateX: -translateX * farRatio
                    }, 1600);
                    hasNext(sw, cw) ? next.show() : next.hide();
                    hasPrev() ? prev.show() : prev.hide();
                }
                function goNext(){ 
                    var sw = stage.width(),
                        cw = container.outerWidth();
                    if ( !hasNext(sw, cw) ) return;
                    var increase = Math.min( sw - bodyWidth, cw - sw - translateX );
                    translateX += increase;                    
                    go( sw, cw );
                }
                function goPrev(){ 
                    var sw = stage.width(),
                        cw = container.outerWidth();
                    if ( !hasPrev() ) return;
                    var decrease = Math.min( sw - bodyWidth, translateX );
                    translateX -= decrease;
                    go( sw, cw );
                }

                next.click(goNext);
                prev.click(goPrev);
                _this.on('navigate', function(e){
                    if ( e.source != 'keyboard' ) return;
                    switch(e.direction) {
                         case 'Left': return goPrev();
                         case 'Right': return goNext();
                    }
                });

                var dscx = 0, dstx;
                function drag(e) {
                    e.preventDefault();
                    if(e.touches) {
                        if(e.touches.length !== 1) return;
                        e = e.touches[0];
                    }
                    var dx = e.clientX - dscx;
                    if ( hasNext() ) {
                        next.show();
                    } else {
                        next.hide();
                        if ( dx < -1 ) return;
                    }
                    if ( hasPrev() ) {
                        prev.show();
                    } else {
                        prev.hide();
                        if ( dx > 1 ) return;
                    }
                    translateX = dstx - dx;
                    container.css3( { translateX: -translateX } );
                    drawing.css3( { translateX: -translateX * farRatio } );
                }
                container.on('dragstart', function(e) { e.preventDefault(); } );
                _this.$.on( 'dragstart', function(e) { e.preventDefault(); } );

                if(window.ontouchstart === undefined) {
                    _this.$.on( 'mousedown', function(e) {
                        dstx = translateX;
                        dscx = e.clientX;
                        _this.$.on('mousemove', drag);
                    } );

                    _this.$.on( 'mouseup', function(e) {
                        _this.$.off('mousemove', drag);
                    } );
                } else { 
                    var ts;
                    _this.$[0].addEventListener('touchstart', function(e) {
                        if ( e.touches.length !== 1 ) return;
                        ts = +new Date();
                        dstx = translateX;
                        dscx = e.touches[0].clientX;
                        _this.$[0].addEventListener('touchmove', drag);
                    });
                    _this.$[0].addEventListener('touchend', function(e) {
                        _this.$[0].removeEventListener('touchmove', drag);
                        if((+new Date()) - ts < 500) {
                            var dx = e.changedTouches[0].clientX - dscx;
                            if(dx < -20 && hasNext()) goNext();
                            if(dx > 20 && hasPrev()) goPrev();
                        }
                    });
                }
                
            }                      
            
        })
        
        .on('aftershow', function() {
            setTimeout(function(){
                this.prev.cssAnimate( '+show' , 200 );
                this.next.cssAnimate( '+show' , 200 );
            }.bind(this), 100);
        })

        .on('beforehide', function(){                 
            this.prev.cssAnimate( '-show' , 200 );
            this.next.cssAnimate( '-show' , 200 );
        });

    stage.getScreen('contact')
        .on('init', function(){
            this.github = this.$.find('#github').addClass('hide');
        })
        .on('aftershow', function(){
            this.github.removeClass('hide');
        })
        .on('beforehide', function(){
            this.github.addClass('hide');
        })

    stage.getScreen('case')
        .on('init', function() {
            this.$.find('.return-button').click(function(){
                window.history.go(-1);
            });
        })
        .on('hashchange', function(hash){
            hash == 'case' || control.enableNavigation( 800 );
        })
        .on('beforeshow', function() {
            plan( control.disableNavigation, 10, [500], control );
        })
        .on('aftershow', function() {    
            var screen = this.$;
            var that = this;
            function setTitle( title ) {
                screen.find('.case-control h1').html(title);
            }
            
            function loadCases() {
                baidu('.loading').css('display', 'block');
                baidu.ajax({
                    type: 'get',
                    url: 'fex/case/list.php?topic=cases',
                    success: showCases
                }); 
            }
            function sortCases( caseMap ) {
                var caseArray = [];
                for(var name in caseMap) {
                    if(caseMap.hasOwnProperty(name)) {
                        var thecase = caseMap[name];
                        thecase.name = name;
                        thecase.level = thecase.level || 0;
                        caseArray.push(thecase);
                    }
                }
                return caseArray.sort(function(a, b){ return b.level - a.level; });
            }
            
            function appendCase(caseMap, container){
            	var article = baidu('<article class="case-list"></article>').appendTo(container);
                var delay = 0;
                var sections = [];
                var cases = sortCases( caseMap );
                var tags = [];
                cases.forEach(function(thecase){
                    var section = baidu(
                        '<section data-tags="' + thecase.tags + '">' 
                      + '  <img class="preview" src="fex/case/cases/' + thecase.name + '/preview.png" />'
                      + '  <h1 class="title">' + thecase.title + '</h1>'
                      + '  <p class="desc">' + thecase.desc + '</p>'
                      + '  <div class="tags">' + thecase.tags + '</div>'
                      + '  <a class="show-case" case-name="' + thecase.name + '" case-title="' +thecase.title + '" href="fex/case/show.php?name=' + thecase.name + '" target="_blank">查看</a>'
                      + '</section>');
                    sections.push(section);
                    section.css3({ opacity: 0, translateY: 30 }).appendTo(article);
                    plan(function(section) {
                        section.cssAnimate({ opacity:1, translateY: 0 });
                    }, delay += 100, [section]);
                    mergeTags(thecase);
                });

                var tagContainer = baidu('<div class="case-tags"><label>标签: </label></div>').prependTo(container);
                tags.sort(function(a, b) { return b.count - a.count; });
                tags.forEach(function(tag) {
                    tagContainer.append('<a data-tag="' + tag.name + '" class="case-tag">' + tag.name + ' (' + tag.count + ')</a>');
                });
                tagContainer.delegate('.case-tag', 'click', function(e) {
                    baidu('.loading').css('display', 'block');
                    var tag = undefined;
                        a = baidu(e.target);
                    if(!a.hasClass('active')) {
                        tagContainer.find('.case-tag.active').removeClass('active');    
                        a.addClass('active');
                        tag = baidu(e.target).attr('data-tag');
                    } else {
                        a.removeClass('active');
                    }
                    plan( article.cssAnimate, 10, [{ translateY: 30, opacity: 0 }, 200, function(){
                        filterByTag( tag );
                    }], article );
                });
                function filterByTag( name ) {
                    var delay = 0;
                    setTitle('精彩案例' + ( name ? (' - ' + name) : ''));
                    sections.forEach(function(section){
                        section.detach();
                        if(!name || ~section.attr('data-tags').indexOf(name)) {
                            section.css3({ opacity: 0, translateY: 30 }).appendTo(article);
                            plan(function(section) {
                                section.cssAnimate({ opacity:1, translateY: 0 });
                            }, delay += 100, [section]);
                        }
                    });
                    article.css3({ translateY: 0, opacity: 1 });
                    baidu('.loading').css('display', 'none');
                }
                
	            function mergeTags( thecase ) {
	                if(!thecase.tags) return;
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
            }
            
            function showCases(caseMap) {
                baidu('.loading').css('display', 'none');
                that.caseLoaded = true;
                setTitle('精彩案例');
				var classifiedCaseMap = {a: {}, b:{}};
				for(var caseName in caseMap){
					if(caseMap[caseName].level > 5){
						classifiedCaseMap["a"][caseName] = caseMap[caseName];
					}else{
						classifiedCaseMap["b"][caseName] = caseMap[caseName];
					}
				}

                // appendCase(caseMap);
                for(var caseGroup in classifiedCaseMap){
                	var container = baidu("<div class=\"case-group case-group-"+caseGroup+"\"/>");
                	screen.find(".case-content").append(container);
	                appendCase(classifiedCaseMap[caseGroup], container);
                }
            }
            this.caseLoaded || loadCases();
        })
    stage.start();
    control.fitNavPosition();
});