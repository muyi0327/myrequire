define('require/math',['require/add','/require/string'],function(add, string){
    console.log('math exeted!');
    return {
        addsome : function(){
            add.test();
        },
        strsome : function(){
            string.test()
        },
        addArray : function(){
            add.testArray()
        }
    }
});