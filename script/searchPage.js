apiready = function(){
    var glbWidth = api.winHeight;
    var jq=jQuery.noConflict();


    //取缓存
    try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

    jq(function(){

      /*搜索类型点击事件*/
      var isStype = true;
      jq('.search_type_span').on('click',function(){
        if(isStype){
          jq(this).text('服务');
          jq(this).attr('stype','services');
          isStype = false;
        }else{
          jq(this).text('需求');
          jq(this).attr('stype','assignments');
          isStype = true;
        }

      });

      /*搜索按钮被点击*/
      var oForm =  document.getElementsByTagName("form")[0];
      oForm.onsubmit = function(){
        var s_type = jq('.search_type_span').attr('stype');
        var s_val = jq('#search_input').val();
        /*请求数据*/
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/"+s_type+"/index?keyword=" + s_val,
          "method": "GET",
          "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token,
            "Cache-Control": "no-cache"
          }
        }
        jq.ajax(settings).done(function (rep) {
          if(rep.message === 'success'){
            var data = rep.response.data;
            if(data.length !== 0){
              jq('.search_result_ul').html('');
              for(var i = 0; i < data.length;i++){
                var _li = jq('<li user_name="'+data[i].user.name+'" user_img="'+data[i].user.image+'" user_id="'+data[i].user.id+'" user_order_id="'+data[i].id+'" class="search_result_li"></li>');
                var _li_title = jq('<div class="search_result_li_title">'+data[i].title+'</div>');
                if(s_type === 'services'){
                  _li.on('click',function(){
                    if(jq(this).attr('user_name') !== undefined){
                      api.openWin({
                          name: 'checkServices',
                          slidBackEnabled:false,
                          url: '../html/checkServices.html',
                          reload:true,
                          pageParam: {
                              oeder_id:jq(this).attr('user_order_id'),
                              user_id:jq(this).attr('user_id'),
                              user_img:jq(this).attr('user_img'),
                              user_name:jq(this).attr('user_name')
                          }
                      });
                    }
                  });
                }
                if(s_type === 'assignments'){
                  _li.on('click',function(){
                    if(jq(this).attr('user_name') !== undefined){
                      api.openWin({
                          name: 'checkTask',
                          slidBackEnabled:false,
                          url: '../html/checkTask.html',
                          reload:true,
                          pageParam: {
                              oeder_id:jq(this).attr('user_order_id'),
                              user_id:jq(this).attr('user_id'),
                              user_img:jq(this).attr('user_img'),
                              user_name:jq(this).attr('user_name')
                          }
                      });
                    }
                  });
                }

                var _txt = data[i].introduction;
                if(_txt === null){
                  var _li_content = jq('<div class="search_result_li_content">没有书写详细说明...</div>');
                }else{
                  if(_txt.length > 30){
                    var _li_content = jq('<div class="search_result_li_content">'+_txt.slice()+'...</div>');
                  }else{
                    var _li_content = jq('<div class="search_result_li_content">'+_txt+'</div>');
                  }
                }




                var _li_state = jq('<div class="search_result_li_state"></div>');
                var _li_state_info = jq('<div class="search_result_li_user_info"></div>');
                var _li_state_info_img = jq('<img info_id="'+data[i].user.id+'" src="http://47.104.73.41'+data[i].user.image+'" />');
                _li_state_info_img.on('click',function(e){
                  e.stopPropagation();
                  if(jq(this).attr('info_id') !== undefined){
                    var _id = jq(this).attr('info_id');
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
                var _li_State_info_name = jq('<div class="search_result_li_user_info_name">'+data[i].user.name+'</div>');
                _li_state_info.append(_li_state_info_img);
                _li_state_info.append(_li_State_info_name);


                var _money = data[i].reward;
                if(_money === null){
                  var _li_state_money = jq('<div class="search_result_li_money"></div>');
                }else{
                  var _li_state_money = jq('<div class="search_result_li_money">'+_money+'</div>');
                }


                _li_state.append(_li_state_info);
                _li_state.append(_li_state_money);
                _li.append(_li_title);
                _li.append(_li_content);
                _li.append(_li_state);
                jq('.search_result_ul').append(_li);
              }
            }else{
              jq('.search_result_ul').html('<div class="no_search_msg">未检索到信息呢~~</div>');
            }
          }
        });
        return false;
      };





      /*关闭当前页面*/
      jq('.search_return').on('click',function(){api.closeWin();});
    });
}
function getScrollTop(){
    var scrollTop=0;
    if(document.documentElement&&document.documentElement.scrollTop){
        scrollTop=document.documentElement.scrollTop;
    }else if(document.body){
        scrollTop=document.body.scrollTop;
    }
    return scrollTop;
}
