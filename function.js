var fs = require('fs');
var path="./data.json";


function read_json_test(){
    var JSONdata={};
    fs.open(path, 'wx', function (err,fd) {
      if (err){  //檔案不存在就新增
        fs.readFile('./data.json', function (err, data) {
          if (err) {
              return console.error(err);
          }
          //將二進制數據轉換為字串符
          var read = data.toString();
          //將字符串轉換為 JSON 對象
          JSONdata = JSON.parse(read);

          console.log("---------------------------");
          console.log(JSONdata);
        })
      }
      else{
        str="{\"device\":[], \"set_data\":[], \"total\": 0}";
        JSONdata = JSON.parse(str);
        fs.writeFile(path, str, function (err) {
          if (err) {
              console.error(err);
          }
          console.log('Establish data');
        })
      }
    });
    return JSONdata;
}

async function getArray(array=[], key){
    var list=[];
    array.forEach(function(value, index, array){
      list.push(value[key]);
    });
    return list;
}

function writeJSON(data){
    var str = JSON.stringify(data);
    //將字串符傳入您的 json 文件中
    fs.writeFile('./data.json', str, function (err) {
        if (err) {
            console.error(err);
        }
        datainfo=data;
        console.log('UPdata...');
    })
}

module.exports = {
    read_json_test,
    getArray,
    writeJSON
}