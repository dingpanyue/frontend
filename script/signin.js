apiready = function(){
  //优化点击事件
  api.parseTapmode();



  /*设置找回密码的模态height*/
  getClassDom('PasswordBack').style.height = api.winHeight + 'px';

  /*找回密码模态的返回登录被点击*/
  getClassDom('PasswordBack-header-returm').addEventListener('click',function(){
    getClassDom('PasswordBack').style.display = 'none';
  },true);


  /*找回密码模态的JS*/
  /*验证手机号*/
  (function(){

    var userReg = /^1[3587]\d{9}$/;

    /*手机号*/
    var user_phone = getIdDom('user-phone');
    var user_phone_bool = false;

    /*验证码*/
    var user_back_code = getIdDom('user-back-code');
    var user_back_code_bool = false;

    /*验证码按钮*/
    var user_back_code_btn = getClassDom('user-back-code-btn');

    /*新密码*/
    var app_new_psw = getClassDom('app-new-psw');
    var app_new_psw_bool = false;

    /*确认新密码*/
    var app_confirm_new_psw = getClassDom("app-confirm-new-psw");
    var app_confirm_new_psw_bool = false;

    /*密码提交*/
    var app_newPsw_submit = getClassDom("app-newPsw-submit");

    /*手机号输入框*/
    user_phone.addEventListener('input',function(){
      if(userReg.test(user_phone.value)){
        console.log("手机号合法");
        user_phone_bool = true;
        user_back_code_btn.style.borderBottom = '1px solid #39f';
      }else{
        console.log("手机号不合法");
        user_phone_bool = false;
        user_back_code_btn.style.borderBottom = '1px solid #c0c0c0';
      }
    },true);

    /*验证码按钮*/
    user_back_code_btn.addEventListener('click',function(){
      if(user_phone_bool){
        console.log("可以发起请求");
      }else{
        console.log("不可以发起请求，手机号错误");
      }
    },true);

    /*验证码输入框*/
    user_back_code.addEventListener('input',function(){
      if(user_back_code.value.length == 6){
        console.log("验证码长度正确");
        user_back_code_bool = true;
      }else{
        console.log("验证码不正确");
        user_back_code_bool = false;
      }
    },true);






    /*新密码验证*/
    app_new_psw.addEventListener('input',function(){
      if(app_new_psw.value.length >= 6){
        console.log("新密码长度正确");
        app_new_psw_bool = true;
      }else{
        console.log("新密码长度不正确");
        app_new_psw_bool = false;
      }
    },true);


    /*确认密码验证*/
    app_confirm_new_psw.addEventListener('input',function(){
      if(app_confirm_new_psw.value == app_new_psw.value){
        console.log("两次密码输入一致");
        app_confirm_new_psw_bool = true;
        app_newPsw_submit.style.backgroundColor = '#39f';
        app_newPsw_submit.style.color = '#fff';
      }else{
        console.log("两次密码输入不一致");
        app_confirm_new_psw_bool = false;
        app_newPsw_submit.style.backgroundColor = '#e5e4e7';
        app_newPsw_submit.style.color = '#333';
      }
    },true);


    /*密码提交的ajax*/
    app_newPsw_submit.addEventListener('click',function(){
      if(user_phone_bool && user_back_code_bool && app_new_psw_bool && app_confirm_new_psw_bool){
        console.log("可以提交");
        /*清除用户本地账户信息*/
        api.removePrefs({
            key: 'user_data'
        });
        api.removePrefs({
            key: 'authentication_status'
        });

        //因为是模态，没有无法刷新页面，将所有Input值置为空
        user_phone.value = '';
        user_back_code.value = '';
        app_new_psw.value = '';
        app_confirm_new_psw.value = '';


        /*发起ajax请求，如果成功再关闭这个页面*/



        getClassDom('PasswordBack').style.display = 'none';


      }else{
        console.log("不可提交");
      }
    },true);



  })();



  /*登录遇到问题，找回密码啥的跳转页面*/
  (function(){
    getClassDom("app-top-bar-btn").addEventListener('click',function(){

      /*打开找回密码的模态*/
      getClassDom('PasswordBack').style.display = 'block';





    },true);


  })();

  /*点击立即注册，去往注册页面*/
  (function(){
    getClassDom("app-signin-jumbotron-span").addEventListener('click',function(){
      api.openWin({
          name: 'userRegister',
          slidBackEnabled:false,
          url: '../html/userRegister.html'
      });
    },true);
  })();


  /*表单验证JS*/
  (function(){
    /*输入手机号的表单*/
    var userName = getClassDom("userName");
    var userPsw = getClassDom("userPsw");
    var app_signin_submit = getClassDom("app-signin-submit");
    var isUserNameSubmit = true;
    var isUserPswSubmit = false;

    /*当手机号验证错误的时候，将显示这个元素*/
    var userName_icon = getClassDom("userName-icon");
    var userNameP = getClassDom("userNameP");




    userPsw.addEventListener('input',function(){
      if(userPsw.value !== '' && userPsw.value.length>=6){
        console.log("密码合法");
        app_signin_submit.style.backgroundColor = "#FF9933";
        isUserPswSubmit = true;
      }else{
        console.log("密码为空或不合法");
        app_signin_submit.style.backgroundColor = "#c0c0c0";
        isUserPswSubmit = false;
      }
    },true);

    /*提交按钮是否可触发事件*/
    app_signin_submit.addEventListener('click',function(){
      if(isUserNameSubmit && isUserPswSubmit){
        if(userPsw.value.length >= 6){
          api.showProgress({
            title: '正在登录...',
            modal: false
          });
          /*发起请求，提交表单*/
          var jsonData = "mobile="+getIdDom('userName').value+"&password="+getIdDom('userPsw').value+"&grant_type=password&client_id=11&client_secret=GVBaxOfw2SuAefMo3A8IhmyxpGOq5VZHFPePf3lY&scope=";
          // console.log(jsonData);
          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/login',
              method: 'post',
              contentType: 'application/json;charset=utf-8',
              headers:{
                'Content-Type':'application/x-www-form-urlencoded'
              },
              data:{
                body:jsonData
              }
          },function(ret, err){
              if (ret) {
                  api.hideProgress();
                  var login_data = ret;
                  //MMP成功和失败的字段不一样
                  if(parseFloat(ret.code) !== undefined && parseFloat(ret.code) === 401){

                    api.toast({
                        msg: '登录失败，账号不存在或密码错误',
                        duration: 4000,
                        location: 'top'
                    });
                  }else{
                    //访问info获取用户id
                    api.ajax({
                        url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/self/info',
                        method: 'get',
                        headers:{
                          "Content-Type": "application/x-www-form-urlencoded",
                          "Authorization":"Bearer " + ret.access_token
                        }
                    },function(ret, err){
                        if (ret){
                          if(ret.message === 'success'){
                            //将登录成功之后返回过来的所有用户数据放在变量里，方便后面的异步操作使用
                            setLocalMsg('user_login_status',{
                                isLoning:true,
                                token_type:login_data.token_type,
                                expires_in:login_data.expires_in,
                                access_token:login_data.access_token,
                                refresh_token:login_data.refresh_token,
                                user_id:ret.response.id
                            });
                            //成功之后跳到index页面
                            api.openWin({
                                name: 'index',
                                slidBackEnabled:false,
                                url: '../index.html',
                                reload:true
                            });
                          }else{
                            console.log('访问info失败');
                          }
                        } else {
                            console.log( JSON.stringify( err ) );
                        }
                    });



                  }
              }else{
                  api.toast({
                      msg: '网络错误，请检查网络连接...',
                      duration: 4000,
                      location: 'top'
                  });

                  //console.log( JSON.stringify( err ) );
              }
          });

        }else{
          api.toast({
              msg: '输入有误，请检查输入！',
              duration: 4000,
              location: 'top'
          });
        }
      }else{
        api.toast({
            msg: '输入有误，请检查输入！',
            duration: 4000,
            location: 'top'
        });
      }
    },true);

  })();






}
