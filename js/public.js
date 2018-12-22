const httpUrl = 'https://shop.outesvilla.com/mobile/index.php?';
const htmlUrl = 'https://shop.outesvilla.com/wap/tmpl';
var userLoginToken = (sessionData('get','userLoginToken').token||'');
// userLoginToken = 'efa2ac037219f60b83dd51b65d380371';

window.cs = console.log;
window.navPathName = (window.location.pathname.split('/')[1]||'index.html').split('.')[0]||'index';
$(function(){
	$('#webFoot').on('click','.webTabLi',function(){
		var et = $(this).attr('et');
		sessionData('set','navTabChoose-'+navPathName,{ choose: et });
		$(this).addClass('cur').siblings('.webTabLi').removeClass('cur');
		$('#webBody .webTabCont[et="'+et+'"]').addClass('show').siblings('.webTabCont').removeClass('show');
		var obj = $('#webHead .webTabHead[et="'+et+'"]');
		if(obj.length==1){
			$('body').removeClass('hideHead');
			obj.addClass('show').siblings('.webTabHead').removeClass('show');
		}else{
			$('body').addClass('hideHead');
		}

		if(window.tabCall){
			window.tabCall(et);
		}
	})
	if($('#webFoot .webTabLi').length>0){
		if(sessionData('get','navTabChoose-'+navPathName)==''){ // 初始化tab
			sessionData('set','navTabChoose-'+navPathName,{ choose: $('#webFoot .webTabLi').eq(0).attr('et') });
		}else{ // 初始化默认选中的tab
			$('#webFoot .webTabLi[et="'+sessionData('get','navTabChoose-'+navPathName).choose+'"]').click();
		}
	}

	$('body [toLocation]').attr('bindLocation',0);
	$('body [toLocation]').click(function(event){
		$(this).attr('bindLocation',1);
		metLocation(event,this);
	})
	$('body').on('click','[toLocation][bindLocation!="1"]',function(event){
		metLocation(event,this);
	})
	function metLocation(event,obj){
		var href = $(obj).attr('toLocation')||'';
		if(href === 'undefined'){
			return false;
		}
        href = href.replace('@server',htmlUrl);
		if($(obj).attr('stopLocation')=='parent'){ // 存在属性阻止冒泡
			event.stopPropagation();
		}

		if(href){
			if(href=='back'){
				window.history.go(-1);
			}else{
				window.location.href = href;
			}
		}
	}

	$('#webBody').on('click','.defTabBox-top .li',function(){
		var et = $(this).attr('et');
		$(this).addClass('cur').siblings('.li').removeClass('cur');
		$(this).closest('.defTabBox').find('.defTabBox-content[et="'+et+'"]').addClass('cur').siblings('.defTabBox-content').removeClass('cur');
	})

	$('#webBody').on('click','.defUbeBox-top .vi',function(){
		var et = $(this).attr('et');
		$(this).addClass('cur').siblings('.vi').removeClass('cur');
		$(this).closest('.defUbeBox').find('.defUbeBox-content[et="'+et+'"]').addClass('cur').siblings('.defUbeBox-content').removeClass('cur');
	})

	if(window.noCheckLogin!=true){
		checkLogin('请先登录！');
	}
})

function countPersonToCha(n){
	n = Number(n||0);
	if(n<10000){
		return n;
	}else{
		var t = n.toString();
		t = Number(t.substring(0,3)+t.substring(3).replace(/\d/g,'0'));
		var s = t/10000;
		// return s.toFixed(1) + '万';
		return Math.ceil(s*10)/10 + '万';
	}
}

//获取url中的参数
function getUrlParam(name,defaults) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	if (r != null){
		return unescape(r[2]);
	}else{
		return defaults||'';
	}
}

// 调用日期选择控件
function initChooseDate(json){
	var dateWidth = parseInt(($(window).width() - 30 - 8*6)/7);
	var p = $.extend(true,{
		title: '日期选择',
		section: false, // 是否选择区间
		initSection: { // 初始化日期区间 section为true时生效
			start: '',
			end: '',
		},
		initDate: '', // 初始化日期区间 section为false时生效
		// isTime: false, // 是否需要选择时间
		canChooseLast: true, // 是否可以选择过去的日期
		call: null, // 回调函数
	},json);

	var oldHeadHtml = $('#webHead').html();
	var nowDate = getDateInfo('year,month,day,timestamp');
	var chooseDateStart = chooseDateEnd = '';
	var dateJson = [];

	createDateBody();
	createDateContent();
		
	function createDateContent(){
		var dayCount = 0;
		var monthList = getMonthList();
		var dateContentHtml = '';
		$.each(monthList,function(a,b){
			var u = getDayList(b.year,b.month);
			var dayList = u.dateList;
			var dayHtml = '';
			var isNowYear = ( b.year==nowDate.year );
			var isNowMonth = ( b.month==nowDate.month );
			var isOutMonth = ( b.year<nowDate.year || (isNowYear&&b.month<nowDate.month) );
			for(var i=0;i<=dayList.length-1;i++){
				var day = dayList[i];
				var isOutState = ( isOutMonth || (isNowYear&&isNowMonth&&day<nowDate.day) );
				dayHtml += '<div class="dayLi df hao wao '+(isOutState?'outDay':'')+'" dates="'+b.year+'/'+et0(b.month)+'/'+et0(day)+'" index="'+dayCount+'" '+(day?'canTouch':'')+'>'+day+'</div>';
				if(day){ dateJson.push(b.year+'-'+b.month+'-'+day); dayCount ++; }
			}
			dateContentHtml += '<div class="monthContent" data-year="'+b.year+'" data-month="'+b.month+'">'+
									dayHtml+
									'<div class="monthLi" data-year="'+b.year+'" data-month="'+b.month+'" style="left: '+(u.firstDayWeek*(dateWidth+8))+'px;"></div>'+
								'</div>';
		})
		$('#chooseDateBody .chooseDateContent').html(dateContentHtml);

		
		var kepYear = nowDate.year;
		var kepMonth = Number(nowDate.month);

		if(p.section){
			var initStartDate = p.initSection.start.replace(/-/g,'/');
			var initEndDate = p.initSection.end.replace(/-/g,'/');
			if(!initStartDate&&initEndDate){
				initStartDate = initEndDate;
				initEndDate = '';
			}

			if(initStartDate){
				kepYear = initStartDate.substring(0,4);
				kepMonth = initStartDate.substring(5,7);
				$('#chooseDateBody .chooseDateContent .dayLi[dates="'+initStartDate+'"]').click();
			}
			if(initEndDate){
				$('#chooseDateBody .chooseDateContent .dayLi[dates="'+initEndDate+'"]').click();
			}
		}else{
			var initDate = p.initDate.replace(/-/g,'/');
			if(initDate){
				kepYear = initDate.substring(0,4);
				kepMonth = initDate.substring(5,7);

				$('#chooseDateBody .chooseDateContent .dayLi[dates="'+initDate+'"]').addClass('startDateLi');
				// chooseDateStart = initDate;
			}
		}

		// if(p.canChooseLast){
			var offsetTop = $('#chooseDateBody .chooseDateContent .monthContent[data-year="'+kepYear+'"][data-month="'+Number(kepMonth)+'"]')[0].offsetTop;
			$('#chooseDateBody .chooseDateContent').scrollTop(offsetTop);
		// }
	}

	function createDateBody(){
		$('#chooseDateBody').remove();
		var html = '<div class="chooseDateBody whiteBg '+(p.section?'':'hideTop hideFoot')+'" id="chooseDateBody">'+
						'<div class="oldHeadHide">'+oldHeadHtml+'</div>'+
						'<style type="text/css" id="chooseDateStyle">'+
							'.chooseDateWeek .weekContent,.chooseDateContent .monthContent{width: '+(dateWidth*7+8*6)+'px;}'+
							'.chooseDateWeek .weekLi{width: '+dateWidth+'px;}'+
							'.chooseDateContent .monthLi{width: '+(dateWidth+60)+'px;}'+
							'.chooseDateContent .dayLi{width: '+dateWidth+'px;height: '+dateWidth+'px;}'+
						'</style>'+
						'<div class="chooseDateTop df hao jcb">'+
							'<div class="df cf wao hao date">--</div>'+
							'<div class="df cf wao hao daynum">0天</div>'+
							'<div class="df cf wao hao date">--</div>'+
						'</div>'+
						'<div class="chooseDateWeek">'+
							'<div class="weekContent">'+
								'<div class="weekLi df cf wao hao">日</div>'+
								'<div class="weekLi df cf wao hao">一</div>'+
								'<div class="weekLi df cf wao hao">二</div>'+
								'<div class="weekLi df cf wao hao">三</div>'+
								'<div class="weekLi df cf wao hao">四</div>'+
								'<div class="weekLi df cf wao hao">五</div>'+
								'<div class="weekLi df cf wao hao">六</div>'+
							'</div>'+
						'</div>'+
						'<div class="chooseDateContent"></div>'+
						'<div class="chooseDateFoot"><div class="btn">确定</div></div>'+
					'</div>';
		$('body').append(html);
		$('#webHead').html('<div class="h-btn h-btn-back" type="chooseDateBack"></div><div class="flex h-txt">'+p.title+'</div><div class="h-btn"></div>');

		$('#chooseDateBody').on('click','.dayLi[canTouch]',function(){
			if(!p.canChooseLast&&$(this).hasClass('outDay')){
				return false;
			}

			var kepDate = $(this).attr('dates');
			if(chooseDateStart==''){
				$(this).addClass('startDateLi');
				chooseDateStart = kepDate;
				if(!p.section){
					if(p.call){
						p.call({
							date: chooseDateStart,
						});
					}
					$('#webHead .h-btn[type="chooseDateBack"]').click();
				}
			}else if($(this).hasClass('startDateLi')){
				$('#chooseDateBody .endDateLi').removeClass('endDateLi').addClass('startDateLi');
				$(this).removeClass('startDateLi');
				chooseDateStart = chooseDateEnd;
				chooseDateEnd = '';
			}else if($(this).hasClass('endDateLi')){
				$(this).removeClass('endDateLi');
				chooseDateEnd = '';
			}else{
				$('#chooseDateBody .endDateLi').removeClass('endDateLi');
				$(this).addClass('endDateLi');
				chooseDateEnd = kepDate;
			}
			calcResult();
		})

		$('#chooseDateBody').on('click','.chooseDateFoot .btn',function(){
			if(p.call){
				p.call({
					// startDate: $('#chooseDateBody .chooseDateTop .date:eq(0) span:eq(2)').text(),
					startDate: $('#chooseDateBody .chooseDateTop .date:eq(0) span:eq(1)').text(),
					// endDate: $('#chooseDateBody .chooseDateTop .date:eq(1) span:eq(2)').text(),
					endDate: $('#chooseDateBody .chooseDateTop .date:eq(1) span:eq(1)').text(),
					dayNum: Number($('#chooseDateBody .chooseDateTop .daynum').text().replace(/天/,'')),
				});
			}
			$('#webHead .h-btn[type="chooseDateBack"]').click();
		})
	}

	function calcResult(){
		$('#chooseDateBody [state]').removeAttr('state');
		var startDate = chooseDateStart;
		var endDate = chooseDateEnd;
		var index = 0;
		var calcTimeStamp = getDateInfo('timestamp',startDate)-getDateInfo('timestamp',endDate);
		var dayNum = 0;
		if(calcTimeStamp>0&&endDate!=0){
			startDate = chooseDateEnd;
			endDate = chooseDateStart;
			index = Number($('#chooseDateBody .endDateLi').attr('index'));
			$('#chooseDateBody .startDateLi').attr('state','end');
			$('#chooseDateBody .endDateLi').attr('state','start');
		}else{
			index = Number($('#chooseDateBody .startDateLi').attr('index'));
			$('#chooseDateBody .startDateLi').attr('state','start');
			$('#chooseDateBody .endDateLi').attr('state','end');
		}

		$('#chooseDateBody .includeDateLi').removeClass('includeDateLi');
		if(startDate&&endDate){
			dayNum = parseInt(Math.abs(calcTimeStamp)/1000/60/60/24)+1;
			for(var i=index+1;i<index+dayNum-1;i++){
				$('#chooseDateBody .dayLi[index="'+i+'"]').addClass('includeDateLi');
			}
		}

		$('#chooseDateBody .chooseDateTop .daynum').text(dayNum+'天');
		if(startDate){
			// $('#chooseDateBody .chooseDateTop .date:eq(0)').html('<span>周'+getDateInfo('week',startDate)+'</span><span>00:00</span><span>'+startDate||'--'+'</span>');
			$('#chooseDateBody .chooseDateTop .date:eq(0)').html('<span>周'+getDateInfo('week',startDate)+'</span><span>'+startDate||'--'+'</span>');
		}else{
			$('#chooseDateBody .chooseDateTop .date:eq(0)').text('--');
		}
		if(endDate){
			// $('#chooseDateBody .chooseDateTop .date:eq(1)').html('<span>周'+getDateInfo('week',endDate)+'</span><span>00:00</span><span>'+endDate||'--'+'</span>');
			$('#chooseDateBody .chooseDateTop .date:eq(1)').html('<span>周'+getDateInfo('week',endDate)+'</span><span>'+endDate||'--'+'</span>');
		}else{
			$('#chooseDateBody .chooseDateTop .date:eq(1)').text('--');
		}
	}

	function getMonthList(){
		var y = nowDate.year;
		var m = Number(nowDate.month);
		var d = Number(nowDate.day);
		var monthList = [];
		if(p.canChooseLast){
			for(var i=m;i<=12;i++){
				monthList.push({
					year: y-1,
					month: i,
				});
			}
			for(var i=1;i<=12;i++){
				monthList.push({
					year: y,
					month: i,
				});
			}
		}else{
			for(var i=m;i<=12;i++){
				monthList.push({
					year: y,
					month: i,
				});
			}
		}
		for(var i=1;i<=m;i++){
			monthList.push({
				year: y+1,
				month: i,
			});
		}
		return monthList;
	}

	function getDayList(y,m){
		var d = getDateInfo('weeks,dayNum',y+'-'+m);
		var dateList = [];
		for(var s=0;s<=d.weeks-1;s++){
			dateList.push('');
		}
		for(var s=1;s<=d.dayNum;s++){
			dateList.push(s);
		}
		var len = dateList.length%7;
		if(len>0){
			for(var s=1;s<=7-len;s++){
				dateList.push('');
			}
		}
		return { dateList: dateList, firstDayWeek: d.weeks };
	}

	function et0(v){
		v = Number(v||0);
		if(v<10){
			v = '0'+v;
		}
		return v;
	}
}
// 关闭日期选择控件
$('#webHead').on('click','.h-btn[type="chooseDateBack"]',function(){
	var oldHeadHtml = $('#chooseDateBody .oldHeadHide').html();
	$('#webHead').html(oldHeadHtml);
	$('#chooseDateBody').remove();
})


function getDateInfo(t,d){
	if(d){
		if(d.length>19){ d = d.substring(0,19); }
		if(d.indexOf('-')>=0){
			if(d.split('-').length==1){
				d = d+'-01-01';
			}else if(d.split('-').length==2){
				d = d+'-01';
			}
		}
		d = d.replace(/\-/g, "/");
		var date = new Date(d);
	}else{
		var date = new Date();
	}

	if(t){
		if(t=='all'){
			t = 'year,month,day,hour,minute,second,timestamp,week,week,quarter,weekNum,dayNum,dateTime,date,monthStart,monthEnd,yearStart,yearEnd,yearStart2,yearEnd2,quaStart,quaEnd,yesterday,lastMonth,lastYear,nextMonth';
		}
		var st = t.split(',');
		if(st.length==1){
			return et(t);
		}else{
			var s = {};
			for(var i=0;i<=st.length-1;i++){
				s[st[i]] = et(st[i]);
			}
			return s;
		}
	}else{
		return {
			year: '年份',
			month: '月份',
			day: '日',
			hour: '小时',
			minute: '分钟',
			second: '秒数',
			timestamp: '时间戳',
			week: '星期数 (一至日)',
			weeks: '星期数 (0至6)',
			quarter: '季度',
			weekNum: '当前周数',
			dayNum: '当月天数',
			dateTime: '日期+时间',
			date: '日期',
			monthStart: '月度区间开始',
			monthEnd: '月度区间结束',
			yearStart: '年度区间开始（一月开始）',
			yearEnd: '年度区间结束（一月开始）',
			yearStart2: '年度区间开始（三月开始）',
			yearEnd2: '年度区间结束（三月开始）',
			quaStart: '季度区间开始',
			quaEnd: '季度区间结束',
			yesterday: '昨天',
			lastMonth: '上个月',
			lastYear: '去年',
			nextMonth: '下个月',
		};
	}

	function et(tt){
		var year = date.getFullYear();
		var old_month = month = date.getMonth()+1;
		var old_day = day = date.getDate();
		var old_hour = hour = date.getHours();
		var old_minute = minute = date.getMinutes();
		var old_second = second = date.getSeconds();
		var timestamp = date.getTime();
		var dayNum = new Date(year, month, 0).getDate();

		month = ( month<10 ? '0'+month : month );
		day = ( day<10 ? '0'+day : day );
		hour = ( hour<10 ? '0'+hour : hour );
		minute = ( minute<10 ? '0'+minute : minute );
		second = ( second<10 ? '0'+second : second );

		if(tt=='year'){ // 年份
			return year;
		}else if(tt=='month'){ // 月份
			return month;
		}else if(tt=='day'){ // 日
			return day;
		}else if(tt=='hour'){ // 小时
			return hour;
		}else if(tt=='minute'){ // 分钟
			return minute;
		}else if(tt=='second'){ // 秒数
			return second;
		}else if(tt=='timestamp'){ // 时间戳
			return timestamp;
		}else if(tt=='week'||tt=='weeks'){ // 星期数 (有s为数字 0-6)
			var week = date.getDay();
			if(tt=='weeks'){
				return week;
			}
			switch (week){
				case 1: week="一"; break;
				case 2: week="二"; break;
				case 3: week="三"; break;
				case 4: week="四"; break;
				case 5: week="五"; break;
				case 6: week="六"; break;
				default: week="日";
			}
			return week;
		}else if(tt=='quarter'){ // 季度
			var quarter = '第一季度';
			switch(old_month){
				case 1:case 2:case 3: quarter = "第一季度"; break;
				case 4:case 5:case 6: quarter = "第二季度"; break;
				case 7:case 8:case 9: quarter = "第三季度"; break;
				case 10:case 11:case 12: quarter = "第四季度"; break;
				default: quarter = "第一季度";
			}
			return quarter;
		}else if(tt=='weekNum'){ // 当前周数
			return getYearWeek(year, month, day);
		}else if(tt=='dayNum'){ // 当月天数
			return dayNum;
		}else if(tt=='dateTime'){ // 【格式化】日期+时间
			return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
		}else if(tt=='date'){ // 【格式化】日期
			return year + '-' + month + '-' + day;
		}else if(tt=='monthStart'){ // 【格式化】月度区间开始
			return year + '-' + month + '-01';
		}else if(tt=='monthEnd'){ // 【格式化】月度区间结束
			return year + '-' + month + '-' + dayNum;
		}else if(tt=='yearStart'){ // 【格式化】年度区间开始（一月开始）
			return year + '-01-01';
		}else if(tt=='yearEnd'){ // 【格式化】年度区间结束（一月开始）
			var dn = new Date(year, 12, 0).getDate();
			return year + '-12-' + dn;
		}else if(tt=='yearStart2'){ // 【格式化】年度区间开始（三月开始）
			return year + '-03-01';
		}else if(tt=='yearEnd2'){ // 【格式化】年度区间结束（三月开始）
			var dn = new Date(year+1, 2, 0).getDate();
			return (year+1) + '-02-' + dn;
		}else if(tt=='quaStart'){ // 【格式化】季度区间开始
			var quarter = '';
			switch(old_month){
				case 1:case 2:case 3: quarter = year+'-01-01'; break;
				case 4:case 5:case 6: quarter = year+'-04-01'; break;
				case 7:case 8:case 9: quarter = year+'-07-01'; break;
				case 10:case 11:case 12: quarter = year+'-10-01'; break;
			}
			return quarter;
		}else if(tt=='quaEnd'){ // 【格式化】季度区间结束
			var quarter = '';
			switch(old_month){
				case 1:case 2:case 3: quarter = dateQuarterEnd = year+'-03-'+new Date(year, 3, 0).getDate(); break;
				case 4:case 5:case 6: quarter = dateQuarterEnd = year+'-06-'+new Date(year, 6, 0).getDate(); break;
				case 7:case 8:case 9: quarter = dateQuarterEnd = year+'-09-'+new Date(year, 9, 0).getDate(); break;
				case 10:case 11:case 12: quarter = dateQuarterEnd = year+'-12-'+new Date(year, 12, 0).getDate(); break;
			}
			return quarter;
		}else if(tt=='yesterday'){ // 昨天
			var yesterday_timestamp = new Date(year+'/'+month+'/'+day).getTime()-1000*60*60*24;
			var yesterday_date = new Date(yesterday_timestamp);
			var yesterday_year = yesterday_date.getFullYear();
			var yesterday_month = yesterday_date.getMonth()+1;
			var yesterday_day = yesterday_date.getDate();
			yesterday_month = ( yesterday_month<10 ? '0'+yesterday_month : yesterday_month );
			yesterday_day = ( yesterday_day<10 ? '0'+yesterday_day : yesterday_day );
			return yesterday_year+'-'+yesterday_month+'-'+yesterday_day;
		}else if(tt=='lastMonth'){ // 上个月
			if(old_month==1){
				var lastMonth_year = year-1;
				var lastMonth_month = 12;
			}else{
				var lastMonth_year = year;
				var lastMonth_month = old_month-1;
			}
			lastMonth_month = ( lastMonth_month<10 ? '0'+lastMonth_month : lastMonth_month );
			return lastMonth_year+'-'+lastMonth_month;
		}else if(tt=='nextMonth'){ // 下个月
			if(old_month==12){
				var nextMonth_year = year+1;
				var nextMonth_month = 1;
			}else{
				var nextMonth_year = year;
				var nextMonth_month = old_month+1;
			}
			nextMonth_month = ( nextMonth_month<10 ? '0'+nextMonth_month : nextMonth_month );
			return nextMonth_year+'-'+nextMonth_month;
		}else if(tt=='lastYear'){ // 去年
			return year-1;
		}else{
			return '';
		}
	}

	function getYearWeek(a, b, c) { // 获取当前周数
		var d1 = new Date(a, b-1, c), d2 = new Date(a, 0, 1), 
		d = Math.round((d1 - d2) / 86400000); 
		return Math.ceil((d + ((d2.getDay() + 1) - 1)) / 7); 
	}
}

function ajax(j){
	var json = $.extend(true,{
		url: '',
		async: true,
		type: 'post',
		dataType: 'json',
		param: {},
		call: function(){},
		failCall: function(){},
		callSuccess: function () {},
	},j);
	json.url = json.url.replace('@server/',httpUrl);
	$.ajax({
		url: json.url,
		data: json.param,
		type: json.type,
		dataType: json.dataType,
		async: json.async,
		success: function(r) {
			json.callSuccess(r);
			if(r.code&&r.datas){
				if(r.code==200){
					json.call(r.datas);
				}else{
					cs(r);
					json.failCall(r.datas);
				}
			}else{
				json.call(r);
			}
			
		},
		error: function(r) {
			cs(r);
		}
	})
}

// 发送验证码
function sendPhoneCode(json) {
	var type = 0;
	switch(json.do){
		case '注册':
			type = 1;
			break;
		case '登录':
			type = 2;
			break;
		case '找回密码':
			type = 3;
			break;
		case '更换绑定手机验证':
			type = 4;
			break;
	}
	ajax({
		url: '@server/act=connect&op=get_sms_captcha',
		param: {
			phone: json.phone,
			type: type,
		},
		call: json.call,
		failCall: json.failCall,
	})
}

// 检测手机号码
function checkPhone(phone){
	if(!phone){
		alerts({
			type: 'fail',
			title: '验证错误',
			txt: '手机号码不能为空',
		});
		return false;
	}else if(!(/^1[34578]\d{9}$/.test(phone))){
		alerts({
			type: 'fail',
			title: '验证错误',
			txt: '手机号码有误，请重新输入',
		});
		return false;
	}else{
		return true;
	}
}

// 检测是否已经登录
function checkLogin(txt){
	if(userLoginToken==''||sessionData('get','userLoginToken')==''){
		alerts({
			type: 'fail', // 弹框类型 [default 普通] [success 成功] [fail 失败] [info 警告]
			txt: (txt||'操作失败！请先登录'), // 弹框内容
			btn: '去登录', // 按钮 空为不显示，会自动隐藏
			click: function(){
				window.location.href = 'login.html';
			}, // 按钮点击回调函数
		});
	}
}

// 自定义弹框提示
var alertsState = false;
var alertsClickCall = null;
var alertsClickCall2 = null;
var alertsQueue = [];
function alerts(j) {
	if(!isJson(j)){
		j = { txt: j };
	}

	if(alertsState){
		alertsQueue.push(j);
	}else{
		alertsState = true;
		var json = $.extend({
			type: 'default', // 弹框类型 [default 普通] [success 成功] [fail 失败] [info 警告]
			title: '', // 弹框标题
			txt: '', // 弹框内容
			autoHide: 2, // 自动隐藏时间 btn存在时该项不生效
			call: null, // 生成成功回调函数
			btn: '关闭', // 按钮 空为不显示，会自动隐藏
			click: null, // 按钮点击回调函数
			btn2: '', // 按钮 空为不显示，会自动隐藏
			click2: null, // 按钮点击回调函数
		},j);

		var hasBtn = false, hasBtn2 = false;
		if(json.btn){
			hasBtn = true;
		}
		if(json.btn2){
			hasBtn2 = true;
		}
		if(['success','fail','info'].indexOf(json.type)==-1){
			json.type = 'default';
		}
		alertsClickCall = json.click;
		alertsClickCall2 = json.click2;

		var html = '<div class="alertBox df hao wao" type="'+json.type+'">'+
			'<div class="net">'+
			(json.title?'<div class="top df hao wao">'+json.title+'</div>':'')+
			'<div class="txt df hao wao">'+json.txt+'</div>'+
			(hasBtn||hasBtn2?
				'<div class="foot df hao wao">'+
				(hasBtn?'<div class="btn" onclick="closeAlerts(1)">'+json.btn+'</div>':'')+
				(hasBtn2?'<div class="btn" onclick="closeAlerts(2)">'+json.btn2+'</div>':'')+
				'</div>'
				:'')+

			'</div>'+
			'</div>';
		$('body').append(html);

		if(!hasBtn&&!hasBtn2){
			setTimeout(closeAlerts,(json.autoHide||2)*1000)
		}
	}
}
function closeAlerts(t){
	$('.alertBox').addClass('closeAlert');
	setTimeout(function(){
		$('.alertBox').remove();

		if(alertsClickCall&&t==1){
			alertsClickCall();
		}
		if(alertsClickCall2&&t==2){
			alertsClickCall2();
		}

		// 延迟执行弹框队列
		alertsState = false;
		if(alertsQueue.length>0){
			alerts(alertsQueue[0]);
			alertsQueue.splice(0,1);
		}
	},250)
}

// 黑色迷你提示框
function smallAlert(txt){
	if(txt){
		if($('#smallAlert').length>0){ $('#smallAlert').remove(); }
		var smallAlert = $('<div id="smallAlert" class="smallAlert">'+txt+'</div>');
		$('body').append(smallAlert);
		smallAlert.fadeIn(200,function(){
			setTimeout(function(){ smallAlert.fadeOut(300); },1200);
		})
	}
}

// 检测是否为json对象
function isJson(obj){
	var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; 
	return isjson;
}
// 检测是否为数字
function isNumber(val){
	if(val === "" || val ==null){ // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
		return false;
	}
	if(!isNaN(val)){
		return true;
	}else{
		return false;
	}
}



// 绑定滚动触发
var bindScrollId = 1;
var bindScroll = {};
function bindScrollCall(obj,num,call) {
	var sid = 'sid'+bindScrollId;
	bindScrollId ++;
	bindScroll[sid] = true;
	$(obj).off('scroll').on('scroll',function(){
		var allHeight = $(obj).prop('scrollHeight');
		var viewHeight = $(obj).height();
		var scrollTop = $(obj).scrollTop();
		if(allHeight-viewHeight<=scrollTop+num&&bindScroll[sid]){
			bindScroll[sid] = false;
			if(call){
				var r = call(sid);
			}
		}
	})
}


// 本地数据操作
function localData(t,key,data) {
	if(t=='set'){ // 保存
		localStorage.setItem(key, JSON.stringify(data));
	}else if(t=='get'){ // 读取
		var data = localStorage.getItem(key)||'{}';
		return JSON.parse(data=='undefined'?'{}':data);
	}else if(t=='remove'){ // 删除某个值
		localStorage.removeItem(key);
	}else if(t=='clear'){
		localStorage.clear();
	}
}
function sessionData(t,key,data) {
	if(t=='set'){ // 保存
		sessionStorage.setItem(key, JSON.stringify(data));
	}else if(t=='get'){ // 读取
		var data = sessionStorage.getItem(key)||'{}';
		return JSON.parse(data=='undefined'?'{}':data);
	}else if(t=='remove'){ // 删除某个值
		sessionStorage.removeItem(key);
	}else if(t=='clear'){
		sessionStorage.clear();
	}
}

// 开启移动端调试显示
// openConsoleLog();
function openConsoleLog() {
	$.getScript('js/vconsole.min.js',function(){
		var checkJsLoad = setInterval(function(){
			if(window.vConsoleLoad==1){
				clearInterval(checkJsLoad);
				var vConsole = new VConsole();
			}
		},200)
	})
}

//时间戳转化为时间
function timestampToTime(timestamp) {
	var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
	var Y = date.getFullYear() + '-';
	var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	var D = date.getDate() + ' ';
	var h = date.getHours() + ':';
	var m = date.getMinutes() + ':';
	var s = date.getSeconds();
	return Y+M+D+h+m+s;
}

//检测是否绑定手机号
function sencAdvance(callback){
	ajax({
		url: '@server/act=travel&op=tour',
		param: {
			key:userLoginToken,
			method:"sencAdvance"
		},
		call: function(r){
			callback(r)
		},
		failCall: function(r) {
			alerts({ txt: r.error, type: 'fail' });
		}
	});
}

//身份证号合法性验证
//支持15位和18位身份证号
function IdentityCodeValid(code) {
	var pass= true;

	if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
		tip = "身份证号格式错误！";
		pass = false;
	}else{
		//18位身份证需要验证最后一位校验位
		if(code.length == 18){
			code = code.split('');
			//∑(ai×Wi)(mod 11)
			//加权因子
			var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
			//校验位
			var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
			var sum = 0;
			var ai = 0;
			var wi = 0;
			for (var i = 0; i < 17; i++)
			{
				ai = code[i];
				wi = factor[i];
				sum += ai * wi;
			}
			var last = parity[sum % 11];
			if(parity[sum % 11] != code[17]){
				tip = "身份证号不正确！";
				pass =false;
			}
		}
	}
	if(!pass){
		alerts({
			type: 'fail',
			title: '验证错误',
			txt: tip,
		});
	};
	return pass;
}

// 判断是否是微信浏览器
function isWeiXin(){
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger'){ //通过正则表达式匹配ua中是否含有MicroMessenger字符串
		return true;
	}else{
		return false;
	}
}

// 分享
function shareFixed() {
	$('#shareBox').remove();
	$('#shareImgBox').remove();
	var html = '';
	if(isWeiXin()){
		html = '<div id="shareBox" class="shareBox" onclick="$(this).remove()"></div>';
	}else{
		html = '<div id="shareImgBox" class="shareImgBox df hao wao" onclick="$(this).remove()"><img src="http://qr.topscan.com/api.php?text='+window.location.href+'" onclick="event.stopPropagation()" /></div>';
	}
	$('body').append(html);
}