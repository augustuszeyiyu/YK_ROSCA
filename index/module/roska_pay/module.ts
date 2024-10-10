"use strict";
// (async () => {
( () => {
	// console.log(register);
	
	// Rrgion for TypeScript
	type User = {
		uid?: uniqid,
		nid: string,
		name: string,
		gender?: 'M'|'F',
		birth_date: string,
		address: string,
		line_id?: string,
		contact_home_number: string,
		contact_mobile_number: string,
		role?: number,
		bank_code: string,
		branch_code: string,
		bank_account_name: string,
		bank_account_number: string,
		emergency_nid: uniqid,
		emergency_contact: string,
		emergency_contact_number: string,
		emergency_contact_relation: string,
		relative_path?: string,
		referrer_uid?: uniqid,
		referrer_path?: string,
		volunteer_uid?: uniqid,
		volunteer_path?: string,
		revoked?: boolean,
		password: string,
		update_time?: number,
		create_time?: number,
		[key:string]:any,
	};
	
	// Rrgion for TypeScript
	const TAG = 'roska_pay';
    const LANG_NAME_MAP = {en_us:'英文', zh_tw:'繁體中文', zh_cn:'簡體中文'};
    type QueryParam = {};
	type PagingCursor = Awaited<ReturnType<typeof window.ROSKA_FORM.Do_Register_User_Info>>;
	const user_info  = ROSKA_FORM.Session.getUserInfo();
	var pre_date = new Date();
	const pre_bid_date = ROSKA_FORM.Tools.calculateMonthlyBitStartTime(pre_date, -1);
	const next_bid_date = ROSKA_FORM.Tools.calculateMonthlyBitStartTime(pre_date, 0);

	const STATE:{
		query:QueryParam;
		cursor:PagingCursor|null;
	} = {
		query:{},
		cursor:null
	};

	const modules = window.modules;
	const viewport = window.viewport;	
	const view = viewport.roska_pay_view;
	const loading_overlay = window.loading_overlay;




	modules.push({
		init: async function(){
			const [{element: layout}] = await window.resources([
				{ type: 'html', path: './module/roska_pay/module.html'},
				{ type: 'css', path: './module/roska_pay/module.css' }
			]);

			view.element.innerHTML = layout.innerHTML;
			view.relink();
			layout.remove();
		}
	});

	view
	.on('view-state', (e:any) => {
		// if (e.state !== "show")
		// 	return;
		// loading_overlay.Show();
		
		// personal_bid_info();
		ResetPage();
		update_user_info();
		list_settlement_serial()
		// 	.catch((e:any) => {
		// 	console.error(e);
		// 	// alert(`載入失敗！(${e.message})`);
		// 	window.HandleUnauthorizedAccess(e);
		// 	})
		// 	.finally(() => {
		// 	loading_overlay.Hide();
		// 	});

	})
    .on('click', async (e:any) => {
        const trigger = e.target;
        switch (trigger.dataset.role) {
            case "view_group": {
                window.open("./" + '?' + 'sid=' + trigger.dataset.relSid + '&' + "next_gid=" + trigger.dataset.next_gid + '&' + 'modal=pay_group_view', 'innerHeight=800', 'innerWidth=800');
                break;
            }
            case "export_record": {
				trigger.textContent = '生成中...'; // 可以顯示生成中的提示
				try{
					let result_data = await ROSKA_FORM.export_record();
					console.log(result_data.url);
					// let result = await ROSKA_FORM.bid_group_serial(query_data).catch((e: Error) => e);
					  const download_elemet = document.createElement('a');
					  download_elemet.href = result_data.url;
					  download_elemet.download = '';
					  document.body.appendChild(download_elemet);
					  download_elemet.click(); // 觸發下載
					  document.body.removeChild(download_elemet);
					//   alert(result_data.url);
					ResetPage();
				}
				catch (e: any) {
					alert(`輸出失敗(${e.message}`);
				}
				finally{
					trigger.textContent = '會組統計下載'; // 還原按鈕文本
				}
				break;
            }
            // default:
            //     alert("您沒有權限使用該功能！\\n請使用更高權限等級的帳號執行此操作！");
            //     return;
        }
    });
	async function list_settlement_serial() {

		interface GroupInfo {
			gid: string;
			win_amount: number;
		}

		const settlement_data:{
			alive_account:number,
			deth_account:number,
			win_account:{
				gids:GroupInfo[],
				win_amount:number,
			},
		} = {
			alive_account:0,
			deth_account:0,
			win_account:{
				gids:[],
				win_amount:0,
			},
		}
		// console.log(settlement_data.win_account.gids);
		try {
			const list_data = await ROSKA_FORM.Get_settlement_list();
			view.region_list.textContent = " ";
			const region_list = view.region_list;
			const tmpl_item = view.tmpl_item;
			// console.log("list_data");
			// console.log(list_data);

            view.bided_date.innerHTML = "本次開標日期 : "+ pre_bid_date.toString().slice(0, 3) + " " + pre_bid_date.toString().slice(4, 15);
			// view.bided_date.innerHTML = "本次開標日期 : "+ "Oct 09 2024";
			const pay_over_view = [];
			var count = 1;
		
			const records = list_data;
			console.log(records);
			for(const record of records) {
				var che = record.group_info.at(-1);
				// console.log(che);


				// if( Number(che.win_amount) === 0 ){
				// 	console.log("break point 1");
				// 	continue;
				// };

					// console.log(record.group_info.at(-1).gid);
					// console.log(record.group_info.at(-1).bid_end_time);
					var record_pre_bid_end_time = new Date(record.group_info.at(-1).bid_end_time);
					var today_this = new Date();
					var this_bid_date = ROSKA_FORM.Tools.calculateMonthlyBitStartTime(today_this,0);					
					var inteval = Number(this_bid_date.getMonth())-Number(record_pre_bid_end_time.getMonth());
					// console.log( {inteval,this_bid_date,record_pre_bid_end_time});
				if(inteval > 0){
					console.log("break point 2");
					continue;
				}
				console.log(record);
				const elm = tmpl_item.duplicate();
				elm.count.textContent = ROSKA_FORM.Tools.pad_zero(count ,3);
				count += 1;
				elm.sid.textContent= record.sid.slice(0, 6);
				// console.log(record.group_info.at(-1));
				const lastGroupInfo = record.group_info.at(-1);
				const winAmount = parseInt(lastGroupInfo.win_amount, 10);
				switch(record.group_info.at(-1).win_amount){
					case 0:{
						// console.log(record.group_info.at(-1).win_amount);
						elm.pay_amount.innerHTML = record.group_info.at(-1).win_amount||"轉讓";
						break;
					}
					case -4000:{
						settlement_data.alive_account +=1;
						elm.pay_amount.textContent = record.group_info.at(-1).win_amount||"pay_amount";
						break;
					}
					case -5000:{
						settlement_data.deth_account +=1;
						elm.pay_amount.textContent = record.group_info.at(-1).win_amount||"pay_amount";
						break;
					}
					default : {
						settlement_data.win_account.gids.push(lastGroupInfo);
						settlement_data.win_account.win_amount += winAmount;
						elm.pay_amount.textContent = record.group_info.at(-1).win_amount||"pay_amount";
					}
				}
				// elm.pay_amount.textContent = record.group_info.at(-1).win_amount||"pay_amount";
				// elm.memebr_mid.textContent = record.mid.slice(0, 6)+record.mid.slice(-1, 2);
				
				elm.memebr_mid.textContent = record.mid.slice(-2);

				elm.view_group.dataset.role = 'view_group';
				elm.view_group.dataset.relSid = record.sid;
				const button_group_detail =  document.createElement("samp")
				button_group_detail.classList.add("glyph-fontawesome-search");
				elm.view_group_icon.appendChild(button_group_detail);

				region_list.appendChild(elm.element);
			}
			const pay_list = view.pay_list;
			// console.log("settlement_data.win_account.win_amount");
			// console.log(settlement_data.win_account.win_amount);
			// console.log(settlement_data.alive_account * -4000);
			// console.log(settlement_data.deth_account * -5000);
			pay_list.should_pay.innerHTML = "本期應繳會費 : " + ( (settlement_data.alive_account * 4000) + (settlement_data.deth_account * 5000) + -(settlement_data.win_account.win_amount) );
            pay_list.alive_account.innerHTML = "活會數 : <span style=\"color:green;\">" + settlement_data.alive_account + "</span> 。" + " 活會款總計" + -(settlement_data.alive_account * 4000);
            pay_list.death_account.innerHTML = "死會數 : <span style=\"color:red;\">" + settlement_data.deth_account + "</span> 。" + " 死會款總計" + -(settlement_data.deth_account * 5000);
            var new_win_section = document.createElement("p");
            new_win_section.innerHTML = "得標會組數 : <span style=\"color:green;\">" + settlement_data.win_account.gids.length + "</span>  。" + " 得標會款總計" + (settlement_data.win_account.win_amount);
			pay_list.win_account.textContent = "";
			pay_list.win_account.appendChild(new_win_section);
			// console.log(settlement_data.win_account);
			for(let record of settlement_data.win_account.gids){
				var result = document.createElement("p");
				result.innerHTML = "得標會組"+ (record.gid||'會組名') +" 得標金 " + ROSKA_FORM.Tools.pad_space(record.win_amount,6);
				pay_list.win_account.appendChild(result);
			};
		}
		catch(e:any) {
			console.error(e);
			alert(`載入失敗！無法取得各會期結算列表！(${e.message})`);
			window.HandleUnauthorizedAccess(e);
		}
		finally{
			loading_overlay.Hide();
		}
	};
	async function update_user_info(){
		view.Head_Card.member_name.innerHTML="會員 :"+user_info.name;
		// view.Head_Card.frame_date.innerHTML = next_bid_date.toString().slice(0, 3) + " " + next_bid_date.toString().slice(4, 15);
		console.log(next_bid_date);


		// view.Head_Card.frame_date.innerHTML = next_bid_date.toDateString().slice(0, 3) +" "+ 
		// 	next_bid_date.getFullYear()+" "+ (next_bid_date.getMonth()+1) +" "+ next_bid_date.getDate();
	};

	function ResetPage(){
		STATE.cursor = null;
		STATE.query = {};
		// {
		// 	const accessor = view;
		// 	accessor.region_list.innerHTML = '';
		// }

		// {
		// 	const accessor = view.region_info;
		// 	accessor.element.addClass('hide');
		// }
	};


	
})();
