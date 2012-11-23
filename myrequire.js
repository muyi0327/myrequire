(function(Win) {
    var head = document.getElementsByTagName('head')[0], 
    script = document.getElementsByTagName("script"), 
    baseUrl = "", 
    path = script[script.length-1].src.split(/\?/)[0].replace(/[^\/]*$/, ""), 
    Modules = {},
    loadStack = [], 
    dpStack = {}, 
    rqStack = {},
    toString = Object.prototype.toString;
    
    Modules['loading'] = false;

    // 下面主要是针对,没有实现新版js的Array方法
    /**
     *检测是否是数组
     */
    if (!Array.isArray) {
        Array.isArray = function isArray(obj) {
            return toString.call(obj) == "[object Array]";
        };
    }
    /**
     * 数组迭代
     */
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fn, bind) {
            for (var i = 0, l = this.length; i < l; i++) {
                if ( i in this) {
                    fn.call(bind, this[i], i, this);
                }
            }
        }
    }
    /**
     * 所在位置索引
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(item, from) {
            var length = this.length >>> 0;
            for (var i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (this[i] === item) {
                    return i;
                }
            }
            return -1;
        }
    }
    /**
     * 是否数中的每一项都符合条件
     */
    if (!Array.prototype.every) {
        Array.prototype.every = function(fn, bind) {
            for (var i = 0, l = this.length >>> 0; i < l; i++) {
                if (( i in this) && !fn.call(bind, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        }
    }
    /**
     * 过滤,筛选符合条件的
     */
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(fn, bind) {
            var results = [];
            for (var value, i = 0, l = this.length >>> 0; i < l; i++) {
                if ( i in this) {
                    value = this[i];
                    if (fn.call(bind, value, i, this)) {
                        results.push(value);
                    }
                }
            }
            return results;
        }
    }
    /**
     * 映射成目标格式
     */
    if (!Array.prototype.map) {
        Array.prototype.map = function(fn, bind) {
            var length = this.length >>> 0, results = Array(length);
            for (var i = 0; i < length; i++) {
                if ( i in this) {
                    results[i] = fn.call(bind, this[i], i, this);
                }
            }
            return results;
        }
    }
    /**
     *相对路径
     */
    function isRelative(str) {
        return str.charAt(0) == ".";
    }

    /**
     *绝对路径
     */
    function isAbsolute(str) {
        return str.charAt(0) == "/";
    }

    /**
     *处理路径
     */
    function makePath(str) {
        str = str in paths ? paths[str].url : str;
        if (isRelative(str)) {
            return baseUrl + str.substring(1);
        } else if (isAbsolute(str)) {
            return baseUrl + str;
        } else {
            return baseUrl + "/" + str;
        }
    }

    // 文件加载
    function loaded(element, callback) {
        function load() {
           
            if ( typeof callback === 'function') {
                callback()
            }
            head.removeChild(element);
        }

        head.appendChild(element);
        // js的加载方式
        if (element.addEventListener) {
            // 加载完后执行回调
            element.addEventListener("load", load, false);
        } else if (element.attachEvent) {
            element.onreadystatechange = function() {
                // 加载完成后执行回调
                if (/loaded|complete/.test(element.readyState)) {
                    load();
                }
            }
        }
    }

    // 加载文件的类型
    var types = {
        // 加载js
        script : function(src) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.async = true;
            return script;
        },
        // 加载css
        css : function(src) {
            // css的加载方式
            var link = document.createElement('link');
            link.type = 'text/css';
            link.href = src;
            link.rel = 'stylesheet';
            return link;
        }
    }
    /**
     * 模块是否准备就绪 
     */
    function readyFor(ary){
        return ary.every(function(val, key, self){
            return !!Modules[val] && Modules[val].exports !== undefined;
        })
    }

    /**
     * 检查这个模块的依赖是否已经准备就绪【放入Modules栈中】
     */
    function check(id) {
        var curModule = Modules[id]["dps"];
        return readyFor(curModule);
    }

    /**
     *通知依赖这个模块的模块，此模块已经准备就绪
     */
    function notice(id) {
        var len = dpStack[id].length;
        for (var i = 0; i < len; i++) {
            var cur = dpStack[id][i];
            
            if (Modules[cur].state ==="complete"){
                continue;
            }
            // 如果依赖准备就绪，执行回调，并通知上一级
            if (check(cur)) {
                var fcargs = [], curdps = Modules[cur]['dps'];

                // 把准备好的依赖模块放入数组做为回调的参数用
                for (var j = 0, jlen = curdps.length; j < jlen; j++) {
                    fcargs.push(Modules[curdps[j]].exports)
                }

                // 执行加调
                Modules[cur].exports = Modules[cur]["fc"].apply(null, fcargs);
                Modules[cur].state = "complete";

                // 如果被其它模块依赖，通知准备就绪
                if (dpStack[cur] && dpStack[cur].length > 0) {
                    notice(cur);
                }
            }
        }
    }

    function loadNext(fn) {
        var fn,
        curload = loadStack.shift();
        
        if (Modules[curload]){
            var state = Modules[curload].state;
            if (state === "complete"){
                if (dpStack[curload] && dpStack[curload].length > 0) {
                     notice(curload);
                }
                 
                if (loadStack.lendth>0){
                   curload = loadStack.shift(); 
                }else{
                    return;
                }
            }else if (state === "loading"){
                Modules['loading'] = true;
                fn = function(){
                    console.log(curload + " loaded---------------------------------")
                    Modules['loading'] = false;
                    Modules[curload].exports = Win[Modules[curload]['exp']];
                    Modules[curload].state = "complete";
                   
                    if (dpStack[curload] && dpStack[curload].length > 0) {
                        notice(curload);
                    }
                    
                    if (loadStack.length > 0) {
                        loadNext();
                    }
                }
            }else{
                fn = fn
            }
        }

        loaded(types["script"](curload + ".js"), fn);
    }
    /**
     * 核心,模块声明 
     */
    function define() {
        var args = arguments, 
        argLen = args.length, 
        id, 
        dependencies, 
        factory, 
        dpargs = [], // 放入回调的参数
        s = head.getElementsByTagName("script"), 
        slen = s.length;
        console.log(s[slen - 1])
        // 没有依赖，直接执行回调放入Modules依赖栈，并通知依赖此模块的模块
        if (argLen == 2) {
            id = args[0];
            factory = args[1];
            // 处理模块标识id
            id = makePath(id);
            Modules[id] = {};
            
            switch(toString.call(factory)){
                case "[object Function]":
                    Modules[id].exports = factory();
                    break;
                case "[object Object]":
                    Modules[id].exports = factory;
                    break;
            }
            
            Modules[id].state = "complete";
            
            // 如果被依赖，通知准备就绪
            if (dpStack[id] && dpStack[id].length > 0) {
                notice(id);
            }
        } else if (argLen == 3) {
            id = args[0];
            dependencies = args[1];
            factory = args[2];

            // 处理模块标识
            id = makePath(id);
            // 处理依赖路径
            dependencies = dependencies.map(function(val, key, self) {
                return makePath(val);
            })
            // 装载模块
            Modules[id] = {
                "id" : id,
                "dps" : dependencies.concat(),
                "fc" : factory,
                'state' : 'loaded'
            }
            
            for (var i = 0, len = dependencies.length; i < len; i++) {
                dpStack[dependencies[i]] ? dpStack[dependencies[i]].push(id) : dpStack[dependencies[i]] = [id];

                if (!Modules[dependencies[i]] || Modules[dependencies[i]]['dps']=='') {
                    loadStack.unshift(dependencies[i]);
                }
            }
            
            // 检查是否全部依赖准备就绪,是就执行回调,并通知依赖本模块的模块
            if (check(id)) {
                for (var j = 0, jlen = dependencies.length; j < jlen; j++) {
                    dpargs.push(Modules[dependencies[j]].exports)
                }
                
                Modules[id].exports = factory.apply(null, dpargs);
                Modules[id].state = "complete";
                
                if (dpStack[id] && dpStack[id].length > 0) {
                    notice(id);
                }
            }
        }

        /**
         *如果加载栈中还有,继续加载
         */
        if (loadStack.length > 0) {
            loadNext();
        }
    }

    /*
     *请求
     */
    function require(modules, factory) {
        var id = ((new Date).getTime() +''+ Math.random()).replace('.',"");
        console.log(id)
        if(arguments.length==1){
            factory(require, define, Modules);
            return;
        }
        
        if (modules && !toString.call(modules) == "[object Array]" || modules.length<=0) {
            return;
        }
        
        // 处理依赖路径
        modules = modules.map(function(val, key, self) {
            return makePath(val);
        });
        
        // 装载到依赖
        modules.forEach(function(val, key, self){
            dpStack[val] ? dpStack[val].push(id) : dpStack[val] =[id];
        })
        
        console.log(dpStack)
        
        // 装载模块
        Modules[id] = {
          "id" : id,
          "dps" : modules.concat(),
          "fc" : factory,
          "state" : "loaded"
        }

        
        // 把请求放进加载的末端
        loadStack = loadStack.concat(modules);
        console.log(loadStack)

        // 如果加载栈中有需要加载的就加载一个
        if (loadStack.length > 0) {
            loadNext(function() {
                // 回调
            })
        }
    }
    /**
     *初始化路径及外部模块 
     */
    require.config = function() {
        var args = arguments[0];
        args.baseUrl && (baseUrl = args.baseUrl);
        args.paths && (paths = args.paths);
        
        for (var p in paths){
            var id = makePath(paths[p].url);
            console.log(id)
            Modules[id] = {
                'id' : id,
                'dps' : '',
                'fc' : '',
                'state' : 'loading',
                'exp' : paths[p].exports
            }
        }
    }
    Win.require = require;
    Win.define = define;
})(window)
