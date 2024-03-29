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
		update_user_info();
		// list_settlement_list()
		// 	.catch((e:any) => {
		// 	console.error(e);
		// 	// alert(`載入失敗！(${e.message})`);
		// 	window.HandleUnauthorizedAccess(e);
		// 	})
		// 	.finally(() => {
		// 	loading_overlay.Hide();
		// 	});
		ResetPage();
	});

	async function update_user_info(){
		view.Head_Card.member_name.innerHTML="會員 :"+user_info.name;
		var next_bid_date = new Date(2024, 3, 10);
        view.Head_Card.frame_date.innerHTML = next_bid_date.toDateString().slice(0,3)+" 2024 4月 10日";
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
