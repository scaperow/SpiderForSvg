// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://www.iconfont.cn/collections/detail?*
// @match        *://www.iconfont.cn/search/index?*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdn.bootcss.com/axios/0.19.0-beta.1/axios.js
// @require      https://cdn.bootcss.com/pure.js/2.83/pure.min.js
// @require      https://npmcdn.com/parse@2.4.0/dist/parse.js
// @resource     css  https://unpkg.com/purecss@1.0.0/build/pure-min.css
// @run-at document-idle
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

;(function () {
    const css = GM_getResourceText ("css");
    GM_addStyle (css);
    GM_addStyle(`
.svg-check.select{
background:whitesmoke;
border-radius:12px;
}
`)


    Parse.initialize("scaperow", "javascript");
    Parse.serverURL = 'http://localhost:5000/api';

    let selectSvgs = [];
    const ShapeClass = Parse.Object.extend("shape");

    const findHighestZIndex = function()
    {
        return Math.max.apply(null,$.map($('body *'), function(e,n) {
            if ($(e).css('position') != 'static')
                return parseInt($(e).css('z-index')) || 1;
        }));
    }

    const makeCreateForm = function(container){
        const form = $(`
<form class="pure-form" id="svgSpiderAddForm" style="padding:12px">
    <fieldset>
        <legend>Fill property to Add</legend>

        <input type="text" name="category" placeholder="Category" required>
        <input type="text" name="tag" placeholder="Tag">

    </fieldset>
<button type="submit" class="pure-button pure-button-primary">Save</button>
</form>
`)




        container.html('');
        form.appendTo(container);

        form.submit(async (e)=>{
             e.preventDefault();

               try{
                   const category = form.find(`[name="category"]`).val();
                   const tag = form.find(`[name="tag"]`).val();
                   selectSvgs.forEach(async span=>{
                       var shape = new ShapeClass();
                       shape.set('category',category);
                       shape.set('tag',tag);
                       shape.set('svgPath',$(span).find('svg path').attr('d'));
                       shape.set('name',$(span).find('.svg-shape-name').val());

                       await shape.save();
                  })

                   alert('success');
               }catch(error){
                    console.error(error);
               }

            return false;

        });
    }

    const makeLoginForm = function(container){
                const form = $(`
<form class="pure-form" id="svgSpiderLoginForm"  style="padding:12px">
    <fieldset>
        <legend>Login</legend>

        <input type="text" name="username" placeholder="User" required>
        <input type="password" name="password" placeholder="Password" required>

    </fieldset>

        <button type="submit" class="pure-button pure-button-primary">Login</button>
</form>

`)

        form.appendTo(container)

        const $svgSpiderLoginForm = $('#svgSpiderLoginForm')
        $svgSpiderLoginForm.submit(async (e)=>{
             e.preventDefault();

            const userName = $svgSpiderLoginForm.find(`[name="username"]`).val();
            const password = $svgSpiderLoginForm.find(`[name="password"]`).val();
            try{
             await Parse.User.logOut();
            const {error} = await Parse.User.logIn(userName,password) ;
              if(error){
                  alert(error);
              }else{
                  alert('Logging success!');
                  makeCreateForm(container);
              }
            }catch({error}){
                alert(error);
            }

            return false;
        });
    }

    const handleSelectSvg = function(event){
        selectSvgs.push(event.delegateTarget);
        onSelectSvgChanges();
    }

    const onSelectSvgChanges = function(){
        $('#svgSpiderSelectNumbers').text(selectSvgs.length);
    }

    const setSvgList = function(list,svgs){
        $(list).html('');
           svgs.each((index,svg)=>{
               let pId = $(svg).attr('p-id');

               if(pId){
                   let iconName= $(svg).closest('li').find('.icon-name').attr('title')
                   $(svg).removeClass('icon');
                   $(svg).attr('style','width:100%;height:100%');


                   var item = $(`<span class="svg-check" p-id="${pId}" icon-name="${iconName}" style="cursor:pointer;width:80px;height:40px;margin-right:12px;margin-bottom:12px;display:inline-block;padding:12px 12px 32px 12px"></span>`);
                   item.append(svg)
                   item.append($(`<center><input class="svg-shape-name" type="text" style="width:100%;" value="${iconName}"></input></center>`))
                   item.appendTo(list)

                   item.click(()=>{
                       if(item.hasClass('select')){
                           item.removeClass('select');
                       }else{
                           item.addClass('select');}


                   });
               }
           })

selectSvgs = [];
        $('.svg-check').off('click',handleSelectSvg);
        $('.svg-check').on('click',handleSelectSvg);
    }

$(function(){

    let toolContainer = $('<div style="width:100%;height:50px;position:absolute;top:80px; left:0;text-align:center" id="svgSpiderTool"></div>');
    toolContainer.appendTo(document.body);


    let checkSvgButton = $('<button  type="button" class="pure-button" id="svgSpiderButton">Check</button>');
    checkSvgButton.appendTo('#svgSpiderTool');

   let sidebar= $(`
<aside style="position:absolute;display:none;left:12px;width:600px;top:12px;padding:12px;z-index:9999999;background:#fff;border-radius:4px; box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19) ;" id="svgSpiderList">
<div id="svgList" style="max-height:500px;overflow-y:auto"></div>
<center>
<div id="svgSpiderListTip">
has Select <label id="svgSpiderSelectNumbers">${selectSvgs.length}</label> items
<button class="pure-button" id="svgSpiderClearButton">Clear</el-button>
</div>
<button class="pure-button pure-button-primary" id="svgSpiderSaveButton">Save Selection</button>
</center>
</aside>`);
    sidebar.appendTo(document.body);

     let svgSpiderRightSider= $(`<aside style="position:absolute;display:none;right:12px;width:300px;top:12px;z-index:9999999;background:#fff;border-radius:4px; box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19) ;" id="svgSpiderRightSider"></aside>`);
        svgSpiderRightSider.appendTo(document.body);

    $('#svgSpiderClearButton').click(()=>{
        selectSvgs = [];
        $('.svg-check.select').removeClass('select');
        onSelectSvgChanges();
    });
    $('#svgSpiderSaveButton').click(()=>{
        if(Parse.User.current()){
            makeCreateForm(svgSpiderRightSider)
        }else{
            makeLoginForm(svgSpiderRightSider)
        }

        svgSpiderRightSider.show('fast');
    });

    $(checkSvgButton).click(()=>{
        const svgs =  $('svg');

        if(svgs.length > 0){
            setSvgList($('#svgSpiderList #svgList'),svgs);
            $('#svgSpiderList').show('fast');
        }
    });

})
})()
