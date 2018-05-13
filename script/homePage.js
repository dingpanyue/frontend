apiready = function(){
    var connectionType = api.connectionType;//unknown 未知  none 无网络
    var glbWidth = api.winHeight;
    var jq=jQuery.noConflict();
    var map = api.require("aMap");
    /*设置全局用户信息缓存数据，仅每次打开应用有效*/
    var user_data = setLocalMsg('user_data',{});
    var province = '';
    jq('.refresh_this_page').css('display','block');
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

    //取缓存
    try {var token = JSON.parse(api.getPrefs({sync: true,key: 'user_login_status'})).access_token;} catch (e) {console.log(JSON.stringify(e));};

    jq(function(){
      if(connectionType === 'none'){
        jq('body').html('<div style="width:100%;height:500px;text-align: center;line-height: 500px;font-size:16px;color:#ccc;">当前未允许应用联网，请允许权限后重新打开应用！</div>');
      }else{
        api.addEventListener({
            name: 'NoneNetwork'
        }, function(ret, err){
            if( ret ){
              api.alert({title: '网络',msg: '请点击右下角刷新！',}, function(ret, err) {});
              jq('.refresh_this_page').css('display','block');
            }
        });

        jq('#sideBar_left_container').height(glbWidth - 220);
        jq('#sideBar_right_container').height(glbWidth - 220);
        jq('.refresh_this_page').on('click',function(){window.location.reload();});
        /*新消息的标志*/
        api.addEventListener({
            name: 'appMyNewsInformationBadge'
        }, function(ret, err){
            if( ret ){
                 jq('#appMyNewsInformationBadge').css('opacity','1');
            }else{
                 console.log( JSON.stringify( err + 'asd') );
            }
        });

        /*定位*/
        var location_inf = new Object();
        //定位功能
        var Province_Id = '';
        var city_Id = '';
        var area_Id = '';
        //获取省ID
        function getProvinceId(str){
          for(key in province){
            if(province[key] === str){
              return key;
            }
          }
        }
        (function(){
          map.open({
              rect: {x: 0,y: 0,w: 0,h: 0},
              showUserLocation: true,
              zoomLevel: 11,
              fixedOn: api.frameName,
              fixed: false
          }, function(ret, err) {
              if (ret.status) {
                /*开启定位*/
                map.getLocation({
                    accuracy: '100m',
                    autoStop: true,
                    filter: 5
                }, function(ret, err){

                    if(ret.status){

                        var Lon = ret.lon;//怕出错，先将经纬度取出来，省的到时候分不清ret是谁的
                        var Lat = ret.lat;

                        //向后台传递经纬度
                        senServerLocation(Lon,Lat);

                        location_inf.demand_lng = ret.lon;
                        location_inf.demand_lat = ret.lat;
                        map.getNameFromCoords({
                            lon: Lon,
                            lat: Lat
                        },function(ret,err){
                            if(ret.status){

                              //jq('.refresh_this_page').css('display','none');
                              /*更改首页TOPBAR的定位view*/
                              jq('#appUserLocationCity').text(ret.city + ret.district + ret.township);
                              //省份
                              location_inf.demand_province_str = ret.state;

                              //城市
                              location_inf.demand_city_str = ret.city;
                              //地区
                              location_inf.demand_area_str = ret.district;

                              Province_Id = getProvinceId(location_inf.demand_province_str);
                              //省份id
                              location_inf.demand_province_id = Province_Id;
                              api.ajax({
                                  url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/regions/'+Province_Id+'/cities',
                                  method: 'get'
                              },function(ret, err){
                                  if(ret.message === 'success'){
                                    var data = ret.response;
                                    for(key in data){
                                      if(data[key] === location_inf.demand_city_str){
                                        city_Id = key;
                                        //城市id
                                        location_inf.demand_city_id = city_Id;
                                        api.ajax({
                                            url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/regions/'+city_Id+'/areas',
                                            method: 'get'
                                        },function(ret, err){
                                            if (ret) {
                                                if(ret.message === 'success'){
                                                  var data2 = ret.response;
                                                  for(key in data2){
                                                    if(data2[key] === location_inf.demand_area_str){
                                                      area_Id = key;
                                                      //地区
                                                      location_inf.demand_area_id = area_Id;
                                                    }
                                                  }
                                                  if(area_Id === ''){
                                                    for(key in data2){
                                                      if(data2[key] === '市辖区'){
                                                        area_Id = key;
                                                        //地区
                                                        location_inf.demand_area_id = area_Id;
                                                      }
                                                    }
                                                  }

                                                  setLocalMsg('location_inf',location_inf);
                                                  runAreaList(area_Id);
                                                }
                                            } else {
                                                console.log( JSON.stringify( err  + 'asd') );
                                            }
                                        });

                                      }
                                    }
                                  }
                              });
                            }else{
                              console.log(JSON.stringify(err));
                            }
                        });
                    }else{
                        console.log('定位出错：' + err.code);
                        api.alert({title: '问题',msg: '定位失败，请点击右下角刷新！',}, function(ret, err) {});
                        jq('.refresh_this_page').css('display','block');
                    }
                });
              } else {
                  console.log(JSON.stringify(err));
              }
          });
        })();

        /*轮播*/
        (function(){
          var tab_swiper = new Swiper('#app_banner',{
            autoplay: true,
            slidesPerGroup:1,
            loop:true,
            initialSlide :0,
            slidesPerView:1,
            autoplay: {
              delay: 5000
            },
            effect:'flip'
          });
        })();

        //获取所有服务类目并进行缓存
        (function(){
          //请求数据
          api.ajax({
              url: 'http://47.104.73.41/api/mobile-terminal/rest/v1/classifications',
              method: 'get',
              headers:{
                'Content-Type':'application/x-www-form-urlencoded'
              }
          },function(ret, err){
              if (ret) {
                  var data = ret.response;
                  //首页获取类目
                  var cacheData = [];
                  for(var i = 0;i < data.length;i++){
                    var obj = new Object();
                    obj.id = data[i].id;
                    obj.name = data[i].name;
                    obj.alias = data[i].alias;
                    cacheData.push(obj);
                    obj = null;
                  }
                  setLocalMsg('app_serve_category',cacheData);

              }
          });
        })();

        /*首页点击顶部右侧聊天，进入聊天窗口*/
        (function(){
          var app_my_information = document.getElementsByClassName("app-my-information")[0];
          app_my_information.onclick = function(){
              //获取用户缓存，判断是否进入聊天界面，否则去往登录界面
              api.getPrefs({
                  key: 'user_login_status'
              }, function(ret, err){
                  if( ret ){
                       if(ret.value !== ""){
                         jq('#appMyNewsInformationBadge').css('opacity','0');
                         api.openWin({
                             name: 'chatRoom',
                             slidBackEnabled:false,
                             bounces:false,
                             reload:true,
                             url: '../html/chatRoom.html',
                             pageParam: {
                                num:true
                            }
                         });
                       }else{
                         //打开登录页面
                         api.openWin({
                             name: 'signin',
                             slidBackEnabled:false,
                             url: '../html/signin.html'
                         });
                       }
                  }else{
                       console.log("出错了");
                  }
              });
          }
        })();

        /*伪装搜索框点击去往搜索界面*/
        var search_style_bool = false;
        jq('.app_disguise_search').on('click',function(){
          api.openWin({
              name: 'searchPage',//   searchPage evaluationService
              slidBackEnabled:false,
              bounces:false,
              reload:true,
              url: '../html/searchPage.html'
          });

        });
        jq(window).scroll(function() {
            var scrollNum = getScrollTop();
            if(scrollNum >= 20 && search_style_bool === false){
              setSearchStyle();
              search_style_bool = true;
            }
            if(scrollNum <= 20 && search_style_bool){
              recoverySearchStyle();
              search_style_bool = false;
            }
        });

        function setSearchStyle(){
          jq('.app_disguise_search_bg').fadeIn();
          jq('.app_disguise_search').css({
            'top':'15px',
            'z-index':'10000'
          });
        }
        function recoverySearchStyle(){
          jq('.app_disguise_search_bg').fadeOut();
          jq('.app_disguise_search').css({
            'top':'170px',
            'z-index':'10000'
          });
        }


        /*导航的渲染*/
        (function(){
          //请求数据
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/classifications",
            "method": "GET",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              var data = rep.response;
              jq('.lattice_nav_ul').html('');
              for(var i = 0;i < data.length;i++){
                var _li = jq('<li class_id="'+data[i].id+'" class="lattice_nav_ul_li"></li>');
                var _div = jq('<div class_id="'+data[i].id+'" style="background-color:#39f;" class="lattice_nav_ul_li_div">'+data[i].name+'</div>');
                _li.append(_div);
                jq('.lattice_nav_ul').append(_li);
              }
            }else{
              jq('.lattice_nav_ul').html('<div class="page_no_msg">暂无信息!</div>');
            }
          });
        })();


        /*设置最新需求列表*/
        function runAreaList(id){
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/assignments/index?status=1&area_id="+id+"&order_by=created_at&per_page=5",
            "method": "GET",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            }
          }

          jq.ajax(settings).done(function (rep) {
            if(rep.message === 'success'){
              var list = rep.response.data;
              if(list.length === 0){
                jq('.app_new_demand_ul').append('');
                var _div = jq('<div class="city_order_null">您当前所在城市暂无最新订单哦~~</div>');
                jq('.refresh_this_page').css('display','none');
                jq('.app_new_demand_ul').append(_div);
              }else{
                var _div = jq('<div></div>');
                for(var i = 0;i < list.length;i++){
                  var _img_url = '';
                  if(list[i].user.image === null){
                    _img_url = '../image/resource/infobg.png';
                  }else{
                    _img_url = 'http://47.104.73.41' + list[i].user.image;
                  }
                  var _li = '<li user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li">'+
                    '<div user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_header">'+
                      '<span user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_header_span1">下单日期：</span>'+
                      '<span user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_header_span2">'+list[i].updated_at+'</span>'+
                    '</div>'+
                    '<div user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_content">'+
                      '<img info_id="'+list[i].user_id+'" class="app_new_demand_ul_li_content_img" src="'+_img_url+'" />'+
                      '<div user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_content_title">'+list[i].title+'</div>'+
                    '</div>'+
                    '<div user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_footer">'+
                      '<span user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_footer_span1">酬金：</span>'+
                      '<span user_name="'+list[i].user.name+'" user_img="'+list[i].user.image+'" user_id="'+list[i].user_id+'" user_order_id="'+list[i].id+'" is_click="true" class="app_new_demand_ul_li_footer_span2">￥'+list[i].reward+'</span>'+
                    '</div>'+
                  '</li>';

                  jq(_div).append(_li);
                }
                jq('.app_new_demand_ul').append('');
                jq('.app_new_demand_ul').append(_div);
                jq('.refresh_this_page').css('display','none');
              }
            }else{
              console.log('获取最新订单出错：' + JSON.stringify(rep));
              api.alert({title: '订单',msg: '刷新页面获取最新订单~~',}, function(ret, err) {});
              jq('.refresh_this_page').css('display','block');
            }
          });
        }

        /*最新需求点击以后跳转到详情页*/
        jq('.app_new_demand_ul').on({
          click:function(e){
            if(jq(e.target).attr('is_click') !== undefined){
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

            var user_info_id = jq(e.target).attr('info_id');
            if(jq(e.target).attr('info_id') !== undefined){
              api.openWin({
                  name: 'checkUserInfo',
                  slidBackEnabled:false,
                  reload:true,
                  url: '../html/checkUserInfo.html',
                  pageParam: {id:user_info_id}
              });
            }




          }
        });

        /*导航点击事件*/
        jq('.lattice_nav_ul').on('click',function(e){
          var _class_id = jq(e.target).attr('class_id');
          if(_class_id !== undefined || _class_id !== ''){
            api.sendEvent({
                name: 'select_class',
                extra: {
                    select_class_id:_class_id,
                }
            });
            api.setFrameGroupIndex({
                name:'appFrame',
                index:1
            });
          }
        });

        function getScrollTop(){
            var scrollTop=0;
            if(document.documentElement&&document.documentElement.scrollTop){
                scrollTop=document.documentElement.scrollTop;
            }else if(document.body){
                scrollTop=document.body.scrollTop;
            }
            return scrollTop;
        }

        //向后台传递用户经纬度
        function senServerLocation(lng,lat){
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://47.104.73.41/api/mobile-terminal/rest/v1/user/location",
            "method": "POST",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": "Bearer " + token,
              "Cache-Control": "no-cache"
            },"data": {"lng": lng,"lat": lat}
          }

          jq.ajax(settings).done(function (res) {if(res.message === 'success'){}});
        }
      }
    });
};
