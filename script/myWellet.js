apiready = function(){
    var glbWidth = api.winHeight;
    var jq=jQuery.noConflict();
    var toast = new auiToast({});


    //取缓存
    try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

    jq(function(){
      /*支付宝模态高度*/
      jq('.bind_alipay_motai').height(glbWidth + 'px');
      /*支付宝模态高度*/
      jq('.bind_bank_motai').height(glbWidth + 'px');




      //请求数据
      (function(){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/self/info",
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }
        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            var data = rep.response;
            //设置头像和用户名
            if(data.image === null){
              jq('#user_img').attr('src','../image/icon/noimage.png');
            }else{
              jq('#user_img').attr('src','http://47.104.73.41' + data.image);
            }

            jq('#user_name').text('名字：' + data.name);
            /*设置用户余额*/
            jq('#user_balance').text('余额：' + data.balance);

            /*已绑定则显示账号*/
            /*支付宝*/
            if(data.user_account === null){
              jq('.bind_alipay_txt').text('(未绑定)');
            }else{
              if(data.user_account.alipay === null){
                jq('.bind_alipay_txt').text('(未绑定)');
              }else{
                jq('.bind_alipay_txt').text('('+data.user_account.alipay+')');
              }
            }

            /*银行卡*/
            if(data.user_account === null){
              jq('.bind_bank_txt').text('(未绑定)');
            }else{
              if(data.user_account.bank_account === null){
                jq('.bind_bank_txt').text('(未绑定)');
              }else{
                jq('.bind_bank_txt').text('('+data.user_account.bank_account+')');
              }
            }

          }
        });
      })();

      //设置银行
      (function(){
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/banks",
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
          }

        jq.ajax(settings).done(function (data) {
          for(var key in data){
            var _li = jq('<li bank="银行" id="'+key+'" isSelect="false">'+data[key]+'</li>');
            jq('.select_bank_ul').append(_li);
          }
        });
      })();



      /*点击事件*/
      /*支付密码设置*/
      jq('#user_pay_password').on('click',function(){
        console.log('asd');
        api.openWin({
            name: 'settingPayParssword',
            slidBackEnabled:false,
            url: '../html/settingPayParssword.html'
        });
      });

      /*模态打开*/
      jq('#bind_alipay').on('click',function(){jq('.bind_alipay_motai').fadeIn();});
      /*关闭支付宝模态*/
      jq('#close_bind_alipay_motai').on('click',function(){jq('.bind_alipay_motai').fadeOut();});

      /*支付宝绑定提交*/
      jq('.bind_alipay_submit').on('click',function(){
        var _val = jq('#bind_alipay_num').val();
        if(_val !== ''){
          //提交数据
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/alipay_account",
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            },
            "data": {
              "account": _val
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              jq('.bind_alipay_motai').fadeOut();
              var data = rep.response;
              api.toast({
                  msg: '绑定成功',
                  duration: 4000,
                  location: 'top'
              });
              jq('.bind_alipay_txt').text(data.alipay);
            }else{
              api.toast({msg: rep.message,duration: 4000,location: 'top'});
              jq('.bind_alipay_txt').text(data.alipay);
            }
          });
        }else{api.toast({msg: '请输入账号',duration: 4000,location: 'top'});}
      });

      //绑定银行卡模态
      /*模态打开*/
      jq('#bind_bank').on('click',function(){jq('.bind_bank_motai').fadeIn();});
      /*关闭支付宝模态*/
      jq('#close_bind_bank_motai').on('click',function(){jq('.bind_bank_motai').fadeOut();});

      /*银行选择事件*/
      jq('.select_bank_ul').on('click',function(e){
        if(jq(e.target).attr('bank') !== undefined){
          var list = jq('.select_bank_ul > li');
          for(var i = 0; i < list.length;i++){
            jq(list[i]).css({
              'border':'1px solid #888',
              'color':'#888'
            });
            jq(list[i]).attr('isSelect','false');
          }
          jq(e.target).attr('isSelect','true');
          jq(e.target).css({
            'border':'1px solid #39f',
            'color':'#39f'
          });
        }
      });

      /*银行卡绑定确定事件*/
      jq('.bind_bank_submit').on('click',function(){
        var bank_id = '';
        var _val = jq('#bind_bank_num').val();
        var list = jq('.select_bank_ul > li');
        for(var i = 0; i < list.length;i++){
          if(jq(list[i]).attr('isSelect') !== 'false'){
            bank_id = jq(list[i]).attr('id');
          }
        }
        if(bank_id === ''){
          api.toast({msg: '请选择银行',duration: 4000,location: 'top'});
        }else if(_val === ''){
          api.toast({msg: '请输入账号',duration: 4000,location: 'top'});
        }else{
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/bank_account",
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            },
            "data": {
              "bank_type": bank_id,
              "bank_account": _val
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              api.toast({
                  msg: '绑定成功',
                  duration: 4000,
                  location: 'top'
              });
              setTimeout(function(){
                window.location.reload();
              },3600);

            }
          });
        }
      });

      /*提现*/
      /*选择方式*/
      jq('.user_withdrawals_method').on('click',function(e){
        if(jq(e.target).attr('isSelect') !== undefined){
          var list = jq('.user_withdrawals_method > div');
          for(var i = 0;i < list.length;i++){
            jq(list[i]).css({
              'color':'#999',
              'border-bottom':'1px solid #fff'
            });
            jq(list[i]).attr('isSelect','false');
          }
          jq(e.target).css({
            'color':'#39f',
            'border-bottom':'1px solid #39f'
          });
          jq(e.target).attr('isSelect','true');
        }
      });

      /*a提现按钮点击事件*/
      jq('#user_drawing').on('click',function(){
        jq('.user_withdrawals').fadeIn();
      });
      /*提现提交按钮被点击*/
      jq('.user_withdrawals_submit').on('click',function(){
        var method = '';
        var _money_num = jq('#withdrawals_money').val();

        var list = jq('.user_withdrawals_method > div');
        for(var i = 0; i < list.length;i++){
          if(jq(list[i]).attr('isSelect') === 'true'){
            method = jq(list[i]).attr('method');
          }
        }
        console.log(method + _money_num);


        if(_money_num === ''){
          api.toast({
              msg: '请输入提现金额',
              duration: 4000,
              location: 'top'
          });
        }else{
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/pay/withdrawal",
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            },
            "data": {
              "method":method ,
              "amount":_money_num
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              api.toast({
                  msg: '已提交',
                  duration: 4000,
                  location: 'top'
              });
              setTimeout(function(){
                window.location.reload();
              },3600);
            }else{
              api.toast({
                  msg: rep.message,
                  duration: 4000,
                  location: 'top'
              });
            }
          });
        }



      });








      /*关闭当前页面*/
      jq('#page_header_return').on('click',function(){api.closeWin();});
    });
}
