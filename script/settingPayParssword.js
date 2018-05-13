apiready = function(){

  //监听input输入状态
  var one_password = '';
  var status = 0;
  getIdDom('user_pay_paw').addEventListener('input',function(){
    if(this.value.length === 6){
      if(status === 1){
        if(this.value === one_password){
          //发起ajax请求，修改密码
          getClassDom('tip_large_title').innerText = '正在设置';
          api.showProgress({
              title: '努力设置中...',
              text: '先喝杯茶...',
              modal: false
          });

          setPassword(this.value);

        }else{
          this.value = '';
          one_password = '';
          getClassDom('tip_large_title').innerText = '两次输入不一致，请重新输入';
          status = 0;
          return;
        }
      }
      if(status === 0){
        one_password = this.value;
        this.value = '';
        getClassDom('tip_large_title').innerText = '请再次输入';
        status = 1;
      }


    }

  },true);


  function setPassword(pasw){
    //取缓存
    api.getPrefs({
        key: 'user_login_status'
    }, function(ret, err){
        if( ret ){
            var token = JSON.parse(ret.value).access_token;
            var mima = {
              password:pasw
            }
            api.ajax({
                url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/payment_password',
                method: 'post',
                headers:{
                  "Content-Type":"application/json",
                  "Authorization":"Bearer " + token
                },
                data: {
                    body:mima
                }
            },function(ret, err){
                if (ret) {
                    if(ret.message === 'success'){
                      //先缓存支付密码
                      setLocalMsg('user_pay_password',{
                        pasw:pasw
                      });
                      api.hideProgress();
                      getClassDom('user_paw_input_container').innerHTML = '<div class="setting_success">支付密码设置成功,即将跳转...</div>';
                      getClassDom('tip_txt').innerText = '';
                      getClassDom('tip_large_title').innerText = '';

                      setTimeout(function(){
                        api.closeWin();
                      },2000);
                    }
                } else {
                    console.log( JSON.stringify( err ) );
                }
            });

        }else{
            console.log('取缓存出错');
        }
    });

  }

  getIdDom('close_page').addEventListener('click',function(){api.closeWin();},true);
}
