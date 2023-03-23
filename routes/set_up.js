var express = require('express');
var fun = require('../function')
var router = express.Router();


var datainfo={};
var clean={"name":"", "steep1_Speed":0, "steep1_Hight":0, "steep2__Speed":0,
          "steep2_Hight":0, "steep3__Speed":0, "steep3_Hight":0, "Time":0,
          "initial_hight":0, "initial_speed":0, "demoulding_H":0, "demoulding_S":0, };

router.get('/', function(req, res) {
    datainfo= fun.read_json_test();
    //res.render("index", {result : "", indata : clean});
    console.log(datainfo.set_data);
    res.render("set_up",{result : "", indata : clean, list : fun.getArray(datainfo.set_data, "name")});
});

var updelay = 0;
router.post('/', function(req, res) {
    datainfo=fun.read_json_test();
    console.log(req.body.sel);
    if(req.body.btn == "search"){
        datainfo.set_data.forEach(function(value, index, array){
            if(value.name == req.body.sel){
                //res.render("index",{result : ""});
                res.render("set_up", { result : "", indata : value, list : fun.getArray(datainfo.set_data, "name") });
                return 0;
            }
        });
        return 0;
    }
    updelay=0;
    var newdata = {};
    newdata["name"]=req.body.name;
    newdata["steep1_Speed"]=parseInt(req.body.steep1_Speed);
    newdata["steep1_Hight"]=parseInt(req.body.steep1_Hight);
    newdata["steep2__Speed"]=parseInt(req.body.steep2__Speed);
    newdata["steep2_Hight"]=parseInt(req.body.steep2_Hight);
    newdata["steep3__Speed"]=parseInt(req.body.steep3__Speed);
    newdata["steep3_Hight"]=parseInt(req.body.steep3_Hight);
    newdata["Time"]=parseInt(req.body.Time);
    newdata["initial_hight"]=parseInt(req.body.steep1_Hight);
    newdata["initial_speed"]=parseInt(req.body.steep2__Speed);
    newdata["demoulding_H"]=parseInt(req.body.steep2_Hight);
    newdata["demoulding_S"]=parseInt(req.body.steep3__Speed);
    upJSON(newdata, req.body.btn);
    //console.log(newdata);
    //res.render("index",{result : ""});
            
    res.render("set_up", { result : "成功"+req.body.btn, indata : clean, list : fun.getArray(datainfo.set_data, "name") });
});

function upJSON(newdata, flag){ //更新設定參數資料
    var repeat=0;
    datainfo.set_data.forEach(function(value, index, array){
        if(value.name == newdata.name){
            for( var key in datainfo.set_data[index]){
                datainfo.set_data[index][key]=newdata[key];
            }
            if(flag == "delete"){
                datainfo.set_data.splice(index,1);
                datainfo.total = datainfo.set_data.length;
            }
            repeat=1;
            return 0;
        }
    });
    if(!repeat) {
        datainfo.set_data.push(newdata);
    }
    //reset_name();
    datainfo.total = datainfo.set_data.length;
    fun.writeJSON(datainfo);
}


module.exports = router;