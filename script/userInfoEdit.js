apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});
  var UIMediaScanner = api.require('UIMediaScanner');
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};
  jq(function(){
    //总共就三个，以后可能会加
    //个人说明。擅长领域。展示图片


    //选择擅长领域的点击事件
    (function(){
      jq('.user_good_field_elected_ul').on('click',function(e){
        if(jq(e.target).attr('index') !== undefined){
          var _text = jq(e.target).text();
          var _id = e.target.id;
          var _index = jq(e.target).attr('index');
          var _li = jq('<li index="'+_index+'" id="'+_id+'">'+_text+'</li>');
          jq('.user_good_field_selected_ul').append(_li);
          jq(e.target).remove();
        }
      });
    })();

    //已选择领域点击事件
    (function(){
      jq('.user_good_field_selected_ul').on('click',function(e){
        if(jq(e.target).attr('index') !== undefined){
          var _index = parseFloat(jq(e.target).attr('index'));
          var _id = e.target.id;
          var _text = jq(e.target).text();

          var _li = jq('<li index="'+_index+'" id="'+_id+'">'+_text+'</li>');
          jq('.user_good_field_elected_ul').append(_li);
          jq(e.target).remove();


        }
      });
    })();

    //添加图片展示  和点击删除图片
    (function(){

      /*选择图片*/
      jq('.user_add_img').on('click',function(){
        var _list = jq('.user_exhibition_img_ul img');
        if(_list.length >= 9){
          toast.fail({title:"最多选择九张",duration:4000});
        }else{
          UIMediaScanner.open({
              type: 'picture',
              column: 4,
              classify: true,
              max: 9,
              sort: {key: 'time',order: 'desc'},
              texts: {stateText: '已选择0项',cancelText: '取消',finishText: '完成'},
              styles: {
                  bg: '#fff',
                  mark: {
                      icon: '',
                      position: 'bottom_left',
                      size: 32
                  },
                  nav: {
                      bg: '#eee',
                      stateColor: '#000',
                      stateSize: 18,
                      cancelBg: 'rgba(0,0,0,0)',
                      cancelColor: '#000',
                      cancelSize: 18,
                      finishBg: 'rgba(0,0,0,0)',
                      finishColor: '#000',
                      finishSize: 18
                  }
              },
              scrollToBottom:{intervalTime: 3,anim: true},
              exchange: true,
              rotation: false
          }, function( ret ){
              if( ret ){
                  if(ret.eventType === 'cancel'){toast.fail({title:"取消了选择",duration:4000});}
                  if(ret.eventType === 'albumError'){toast.fail({title:"访问相册失败",duration:4000});}
                  if(ret.eventType === 'confirm'){
                    if(ret.list.length === 0){
                      toast.fail({title:"未选择",duration:4000});
                    }else{
                      var img_arr = ret.list;
                      for(var i = 0;i < img_arr.length;i++){
                        var _img = jq('<img user_exhibition_img_ul_img="del" src="'+img_arr[i].path+'"/>');
                        jq('.user_exhibition_img_ul').append(_img);
                      }
                    }
                  }
              }
          });
        }
      });

      /*删除图片*/
      jq('.user_exhibition_img_ul').on('click',function(e){
        if(jq(e.target).attr('user_exhibition_img_ul_img') !== undefined){
          jq(e.target).remove();
        }
      });


    })();

    /*提交点击*/
    (function(){
      jq('.user_info_submit').on('click',function(){
        var _list = jq('.user_exhibition_img_ul img');
        if(jq('#user_personal_note_textarea').val() === ''){
          toast.fail({title:"请书写个人说明",duration:4000});return;
        }else if(jq('.user_good_field_selected_ul').children().length === 0){
          toast.fail({title:"请选择擅长的领域",duration:4000});return;
        }else if(jq('.user_exhibition_img_ul').children().length === 0){
          toast.fail({title:"请选择图片",duration:4000});return;
        }else if(_list.length >= 10){
          toast.fail({title:"最多选择九张",duration:4000});return;
        }else{
          api.showProgress({title: '正在提交中...',text: '请稍后...',modal: false});
          sendText();
        }
      });
    })();


    /*发送数据函数*/
    function sendText(){

      var _data = jq('#user_personal_note_textarea').val();
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/user-center/description",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        },
        "data": {
          "description": _data
        }
      }

      jq.ajax(settings).done(function (rep) {
        if(rep.message === 'success'){
          sendGoodField();
        }
      });
    }

    function sendGoodField(){
      var obj = {};
      var _list = jq('.user_good_field_selected_ul').children();
      for(var i = 0; i < _list.length;i++){
        obj[i+1] = jq(_list[i]).attr('id');
      }

      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/user-center/talents",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        },
        "data":obj
      }

      jq.ajax(settings).done(function (rep) {
        if(rep.message === 'success'){
          sendImg();
        }
      });
    }

    function sendImg(){
      var obj = {};
      var _list = jq('.user_exhibition_img_ul').children();
      for(var i = 0;i < _list.length;i++){
        var _url = jq(_list[i]).attr('src');
        obj[i+1] = _url;
      }

      api.ajax({
          url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/user/user-center/images',
          method: 'post',
          headers: {
            "Authorization": "Bearer " + token
          },
          data: {
            files:obj
          }
      },function(ret, err){
          if (ret) {
              if(ret.message === 'success'){
                api.hideProgress();
                toast.success({title:"上传成功",duration:4000});
                setTimeout(function(){api.closeWin();},3600);
              }
          } else {
              console.log( JSON.stringify( err ) );
          }
      });



    }

    //设置表单默认值
    (function(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/24/user-center",
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (res) {
        if(res.message === 'success'){
          var data = res.response;
          //设置个人说明
          var __text = '';
          if(data.user_center === null){
            __text = '还没有设置个人说明';
          }else{
            if(data.user_center.description === null){
              __text = '还没有设置个人说明';
            }else{
              __text = data.user_center.description;
            }
          }
          jq('#user_personal_note_textarea').val(__text);

          //设置个人擅长的领域
          var wait_data = [];
          if(data.userTalents === undefined || data.userTalents === null){
            wait_data = null;
          }else{
            wait_data = data.userTalents;
          }

          var __list = jq('.user_good_field_elected_ul li');
          for(var i = 0; i < __list.length;i++){
            for(var k = 0;k < wait_data.length;k++){
              if(jq(__list[i]).text() === wait_data[k]){
                var _li = jq('<li index="'+jq(__list[i]).attr('index')+'" id="'+jq(__list[i]).attr('index')+'">'+jq(__list[i]).text()+'</li>');
                jq('.user_good_field_selected_ul').append(_li);
                jq(__list[i]).remove();
              }
            }
          }











        }
      });
    })();



    //返回上一页
    jq('#page_header_return').on('click',function(){api.closeWin();});
  });
}
