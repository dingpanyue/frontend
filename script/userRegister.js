apiready = function(){
  //优化点击事件
  api.parseTapmode();

  (function(){
    getClassDom("app-top-bar-icon").addEventListener('click',function(){
      api.openWin({
          name: 'signin',
          slidBackEnabled:false,
          url: '../html/signin.html'
      });

    },true);
  })();

  /*表单输入验证*/
  (function(){
    /*获得用户手机号*/
    var user_phone = getClassDom("user-phone");
    var user_phone_bool = false;

    /*获得验证码值*/
    var user_verification = getClassDom("user-verification");
    var user_verification_bool = true;

    /*获得密码*/
    var user_psw = getClassDom("user-psw");
    var user_psw_bool = false;

    /*获得第二次输入的密码*/
    var user_confirm_psw = getClassDom("user-confirm-psw");

    var user_confirm_psw_bool = false;

    /*获得验证码按钮*/
    var send_verification_btn = getClassDom("send-verification-btn");

    /*获得注册按钮*/
    var user_input_submit = getClassDom("user-input-submit");

    /*获得显示错误的dom元素*/
    var error_prompt_DOM = getClassDom("error-prompt");

    /*手机号验证正则*/
    var phoneReg = /^1\d{10}$/;

    /*验证手机号是否合法*/
    user_phone.addEventListener('input',function(){
      if(phoneReg.test(user_phone.value)){
        console.log("手机号合法");
        user_phone_bool = true;
      }else{
        var _user_phone_value = getClassDom("user-phone").value;
        getClassDom("user-phone").value = _user_phone_value.replace(/[^0-9]{1,}/,'');
        console.log("手机号不合法");
        user_phone_bool = false;
      }
    },true);

    /*验证码是否正确*/
    user_verification.addEventListener('input',function(){
      if(user_verification.value.length >= 6){
        console.log("验证码输入正确");
        user_verification_bool = true;
      }else{
        console.log("验证码输入错误");
        user_verification_bool = false;
      }
    },true);

    /*判断密码长度是否足够，暂时是不少于六位*/
    user_psw.addEventListener('input',function(){
      if(user_psw.value.length >= 6){
        console.log("密码长度大于等于6位");
        user_psw_bool = true;
      }else{
        console.log("密码强度不够，无法通过");
        user_psw_bool = false;
      }
    },true);

    /*判断第二次输入的密码长度是否足够，暂时不少于六位，是否与第一次输入的一致*/
    user_confirm_psw.addEventListener('input',function(){
      if(user_confirm_psw.value === user_psw.value){
        if(user_confirm_psw.value == ""){
          console.log("请再次输入密码...");
        }else{
          console.log("密码正确");
          user_confirm_psw_bool = true;
        }
      }else{
        user_confirm_psw_bool = false;
      }


    },true);



    /*是否发送验证码*/
    var user_verification_bool_send = true;
    send_verification_btn.addEventListener('click',function(){
      if(user_phone_bool){
        if(user_verification_bool_send){
          //发起验证码请求
          var sendData = 'mobile='+user_phone.value;
          console.log(sendData);
          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/send-sms',
              method: 'post',
              headers:{
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-cache",
                "Postman-Token": "027e21b7-b31a-ad0e-394a-f0da4134ae39"
              },
              data: {
                  body:sendData
              }
          },function(ret, err){
              if (ret) {
                if(ret.msgcode === 200003){
                  api.toast({
                    msg: ret.message,
                    duration: 4000,
                    location: 'top'
                  });
                }else{
                  api.toast({
                    msg: '发送成功!',
                    duration: 4000,
                    location: 'top'
                  });
                  var isSendTrueNum = 60;
                  //之后是一个倒计时
                  var isSendTrueTime = setInterval(function(){
                    if(isSendTrueNum <= 1){
                      clearInterval(isSendTrueTime);
                      isSendTrueTime = null;
                      user_verification_bool_send = true;
                      getClassDom('send-verification-btn').innerText = '获取验证码';
                    }else{
                      getClassDom('send-verification-btn').innerText = --isSendTrueNum;
                    }
                  },900);
                  user_verification_bool_send = false;
                  console.log( JSON.stringify( ret ) );
                }
              } else {
                console.log( JSON.stringify( err ) );
              }
          });


        }else{
          api.toast({
            msg: '验证码已发送，不可多次获取!',
            duration: 4000,
            location: 'top'
          });
        }
      }else{
        api.toast({
          msg: '手机号填写不正确！',
          duration: 4000,
          location: 'top'
        });
      }

    },true);

    /*判断注册按钮是否可提交*/

    user_input_submit.addEventListener('click',function(){
      if(user_phone_bool && user_verification_bool && user_psw_bool && user_confirm_psw_bool){
          console.log("可以提交注册");
          error_prompt_DOM.style.bottom = "-50px";

          /*将用户数据序列化为JSON字符串，方便发送*/
          var userInformation = "mobile="+user_phone.value+"&password="+user_psw.value+"&sms_code=" + user_verification.value;

          /*发起请求*/
          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/register',
              method: 'post',
              headers:{
                "mobile": user_phone.value,
                "password": user_psw.value,
                "sms_code": user_verification.value,
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-cache"
              },
              data: {
                  body:userInformation
              }
          },function(ret, err){
              if (ret) {
                  console.log('注册成功');
                  console.log( JSON.stringify( ret ) );
                  setLocalMsg('user_register_inf',{
                    userName:ret.name,
                    userParssword:ret.password,
                    userMobile:ret.mobile,
                    userId:ret.id
                  });
                  api.closeWin({
                      name: 'userRegister'
                  });
                  //然后跳转到登录页面
                  api.openWin({
                      name: 'signin',
                      slidBackEnabled:false,
                      url: '../html/signin.html'
                  });

              } else {
                  console.log('注册时出错了');
                  console.log( JSON.stringify( err ) );
              }
          });
      }else{
          switch (false) {
            case user_phone_bool:
              error_prompt_DOM.innerText = "手机号输入可能有错误";
              error_prompt_DOM.style.bottom = "10px";
              break;
            case user_verification_bool:
              error_prompt_DOM.innerText = "验证码输入可能有错误";
              error_prompt_DOM.style.bottom = "10px";
              break;
            case user_psw_bool:
              error_prompt_DOM.innerText = "密码输入可能有错误";
              error_prompt_DOM.style.bottom = "10px";
              break;
            case user_confirm_psw_bool:
              error_prompt_DOM.innerText = "第二次的密码输入可能有错误";
              error_prompt_DOM.style.bottom = "10px";
              break;
            default:
              return;
          }
      }
    },true);



  })();



}
