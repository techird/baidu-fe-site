;(function($) {
	/**
	 * @desc 瀑布流布局器
	 */
    var WaterfallLayout = function(options) {
        this.options = $.extend({
            autoCenter: true
        }, options);
        
        this.container = $(this.options.container);
        this.itemCollection = this.container.children();
        this.itemCounter = 0;
        this.posInfo = {};
        this.reset();
    };
    
    $.extend(WaterfallLayout.prototype, {
    	/**
		 * @param {Elements} els 参与布局的元素
    	 */
        layout: function(els) {
            els = $(els),
                that = this;
            els.each(function(index, item){
                var pos = that.getPos(item);
                that.posInfo[that.itemCounter++] = pos.y;
                that.setPos(pos);
            });
            this.container.css('height', Math.max.apply(Math, this.coorsY));
        },
		/**
		 * @desc 更新列信息
		 */
        updateCols : function() {
            var i = 0,
                containerWidth = this.containerWidth = this.container.width();
            this.columnWidth = this.options.columnWidth;
            this.cols = Math.floor(containerWidth / this.columnWidth);
            this.coorsY = [];
            while (this.cols > i++){
                this.coorsY.push(0);
            }
        },
        
        setPos: function(param){
            $(param.el).css('-webkit-transform', 'translate3d('+ param.x +'px, '+ param.y +'px, 0)');
            // $(param.el).css('left', param.x);
            // $(param.el).css('top', param.y);
        },
        /**
         * @desc 获取元素在布局中的位置
		 * @param {Element} el 参与计算的元素
		 * @return {Object} 
         */
        getPos: function(el) {
            el = $(el);
            var posX,
                posY = Math.min.apply(Math, this.coorsY),
                colIndex = 0;
            
            this.coorsY.some(function(item, index){
                colIndex = index;
                return item == posY;
            });
            posX = this.columnWidth * colIndex;
            
            if(this.options.autoCenter){
                posX += (this.containerWidth - this.columnWidth * this.cols) / (this.cols + 1) * (colIndex + 1);
            }
            
            var elHeight = el.height() || parseInt(el.css('height'), 10),
                elMargin = 10; //parseInt(el.css('margin-top'), 10) + parseInt(el.css('margin-bottom'), 10);

            this.coorsY[colIndex] = posY + elHeight + elMargin;
            el.css('height', elHeight);
            
            // FIXME hack
            // $('#global_nav').height($(document.body).height());
            return {
                el: el,
                x: posX,
                y: posY
            };
        },
		/**
		 * @desc 更新布局
		 */
        reset: function() {
            this.posInfo = {};
            this.itemCounter = 0;
            this.updateCols();
            this.layout(this.itemCollection);
        },
		/**
		 * @desc 向布局中添加元素
		 * @param {Element} el
		 */
        append: function(el) {
            this.container.append(el);
            this.itemCollection = this.itemCollection.add(el);
            this.layout(el);
        },
        /**
		 * @desc 清空布局中的元素
		 *
		 */
        clear: function(){
        	this.itemCollection.remove();
        	this.itemCollection = this.container.children();
        	this.reset();
        },
		
		/**
		 * @desc 根据给定坐标与偏移量获取元素集合
		 * @param {Number} y Y 轴坐标值
		 * @param {Number} offsets 垂直偏移量
		 * @return {Elements} elCollection
		 */
        getElementsByYCoor: function(y, offsets){
            var elCollection = [];
            for(var index in this.posInfo){
                if(this.posInfo[index] <= y + offsets &&  this.posInfo[index] >= y - offsets){
                    elCollection.push(this.itemCollection[index]);
                }
            }
            return elCollection;
        },
        /**
         * @desc 获取元素垂直偏移量
		 * @param {Element} el
         */
        getOffsetTop: function(el){
            var coorY = 0,
                that = this;
            this.each(function(index){
                if(this === el){
                    coorY = that.posInfo[index];
                }
            });
            return coorY;
        },
        
        each: function(fn){
            this.itemCollection.each(fn);
        },
        
        destroy: function(){
        	this.itemCollection.remove();
        	this.container = null;
        }
    });
    
    $.WaterfallLayout = WaterfallLayout;
})(Zepto);