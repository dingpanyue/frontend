apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();


  getClassDom('bearer-information-container').style.height = (api.winHeight - 120) + 'px';

  var cache_arr = [];



  /*引入模块*/
  var UIChatBox = api.require('UIChatBox');
  //目标用户id
  var targetUserId = api.pageParam.from_id;
  //目标用户昵称
  var targetUserName = api.pageParam.from_name;
  //目标用户头像
  var targetUserImg = api.pageParam.from_img;
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};


  jq(function(){

    var __msg = '';
    var __send_user_id = targetUserId;
    var __time = '';




    //取与目标用户的聊天历史记录缓存
    var chat_record_cache = api.getPrefs({sync: true,key: 'chat_record_' + targetUserId});

    //如果有应该取出数据，渲染试图
    //如果没有，应该创建这个缓存，并且把当前发送的信息进行缓存

    //渲染聊天历史记录
    (function(){

      if(chat_record_cache !== ''){
        var interim_arr = JSON.parse(chat_record_cache);
        for(var i = 0;i<interim_arr.length;i++){
          if(interim_arr[i].type === 'left'){
            fromMsgView(interim_arr[i].from_id,interim_arr[i].msg);
          }
          if(interim_arr[i].type === 'right'){
            thisMsgView(interim_arr[i].msg);
          }
        }
        setScroll();
      }

    })();

    getClassDom('target-user-title').innerText = targetUserName;



    //给用户发消息
    function sendMsg(data){

      if(data !== ''){
        console.log('发送消息的方法执行了');
        var dataStr = 'message=' + data;
        api.ajax({
            url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/send/'+targetUserId,
            method: 'post',
            headers:{
              "Content-Type":"application/x-www-form-urlencoded",
              "Authorization":"Bearer " + token
            },
            data:{
                body:dataStr
            }
        },function(ret, err){
            if (ret) {
              console.log(JSON.stringify(ret));
              console.log('消息发送成功');
            }else{
              console.log('发送信息出错');
            }
        });
      }


    }

    //接收的消息渲染到视图
    function fromMsgView(id,msg){
      //先处理数据，拿到from用户的头像昵称
      //from_msg
      var from_inf = msg;


      //创建节点
      var aui_chat_left = document.createElement('div');
      aui_chat_left.setAttribute('class','aui-chat-item aui-chat-left');

      var htmlStr = '<div class="aui-chat-media">'+
          '<img info_id="'+targetUserId+'" src="http://47.104.73.41'+targetUserImg+'" />'+
      '</div>'+
      '<div class="aui-chat-inner">'+
          '<div class="aui-chat-name">'+targetUserName+'</div>'+
          '<div class="aui-chat-content public_msg_strip">'+'<div class="aui-chat-arrow"></div>'+from_inf+'</div>'+'</div>';

      aui_chat_left.innerHTML = htmlStr;
      getClassDom('app_chat_list').appendChild(aui_chat_left);
    }

    // //当前用户自身发送的消息渲染到视图
    function thisMsgView(msg){
      //先处理数据，拿到from用户的头像昵称

      var user_login_status = JSON.parse(api.getPrefs({
        sync: true,
        key: 'user_login_status'
      }));
      var this_img = user_login_status.user_img_url;
      var this_name = user_login_status.user_nicheng;
      var this_inf = msg;
      var my_id = user_login_status.user_id;



      //创建节点
      var aui_chat_right = document.createElement('div');
      aui_chat_right.setAttribute('class','aui-chat-item aui-chat-right');
      var this_img_url = '';
      if(this_img === null){
        this_img_url = '../image/icon/noimage.png';
      }else{
        this_img_url = 'http://47.104.73.41' + this_img;
      }
      var htmlStr = '<div class="aui-chat-media">'+
          '<img info_id="'+my_id+'" src="'+this_img_url+'" />'+
      '</div>'+
        '<div class="aui-chat-inner">'+
          '<div class="aui-chat-name">'+this_name+'</div>'+
          '<div style="width:400px;" class="aui-chat-content">'+
          '<div class="aui-chat-arrow"></div>'+this_inf+
        '</div>';

      aui_chat_right.innerHTML = htmlStr;
      getClassDom('app_chat_list').appendChild(aui_chat_right);
    }


    //设置滚动条
    function setScroll(){
      var bearer_information = getClassDom('bearer_information');
      var all_px = bearer_information.scrollHeight;
      getClassDom('bearer_information').scrollTop = all_px;
    }

    //监听ws链接收到的消息，如果跟当前聊天用户的id一致则渲染试图，如果不一致，则不做处理
    api.addEventListener({name: 'reloadThisWin'}, function(ret, err){setTimeout(function(){api.closeWin();},800);});
    api.addEventListener({name:'wsReceivedUserMsg'},function(ret, err){
      var data = ret.value.msg;
      var ws_from_user_id = data.from_user_id;
      var ws_from_user_msg = data.message;
      if(parseFloat(targetUserId) === parseFloat(ws_from_user_id)){
        fromMsgView(ws_from_user_id,ws_from_user_msg);
        setScroll();
        //将消息始终设置为0
        var isFrom_msg = JSON.parse(api.getPrefs({sync: true,key: 'from_msg'}));
        for(var i = 0;i < isFrom_msg.length;i++){
          if(parseFloat(isFrom_msg[i].fromId) === parseFloat(ws_from_user_id)){
            isFrom_msg[i].total = 0;
          }
          setLocalMsg('from_msg',isFrom_msg);
          api.sendEvent({
              name: 'runList',
              extra: {
                  shuaxin:'true'
              }
          });
        }
      }
      api.sendEvent({
          name: 'runList',
          extra: {
              shuaxin:'true'
          }
      });



    });

    /*实例化底部输入框*/
    UIChatBox.open({
        placeholder: '',
        maxRows: 4,
        emotionPath: 'widget://image/emotion',
        texts: {
            sendBtn:{
                title:'发送'
            }
        },
        styles: {
            inputBar: {
                borderColor: '#d9d9d9',
                bgColor: '#f2f2f2'
            },
            inputBox: {
                borderColor: '#B3B3B3',
                bgColor: '#FFFFFF'
            },
            emotionBtn: {
                normalImg: 'widget://image/icon/face1.png'
            },
            keyboardBtn: {
                normalImg: 'widget://image/icon/key1.png'
            },
            indicator: {
                target: 'both',
                color: '#c4c4c4',
                activeColor: '#9e9e9e'
            },
            sendBtn: {
                titleColor: '#fff',
                bg: '#39f' ,
                activeBg: '#39f',
                titleSize: 14
            }
        }
    }, function(ret, err){
        if( ret ){
             if(ret.eventType === 'send'){
               if(ret.msg !== undefined){
                     var chat_record_caches = api.getPrefs({
                         sync: true,
                         key: 'chat_record_' + targetUserId
                     });


                     if(chat_record_caches === ''){
                         var msg_obj = new Object();
                         msg_obj.msg = ret.msg;
                         msg_obj.send_user_id = targetUserId;
                         msg_obj.type = 'right';
                         cache_arr.push(msg_obj);
                         msg_obj = null;
                         setLocalMsg('chat_record_' + targetUserId,cache_arr);
                     }else{
                         var __msg_arr = JSON.parse(chat_record_caches);
                         var msg_obj = new Object();
                         msg_obj.msg = ret.msg;
                         msg_obj.send_user_id = targetUserId;
                         msg_obj.type = 'right';
                         __msg_arr.push(msg_obj);
                         msg_obj = null;
                         setLocalMsg('chat_record_' + targetUserId,__msg_arr);
                       }

                     //先缓存给用户发送消息的from用户的数据，头像/昵称/ID
                     var isFrom_msg = api.getPrefs({
                         sync: true,
                         key: 'from_msg'
                     });
                     var this_time = getyyyyMMdd();
                     if(isFrom_msg === ''){
                       var from_msg_arr = [];
                       //如果为空，说明之前没有信息，创建这个缓存
                       api.ajax({
                           url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/'+targetUserId+'/info',
                           method: 'get',
                           headers:{
                             "Content-Type": "application/x-www-form-urlencoded",
                             "Authorization":"Bearer " + token
                           }
                       },function(info_ret, err){
                           if (info_ret) {
                               //得到from信息之后，得到：头像/昵称/id  进行创建缓存
                               var obj = new Object();
                               obj.imgUrl = info_ret.response.image;
                               obj.fromId = info_ret.response.id;
                               obj.fromName = info_ret.response.name;
                               obj.msg = ret.msg;
                               obj.time = this_time;
                               from_msg_arr.push(obj);
                               obj = null;
                               //进行缓存
                               setLocalMsg('from_msg',from_msg_arr);
                           } else {
                               console.log( JSON.stringify( err ) );
                           }
                       });

                     }else{
                       //如果不为空，说明这不是第一次接收到from用户的消息了，应该是取缓存，然后在原值上进行存储，数组的前面
                       //console.log('不是第一次收到from用户的消息');
                       //看缓存中存储的from用户的信息和本次收到的from是否一致，如果一致，则更新缓存信息
                       //如果一致，说明相同的用户又给当前用户发送了信息，应该去更新缓存中的信息
                       //如果不一致，则向数组前面插入一个新对象
                       //保存当前缓存中所有from用户的id
                       var from_id_arr = [];
                       for(var i = 0;i < JSON.parse(isFrom_msg).length;i++){
                         if(parseFloat(JSON.parse(isFrom_msg)[i].fromId) === parseFloat(targetUserId)){
                           var arr = JSON.parse(isFrom_msg);
                           arr[i].msg = ret.msg;
                           arr[i].time = this_time;
                           setLocalMsg('from_msg',arr);
                         }
                         from_id_arr.push(parseFloat(JSON.parse(isFrom_msg)[i].fromId));
                       }

                       //如果收到的新消息本地没有缓存，则说明是新用户发来的消息，应该对缓存数组进行前入栈
                       if(from_id_arr.indexOf(parseFloat(targetUserId)) === -1){


                         api.ajax({
                             url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/'+targetUserId+'/info',
                             method: 'get',
                             headers:{
                               "Content-Type": "application/x-www-form-urlencoded",
                               "Authorization":"Bearer " + token
                             }
                         },function(user_info_ret, err){
                             if (ret) {
                                 var arr = JSON.parse(isFrom_msg);
                                 //得到from信息之后，得到：头像/昵称/id  进行创建缓存
                                 var obj = new Object();
                                 obj.imgUrl = user_info_ret.response.image;
                                 obj.fromId = user_info_ret.response.id;
                                 obj.fromName = user_info_ret.response.name;
                                 obj.msg = ret.msg;
                                 obj.time = this_time;
                                 arr.unshift(obj);

                                 obj = null;
                                 //进行缓存
                                 setLocalMsg('from_msg',arr);
                             } else {
                                 console.log( JSON.stringify( err ) );
                             }
                         });
                       }

                     }


                     thisMsgView(ret.msg);
                     sendMsg(ret.msg);
                     setScroll();
               }
             }
        }else{
             console.log( JSON.stringify( err ) );
        }
    });



    /*点击头像进入用户信息页面*/
    jq('#go_user_info_page').on('click',function(e){
      var _id = jq(e.target).attr('info_id');
      console.log(_id);
      if(_id !== undefined){
        api.openWin({
            name: 'checkUserInfo',
            slidBackEnabled:false,
            reload:true,
            url: '../html/checkUserInfo.html',
            pageParam: {
                id:_id
            }
        });
      }
    });

    /*顶部返回聊天信息列表*/
    getClassDom('app-gochatRoom').addEventListener('click',function(){api.closeWin();},true);

  });
}
