apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var toast = new auiToast({});

  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  //取用户自己的头像
  try {var user_msg = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'}));} catch (e) {console.log(JSON.stringify(e));};




  jq(function(){

    jq('.app_tab_page_swiper_li').height(win_height - (100 + jq('.app-order-header').height()));

    //先渲染这些页面
    i_release_entrust(1);
    api.addEventListener({name: 'RefreshOrder'}, function(ret, err){i_accept_entrust(1);});


    /*顶部tab栏实例*/
    (function(){
      var tab_swiper = new Swiper('.app_tab_swiper',{
        slidesPerGroup:1,
        initialSlide :0,
        slidesPerView:3,
        on:{
          click:function(){
            for(var i = 0;i < 3;i++){
              jq('.app_tab_swiper_li' + i).css('color','#333');
            }
            jq('.app_tab_swiper_li' + this.clickedIndex).css('color','#39f');
            app_tab_page.slideTo(this.clickedIndex,300,true);

            /*发布的需求*/
            if(this.activeIndex === 0){
              api.showProgress({
                  title: '加载中...',
                  modal: false
              });
              i_release_entrust(1);
            }
            /*接受的任务*/
            if(this.activeIndex === 1){
              api.showProgress({
                  title: '加载中...',
                  modal: false
              });
              i_accept_task(1);
            }
            /*完成的任务*/
            if(this.activeIndex === 2){
              i_complete_task();
            }
          }
        }
      });


      /*实例化tab页*/
      var app_tab_page = new Swiper('.app_tab_page_swiper',{
        slidesPerGroup:1,
        initialSlide :0,
        slidesPerView:1,
        on:{
          slideChangeTransitionEnd:function(){
            for(var i = 0;i < 3;i++){
              jq('.app_tab_swiper_li' + i).css('color','#333');
            }
            jq('.app_tab_swiper_li' + this.activeIndex).css('color','#39f');

            tab_swiper.slideTo(this.activeIndex,300,true);

            /*发布的需求*/
            if(this.activeIndex === 0){
              api.showProgress({
                  title: '加载中...',
                  modal: false
              });
              i_release_entrust(1);
            }
            /*接受的任务*/
            if(this.activeIndex === 1){
              api.showProgress({
                  title: '加载中...',
                  modal: false
              });
              i_accept_task(1);
            }
            /*完成的任务*/
            if(this.activeIndex === 2){
              i_complete_task();
            }
          }
        }
      });

    })();




    /******发布的需求******/
    var i_release_entrust_page_url = '';
    function i_release_entrust(state){

      //请求数据
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/assignments?page=1",
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
            jq('#app_tab_page_swiper_li0_node').html('');
            var __user_img_url = '';
            if(user_msg.user_img_url === null || user_msg.user_img_url === undefined){
              __user_img_url = '../image/icon/noimage.png';
            }else{
              __user_img_url = 'http://47.104.73.41' + user_msg.user_img_url;
            }
            for (var i = 0; i < data.length; i++) {
              var html_str = '<div id="'+data[i].id+'" jump_type="assignments" class="data_list_li_container">'+
                '<div class="data_list_li_img"><img info_id="'+data[i].user_id+'" src="'+__user_img_url+'"></div>'+
                '<div id="'+data[i].id+'" jump_type="assignments" class="data_list_li_title">'+data[i].title+'</div>'+
                '<div class="data_list_li_state">'+
                  '<span class="data_list_li_state_span">'+data[i].status+'</span>'+
                '</div>'+
              '</div>';
              jq('#app_tab_page_swiper_li0_node').prepend(html_str);
            }


            api.hideProgress();
            i_release_entrust_page_url = rep.response.next_page_url;

          }else{
            jq('#app_tab_page_swiper_li0_node').html('<div class="no_information">暂无信息!</div>');
            api.hideProgress();
          }



        }

      });
    }
    function i_release_entrust_page(){
      var xhr_url = '';
      if(i_release_entrust_page_url === null){toast.hide();return;}else{
        xhr_url = i_release_entrust_page_url;
      }

      //请求数据
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": xhr_url,
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
            var __user_img_url = '';
            if(user_msg.user_img_url === null || user_msg.user_img_url === undefined){
              __user_img_url = '../image/icon/noimage.png';
            }else{
              __user_img_url = 'http://47.104.73.41' + user_msg.user_img_url;
            }
            for (var i = 0; i < data.length; i++) {
              var html_str = '<div id="'+data[i].id+'" jump_type="assignments" class="data_list_li_container">'+
                '<div class="data_list_li_img"><img info_id="'+data[i].user_id+'" src="'+__user_img_url+'"></div>'+
                '<div id="'+data[i].id+'" jump_type="assignments" class="data_list_li_title">'+data[i].title+'</div>'+
                '<div class="data_list_li_state">'+
                  '<span class="data_list_li_state_span">'+data[i].status+'</span>'+
                '</div>'+
              '</div>';

              jq('#app_tab_page_swiper_li0_node').append(html_str);
            }

            api.hideProgress();
            i_release_entrust_page_url = rep.response.next_page_url;
            toast.hide();
          }else{
            jq('#app_tab_page_swiper_li0_node').html('<div class="no_information">暂无信息!</div>');
            api.hideProgress();
          }

        }

      });
    }
    /*点击查看详情跳转*/
    (function(){
      jq('#app_tab_page_swiper_li0_node').on('click',function(e){
        var jump_type = jq(e.target).attr('jump_type');
        if(jump_type !== undefined){

          var select_id = e.target.id;
          var select_type = jump_type;
          api.openWin({
              name: 'orderEntrustDetails',
              slidBackEnabled:false,
              url: '../html/orderEntrustDetails.html',
              pageParam: {
                  id:select_id,
                  type:select_type
              }
          });

        }
        var _id = jq(e.target).attr('info_id');
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
    })();

    /******接受的任务******/
    var i_accept_task_page_url = '';
    function i_accept_task(state){
      /*请求数据*/
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/accepted_assignments?page=1",
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
          if(data.length === 0){
            jq('#app_tab_page_swiper_li1_node').html('<div class="no_information">暂无信息!</div>');
            api.hideProgress();
          }else{
            jq('#app_tab_page_swiper_li1_node').html('');
            for(var i = 0; i < data.length;i++){
              var _user_img_url = '';
              if(data[i].assign_user === null || data[i].assign_user.image === null){_user_img_url = '../image/icon/noimage.png'}else{
                _user_img_url = 'http://47.104.73.41' + data[i].assign_user.image;
              }
              var html_str = '<div status="'+data[i].status+'" adapted_assignment_id="'+data[i].id+'" id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_container">'+
                '<div status="'+data[i].status+'" adapted_assignment_id="'+data[i].id+'" class="data_list_li_img"><img info_id="'+data[i].assignment.user_id+'" src="'+_user_img_url+'"></div>'+
                '<div status="'+data[i].status+'" adapted_assignment_id="'+data[i].id+'" id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_title">'+data[i].assignment.title+'</div>'+
                '<div class="data_list_li_state">'+
                  '<span class="data_list_li_state_span">'+data[i].status+'</span>'+
                '</div>'+
              '</div>';

              jq('#app_tab_page_swiper_li1_node').append(html_str);
            }
            i_accept_task_page_url = rep.response.next_page_url;

            api.hideProgress();
          }
        }
      });
    }
    function i_accept_task_page(state){
      var xhr_url = '';
      if(i_accept_task_page_url === null){toast.hide();return;}else{
        xhr_url = i_accept_task_page_url;
      }
      /*请求数据*/
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": xhr_url,
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
          if(data.length === 0){
            jq('#app_tab_page_swiper_li1_node').html('<div class="no_information">暂无信息!</div>');
            api.hideProgress();
          }else{

            for(var i = 0; i < data.length;i++){
              var _user_img_url = '';
              if(data[i].assign_user === null || data[i].assign_user.image === null){_user_img_url = '../image/icon/noimage.png'}else{
                _user_img_url = 'http://47.104.73.41' + data[i].assign_user.image;
              }
              var html_str = '<div status="'+data[i].status+'" adapted_assignment_id="'+data[i].id+'" id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_container">'+
                '<div status="'+data[i].status+'" adapted_assignment_id="'+data[i].id+'" class="data_list_li_img"><img info_id="'+data[i].assignment.user_id+'" src="'+_user_img_url+'"></div>'+
                '<div status="'+data[i].status+'" adapted_assignment_id="'+data[i].id+'" id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_title">'+data[i].assignment.title+'</div>'+
                '<div class="data_list_li_state">'+
                  '<span class="data_list_li_state_span">'+data[i].status+'</span>'+
                '</div>'+
              '</div>';

              jq('#app_tab_page_swiper_li1_node').append(html_str);
            }
            i_accept_task_page_url = rep.response.next_page_url;
            toast.hide();
            api.hideProgress();
          }
        }
      });
    }
    /*点击查看详情跳转*/
    (function(){
      jq('#app_tab_page_swiper_li1_node').on('click',function(e){
        if(jq(e.target).attr('jump_type') !== undefined){

          var select_id = e.target.id;
          var adapted_assignment_id = jq(e.target).attr('adapted_assignment_id');

          var select_type = jq(e.target).attr('jump_type');

          var __status = jq(e.target).attr('status');

          api.openWin({
              name: 'orderAcceptDetails',
              slidBackEnabled:false,
              url: '../html/orderAcceptDetails.html',
              pageParam: {
                  id:select_id,
                  adapted_assignment_id:adapted_assignment_id,
                  type:select_type,
                  status:__status
              }
          });

        }

        var _id = jq(e.target).attr('info_id');
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
    })();

    /******完成的任务*******/
    var i_complete_task_page_url = '';
    function i_complete_task(){

      //请求数据
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/accepted_assignments?status=6&page=1",
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
          if(data.length === 0){
            jq('#app_tab_page_swiper_li2_node').html('<div class="no_information">暂无信息!</div>');
          }else{

            jq('#app_tab_page_swiper_li2_node').html('');
            for(var i = 0; i< data.length;i++){
              var _user_img_url = '';
              if(data[i].assign_user === null || data[i].assign_user.imag === null){_user_img_url = '../image/icon/noimage.png'}else{
                _user_img_url = 'http://47.104.73.41' + data[i].assign_user.image;
              }
              var html_str = '<div id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_container">'+
                '<div class="data_list_li_img"><img info_id="'+data[i].assignment.user_id+'" src="'+_user_img_url+'"></div>'+
                '<div id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_title">'+data[i].assignment.title+'</div>'+
              '</div>';

              jq('#app_tab_page_swiper_li2_node').prepend(html_str);
            }
            i_complete_task_page_url = rep.response.next_page_url;
            api.hideProgress();

          }
        }
      });
    }
    function i_complete_task_page(){
      var xhr_url = '';
      if(i_complete_task_page_url === null){toast.hide();return;}else{
        xhr_url = i_complete_task_page_url;
      }
      //请求数据
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": xhr_url,
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
          if(data.length === 0){
            jq('#app_tab_page_swiper_li2_node').html('<div class="no_information">暂无信息!</div>');
          }else{

            for(var i = 0; i< data.length;i++){
              var _user_img_url = '';
              if(data[i].assign_user === null || data[i].assign_user.image === null){_user_img_url = '../image/icon/noimage.png'}else{
                _user_img_url = 'http://47.104.73.41' + data[i].assign_user.image
              }
              var html_str = '<div id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_container">'+
                '<div class="data_list_li_img"><img info_id="'+data[i].assignment.user_id+'" src="'+_user_img_url+'"></div>'+
                '<div id="'+data[i].assignment.id+'" jump_type="assignments" class="data_list_li_title">'+data[i].assignment.title+'</div>'+
              '</div>';

              jq('#app_tab_page_swiper_li2_node').append(html_str);
            }
            i_complete_task_page_url = rep.response.next_page_url;
            toast.hide();

          }
        }
      });
    }
    /*完成的任务查看详情点击事件*/
    (function(){
      jq('#app_tab_page_swiper_li2_node').on('click',function(e){
        if(jq(e.target).attr('jump_type') !== undefined){

          var select_id = e.target.id;
          var select_type = jq(e.target).attr('jump_type');
          console.log(select_type);
          api.openWin({
              name: 'orderEntrustDetails',
              slidBackEnabled:false,
              url: '../html/orderEntrustDetails.html',
              pageParam: {
                  id:select_id,
                  type:select_type
              }
          });

        }

        var _id = jq(e.target).attr('info_id');
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
    })();

    api.addEventListener({
        name: 'run_i_accept_task'
    }, function(ret, err){
        if( ret ){
             i_accept_task();
             console.log('订单列表刷新');
        }else{
             alert( JSON.stringify( err ) );
        }
    });


    /*上拉加载*/
    jq('.app_tab_page_swiper_li0').scroll(function(){//scroll

      var node_top = jq('#app_tab_page_swiper_li0_node').children(':last-child').offset().top;
      var node_heihgt = jq('#app_tab_page_swiper_li0_node').children(':last-child').height();
      var cankaozhi = node_top + node_heihgt;

      if(cankaozhi <= win_height){
        toast.loading({title:"加载中",duration:4000});
        i_release_entrust_page();
      }
    });
    jq('.app_tab_page_swiper_li1').scroll(function(){//scroll

      var node_top = jq('#app_tab_page_swiper_li1_node').children(':last-child').offset().top;
      var node_heihgt = jq('#app_tab_page_swiper_li1_node').children(':last-child').height();
      var cankaozhi = node_top + node_heihgt;

      if(cankaozhi <= win_height){
        toast.loading({title:"加载中",duration:4000});
        i_accept_task_page();
      }
    });
    jq('.app_tab_page_swiper_li2').scroll(function(){//scroll

      var node_top = jq('#app_tab_page_swiper_li2_node').children(':last-child').offset().top;
      var node_heihgt = jq('#app_tab_page_swiper_li2_node').children(':last-child').height();
      var cankaozhi = node_top + node_heihgt;

      if(cankaozhi <= win_height){
        toast.loading({title:"加载中",duration:4000});
        i_complete_task_page();
      }
    });









  });
}
