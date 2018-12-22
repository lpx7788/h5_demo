// 取消订单
function orderCancel(oid){
	ajax({
		url: '@server/act=member_order&op=order_cancel',
		param:{
			order_id: oid,
			key: userLoginToken,
		},
		call: function(r){
			// cs(r);
			if(r==1){
				alerts({
					txt:"取消成功！",
					type:"success",
					click:function(){
						if(webType=='mineOrder'){
							reloadShopOrderData();
						}else{
							window.history.go(-1);
						}
					}
				});
			}
		}
	});
}

// 立即付款
function memberBuy(pay_sn, pay_money, payDoneType, type ){

	// 调用支付
	ajax({
		url: '@server/act=member_payment&op=payfee',
		param: {
			pay_sn: pay_sn,
			payment_code: 'wxpay_jsapi',
			key: userLoginToken,
			type: type
		},
		call: function(r){
			WeixinJSBridge.invoke('getBrandWCPayRequest', {
				"appId": r.appId, //公众号名称，由商户传入
				"timeStamp": r.timeStamp, //时间戳，自1970年以来的秒数
				"nonceStr": r.nonceStr, //随机串
				"package": r.package,
				"signType": r.signType, //微信签名方式:
				"paySign": r.paySign //微信签名
			},function(r2){
				if(r2.err_msg == "get_brand_wcpay_request:ok"){
					window.location.href = 'payDone.html?type='+payDoneType+'&money='+pay_money;
				}else if(r2.err_msg == "get_brand_wcpay_request:cancel"){
					if(webType=='mineOrder'){
						reloadShopOrderData();
					}else{
						alerts({ txt: "取消支付!", type: 'fail' });
					}
				}else{
					if(webType=='mineOrder'){
						reloadShopOrderData();
					}else{
						alerts({ txt: "支付失败!", type: 'fail' });
					}
				}
			});
		},
		failCall: function(r) {
			alerts({ txt: r.error, type: 'fail' });
		}
	});
}

// 取消退款
function application_refund(oid){
	ajax({
		url: '@server/act=member_refund&op=refund_all_form',
		param: {
			order_id: oid,
			key: userLoginToken,
		},
		type:'get',
		call: function(r){
		   // cs(r);
			alerts({
				txt:"取消成功！",
				type:"success",
				click:function(){
					if(webType=='mineOrder'){
						reloadShopOrderData();
					}else{
						window.history.go(-1);
					}
				}
			});
		}
	});
}

// 确认收货
// function collect_goods(oid){
// 	ajax({
// 		url: '@server/act=member_order&op=order_receive',
// 		param:{
// 			order_id: oid,
// 			key: userLoginToken,
// 		},
// 		call: function(r){
// 		   // cs(r);
// 			if(r==1){
// 				alerts({
// 					txt:"已确认收货！",
// 					type:"success",
// 					click:function(){
// 						if(webType=='mineOrder'){
// 							reloadShopOrderData();
// 						}else{
// 							window.history.go(-1);
// 						}
// 					}
// 				});
// 			}
// 		}
// 	});
// }

// 当前物流信息
function get_current_deliver(oid) {
	var txt = '';
	ajax({
		url: '@server/act=member_order&op=get_current_deliver',
		param:{
			order_id: oid,
			key: userLoginToken,
		},
		async: false,
		call: function(r){
		   // cs(r);
			txt = r.deliver_info.context;
		}
	});
	return txt;
}