(async () => {
	const TAG = 'roska_last';
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
	const view = viewport.roska_last_view;
	const loading_overlay = window.loading_overlay;

	modules.push({
		init: async function(){
			const [{element: layout}] = await window.resources([
				{ type: 'html', path: './module/roska_last/module.html'},
				{ type: 'css', path: './module/roska_last/module.css' }
			]);

			view.element.innerHTML = layout.innerHTML;
			view.relink();
			layout.remove();
		}
	});

	view
	.on('view-state', (e:any) => {
		if (e.state !== "show")
			return;
		loading_overlay.Show();
		// personal_bid_info();
		ResetPage();
		update_user_info();
		list_settlement_list()
			.catch((e:any) => {
			console.error(e);
			// alert(`載入失敗！(${e.message})`);
			window.HandleUnauthorizedAccess(e);
			})
			.finally(() => {
			loading_overlay.Hide();
			});
		
	});

	async function personal_bid_info() {
		const user_info = await ROSKA_FORM.Get_user_info();
	}
	
	async function update_user_info(){
		view.Head_Card.member_name.innerHTML="會員 :"+user_info.name;
		view.Head_Card.frame_date.innerHTML = next_bid_date.toString().slice(0, 3) + " " + next_bid_date.toString().slice(4, 15);
	}
    async function list_settlement_list() {
 
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

		try {
			const list_data = await ROSKA_FORM.Get_settlement_list();
			view.region_list.textContent = " ";
			const region_list = view.region_list;
			const tmpl_item = view.tmpl_item;
			// console.log("list_data");
			// console.log(list_data);

            view.bided_date.innerHTML = "前次開標日期 : "+ pre_bid_date.toString().slice(0, 3) + " " + pre_bid_date.toString().slice(4, 15);
			const pay_over_view = [];
			var count = 1;
		
			const records = list_data;
			// console.log(records);
			for(const record of records) {
				var che = record.group_info.at(-1);
				// console.log(che);
				if( Number(che.win_amount) === 0 ){
					continue;
				};

				var record_pre_bid_end_time = new Date(record.group_info.at(-1).bid_end_time);
				var today_this = new Date();
				var this_bid_date = ROSKA_FORM.Tools.calculateMonthlyBitStartTime(today_this,0);					
				var inteval = Number(this_bid_date.getMonth())-Number(record_pre_bid_end_time.getMonth());
				// console.log( {inteval,this_bid_date,record_pre_bid_end_time});
					if(inteval > 0){
						console.log("break point 2");
						continue;
					}

				// console.log(record);
				const elm = tmpl_item.duplicate();

				// console.log(record.group_info.at(-1));
				const lastGroupInfo = record.group_info.at(-1);
				const winAmount = parseInt(lastGroupInfo.win_amount, 10);
				switch(record.group_info.at(-1).win_amount){
					case -4000:{
						settlement_data.alive_account +=1;
						break;
					}
					case -5000:{
						settlement_data.deth_account +=1;
						break;
					}
					default : {
						settlement_data.win_account.gids.push(lastGroupInfo);
						settlement_data.win_account.win_amount += winAmount;
						
						elm.count.textContent = ROSKA_FORM.Tools.pad_zero(count ,3);
						count += 1;
						elm.sid.textContent= record.sid.slice(0, 6);

						elm.pay_amount.textContent = record.group_info.at(-1).win_amount||"pay_amount";
						// elm.memebr_mid.textContent = record.mid.slice(0, 6)+record.mid.slice(-1, 2);
						
						elm.memebr_mid.textContent = record.mid.slice(-2);
		
						elm.view_group.dataset.role = 'view_group';
						elm.view_group.dataset.relSid = record.sid;
						const button_group_detail =  document.createElement("samp")
						button_group_detail.classList.add("glyph-fontawesome-search");
						elm.view_group_icon.appendChild(button_group_detail);
		
						region_list.appendChild(elm.element);
					}
				}

			}
			const pay_list = view.pay_list;
			pay_list.win_account.innerHTML = "";
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

    }
	async function _nini(){
			// for ( var i = 2, j = 1; j < 10; i == 9 ? i = (++j/j) + 1 : i++) {
			//     console.log("%d*%d=%d %c", i, j, i * j, i == 9 ? '\n' : ' ');
			// }

	}

	function ResetPage(){
		STATE.cursor = null;
		STATE.query = {};

		// {
		// 	const accessor = view;
		// 	accessor.list_container.region_card_list.innerHTML = '';
		// 	// accessor.region_card_list.innerHTML = '';
		// }

		// {
		// 	const accessor = view.region_info;
		// 	accessor.element.addClass('hide');
		// }
	}


	
})();
