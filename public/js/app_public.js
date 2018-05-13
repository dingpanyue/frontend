/*项目公共JS部分，所有重复使用的函数，组件等，都在这里*/
/*设置和获取偏好数据*/
function setLocalMsg(msgKey,obj){var _jsonObj = JSON.stringify(obj);api.setPrefs({key: msgKey,value: _jsonObj});}
//得到偏好数据
function getLocalMsg(msgKey){var localMsg = api.getPrefs({sync: true,key: msgKey});return JSON.parse(localMsg);}
//简化获取元素方式
function getIdDom(id){return document.getElementById(id);}
function getClassDom(classStr){return document.getElementsByClassName(classStr)[0];}
function getyyyyMMdd(){
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();
    String(curr_month).length < 2 ? (curr_month = "0" + curr_month): curr_month;
    String(curr_date).length < 2 ? (curr_date = "0" + curr_date): curr_date;
    var yyyyMMdd = curr_year + "-" + curr_month +"-"+ curr_date;
    return yyyyMMdd;
}
