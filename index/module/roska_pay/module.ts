(async () => {
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
	.on('click', async(e:any)=>{
		const trigger = e.target;
		console.log(trigger);
		const row = trigger.closest('.t-row');
		if ( !row ) return;		
		const button = trigger.closest('.view-group');	
			
		if ( !button || !row ) return;		
		switch(button.dataset.role) {
			case "view_group": {
				window.open("./"+'?'+ 'sid='+button.dataset.relSid +'&'+ "next_gid="+ button.dataset.next_gid  +'&'+'modal=pay_group_view', 'innerHeight=800' ,'innerWidth=800',);
				break;				
			}
			
			default:
				alert("您沒有權限使用該功能！\\n請使用更高權限等級的帳號執行此操作！");
				return;
		}
	});
	async function list_settlement_serial() {
		try {
			const list_data = await ROSKA_FORM.Get_settlement_list();
			view.region_list.textContent = " ";
			const region_list = view.region_list;
			const tmpl_item = view.tmpl_item;
			console.log("list_data");
			console.log(list_data);
			var count = 1;
			// const { total_records } = view.continue_list_container.list_container;	
			// total_records.textContent =list_data.meta.total_records;	
		
			const records = list_data;
			for(const record of records) {
				const elm = tmpl_item.duplicate();

				elm.count.textContent = ROSKA_FORM.Tools.pad_zero(count ,3);
				count += 1;
				elm.sid.textContent= record.sid.slice(0, 6);
				// elm.pay_amount.textContent = record.prev_gid.mid;
				elm.pay_amount.textContent = "pay_amount";
				elm.memebr_mid.textContent = record.sid.slice(0, 6);
				
				elm.view_group.dataset.role = 'view_group';
				elm.view_group.dataset.relSid = record.sid;
				const button_group_detail =  document.createElement("samp")
				button_group_detail.classList.add("glyph-fontawesome-search");
				elm.view_group_icon.appendChild(button_group_detail);

				

				region_list.appendChild(elm.element);
			}
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
	async function update_user_info(){
		view.Head_Card.member_name.innerHTML="會員 :"+user_info.name;
		var next_bid_date = new Date(2024, 7, 10);
        view.Head_Card.frame_date.innerHTML = next_bid_date.toDateString().slice(0,3)+" 2024 7月 10日";
	}

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
	}


	
})();
