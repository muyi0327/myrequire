/**
 * @author Administrator
 */
define('mylibs/event', function() {
    // 注册事件
    function addEvent(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    }

    // 注册多事件
    function addEvents(element, types, handler) {

    }

    // 清除事件
    function rmEvent(element, type, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
    }

    // 清除多事件
    function rmEvents(element, types, handler) {

    }

    //  绑定事件
    function bind() {

    }

    // 解除bind绑定的事件
    function unbind() {

    }

    // 获取event对象
    function getEvent(event) {
        return event ? event : window.event;
    }

    // 获取剪切板数据
    function getClipData(event) {
        var clipboardData = (event.clipboardData || window.clipboardData);
        return clipboardData.getData("text");
    }

    // 设置剪切板数据
    function setClipData(event, value) {
        if (event.clipboardData) {
            event.clipboardData.setData("text/plain", value);
        } else if (window.clipboardData) {
            window.clipboardData.setData("text", value);
        }
    }

    // 清空切剪板
    function clearClipData(event) {
        var clipboardData = (event.clipboardData || window.clipboardData);
        clipboardData.clearData();
    }

    // 获取键盘ASCLL码
    function getCharCode(event) {
        if ( typeof event.which == "number") {
            return event.which;
        } else {
            return event.keyCode;
        }
    }

    // 获取当前对象
    function getRelatedTarget(event) {
        if (event.relatedTarget) {
            return event.relatedTarget;
        } else if (event.toElement) {
            return event.toElement;
        } else if (event.fromElement) {
            return event.fromElement;
        } else {
            return null;
        }
    }

    function getTarget(event) {
        return event.target || event.srcElement;
    }

    // 获取滑轮滚动距离
    function getWheelDelta(event) {
        if (event.wheelDelta) {
            return (client.engine.opera && client.engine.opera < 9.5 ? -event.wheelDelta : event.wheelDelta);
        } else {
            return -event.detail * 40;
        }
    }

    // 阻止默认事件
    function preventDefault(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }

    // 停止冒泡
    function stopPropagation(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }

    // public methods
    return {
        // 绑定事件
        addEvent : addEvent, 
        // 解除绑定事件
        rmEvent : rmEvent, 
        // 批量绑定
        addEvents : addEvents, 
        // 批量解除
        rmEvents : rmEvents, 
        // 绑定事件
        bind : bind, 
        // 解除绑定
        unbind : unbind, 
        // 获取滚轮距离
        getWheelDelta : getWheelDelta, 
        // 获取事件目标对象
        getTarget : getTarget, 
        // 获取事件涉及对象
        getRelatedTarget : getRelatedTarget,
        // 获取键盘ASCLL码
        getCharCode : getCharCode,
        // 阻止默认事件
        preventDefault : preventDefault,
        // 停止冒泡
        stopPropagation : stopPropagation,
        // 停止冒泡，阻止默认事件
        stop : function(event){
            preventDefault(event);
            stopPropagation(event);
        },
        // 获取剪切板事件
        getClipData : getClipData, 
        // 设置剪切板事件
        setClipData : setClipData,
        // 清除剪切板
        clearClipData : clearClipData,
    }
})
