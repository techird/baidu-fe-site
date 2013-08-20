
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
            var inCaseMode = 0;
            var tcontainer = this.$.find('.topic-container');
            var ccontainer = this.$.find('.case-container');
            var screen = this.$;
            var topicName;
            var that = this;

            this.enterDutaion = 1000,
            this.leaveDuration = 1000;
            baidu('.case-control .return-button').click(function(){
                var hash = window.location.hash.substr(1);
                var part = hash.split('-');
                switch(part.length) {
                    case 2:
                        /*if(inCaseMode == 1)*/ leaveCaseMode();
                        //if(inCaseMode == 2) showTopicMenu();
                        break;
                    case 3:
                        baidu('.case-content').cssAnimate({
                            translateX: '100%',
                            opacity: 0
                        }, 500, function() {
                            showTopic(topicName);
                        });
                        break;
                }
            });

            screen.find('.case-content').delegate('a.show-case', 'click', function(e){
                return; // 先在新窗口打开，细节交互再调节
                e.preventDefault();
                var path = baidu(e.target).attr('href');
                var title = baidu(e.target).attr('case-title');
                var name = baidu(e.target).attr('case-name');
                window.location.hash = ['topic', topicName, name].join('-');
                screen.find('.case-control h1').html(title);
                screen.find('.case-content').cssAnimate({
                    translateX: '-100%',
                    opacity: 0
                }, 500, function loadCase() {
                    var iframe = baidu('<iframe style="border:none; width: 100%;" src="' + path + '&iframe=true"></iframe>');
                    baidu('.case-content').empty().append(iframe);
                    baidu('.case-content').css3({
                        translateX: '100%'
                    });
                    baidu('.loading').css('display', 'block');
                    var loading = true;
                    var checkLoad = setInterval( function(){
                        if(!iframe[0].contentWindow) {                            
                            return clearInterval(checkLoad);
                        }
                        var height = iframe[0].contentWindow.document.documentElement.scrollHeight;
                        if( parseFloat(height) > 200 ) {
                            iframe.css('height', height);
                            if(loading) {
                                loading = false;
                                baidu('.loading').css('display', 'none');
                                baidu('.case-content').cssAnimate({
                                    translateX: '0',
                                    opacity: 1
                                }, 500);
                            }
                        }
                    }, 100);
                });
            });
            
            function showTopicMenu() {
                tcontainer.cssAnimate( { translateY: 0 } );
                ccontainer.cssAnimate( { translateY: 200 } );
                inCaseMode = 1;
            }

            function showCases(caseMap) {
                baidu('.loading').css('display', 'none');
                var article = baidu('<article class="case-list"></article>').appendTo(screen.find('.case-content').empty());
                var delay = 0;

                screen.find('.case-content').css3({ opacity: 1, translateX: 0 });
                for(var name in caseMap) {
                    if(caseMap.hasOwnProperty(name)) {
                        var thecase = caseMap[name];
                        var section = baidu(
                            '<section>' 
                          + '  <img class="preview" src="fex/case/cases/' + name + '/preview.png" />'
                          + '  <h1 class="title">' + thecase.title + '</h1>'
                          + '  <p class="desc">' + thecase.desc + '</p>'
                          + '  <div class="tags">' + thecase.tags + '</div>'
                          + '  <a class="show-case" case-name="' + name + '" case-title="' +thecase.title + '" href="fex/case/show.php?name=' + name + '" target="_blank">查看</a>'
                          + '</section>');
                        plan(function(section) {
                            section.css3({ opacity: 0, translateY: 30 }).appendTo(article);
                            plan( function() {
                                section.cssAnimate({ opacity:1, translateY: 0 });
                            }, 10);
                        }, delay += 150, [section]);
                    }
                }
            }
            function loadCases() {                
                baidu('.loading').css('display', 'block');
                baidu.ajax({
                    type: 'get',
                    url: 'fex/case/list.php?topic=' + topicName,
                    success: showCases
                })
            }
            function removeCases() {
                screen.find('.case-content').empty();
            }
            function enterCaseMode() {
                var duration = that.enterDutaion;
                control.disableNavigation( duration / 2 );
                tcontainer.cssAnimate( { translateY: -200 }, duration );
                ccontainer.cssAnimate( { opacity: 1, translateY: 0 }, duration );
                inCaseMode = 2;
            }
            function leaveCaseMode() {
                var duration = that.leaveDuration;
                control.enableNavigation( duration );
                tcontainer.cssAnimate( { translateY: '40%' }, duration, removeCases );
                ccontainer.cssAnimate( { opacity: 0, translateY: 800 }, duration );
                inCaseMode = 0;
                window.location.hash = 'topic';
            }

            var showTopic = this.showTopic = function( name ) {
                var p = screen.find('p.' + name);
                if( p.length ) {
                    tcontainer.cssAnimate( { translateY: -200 }, 800 );
                    ccontainer.cssAnimate( { opacity: 1, translateY: 0 }, 800 );
                    topicName = name;
                    screen.find('.case-control h1').html(p.html());
                    screen.find('.case-control').removeClass('point-tool point-data point-end').addClass('point-' + name);
                    if(!inCaseMode) {
                        enterCaseMode();
                        plan(loadCases, that.enterDutaion);
                    } else {
                        plan(loadCases);
                    }
                    inCaseMode = 2;
                    window.location.hash = 'topic-' + name;
                }
            }
            screen.find('p').click(function(e) {
                if(!that.actived) return;
                showTopic(e.target.className);
                e.stopPropagation();
            });
            screen.click(function(e){
                ~e.target.className.indexOf('topic-container') && inCaseMode && leaveCaseMode();
            });
        })
        .on( 'aftershow', function(hashPart) {
            this.actived = true;
            if(hashPart[0]) plan(function() {
                this.showTopic(hashPart[0]);
            }.bind(this), 10);
        })
        .on( 'beforehide', function() {
            this.actived = false;
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
                control.enableNavigation( 800 );
                window.history.go(-1);
            });
        })
        .on('beforeshow', function() {
            plan( control.disableNavigation, 10, [500], control );
        })
        .on('aftershow', function() {    
            var screen = this.$;
            var that = this;
            var tags = [];
            function setTitle( title ) {
                screen.find('.case-control h1').html(title);
            }
            function mergeTags( thecase ) {
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
            function loadCases() {
                baidu('.loading').css('display', 'block');
                baidu.ajax({
                    type: 'get',
                    url: 'fex/case/list.php?topic=cases',
                    success: showCases
                }); 
            }
            function showCases(caseMap) {
                baidu('.loading').css('display', 'none');
                that.caseLoaded = true;
                setTitle('精彩案例');
                var article = baidu('<article class="case-list"></article>').appendTo(screen.find('.case-content').empty());
                var delay = 0;
                var sections = [];

                screen.find('.case-content').css3({ opacity: 1, translateX: 0 });

                for(var name in caseMap) {
                    if(caseMap.hasOwnProperty(name)) {
                        var thecase = caseMap[name];
                        var section = baidu(
                            '<section data-tags="' + thecase.tags + '">' 
                          + '  <img class="preview" src="fex/case/cases/' + name + '/preview.png" />'
                          + '  <h1 class="title">' + thecase.title + '</h1>'
                          + '  <p class="desc">' + thecase.desc + '</p>'
                          + '  <div class="tags">' + thecase.tags + '</div>'
                          + '  <a class="show-case" case-name="' + name + '" case-title="' +thecase.title + '" href="fex/case/show.php?name=' + name + '" target="_blank">查看</a>'
                          + '</section>');
                        sections.push(section);
                        plan(function(section) {
                            section.css3({ opacity: 0, translateY: 30 }).appendTo(article);
                            plan( function() {
                                section.cssAnimate({ opacity:1, translateY: 0 });
                            }, 10);
                        }, delay += 50, [section]);
                        mergeTags(thecase);
                    }
                }

                var tagContainer = baidu('<div class="case-tags"><label>标签: </label></div>').prependTo(screen.find('.case-content'));
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
                        if(!name || ~section.attr('data-tags').indexOf(name)) {
                            plan(function(section) {
                                section.css3({ opacity: 0, translateY: 30 }).appendTo(article);
                                plan( function() {
                                    section.cssAnimate({ opacity:1, translateY: 0 });
                                }, 10);
                            }, delay += 50, [section]);
                        } else {
                            section.detach();
                        }
                    });
                    plan( article.css3, delay, [{ translateY: 0, opacity: 1 }], article);
                    baidu('.loading').css('display', 'none');
                }
            }
            this.caseLoaded || loadCases();
        })
    stage.start();
    control.fitNavPosition();
});