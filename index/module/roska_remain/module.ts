(async () => {
	const TAG = 'roska_new';
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
	const modal_view = window.modal_view;	
	const viewport = window.viewport;	
	const view = viewport.roska_remain_view;
	const loading_overlay = window.loading_overlay;



	modules.push({
		init: async function(){
			const [{element: layout}] = await window.resources([
				{ type: 'html', path: './module/roska_remain/module.html'},
				{ type: 'css', path: './module/roska_remain/module.css' }
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
		ResetPage();
		update_user_info();
		list_new_group_serial()
			.catch((e:any) => {
			console.error(e);
			// alert(`載入失敗！(${e.message})`);
			window.HandleUnauthorizedAccess(e);
			})
			.finally(() => {
			loading_overlay.Hide();
			});
		ResetPage();
	})
	.on('click', async(e:any)=>{
		const trigger = e.target;
		const card = trigger.closest('.Card');
		
		if ( !card) return;
		
		switch(card.dataset.role) {
			// case APPLICATION_TYPE.UPGRADE_ADVANCED:
			// case APPLICATION_TYPE.UPGRADE_BUSINESS:
			// case APPLICATION_TYPE.BUY_ADVERT_POINT:
			// case APPLICATION_TYPE.WITHDRAW: {
			//     window.location.href = "/admin/member/approval/" + button.dataset.relId;
			//     break;
			// }
			
			// case APPLICATION_TYPE.PROFILE_VERIFICATION: {
			//     window.location.href = "/admin/member/info-approval/" + button.dataset.relId;
			//     break;
			// }
			// case APPLICATION_TYPE.PROFILE_VERIFICATION: {
			// 	window.open("/admin/member/info-approval/" + button.dataset.relId,innerHeight=500,innerWidth=500);
			// 	break;
			// }
			case "bid": {
				// window.location.href = "/admin/member/info/" + row.dataset.relId;
				window.open("./"+'?'+ 'sid='+card.dataset.relId , 'innerHeight=1600' ,'innerWidth=800',);
				// window.open("./module/roska_new_view/modals.html" + button.dataset.relId, innerHeight=1600,innerWidth=800,);
				break;
				
			}
			case "view_group": {
				// window.location.href = "/admin/member/info/" + row.dataset.relId;
				window.open("./"+'?'+ 'sid='+card.dataset.sid +'&'+'modal=group_view', 'innerHeight=800' ,'innerWidth=800',);
				// window.open("./module/roska_new_view/modals.html" + button.dataset.relId, innerHeight=1600,innerWidth=800,);
				break;
				
			}
			
			default:
				alert("您沒有權限使用該功能！\\n請使用更高權限等級的帳號執行此操作！");
				return;
		}
	})
	;


	
    async function list_new_group_serial() {
        const list_data = await ROSKA_FORM.Get_on_list();
        // const { region_list: list, total_records,tmpl_item  } = view.list_container;
        const region_list = view.list_container.region_card_list;
        const tmpl_item = view.list_container.tmpl_card;
        var count = 0;
        const records = list_data;
		console.log(records);
        for(const record of records) {
			console.log(record);
			const elm = tmpl_item.duplicate();
            elm.element.dataset.sid = record.sid;
			elm.element.dataset.role = 'view_group';

            elm.gruou_sid.textContent = record.sid;
            elm.gruou_sid.style = "color:green; font-size:1rem;";
            elm.period.textContent = "共" + record.cycles + "期";
            elm.bid_status.textContent = '起標日期';
            elm.bid_status.style = "color:#3c434a;";
            elm.period_date.textContent = record.bid_start_time.slice(0, 10);
            elm.des_g_name.innerHTML = "會組序號";
            elm.name_in_group.innerHTML = record.mid.slice(-2);
            if (!record.mid) {
                elm.name_in_group.style = "color:green; font-weight:600;";
            }
            else {
                elm.name_in_group.style = "color:green; font-weight:600;";
            }
            elm.count_in_group.innerHTML = "NT "+record.basic_unit_amount;
            elm.period_01.innerHTML = "&emsp;";
            elm.duration.textContent = "共" + record.cycles + "期";
            elm.bid_amount.innerHTML = "NT 1,000";
            elm.max_bid_amount.innerHTML = "最高標金";
        // 	elm.create_time.textContent = record.create_time.slice(0 , 10)+" "+record.create_time.slice(11 , -5);
        // 	elm.count.textContent = count;      
      		region_list.appendChild(elm.element);
        }

		// for ( var i = 2, j = 1; j < 10; i == 9 ? i = (++j/j) + 1 : i++) {
        //     console.log("%d*%d=%d %c", i, j, i * j, i == 9 ? '\n' : ' ');
		// }
		count += 1;
    }
	async function update_user_info(){
		view.Head_Card.member_name.innerHTML="會員 :"+user_info.name;
		view.Head_Card.frame_date.innerHTML = next_bid_date.toString().slice(0, 3) + " " + next_bid_date.toString().slice(4, 15);
	}

	function ResetPage(){
		STATE.cursor = null;
		STATE.query = {};

		{
			const accessor = view;
			accessor.list_container.region_card_list.innerHTML = '';
			// accessor.region_card_list.innerHTML = '';
		}

		// {
		// 	const accessor = view.region_info;
		// 	accessor.element.addClass('hide');
		// }
	}


	
})();
