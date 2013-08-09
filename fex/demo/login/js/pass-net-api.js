/**
 * 
 */

/**
 * @Author: pass
 * @Overview: pass api网络层错误信息(中文)
 * @Date: 2012-11-27
 */

var passport = {};

passport.err = passport.err || {};
(function(ns) {
    var errMsg = {
        login: {
            '-1':     {msg: "发生未知错误", field: ""},
            "1":      {msg: "用户名格式错误", field: "userName"},
            "2":      {msg: "此帐号不存在", field: "userName"},
            "4":      {msg: "登录密码错误", field: "password"},
            "5":      {msg: "您登录过于频繁，请24小时后再试", field: ""},
            "6":      {msg: "验证码不正确", field: "verifyCode"},
            "16":     {msg: "对不起，您现在无法登录", field: ""},
            "257":    {msg: "请输入验证码", field: "verifyCode"},
            "120016": {msg: "", field: ""},
            "100005": {msg: "此帐号已登录人数过多", field: ""},
            "120019": {msg: "帐号冻结", field: "userName"},
            "110024": {msg: "此账号暂未激活", field: ""}
        }
        // reg: {
        //     '-1':     {msg: "\u6ce8\u518c\u65f6\u53d1\u751f\u672a\u77e5\u9519\u8bef", field: "isAgree"},
        //     //checkUserName
        //     '110002': {msg: "\u7528\u6237\u540d\u683c\u5f0f\u6709\u8bef\uff08\u4ec5\u80fd\u4f7f\u7528\u6c49\u5b57\u3001\u534a\u89d2\u6570\u5b57\u3001\u534a\u89d2\u5b57\u6bcd\u6216\u4e0b\u5212\u7ebf\uff0c\u4e14\u4e0d\u80fd\u662f\u7eaf\u6570\u5b57\uff09", field: "userName"},
        //     "130006": {msg: "\u6b64\u7528\u6237\u540d\u4e0d\u53ef\u4f7f\u7528", field: "userName"},
        //     "130007": {msg: "\u6b64\u7528\u6237\u540d\u4e0d\u53ef\u4f7f\u7528", field: "userName"},
        //     //checkMail
        //     "110023": {msg: "\u8be5\u90ae\u7bb1\u5df2\u88ab\u6fc0\u6d3b\uff0c\u8bf7\u76f4\u63a5<a href='https://passport.baidu.com/v2/?login' target='_blank'>\u767b\u5f55</a>", field: "email"},
        //     "110024": {msg: "\u8be5\u90ae\u7bb1\u5df2\u88ab\u6ce8\u518c\uff0c\u4f46\u672a\u6fc0\u6d3b\uff0c\u8bf7\u5230\u9a8c\u8bc1\u90ae\u4ef6\u4e2d\u6fc0\u6d3b\u6216\u8005<a href='https://passport.baidu.com/v2/?regnotify&needresend=true&tpl=pp&user=#{email}' target='_blank'>\u91cd\u53d1\u9a8c\u8bc1\u90ae\u4ef6</a>", field: "email"},
        //     "130036": {msg: "\u8bf7\u4f7f\u7528\u4e3b\u6d41\u90ae\u4ef6\u670d\u52a1\u5546\u63d0\u4f9b\u7684\u90ae\u7bb1\u8fdb\u884c\u6ce8\u518c", field: "email"},
        //     //reg
        //     '10':     {msg: "\u8bf7\u586b\u5199\u7528\u6237\u540d", field: "userName"},
        //     '11':     {msg: "\u7528\u6237\u540d\u6700\u957f\u4e0d\u5f97\u8d85\u8fc77\u4e2a\u6c49\u5b57\uff0c\u621614\u4e2a\u6570\u5b57\u3001\u5b57\u6bcd\u3001\u4e0b\u5212\u7ebf", field: "userName"},
        //     '12':     {msg: "\u7528\u6237\u540d\u4ec5\u53ef\u4f7f\u7528\u6c49\u5b57\u3001\u6570\u5b57\u3001\u5b57\u6bcd\u548c\u4e0b\u5212\u7ebf", field: "userName"},
        //     '14':     {msg: "\u6b64\u7528\u6237\u540d\u5df2\u88ab\u6ce8\u518c\uff0c\u8bf7\u53e6\u6362\u4e00\u4e2a", field: "userName"},
        //     '15':     {msg: "\u6b64\u7528\u6237\u540d\u4e0d\u53ef\u4f7f\u7528", field: "userName"},
        //     '16':     {msg: "\u6ce8\u518c\u65f6\u53d1\u751f\u672a\u77e5\u9519\u8bef", field: "isAgree"},
        //     '20':     {msg: "\u8bf7\u586b\u5199\u5bc6\u7801", field: "password"},
        //     '21':     {msg: "\u5bc6\u7801\u6700\u5c116\u4e2a\u5b57\u7b26\uff0c\u6700\u957f\u4e0d\u5f97\u8d85\u8fc714\u4e2a\u5b57\u7b26", field: "password"},
        //     '22':     {msg: "\u5bc6\u7801\u4e0e\u786e\u8ba4\u5bc6\u7801\u4e0d\u4e00\u81f4", field: "verifyPass"},
        //     '23':     {msg: "\u5bc6\u7801\u4ec5\u80fd\u7531\u6570\u5b57\uff0c\u5b57\u6bcd\u548c\u7b26\u53f7\u7ec4\u6210 / \u5bc6\u7801\u4e2d\u4e0d\u80fd\u542b\u6709\u7a7a\u683c", field: "password"},
        //     '24':     {msg: "\u60a8\u7684\u5bc6\u7801\u592a\u8fc7\u7b80\u5355\uff0c\u8bf7\u4f7f\u7528\u5b57\u6bcd\u548c\u6570\u5b57\u7684\u7ec4\u5408\uff0c\u5426\u5219\u65e0\u6cd5\u6ce8\u518c", field: "password"},
        //     '30':     {msg: "\u8bf7\u586b\u5199\u90ae\u7bb1", field: "email"},
        //     '31':     {msg: "\u90ae\u7bb1\u683c\u5f0f\u4e0d\u6b63\u786e", field: "email"},
        //     '40':     {msg: "\u8bf7\u8f93\u5165\u9a8c\u8bc1\u7801", field: "verifyCode"},
        //     '41':     {msg: "\u9a8c\u8bc1\u7801\u683c\u5f0f\u9519\u8bef", field: "verifyCode"},
        //     '42':     {msg: "\u9a8c\u8bc1\u7801\u9519\u8bef", field: "verifyCode"}
        // },
        // fillUserName: {
        //     '-1':     {msg: "\u53d1\u751f\u672a\u77e5\u9519\u8bef", field: ""},
        //     '11':     {msg: "\u7528\u6237\u540d\u6700\u957f\u4e0d\u5f97\u8d85\u8fc77\u4e2a\u6c49\u5b57\uff0c\u621614\u4e2a\u5b57\u8282\uff08\u534a\u89d2\u6570\u5b57\u3001\u534a\u89d2\u5b57\u6bcd\u6216\u4e0b\u5212\u7ebf\uff09", field: "userName"},
        //     '160100': {msg: "\u8bf7\u586b\u5199\u7528\u6237\u540d", field: "userName"},
        //     '160102': {msg: "\u8bf7\u767b\u5f55\u540e\u518d\u8865\u586b", field: "userName"},
        //     '160103': {msg: "\u8bf7\u767b\u5f55\u540e\u518d\u8865\u586b", field: ""},
        //     '160111': {msg: "\u6b64\u7528\u6237\u540d\u5df2\u88ab\u6ce8\u518c\uff0c\u8bf7\u53e6\u6362\u4e00\u4e2a", field: "userName"},
        //     '160104': {msg: "\u60a8\u5df2\u5b8c\u6210\u7528\u6237\u540d\u8865\u586b", field: ""},
        //     '160105': {msg: "\u6b64\u7528\u6237\u540d\u4e0d\u53ef\u4f7f\u7528", field: "userName"},
        //     '160110': {msg: "\u7528\u6237\u540d\u4ec5\u53ef\u4f7f\u7528\u6c49\u5b57\u3001\u6570\u5b57\u3001\u5b57\u6bcd\u548c\u4e0b\u5212\u7ebf", field: "userName"}
        // },
        // regPhone: {
        //     '-1':     {msg: "\u53d1\u751f\u672a\u77e5\u9519\u8bef", field: "isAgree"},
        //     '130018': {msg: "\u8bf7\u8f93\u5165\u624b\u673a\u53f7", field: "phone"},
        //     '130019': {msg: "\u624b\u673a\u53f7\u7801\u683c\u5f0f\u4e0d\u6b63\u786e", field: "phone"},
        //     '130020': {msg: "\u624b\u673a\u53f7\u5df2\u88ab\u6ce8\u518c\uff0c\u8bf7\u76f4\u63a5\u767b\u5f55\u6216\u66f4\u6362\u624b\u673a\u53f7\u6ce8\u518c", field: "phone"},
        //     '130035': {msg: "\u624b\u673a\u53f7\u5df2\u88ab\u6ce8\u518c\uff0c\u8bf7\u76f4\u63a5\u767b\u5f55\u6216\u66f4\u6362\u624b\u673a\u53f7\u6ce8\u518c", field: "phone"},
        //     '130017': {msg: "\u53d1\u9001\u77ed\u4fe1\u8fc7\u591a\uff0c\u8bf724\u5c0f\u65f6\u540e\u518d\u8bd5", field: "verifyCodeSend"},
        //     '130038': {msg: "\u53d1\u9001\u77ed\u4fe1\u8fc7\u4e8e\u9891\u7e41\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5", field: "verifyCodeSend"},
        //     '130010': {msg: "\u8bf7\u8f93\u5165\u5bc6\u7801", field: "password"},
        //     '130011': {msg: "\u5bc6\u7801\u5fc5\u987b\u75316-14\u4e2a\u5b57\u7b26\u7ec4\u6210", field: "password"},
        //     '110013': {msg: "\u5bc6\u7801\u4ec5\u652f\u6301\u6570\u5b57\u3001\u5b57\u6bcd\u548c\u7b26\u53f7\uff0c\u4e0d\u652f\u6301\u7a7a\u683c", field: "password"},
        //     '110012': {msg: "\u5bc6\u7801\u8fc7\u4e8e\u7b80\u5355\uff0c\u5efa\u8bae\u4f7f\u7528\u6570\u5b57\u52a0\u5b57\u6bcd\u7ec4\u5408\uff0c\u5426\u5219\u65e0\u6cd5\u6ce8\u518c", field: "password"},
        //     '130023': {msg: "\u8bf7\u8f93\u5165\u77ed\u4fe1\u6fc0\u6d3b\u7801", field: "smsCode"},
        //     '130021': {msg: "\u8bf7\u8f93\u5165\u77ed\u4fe1\u6fc0\u6d3b\u7801", field: "smsCode"},
        //     '130022': {msg: "\u77ed\u4fe1\u6fc0\u6d3b\u7801\u9519\u8bef", field: "smsCode"},
        //     '130003': {msg: "\u77ed\u4fe1\u6fc0\u6d3b\u7801\u9519\u8bef", field: "smsCode"},
        //     '130036': {msg: "\u6fc0\u6d3b\u7801\u9519\u8bef\u6b21\u6570\u8fc7\u591a\uff0c\u8bf724\u5c0f\u65f6\u540e\u91cd\u65b0\u6ce8\u518c", field: "smsCode"},
        //     '130037': {msg: "\u6fc0\u6d3b\u7801\u9519\u8bef\u6b21\u6570\u8fc7\u591a\uff0c\u8bf724\u5c0f\u65f6\u540e\u91cd\u65b0\u6ce8\u518c", field: "smsCode"},
        //     '130004': {msg: "\u6fc0\u6d3b\u7801\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u6ce8\u518c", field: "smsCode"},
        //     '130032': {msg: "\u60a8\u8fd8\u672a\u63a5\u53d7\u767e\u5ea6\u7528\u6237\u534f\u8bae", field: "isAgree"},
        //     '130039': {msg: "\u7cfb\u7edf\u7e41\u5fd9\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5", field: "isAgree"}
        // }
    };
    
    ns.getCurrent = function() {
        return errMsg;
    };
})(passport.err);

/**
 * @Author: yangkun | yangkun01@baidu.com
 * @Overview: pass api网络层接口
 * @Date: 2012-11-13
 */
/**
 * 登录时检查
 * @param {Object} params 参数
 *                      userName : {String} //用户名
 */
//passport.data.loginCheck = function(params) {};
/**
 * 获取验证码
 */
//passport.data.getVerifyCodeStr = function() {};
/**
 * 用户名检查及推荐
 * @param {Object} params 参数
 *                      userName : {String} //用户名
 */
//passport.data.checkUserName = function(params) {};
/**
 * 密码强度检查
 * @param {Object} params 参数
 *                      password : {String} //密码
 */
//passport.data.checkPassword = function(params) {};
/**
 * email地址检查
 * @param {Object} params 参数
 *                      email : {String} //邮箱地址
 */
//passport.data.checkMail = function(params) {};
/**
 * 获取用户信息
 */
//passport.data.isUserNoName = function() {};
/**
 * 登录
 * @param {Object} params 参数
 *                      userName : {String} //用户名/手机号
 *                      codeString : {String} //验证码串
 *                      isPhone : {Boolean} //是否是手机登陆
 *                      password : {String} 密码
 *                      verifyCode : {String}   用户输入的验证码，无需验证码时为空
 *                      safeFlg : {Number}  安全控件，百付宝
 *                      memberPass : {Boolean}  是否需要记住密码
 *                      u : {String}    登陆成功跳转地址
 */
//passport.data.login = function(params) {};
/**
 * 注册
 * @param {Object} params 参数
 *                      codeString : {String}   验证码串
 *                      email : {String}    邮件地址
 *                      userName : {String} 用户名/手机号
 *                      isAgree : {Boolean} 是否同意协议
 *                      verifyCode : {String}   用户输入的验证码，无需验证码时为空
 *                      loginPass : {String}    登录密码
 *                      verifyPass : {String}   重复密码
 *                      suggestIndex : {Number} 用户名推荐的顺序 abtest
 *                      suggestType : {Number}  用户名推荐接口返回的type
 *                      registerType : {Boolean}    有无用户名注册
 *                      u : {String}    注册成功跳转地址
 *                      retu    {String}    激活后的跳转地址
 */
//passport.data.reg = function(params) {};
/**
 * 补填用户名
 * @param {Object} params 参数
 *                      userName : {String} 输入的用户名
 *                      selectedSuggestName : {String}  选中推荐的用户名
 */
//passport.data.fillUserName = function(params) {};
 
// var passport = passport || window.passport || {};
passport.data = passport.data || {};
(function(ns) {
    var _blankFunc = function() {};
    function Promise(initCallback) {
        this._requests = [];
        this._value = null;
        this._exception = null;
        this._isComplete = false
        var promise = this;
        initCallback(
            function(value) { promise._fulfillPromise(value) },
            function(value) { promise._breakPromise(value) });
    }
    Promise.prototype = {
        get_isComplete: function() {
            return this._isComplete;
        },
        get_value: function() {
            if (!this._isComplete) {
                return undefined;
            }
            if (this._exception) {
                throw this._exception;
            }
            return this._value;
        },
        call: function(name, params) {
            var args = [];
            for (var i = 0, l = arguments.length - 1; i < l; i++) {
                args[i] = arguments[i + 1];
            }
            return this.when(function(v) {
                return v[name].apply(v, args);
            });
        },
        getValue: function(name) {
            return this.when(function(v) {
                return v[name];
            });
        },
        setValue: function(name, value) {
            this.whenOnly(function(v) {
                v[name] = value;
            });
        },
        when: function(fulfillPromise, breakPromise, context) {
            return Promise.when(this, fulfillPromise, breakPromise, context);
        },
        whenOnly: function(fulfillPromise, breakPromise, context) {
            Promise.whenOnly(this, fulfillPromise, breakPromise, context);
        },
        success : function(fulfillPromise, context) {
            return this.when(fulfillPromise, _blankFunc, context);
        },
        fail : function(breakPromise, context) {
            return this.when(_blankFunc, breakPromise, context);
        },
        _enqueueOne: function(op) {
            if (this._isComplete) {
                this._notify(op);
            } else {
                this._requests.push(op);
            }

        },
        _notify: function(op) {
            if (this._exception) {
                if (op.breakPromise) {
                    op.breakPromise(this._exception);
                }
            } else {
                if (op.fulfillPromise) {
                    op.fulfillPromise(this._value);
                }
            }

        },
        _notifyAll: function() {
            for (var i = 0, l = this._requests.length; i < l; i++) {
                this._notify(this._requests[i]);
            }

        },
        _fulfillPromise: function(value) {
            this._value = value;
            this._exception = null;
            this._isComplete = true;
            this._notifyAll();

        },
        _breakPromise: function(exception) {
            this._value = null;
            this._exception = exception || new Error("An error occured");
            this._isComplete = true;
            this._notifyAll();

        }
    };
    Promise.when = function(promise, fulfillPromise, breakPromise, context) {
        return new Promise(function(fp, bp) {
            Promise.make(promise)._enqueueOne({
                fulfillPromise: function(value) {
                    if (fulfillPromise) {
                        fp(fulfillPromise.call(context, value));
                    } else {
                        fp(value);
                    }
                },
                breakPromise: function(exception) {
                    if (breakPromise) {
                        try {
                            fp(breakPromise.call(context, exception));
                        } catch (e) {
                            bp(e);
                        }
                    } else {
                        bp(exception);
                    }
                }
            });
        });
    };
    Promise.whenOnly = function(promise, fulfillPromise, breakPromise, context) {
        Promise.make(promise)._enqueueOne({
            fulfillPromise: function(value) { if (fulfillPromise) fulfillPromise.call(context, value); },
            breakPromise: function(exception) { if (breakPromise) breakPromise.call(context, exception); }
        });

    };
    Promise.make = function(value) {
        if (value instanceof Promise) {
            return value;
        }
        return Promise.immediate(value);
    };
    Promise.immediate = function(value) {
        return new Promise(function(fulfillPromise, breakPromise) {
            fulfillPromise(value);
        });
    };
    
    var Base = {};
    (function(Base) {
        var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");
        Base.trim = function (source) {
            return String(source).replace(trimer, "");
        };
        Base.getUniqueId = function(prefix) { return prefix + Math.floor(Math.random() * 2147483648).toString(36); };
        Base.g = function(id) {
            if (!id) return null; //修改IE下baidu.dom.g(baidu.dom.g('dose_not_exist_id'))报错的bug，by Meizz, dengping
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };
        Base.getParent = function (a) { a=Base.g(a);return a.parentElement||a.parentNode||null};
        Base.encodeHTML = function(a) { return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")};
        Base.array = Base.array || {};
        Base.array.indexOf = function (source, match, fromIndex) {
            var len = source.length,
                iterator = match;
            fromIndex = fromIndex | 0;
            if(fromIndex < 0){//小于0
                fromIndex = Math.max(0, len + fromIndex)
            }
            for ( ; fromIndex < len; fromIndex++) {
                if(fromIndex in source && source[fromIndex] === match) {
                    return fromIndex;
                }
            }
            return -1;
        };
        Base.array.contains = function(source, obj) {
            return (baidu.array.indexOf(source, obj) >= 0);
        };
        Base.browser = Base.browser || {};
        Base.browser.opera = /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(navigator.userAgent) ?  + ( RegExp["\x246"] || RegExp["\x242"] ) : undefined;
        Base.insertHTML = function (element, position, html) {
            element = Base.g(element);
            var range,begin;

            //在opera中insertAdjacentHTML方法实现不标准，如果DOMNodeInserted方法被监听则无法一次插入多element
            //by lixiaopeng @ 2011-8-19
            if (element.insertAdjacentHTML && !Base.browser.opera) {
                element.insertAdjacentHTML(position, html);
            } else {
                // 这里不做"undefined" != typeof(HTMLElement) && !window.opera判断，其它浏览器将出错？！
                // 但是其实做了判断，其它浏览器下等于这个函数就不能执行了
                range = element.ownerDocument.createRange();
                // FF下range的位置设置错误可能导致创建出来的fragment在插入dom树之后html结构乱掉
                // 改用range.insertNode来插入html, by wenyuxiang @ 2010-12-14.
                position = position.toUpperCase();
                if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
                    range.selectNodeContents(element);
                    range.collapse(position == 'AFTERBEGIN');
                } else {
                    begin = position == 'BEFOREBEGIN';
                    range[begin ? 'setStartBefore' : 'setEndAfter'](element);
                    range.collapse(begin);
                }
                range.insertNode(range.createContextualFragment(html));
            }
            return element;
        };
        Base.format = function (source, opts) {
            source = String(source);
            var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
            if(data.length){
                data = data.length == 1 ? 
                    /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                    (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                    : data;
                return source.replace(/#\{(.+?)\}/g, function (match, key){
                    var replacer = data[key];
                    // chrome 下 typeof /a/ == 'function'
                    if('[object Function]' == toString.call(replacer)){
                        replacer = replacer(key);
                    }
                    return ('undefined' == typeof replacer ? '' : replacer);
                });
            }
            return source;
        };
    })(Base);
    ns.base = Base;
    //Request Object
    var Request = {};
    (function(Request) {
        var _postContainer = "__bdpp_pstc__" + new Date().getTime(),
            _postForm = _postContainer + "_form",
            _postTarget = _postContainer + "_ifr";
        var _buildQuery = function(query) {
            if (typeof (query) == "object") {
                var builder = [];
                for (var p in query) {
                    var value = query[p];
                    if (value !== undefined && value !== null) {
                        if (builder.length) builder.push("&");
                        var valueString = encodeURIComponent(typeof(value) == "boolean" ? (value ? "1" : "0") : value.toString());
                        builder.push(encodeURIComponent(p), "=", valueString);
                    }
                }
                return builder.join("");
            }
            if (typeof (query) == "string") {
                return query;
            }
            return null;
        };
        var _appendQuery = function(url, query) {
            query = _buildQuery(query);
            if (typeof (query) == "string") {
                var hasQuery = (/\?/g).test(url);
                url += (hasQuery ? "&" : "?") + _buildQuery(query);
            }
            return url;
        };
        var _createScriptTag = function(scr, url, charset){
            scr.setAttribute('type', 'text/javascript');
            charset && scr.setAttribute('charset', charset);
            scr.setAttribute('src', url);
            document.getElementsByTagName('head')[0].appendChild(scr);
        };
        var _removeScriptTag = function(scr){
            if (scr.clearAttributes) {
                scr.clearAttributes();
            } else {
                for (var attr in scr) {
                    if (scr.hasOwnProperty(attr)) {
                        delete scr[attr];
                    }
                }
            }
            if(scr && scr.parentNode){
                scr.parentNode.removeChild(scr);
            }
            scr = null;
        };
        var _callByServer = function(url, callback, opt_options) {
            var scr = document.createElement('SCRIPT'),
                prefix = 'bd__cbs__',
                callbackName,
                callbackImpl,
                options = opt_options || {},
                charset = options['charset'],
                queryField = options['queryField'] || 'callback',
                timeOut = options['timeOut'] || 0,
                timer,
                reg = new RegExp('(\\?|&)' + queryField + '=([^&]*)'),
                matches;

            callbackName = Base.getUniqueId(prefix);
            window[callbackName] = getCallBack(0);

            if( timeOut ){
                timer = setTimeout(getCallBack(1), timeOut);
            }

            //如果用户在URL中已有callback，用参数传入的callback替换之
            url = url.replace(reg, '\x241' + queryField + '=' + callbackName);
            
            if (url.search(reg) < 0) {
                url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
            }
            _createScriptTag(scr, url, charset);

            /*
             * 返回一个函数，用于立即（挂在window上）或者超时（挂在setTimeout中）时执行
             */
            function getCallBack(onTimeOut){
                /*global callbackName, callback, scr, options;*/
                return function(){
                    try {
                        if( onTimeOut ){
                            options.onfailure && options.onfailure();
                        }else{
                            callback.apply(window, arguments);
                            clearTimeout(timer);
                        }
                        window[callbackName] = null;
                        delete window[callbackName];
                    } catch (exception) {
                        // ignore the exception
                    } finally {
                        _removeScriptTag(scr);
                    }
                }
            }
        };
        
        var _renderDataForm = function(url, segments) {
            var builder = [];
            builder.push("<form id='", _postForm, "' target='", _postTarget, "' ");
            builder.push("action='", Base.encodeHTML(url), "' method='post'>");
            for(var p in segments) {
                if(segments.hasOwnProperty(p)) {
                    var value = segments[p];
                    if (value !== undefined && value !== null) {
                        var valueString = Base.encodeHTML(typeof(value) == "boolean" ? (value ? "1" : "0") : value);
                        builder.push("<input type='hidden' name='", Base.encodeHTML(p), "' value='", valueString, "' />");
                    }
                }
            }
            builder.push("</form>");
            return builder.join("");
        };
        var _postInIframe = function(url, data, callback, options) {
            options = options || {};
            var timeOut = options['timeOut'] || 0,
                timer = false,
                callbackName = Base.getUniqueId("bd__pcbs__");
            data[options["queryField"] || "callback"] = "parent." + callbackName;
            var formHtml = _renderDataForm(url, data);
            if(Base.g(_postForm)) {
                Base.getParent(_postForm).innerHTML = formHtml;
            } else {
                var htmlBuilder = [];
                htmlBuilder.push("<div id='", _postContainer, "' style='display:none;'>");
                htmlBuilder.push("<div>", formHtml, "</div>");
                htmlBuilder.push("<iframe name='", _postTarget, "' src='" + (window.location.protocol.toLowerCase() == "https:" ? "https://passport.baidu.com/passApi/html/_blank.html" : "about:blank") + "' style='display:none;'></iframe>");
                htmlBuilder.push("</div>");
                Base.insertHTML(document.body, "beforeEnd", htmlBuilder.join(""));
            }
            window[callbackName] = getCallBack();
            if( timeOut ){
                timer = setTimeout(getCallBack(1), timeOut);
            }
            function getCallBack(onTimeOut){
                /*global callbackName, callback, scr, options;*/
                return function(){
                    try {
                        if( onTimeOut ){
                            options.onfailure && options.onfailure();
                        }else{
                            callback.apply(window, arguments);
                            timer && clearTimeout(timer);
                        }
                        window[callbackName] = null;
                        delete window[callbackName];
                    } catch (exception) {
                        // ignore the exception
                    }
                }
            }
            
            Base.g(_postForm).submit();
        };
        
        /**
         * jsonp请求
         * @param {String} url 请求url
         * @param {Object} query 请求参数，键值对
         * @param {Object} options 选项
         *                      charset : {String} 编码
         *                      queryField : {String} 回调函数参数名称，默认：callback
         *                      timeOut : {Number} 请求超时时间，单位ms
         *                      processData : {Function} 返回数据处理函数
         * @returns {Promise} 
         */
        Request.jsonp = function(url, query, options) {
            options = options || {};
            var originUrl = url;
            return new Promise(
                function(fulfillPromise, breakProimise) {
                    url = _appendQuery(url, query);
                    _callByServer(url, function(jsonResult) {
                        if(options.processData) {
                            jsonResult = options.processData(jsonResult);
                        }
                        fulfillPromise && fulfillPromise(jsonResult);
                    }, {
                        charset : options.charset,
                        queryField : options.queryField,
                        timeOut : options.timeOut,
                        onfailure : function() {
                            breakProimise && breakProimise();
                        }
                    });
                }
            );
        };
        /**
         * 提交请求
         * @param {String} url 请求url
         * @param {Object} data 提交的数据，键值对
         * @param {Object} options 选项
         *                      charset : {String} 编码
         *                      queryField : {String} 回调函数参数名称，默认：callback
         *                      timeOut : {Number} 请求超时时间，单位ms
         *                      processData : {Function} 返回数据处理函数
         * @returns {Promise} 
         */
        Request.submit = function(url, data, options) {
            if(url && data) {
                return new Promise(
                    function(fulfillPromise, breakProimise) {
                        _postInIframe(url, data, function(jsonResult) {
                            if(options.processData) {
                                jsonResult = options.processData(jsonResult);
                            }
                            fulfillPromise && fulfillPromise(jsonResult);
                        }, options);
                    }
                );
            }
        };
        var _loadImgList = [];
        Request.load = function(src) {
            return new Promise(
                function(fulfillPromise, breakProimise) {
                    var index = _loadImgList.push(new Image) -1,
                        done = false,
                        timer = setTimeout(function() {
                            done = true;
                            fulfillPromise && fulfillPromise();
                        }, 1000);
                    _loadImgList[index].onload = function() {
                        clearTimeout(timer);
                        if(!done) {
                            fulfillPromise && fulfillPromise();
                        }
                        done = true;
                        _loadImgList[index] = _loadImgList[index].onload = null;
                    };
                    _loadImgList[index].src = src;
                }
            );
        };
    })(Request);
    
    //网络层接口
    var _domain = "https://passport.baidu.com",//"https://passport.baidu.com",
        _getInterfaces = { //get接口定义
            getApiInfo : "/v2/api/?getapi",
            loginCheck : "/v2/api/?logincheck",
            getVerifyCodeStr : "/v2/?reggetcodestr",
            checkUserName : "/v2/?regnamesugg",
            checkPassword : "/v2/?regpwdcheck",
            checkMail : "/v2/?regmailcheck",
            isUserNoName : "/v2/api/?ucenteradduname",
            checkPhone : "/v2/?regphonecheck",
            sendPhoneCode : "/v2/?regphonesend"
        },
        _postInterfaces = { //post接口定义
            login : "/v2/api/?login",
            reg : "/v2/api/?reg",
            fillUserName : "/v2/api/?ucenteradduname",
            regPhone : "/v2/api/?regphone"
        },
        _paramNameMapping = {  //参数名称映射
            getApiInfo : {apiType : "class"},
            login : {memberPass : "mem_pass", safeFlag : "safeflg", isPhone : "isPhone", timeSpan : "ppui_logintime"},
            fillUserName : {selectedSuggestName : "pass_fillinusername_suggestuserradio", timeSpan : "ppui_fillusernametime"},
            reg : {password : "loginpass", timeSpan : "ppui_regtime", suggestIndex: "suggestIndex", suggestType: "suggestType", selectedSuggestName: "pass_reg_suggestuserradio_0"},
            regPhone : {password : "loginpass", timeSpan : "ppui_regtime", suggestIndex: "suggestIndex", suggestType: "suggestType", selectedSuggestName: "pass_reg_suggestuserradio_0"}
        },
        _paramValueMapping = {  //参数值映射
            loginCheck : {isPhone : function(val, params) { return val ? "true" : "false"; }},
            login : {memberPass : function(val, params) { return (val ? "on" : ""); }}
        },
        _paramDefaultValue = {  //接口默认参数值
            checkPassword : {fromreg : 1},
            reg : {registerType : 1, verifypass : function(params) { return params.password; }}
        },
        _paramSpaceIgnoreList = { //不进行去除空白字符的参数
            password: true
        },
        _resultProcessFunc = {  //返回结果处理函数
            login : function(jsonResult) {  //登录处理
                jsonResult.needToModifyPassword = (jsonResult.needToModifyPassword == 0 ? false : true);
            }
        },
        _errInfoFieldMapping = { //错误号与域的映射
            checkUserName : "reg",
            checkMail : "reg",
            checkPhone : "regPhone",
            sendPhoneCode : "regPhone"
        },
        _errMsg = passport.err.getCurrent(), //获取错误信息
        _ctx = {};
    /**
     * 登录时检查
     * @param {Object} ctxInfo 公共参数
     *                      product : {String} //产品线标志
     *                      charset : {String} //页面编码
     *                      staticPage : {String} //产品线跳转页面编码
     *                      token : {String} //token
     */
    ns.setContext = function(ctxInfo) {
        _ctx.product = ctxInfo.product || _ctx.product;
        _ctx.charset = ctxInfo.charset || _ctx.charset;
        _ctx.staticPage = ctxInfo.staticPage || _ctx.staticPage;
        _ctx.token = ctxInfo.token || _ctx.token;
    };
    
    /**
     * 定义接口
     * @param {String} interfaceName 接口名称
     * @param {String} url 接口url
     * @param {Boolean} isPost 是否post
     * @returns {Function} 
     */
    function defineInterface(interfaceName, url, isPost) {
        if(url) {
            if(!isPost) {
                return function(params) {
                    return Request.jsonp(
                        _domain + url, 
                        processParam(params, interfaceName, _paramNameMapping[interfaceName], _paramValueMapping[interfaceName], false), 
                        {
                            charset : "utf-8",
                            processData : function(jsonResult) {
                                return processResult(interfaceName, jsonResult);
                            }
                        }
                    );
                };
            } else {
                return function(params) {
                    params = params || {};
                    //params["ppui_" + interfaceName.toLowerCase() + "time"] = new Date().getTime();
                    return Request.submit(
                        _domain + url, 
                        processParam(params, interfaceName, _paramNameMapping[interfaceName], _paramValueMapping[interfaceName], true), 
                        {
                            charset : "utf-8", 
                            processData : function(jsonResult) {
                                //decode
                                if(jsonResult) {
                                    for(var p in jsonResult) {
                                        if(jsonResult.hasOwnProperty(p)) {
                                            var v = jsonResult[p];
                                            if(v) { 
                                                jsonResult[p] = decodeURIComponent(v);
                                            }
                                        }
                                    }
                                }
                                return processResult(interfaceName, jsonResult);
                            }
                        }
                    );
                };
            }
        } else { return _blankFunc; }
    }
    /**
     * 处理请求参数
     * @param {Object} params 参数对象
     * @param {String} interfaceName 接口名称
     * @param {Object} paramNameMap 参数名称映射
     * @param {Object} paramValueMap 参数值映射
     * @param {Boolean} isPost 是否post
     * @returns {Object} 
     */
    function processParam(params, interfaceName, paramNameMap, paramValueMap, isPost) {
        var retParam = (isPost 
                            ? {staticpage : _ctx.staticPage, charset : _ctx.charset || document.characterSet || document.charset || ""}
                            : {}
                        ),
            defaultParam = _paramDefaultValue[interfaceName];
        if(defaultParam) { 
            //扩展默认参数
            for(var p in defaultParam) {
                if(defaultParam.hasOwnProperty(p)) {
                    var v = defaultParam[p];
                    retParam[p] = (typeof(v) == "function" ? v(params) : v);
                }
            }
        }
        retParam.token = _ctx.token;
        retParam.tpl = _ctx.product;
        //retParam.charset = _ctx.charset;
        retParam.apiver = "v3"; //remark:标识新版api调用
        retParam.tt = new Date().getTime();
        if(params) {
            paramNameMap = paramNameMap || {};
            paramValueMap = paramValueMap || {};
            for(var p in params) {
                if(params.hasOwnProperty(p)) {
                    var valFn = paramValueMap[p],
                        val = (!!valFn ? valFn(params[p], params) : params[p]);
                    if(typeof(val) == "string") {
                        if(isPost) { val = decodeURIComponent(val); }
                        if(!_paramSpaceIgnoreList[p]) {
                            val = Base.trim(val);
                        }
                    }
                    retParam[paramNameMap[p] || p.toLowerCase()] = val;
                }
            }
        }
        return retParam;
    }
    /**
     * 处理返回的结果
     * @param {String} interfaceName 接口名称
     * @param {Object} jsonResult 返回结果对象
     * @returns {Object} 
     */
    function processResult(interfaceName, jsonResult) {
        if(jsonResult) {
            var processFunc = _resultProcessFunc[interfaceName];
            if(processFunc) { processFunc(jsonResult); }
            var errInfo = jsonResult.errInfo,
                data = jsonResult,
                result = data;
            if(!errInfo) {
                errInfo = {no : jsonResult.err_no, msg : jsonResult.err_msg || ""};
                delete data["err_no"];
                delete data["err_msg"];
                result = {data : data, errInfo : processReturnErrInfo(interfaceName, errInfo, data)};
            } else {
                data.errInfo = processReturnErrInfo(interfaceName, errInfo, data);
            }
            return result;
        }
        return jsonResult;
    }
    /**
     * 处理返回的错误信息，增加错误信息对应的域
     * @param {String} interfaceName 接口名称
     * @param {Object} errInfo 错误信息对象
     * @param {Object} data 返回的数据对象
     * @returns {Object} 
     */
    function processReturnErrInfo(interfaceName, errInfo, data) {
        var cfg = _errMsg[_errInfoFieldMapping[interfaceName] || interfaceName];
        if(cfg && errInfo && (errInfo.no != 0)) {
            var msgDefine = cfg[errInfo.no] || cfg["-1"];
            if(msgDefine) {
                var msg = msgDefine.msg;                
                if(msg && (msg.indexOf("#{") >= 0)) {
                    if(interfaceName == "login" && (errInfo.no == 110024)) {
                        var linkUrl = _domain + "/v2/?regnotify&needresend=true&tpl=" + encodeURIComponent(_ctx.product) + "&user=" + encodeURIComponent(data.mail) + "&u=" + encodeURIComponent(data.u);
                        msg = Base.format(msg, {gotourl : linkUrl});
                    } else {
                        msg = Base.format(msg, data || {});
                    }
                }
                errInfo.msg = msg;
                errInfo.field = msgDefine.field;
            }
        }
        return errInfo;
    }
    //生成get接口
    for(var p in _getInterfaces) {
        if(_getInterfaces.hasOwnProperty(p)) {
            ns[p] = defineInterface(p, _getInterfaces[p]);
        }
    }
    //提交接口
    for(var p in _postInterfaces) {
        if(_postInterfaces.hasOwnProperty(p)) {
            ns[p] = defineInterface(p, _postInterfaces[p], true);
        }
    }
    //外部暴露的提交接口
    function processSimpleResult(jsonResult) {
        if(jsonResult) {
            var errInfo = jsonResult.errInfo,
                data = jsonResult;
            if(!errInfo) {
                for(var p in jsonResult) {
                    if(jsonResult.hasOwnProperty(p)) {
                        var v = jsonResult[p];
                        if(v) { 
                            jsonResult[p] = decodeURIComponent(v);
                        }
                    }
                }
            }
            if(!errInfo) {
                errInfo = {no : jsonResult.err_no, msg : jsonResult.err_msg || ""};
                delete data["err_no"];
                delete data["err_msg"];
                jsonResult = {data : data, errInfo : errInfo};
            }
        }
        return jsonResult;
    }
    ns.jsonp = function(url, params) {
        if(url.indexOf("http") != 0) { url = _domain + url; }
        params = params || {};
        params.apiver = "v3"; //remark:标识新版api调用
        params.tt = new Date().getTime();
        return Request.jsonp(
            url, 
            params,
            {
                charset : "utf-8",
                processData : function(jsonResult) {
                    return processSimpleResult(jsonResult);
                }
            }
        );
    };
    ns.post = function(url, data) {
        data = data || {};
        data.staticpage = data.staticpage || _ctx.staticPage;
        data.charset = data.charset || _ctx.charset || document.characterSet || document.charset || "";
        data.token = data.token || _ctx.token;
        data.tpl = data.tpl || _ctx.product;
        return Request.submit(
                    _domain + url,
                    data,
                    {
                        charset : "utf-8", 
                        processData : function(jsonResult) {
                            //decode
                            return processSimpleResult(jsonResult);
                        }
                    }
                );
    };
    ns.request = Request;
})(passport.data);

// exports = passport.data;