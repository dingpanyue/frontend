apiready = function(){
  var win_height = api.winHeight;
  var jq=jQuery.noConflict();
  var map = api.require("aMap");
  var toast = new auiToast({});
  var province = '';
  //取得省市区的ID
  api.ajax({
      url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/regions/provinces',
      method: 'get'
  },function(ret, err){
      if (ret) {
        if(ret.message === 'success'){
          province = ret.response;
        }
      } else {
        console.log( JSON.stringify( err ) );
      }
  });
  //优化点击事件
  api.parseTapmode();
  /*实例化toast组件，全局可用*/
  var toast = new auiToast();

  function strSlice(str){
    var content_reg = /^[\u4e00-\u9fa5A-Za-z0-9\,\，\\\.\。\!\?\-\s]{1,30}$/;
    if(content_reg.test(str)){return str;}else{var _str = str.slice(0,30);return _str;}
  }
  /*定位*/
  var location_inf = new Object();
  //定位功能
  var Province_Id = '';
  var city_Id = '';
  var area_Id_S = '';
  var entrust_next_page_url = '';
  var server_next_page_url = '';
  //获取省ID
  function getProvinceId(str){
    for(key in province){
      if(province[key] === str){
        return key;
      }
    }
  }

  //两个全局变量，是否再次渲染服务和附近
  var isServicesRendering = true;
  var isNearbyRendering = true;
  //取缓存
  try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

  //取定位缓存location_inf
  try {var location_inf = JSON.parse(api.getPrefs({sync: true,key: 'location_inf'}))} catch (e) {console.log(JSON.stringify(e));};




  jq(function(){
    runAllEntrust(location_inf.demand_area_id);
    //设置tab页的高度
    jq('.app_tab_page_swiper_li').height(win_height - (100 + jq('.app-user-nearby').height()));

    //委托查看详情事件委托
    (function(){
      //委托子页的事件委托
      jq('#app_tab_page_swiper_li0_node').on({
        click:function(e){
          if(jq(e.target).attr('user_order_id') !== undefined){
            api.openWin({
                name: 'checkTask',
                slidBackEnabled:false,
                url: '../html/checkTask.html',
                reload:true,
                pageParam: {
                    oeder_id:jq(e.target).attr('user_order_id'),
                    user_id:jq(e.target).attr('user_id'),
                    user_img:jq(e.target).attr('user_img'),
                    user_name:jq(e.target).attr('user_name')
                }
            });

          }
        }
      });




    })();


    //服务查看详情事件委托
    (function(){
      //服务子页的事件委托
      jq('#app_tab_page_swiper_li1_node').on({
        'click':function(e){
          if(jq(e.target).attr('service_order_id') !== undefined){
            api.openWin({
                name: 'checkServices',
                slidBackEnabled:false,
                url: '../html/checkServices.html',
                reload:true,
                pageParam: {
                    oeder_id:jq(e.target).attr('service_order_id'),
                    user_id:jq(e.target).attr('user_id'),
                    user_img:jq(e.target).attr('user_img'),
                    user_name:jq(e.target).attr('user_name')
                }
            });

          }
        }
      });




    })();

    //附近的委托查看详情事件委托
    (function(){
      jq('#app_tab_page_swiper_li2_node').on('click',function(e){
        if(jq(e.target).attr('user_order_id') !== undefined){

          api.openWin({
              name: 'checkTask',
              slidBackEnabled:false,
              url: '../html/checkTask.html',
              reload:true,
              pageParam: {
                  oeder_id:jq(e.target).attr('user_order_id'),
                  user_id:jq(e.target).attr('user_id'),
                  user_img:jq(e.target).attr('user_img'),
                  user_name:jq(e.target).attr('user_name')
              }
          });

        }
      });
    })();

    //附近的服务查看详情事件委托
    (function(){
      //委托子页的事件委托
      jq('#app_tab_page_swiper_li2_node').on({
        click:function(e){
          if(jq(e.target).attr('service_order_id') !== undefined){
            api.openWin({
                name: 'checkServices',
                slidBackEnabled:false,
                url: '../html/checkServices.html',
                reload:true,
                pageParam: {
                    oeder_id:jq(e.target).attr('service_order_id'),
                    user_id:jq(e.target).attr('user_id'),
                    user_img:jq(e.target).attr('user_img'),
                    user_name:jq(e.target).attr('user_name')
                }
            });

          }
        }
      });
    })();

    //点击头像查看用户信息点击事件
    (function(){
      jq('.app_tab_page').on('click',function(e){
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

    /*开启定位*/
    (function(){

      map.open({
        rect: {x: 0,y: 0,w: 0,h: 0},
        showUserLocation: true,
        zoomLevel: 11,
        fixedOn: api.frameName,
        fixed: false
      }, function(ret, err) {
          if (ret.status) {
            map.getLocation({
                accuracy: '100m',
                autoStop: true,
                filter: 5
            }, function(ret, err){
                if(ret.status){
                    var Lon = ret.lon;//怕出错，先将经纬度取出来，省的到时候分不清ret是谁的
                    var Lat = ret.lat;
                    location_inf.demand_lng = ret.lon;
                    location_inf.demand_lat = ret.lat;
                    map.getNameFromCoords({
                        lon: Lon,
                        lat: Lat
                    },function(ret,err){
                        if(ret.status){

                          //省份
                          location_inf.demand_province_id = ret.province;
                          //城市
                          location_inf.demand_city_id = ret.city;
                          //地区
                          location_inf.demand_area_id = ret.district;

                          Province_Id = getProvinceId(location_inf.demand_province_id)
                          api.ajax({
                              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/regions/'+Province_Id+'/cities',
                              method: 'get'
                          },function(ret, err){
                              if (ret) {
                                  if(ret.message === 'success'){
                                    var data = ret.response;
                                    for(key in data){
                                      if(data[key] === location_inf.demand_city_id){
                                        city_Id = key;

                                        api.ajax({
                                            url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/regions/'+city_Id+'/areas',
                                            method: 'get'
                                        },function(ret, err){
                                            if (ret) {
                                                if(ret.message === 'success'){
                                                  var data2 = ret.response;
                                                  for(key in data2){
                                                    if(data2[key] === location_inf.demand_area_id){
                                                      area_Id = key;
                                                    }
                                                  }
                                                  if(area_Id === ''){
                                                    for(key in data2){
                                                      if(data2[key] === '市辖区'){
                                                        area_Id = key;
                                                      }
                                                    }
                                                  }

                                                  runAllEntrust(area_Id);
                                                }
                                            } else {
                                                console.log( JSON.stringify( err ) );
                                            }
                                        });

                                      }
                                    }
                                  }
                              } else {
                                  console.log( JSON.stringify( err ) );
                              }
                          });
                        }
                    });
                }else{
                    console.log(err.code);
                }
            });

          } else {
              console.log(JSON.stringify(err));
          }
      });
    })();

    /*顶部tab栏实例*/
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
          if(this.activeIndex === 0 && isServicesRendering){
            api.showProgress({title: '加载中...',modal: false});
            runAllEntrust(area_Id_S);
          }
          if(this.activeIndex === 1 && isServicesRendering){
            api.showProgress({title: '加载中...',modal: false});
            servicesRendering();
          }
          if(this.activeIndex === 2 && isNearbyRendering){
            api.showProgress({
                title: '加载中...',
                modal: false
            });
            nearbyRendering(1,'assignments');
            isNearbyRendering = false;
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

        }
      }
    });

    /*AUI的tab切换，主要是附近里面的服务和委托的切换*/
    (function(){
      var tab = new auiTab({
          element:document.getElementById("nearby_tab"),
          index:1,
          repeatClick:false
      },function(ret){
        var index = ret.index;
        api.sendEvent({
          name: 'nearby_tab_switch',
          extra: {
              index:index
          }
        });

      });
    })();

    //全部委托的渲染
    function runAllEntrust(area_Id){
      var area_Id_view = area_Id;
      if(area_Id_view === undefined || area_Id_view === ''){
        area_Id_view = '';
      }else{
        area_Id_view = '&area_id=' + area_Id_view;
        area_Id_S = area_Id;
      }

      var xhr_url = "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/index?status=1" + area_Id_view + "&page=1";

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

      jq.ajax(settings).done(function (req){
        if(req.message === 'success'){
          var data = req.response.data;
          jq('#app_tab_page_swiper_li0_node').html('');
          if(data === '' || data.length === 0){
            jq('#app_tab_page_swiper_li0_node').html('<div class="app_inf_null">暂无信息</div>');
            api.hideProgress();
          }else{
            //循环追加的HTML字符串
            for(var i = 0;i < data.length;i++){
              var user_img = '';
              if(data[i].user === null || data[i].user.image === null){
                user_img = '../image/icon/noimage.png';
              }else{
                user_img = 'http://47.104.73.41' + data[i].user.image;
              }
              var html_str = '<div class="list_li">'+
                '<img info_id="'+data[i].user.id+'" class="list_left_img" src="'+user_img+'" />'+
                '<div user_name="'+data[i].user.name+'" user_img="'+user_img+'" user_id="'+data[i].user.id+'" user_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
                '<div class="list_moner">￥'+data[i].reward+'</div>'+
                '<div class="list_reputation">信誉度:'+data[i].user.user_info.assign_points+'</div>'
              '</div>';

              jq('#app_tab_page_swiper_li0_node').append(html_str);
              api.hideProgress();
              jq('.jiazai_loading').css('display','none');
            }
          }
          entrust_next_page_url = req.response.next_page_url;
        }else{
          jq('#app_tab_page_swiper_li0_node').append('<div>服务器返回错误</div>');
          api.hideProgress();
        }


      });
    }
    //全部委托的分页函数
    function runAllEntrustPaging(){

      var xhr_url = '';
      if(entrust_next_page_url === null){toast.hide();return;}else{
        xhr_url = entrust_next_page_url + '&area_id=' + location_inf.demand_area_id;
      }
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

      jq.ajax(settings).done(function (req){
        if(req.message === 'success'){
          var data = req.response.data;
          if(data === '' || data.length === 0){
            jq('#app_tab_page_swiper_li0_node').html('<div class="app_inf_null">暂无信息</div>');
            api.hideProgress();
          }else{
            //循环追加的HTML字符串
            for(var i = 0;i < data.length;i++){
              var user_img = '';
              if(data[i].user === null || data[i].user.image === null){
                user_img = '../image/icon/noimage.png';
              }else{
                user_img = 'http://47.104.73.41' + data[i].user.image;
              }
              var html_str = '<div class="list_li">'+
                '<img info_id="'+data[i].user.id+'" class="list_left_img" src="'+user_img+'" />'+
                '<div user_name="'+data[i].user.name+'" user_img="'+user_img+'" user_id="'+data[i].user.id+'" user_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
                '<div class="list_moner">￥'+data[i].reward+'</div>'+
                '<div class="list_reputation">信誉度:'+data[i].user.user_info.assign_points+'</div>'
              '</div>';

              jq('#app_tab_page_swiper_li0_node').append(html_str);
              api.hideProgress();
            }
          }
          entrust_next_page_url = req.response.next_page_url;
          toast.hide();
        }else{
          jq('#app_tab_page_swiper_li0_node').append('<div>服务器返回错误</div>');
          api.hideProgress();
        }


      });
    }

    //服务的渲染
    function servicesRendering(){
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/services/index?page=1",
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (req) {
        if(req.message === 'success'){
          var data = req.response.data;

          //循环追加的HTML字符串
          for(var i = 0;i < data.length;i++){
            var user_img = '';
            if(data[i].user === null || data[i].user.image === null){
              user_img = '../image/icon/noimage.png';
            }else{
              user_img = 'http://47.104.73.41' + data[i].user.image;
            }
            var html_str = '<div class="list_li_service">'+
              '<img info_id="'+data[i].user_id+'" class="list_left_img" src="'+user_img+'" />'+
              '<div user_name="'+data[i].user.name+'" user_img="'+user_img+'" user_id="'+data[i].user_id+'" service_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
            '</div>';

            jq('#app_tab_page_swiper_li1_node').append(html_str);
            isServicesRendering = false;
            api.hideProgress();
          }
          server_next_page_url = req.response.next_page_url;
        }else{
          jq('#app_tab_page_swiper_li1_node').append('<div>服务器返回错误</div>');
          api.hideProgress();
        }
      });
    }
    //服务的分页函数
    function servicesRenderingPaging(){
      var xhr_url = '';
      if(server_next_page_url === null){toast.hide();return;}else{
        xhr_url = server_next_page_url;
      }
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

      jq.ajax(settings).done(function (req) {
        if(req.message === 'success'){
          var data = req.response.data;

          //循环追加的HTML字符串
          for(var i = 0;i < data.length;i++){
            var user_img = '';
            if(data[i].user === null || data[i].user.image === null){
              user_img = '../image/icon/noimage.png';
            }else{
              user_img = 'http://47.104.73.41' + data[i].user.image;
            }
            var html_str = '<div class="list_li_service">'+
              '<img info_id="'+data[i].user_id+'" class="list_left_img" src="'+user_img+'" />'+
              '<div user_name="'+data[i].user.name+'" user_img="'+user_img+'" user_id="'+data[i].user_id+'" service_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
            '</div>';

            jq('#app_tab_page_swiper_li1_node').append(html_str);

            api.hideProgress();
          }
          toast.hide();
          server_next_page_url = req.response.next_page_url;
        }else{
          jq('#app_tab_page_swiper_li1_node').append('<div>服务器返回错误</div>');
          api.hideProgress();
        }
      });
    }

    //附近的渲染
    function nearbyRendering(index,type){
      if(index === undefined){
        index = 1;
      }
      //开始定位，定位成功之后再去渲染视图
      map.getLocation({
          accuracy: '100m',
          autoStop: true,
          filter: 1
      }, function(ret, err) {
          if (ret.status) {
            var bMap_lon = ret.lon;
            var bMap_lat = ret.lat;
            //定位成功了之后取请求数据
            //这个是请求数据的函数，他接收三个参数经纬度和token，并且他还会渲染视图
            runList(bMap_lon,bMap_lat,token,index,type);
          } else {
            jq('#app_tab_page_swiper_li2_node').append('<div class="location_err">定位失败，请确认开启了GPS/定位权限，之后尝试重新打开应用!</div>');
          }
      });
    }

    //请求附近的商品数据
    function runList(lon,lat,token,index,type){
      api.ajax({
          url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/'+type+'/index?near_by=true&lat='+lat+'&lng='+lon,
          method: 'get',
          headers:{
            "Authorization":"Bearer " + token
          }
      },function(ret, err){
          if (ret) {
              if(ret.message === 'success'){

                var data = ret.response;

                if(data.length === undefined){
                  getIdDom('app_tab_page_swiper_li2_node').innerHTML = '<div class="app_inf_null">附近没有人发布过信息呢~ (!_!)</div>';
                  api.hideProgress();
                }
                if(data.length !== 0){

                  //为1渲染委托
                  if(parseFloat(index) === 1){

                    var div = jq('<div></div>');
                    for(var i = 0; i < data.length;i++){

                      var content = data[i].introduction;
                      if(content === null){
                        content = '委托方为书写详细的说明!';
                      }else{
                        content = strSlice(content);
                      }

                      var num = data[i].distance;
                      if(num < 0){num = num.replace(/(^[0][\.]\d{2})/,'');}else{num = num.toFixed(2);}
                      var user_img_url = '';
                      if(data[i].user.image === null){user_img_url = '../image/icon/noimage.png';}else{user_img_url = 'http://47.104.73.41' + data[i].user.image}
                      var html_str = '<div class="list_li">'+
                        '<img info_id="'+data[i].user_id+'" class="list_left_img" src="'+user_img_url+'" />'+
                        '<div user_name="'+data[i].user.name+'" user_img="'+data[i].user.image+'" user_id="'+data[i].user_id+'" user_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
                        '<div class="list_moner">￥'+data[i].reward+'</div>'+
                        '<div class="list_reputation">信誉度:'+data[i].user.user_info.assign_points+'</div>'+
                      '</div>';

                      div.append(html_str);

                    }

                    jq('#app_tab_page_swiper_li2_node').html(div);
                    api.hideProgress();
                  }

                  //为2渲染服务
                  if(parseFloat(index) === 2){
                    //getIdDom('app_tab_page_swiper_li2_node').innerHTML = '<div class="app_inf_null">附近没有人发布过信息呢~ (!_!)</div>';

                    if(data.length === undefined){
                      api.hideProgress();
                      getIdDom('app_tab_page_swiper_li2_node').innerHTML = '<div class="app_inf_null">附近没有人发布过信息呢~ (!_!)</div>';
                    }else{
                      var div = jq('<div></div>');
                      for(var i = 0; i < data.length;i++){
                        var server_user_img_url = '';
                        if(data[i].user.image === null){server_user_img_url = '../image/icon/noimage.png';}else{server_user_img_url = 'http://47.104.73.41' + data[i].user.image}
                        var html_str = '<div class="list_li_service">'+
                          '<img info_id="'+data[i].user_id+'" class="list_left_img" src="'+server_user_img_url+'" />'+
                          '<div user_name="'+data[i].user.name+'" user_img="'+data[i].user.image+'" user_id="'+data[i].user_id+'" service_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
                        '</div>';

                        div.append(html_str);

                      }

                      jq('#app_tab_page_swiper_li2_node').html(div);
                      api.hideProgress();
                    }
                  }


                }
              }else{
                console.log('请求列表数据出错，服务器出错');
              }
          } else {
              console.log('请求附近列表出错');
          }
      });

    }

    //监听附近的点击事件，调用runList函数
    api.addEventListener({
        name: 'nearby_tab_switch'
    }, function(ret, err) {
        var data = ret.value;
        var index = data.index;
        // console.log(data.index);
        // runList(bMap_lon,bMap_lat,token,index);
        if(parseFloat(index) === 1){
          api.showProgress({
              title: '加载中...',
              modal: false
          });
          nearbyRendering(index,'assignments');
        }
        if(parseFloat(index) === 2){
          api.showProgress({
              title: '加载中...',
              modal: false
          });
          nearbyRendering(index,'services');
        }

    });

    //监听homePage页面的分类点击事件，渲染委托列表
    function runAllEntrust2(area_Id){
      var area_Id_view = area_Id;
      if(area_Id_view === undefined || area_Id_view === ''){
        area_Id_view = '';
      }else{
        area_Id_view = '&classification=' + area_Id_view;
      }



      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/index?status=1" + area_Id_view,
        "method": "GET",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Bearer " + token,
          "Cache-Control": "no-cache"
        }
      }

      jq.ajax(settings).done(function (req){
        if(req.message === 'success'){
          var data = req.response.data;
          jq('#app_tab_page_swiper_li0_node').html('');
          if(data === '' || data.length === 0){
            jq('#app_tab_page_swiper_li0_node').html('<div class="app_inf_null">暂无信息</div>');
            api.hideProgress();
          }else{
            //循环追加的HTML字符串
            for(var i = 0;i < data.length;i++){
              var user_img = '';
              if(data[i].user === null || data[i].user.image === null){
                user_img = '../image/icon/noimage.png';
              }else{
                user_img = 'http://47.104.73.41' + data[i].user.image;
              }
              var html_str = '<div class="list_li">'+
                '<img info_id="'+data[i].user.id+'" class="list_left_img" src="'+user_img+'" />'+
                '<div user_name="'+data[i].user.name+'" user_img="'+user_img+'" user_id="'+data[i].user.id+'" user_order_id="'+data[i].id+'" class="list_right_title">'+data[i].title+'</div>'+
                '<div class="list_moner">￥'+data[i].reward+'</div>'+
                '<div class="list_reputation">信誉度:'+data[i].user.user_info.assign_points+'</div>'
              '</div>';

              jq('#app_tab_page_swiper_li0_node').append(html_str);
              api.hideProgress();
            }
          }
        }else{
          jq('#app_tab_page_swiper_li0_node').append('<div>服务器返回错误</div>');
          api.hideProgress();
        }


      });
    }

    api.addEventListener({
        name: 'select_class'
    }, function(ret, err){
        if( ret ){
             var select_id = ret.value.select_class_id;
             api.showProgress({
                 title: '加载中...',
                 modal: false
             });
             tab_swiper.slideTo(0,300,true);
             app_tab_page.slideTo(0,300,true);
             runAllEntrust2(select_id);
        }else{
             console.log( JSON.stringify( err ) );
        }
    });
    /*上拉加载*/
    jq('.app_tab_page_swiper_li0').scroll(function(){//scroll

      var node_top = jq('#app_tab_page_swiper_li0_node').children(':last-child').offset().top;
      var node_heihgt = jq('#app_tab_page_swiper_li0_node').children(':last-child').height();
      var cankaozhi = node_top + node_heihgt;

      if(cankaozhi <= win_height){
        toast.loading({title:"加载中",duration:4000});
        runAllEntrustPaging();
      }
    });

    jq('.app_tab_page_swiper_li1').scroll(function(){//scroll

      var node_top = jq('#app_tab_page_swiper_li1_node').children(':last-child').offset().top;
      var node_heihgt = jq('#app_tab_page_swiper_li1_node').children(':last-child').height();
      var cankaozhi = node_top + node_heihgt;

      if(cankaozhi <= win_height){
        toast.loading({title:"加载中",duration:4000});
        servicesRenderingPaging();
      }
    });




  });
}
