# ESP32區網Server 由網頁控制ESP32

這是一個可以透過網頁控制ESP32的伺服器，由SocketIO與ESP32進行通信來傳遞使用者於網頁上設定的參數和ESP32目前狀態的參數。
***
<br>

該伺服器一共有以下4個網頁
1. index
: 跳轉其他頁面
2. set_up
: 設定參數
3. control
: 選擇設備與參數進行控制
4. manual
: 手動控制設備
***

## 伺服器架設方式

1. 安裝[nodejs][1]
2. 安裝express<br>`npm install express`
3. 下載該專案
4. 移動到相同路徑下
5. 執行 `node index.js`

[1]: https://nodejs.org/zh-tw/download

***
<br>
設備以及設定過的參數都會記錄在data.json內
