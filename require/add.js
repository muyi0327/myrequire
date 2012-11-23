define('require/add',['require/array','jquery'],function(array,$){
    
    return {
        test : function(){
            console.log('test add');
            console.log($(document))
        },
        testArray : function(){
            array.test()
        }
    }
});
