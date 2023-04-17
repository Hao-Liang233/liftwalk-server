var io = require("socket.io");
var express = require("express");
//var set_up = require('./routes/set_up');

var app = express();
app.set("views", "./views");
app.set("view engine", "ejs");
var fs = require("fs");

var path = "./data.json";
var datainfo = {};
var clean = {
  name: "",
  step1_Speed: 0,
  step1_Hight: 0,
  step2_Speed: 0,
  step2_Hight: 0,
  step3_Speed: 0,
  step3_Hight: 0,
  delay_time: 0,
  initial_hight: 0,
  initial_speed: 0,
  demoulding_H: 0,
  demoulding_S: 0,
};

app.use(
  express.urlencoded({
    extended: false,
  })
);
//app.use('/set_up', set_up);

//bootstrap setup
app.use("/css", express.static("./node_modules/bootstrap/dist/css"));
app.use("/js", express.static("./node_modules/bootstrap/dist/js"));
app.use("/jquery", express.static("./node_modules/jquery/dist/"));

var Host = "localhost"; //"192.168.208.12"//"192.168.0.14"//"192.168.66.12"//"192.168.1.188"
var Port = 80;

var server = app.listen(Port, function (req, res) {
  //, Host
  //Host
  var host = server.address().address;
  var port = server.address().port;

  console.log("应用实例，访问地址为 http://%s:%s", host, port);

  read_json_test();
});

var sio = io(server);

sio.on("connection", function (socket) {
  console.log("Connected");
  // 接收'connection'事件訊息
  socket.on("disconnect", () => {
    console.log("disconnect"); // false
  });
  socket.on("Connect", function (data) {
    //每一次ESP32確認連線狀態，判斷是否要更新資料到設備上
    console.log("來自Arduino的mac:" + data);
    /*     for( var key in data){
      console.log(key);
      console.log(data[key]);
    } */
    var ind = datainfo.device.length;
    var index = datainfo.device.findIndex((i) => i.mac === data.mac);
    //console.log(index);
    if (index != -1) {
      if (datainfo.device[index]["web_control"]) {
        console.log("WEB控制");
      } else {
        for (var key in data) {
          datainfo.device[index][key] = data[key];
        }
      }
      ind = index;
    } else {
      var copy_data = {};
      for (var key in data) {
        copy_data[key] = data[key];
      }
      copy_data["web_control"] = 0;
      copy_data["web_flag"] = 0;
      copy_data["web_counter"] = 0;
      datainfo.device.push(copy_data);
    }
    writeJSON(datainfo);
    //console.log(data.return);
    //console.log(data.now_hight);
    if (data.return) socket.emit("Connect", datainfo.device[ind]);
  });

  socket.on("arduino_get", function (data) {
    console.log("arduino_get");
    // 卻日arduino有收到資料
    var index = datainfo.device.findIndex((i) => i.mac === data.mac);
    console.log(index);
    datainfo.device[index]["web_control"] = 0;
    datainfo.device[index]["web_flag"] = 0;
    datainfo.device[index]["web_counter"] = 0;
    writeJSON(datainfo);
    socket.emit("arduino_get", 1);
  });

  socket.on("get_hight", function (data) {
    //console.log('now_hight');
    // 卻日arduino有收到資料
    var index = datainfo.device.findIndex((i) => i.mac === data.mac);
    if (index != -1)
      socket.emit("get_hight", {
        now_hight: datainfo.device[index]["now_hight"],
        max_hight: datainfo.device[index]["max_hight"],
      });
  });

  socket.on("manual", function (data) {
    var index = datainfo.device.findIndex((i) => i.mac === data.mac);
    //var show_data={"err" : 0};
    if (index != -1) {
      datainfo.device[index]["web_control"] = 1;
      datainfo.device[index]["web_counter"] = data.web_counter;
      datainfo.device[index]["web_speed"] = data.web_speed;
      datainfo.device[index]["web_flag"] = 6;
    }
    console.log(data);
  });

  socket.on("manual_reset", function (data) {
    var index = datainfo.device.findIndex((i) => i.mac === data.mac);
    //var show_data={"err" : 0};
    if (index != -1) {
      datainfo.device[index]["web_control"] = 1;
      datainfo.device[index]["web_flag"] = 3;
      socket.emit("manual_reset", datainfo.device[index]["initial_hight"]);
    }
  });

  socket.on("manual_stop", function (data) {
    var index = datainfo.device.findIndex((i) => i.mac === data.mac);
    //var show_data={"err" : 0};
    if (index != -1) {
      datainfo.device[index]["web_control"] = 1;
      datainfo.device[index]["web_flag"] = -1;
    }
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/", function (req, res) {
  var route = "";
  switch (req.body.send) {
    case "設備控制":
      route = "/control";
      break;

    case "參數設定":
      route = "/set_up";
      break;

    case "手動控制":
      route = "/manual";
      break;

    default:
      break;
  }
  res.redirect(route);
});

app.get("/set_up", function (req, res) {
  //res.render("index", {result : "", indata : clean});
  //console.log(name_list);
  res.render("set_up", {
    result: "",
    indata: clean,
    list: getArray(datainfo.set_data, "name"),
    device_list: getArray(datainfo.device, "mac"),
  });
});

var updelay = 0;
app.post("/set_up", function (req, res) {
  console.log(req.body.sel);
  if (req.body.btn == "search") {
    datainfo.set_data.forEach(function (value, index, array) {
      if (value.name == req.body.sel) {
        //res.render("index",{result : ""});
        res.render("set_up", {
          result: "",
          indata: value,
          list: getArray(datainfo.set_data, "name"),
          device_list: getArray(datainfo.device, "mac"),
        });
        return 0;
      }
    });
    return 0;
  }
  updelay = 0;
  var newdata = {};
  for (var key in req.body) {
    newdata[key] = req.body[key];
  }

  upJSON(newdata, req.body.btn);
  //console.log(newdata);
  //res.render("index",{result : ""});

  res.render("set_up", {
    result: "成功" + req.body.btn,
    indata: clean,
    list: getArray(datainfo.set_data, "name"),
    device_list: getArray(datainfo.device, "mac"),
  });
});

app.get("/control", function (req, res) {
  var show_data = JSON.parse(JSON.stringify(clean));
  if (datainfo.device.length) {
    for (var key in show_data) {
      show_data[key] = datainfo.device[0][key];
    }
    show_data["name"] = datainfo.device[0]["mac"];
  }
  res.render("control", {
    device_list: getArray(datainfo.device, "mac"),
    setfile_list: getArray(datainfo.set_data, "name"),
    show_data: clean,
  });
});

app.post("/control", function (req, res) {
  var D_ind = datainfo.device.findIndex((i) => i.mac === req.body.sel_device);
  var S_ind = datainfo.set_data.findIndex(
    (i) => i.name === req.body.sel_setfile
  );
  if (D_ind != -1) {
    for (var key in clean) {
      if (key != "name") datainfo.device[D_ind][key] = req.body[key];
    }
    datainfo.device[D_ind]["web_control"] = 1;
    datainfo.device[D_ind]["web_flag"] = 1;
  }
  var show_data = JSON.parse(JSON.stringify(clean));
  /* if(datainfo.device.length){
    for(var key in show_data){
      show_data[key]=datainfo.device[0][key];
    }
    show_data["name"]=datainfo.device[0]["mac"];
  } */
  writeJSON(datainfo);
  res.render("control", {
    device_list: getArray(datainfo.device, "mac"),
    setfile_list: getArray(datainfo.set_data, "name"),
    show_data: clean,
  });
});

app.get("/manual", function (req, res) {
  res.render("manual", { device_list: getArray(datainfo.device, "mac") });
});

app.post("/get_Device_data", function (req, res) {
  var index = datainfo.device.findIndex((i) => i.mac === req.body.mac);
  var show_data = JSON.parse(JSON.stringify(clean));
  if (index != -1) {
    for (var key in show_data) {
      if (key == "name") {
        show_data[key] = datainfo.device[index]["mac"];
        continue;
      }
      show_data[key] = datainfo.device[index][key];
    }
    show_data["max_hight"] = datainfo.device[index]["max_hight"];
  }
  res.send(show_data);
});

app.post("/get_setfile_data", function (req, res) {
  var index = datainfo.set_data.findIndex((i) => i.name === req.body.name);
  var show_data = JSON.parse(JSON.stringify(clean));
  if (index != -1) {
    for (var key in show_data) {
      show_data[key] = datainfo.set_data[index][key];
    }
  }
  res.send(show_data);
});

app.post("/delete_Device", function (req, res) {
  var D_ind = datainfo.device.findIndex((i) => i.mac === req.body.mac);
  datainfo.device.splice(D_ind, 1);
  //console.log(datainfo.device);
  writeJSON(datainfo);
  res.send("1");
});

/* app.post("/web_manual", function(req, res){
  var index=datainfo.device.findIndex(i => i.mac===req.body.mac);
  var show_data={"err" : 0};
  if(index != -1){
    datainfo.device[index]["web_counter"] = req.body.web_counter;
    datainfo.device[index]["web_flag"] = 6;
  }
  res.send(show_data);
}); */

function upJSON(newdata, flag) {
  //更新設定參數資料
  var repeat = 0;
  datainfo.set_data.forEach(function (value, index, array) {
    if (value.name == newdata.name) {
      for (var key in datainfo.set_data[index]) {
        datainfo.set_data[index][key] = newdata[key];
      }
      if (flag == "delete") {
        datainfo.set_data.splice(index, 1);
        datainfo.total = datainfo.set_data.length;
      }
      repeat = 1;
      return 0;
    }
  });
  if (!repeat) {
    datainfo.set_data.push(newdata);
  }
  //reset_name();
  datainfo.total = datainfo.set_data.length;
  writeJSON(datainfo);
}

function writeJSON(data) {
  var str = JSON.stringify(data);
  //將字串符傳入您的 json 文件中
  fs.writeFile("./data.json", str, function (err) {
    if (err) {
      console.error(err);
    }
    datainfo = data;
    console.log("UPdata...");
  });
}

function read_json_test() {
  var JSONdata = {};
  fs.open(path, "wx", function (err, fd) {
    if (err) {
      //檔案不存在就新增
      fs.readFile("./data.json", function (err, data) {
        if (err) {
          return console.error(err);
        }
        //將二進制數據轉換為字串符
        var read = data.toString();
        //將字符串轉換為 JSON 對象
        datainfo = JSON.parse(read);
        /*         datainfo.set_data.forEach(function(value){
          name_list.push(value.name);
        }) */
        console.log(datainfo);
      });
    } else {
      str = '{"device":[], "set_data":[], "total": 0}';
      datainfo = JSON.parse(str);
      fs.writeFile(path, str, function (err) {
        if (err) {
          console.error(err);
        }
        console.log("Establish data");
      });
    }
  });
}

function getArray(array, key) {
  var list = [];
  array.forEach(function (value, index, array) {
    list.push(value[key]);
  });
  return list;
}
//
//                       oo0oo
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    __/`---'\__
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\_  '-'  __/-. /
//             __'. .'  /--.--\  `. .'__
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `.   \ _\ /_ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
