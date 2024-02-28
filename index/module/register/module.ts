(async () => {
	// Rrgion for TypeScript
	// type User = {
	// 	uid?: uniqid,
	// 	nid: string,
	// 	name: string,
	// 	gender?: 'M'|'F',
	// 	birth_date: string,
	// 	address: string,
	// 	line_id?: string,
	// 	contact_home_number: string,
	// 	contact_mobile_number: string,
	// 	role?: number,
	// 	bank_code: string,
	// 	branch_code: string,
	// 	bank_account_name: string,
	// 	bank_account_number: string,
	// 	emergency_nid: uniqid,
	// 	emergency_contact: string,
	// 	emergency_contact_number: string,
	// 	emergency_contact_relation: string,
	// 	relative_path?: string,
	// 	referrer_uid?: uniqid,
	// 	referrer_path?: string,
	// 	volunteer_uid?: uniqid,
	// 	volunteer_path?: string,
	// 	revoked?: boolean,
	// 	password: string,
	// 	update_time?: number,
	// 	create_time?: number,
	// 	[key:string]:any,
	// };
	
	const TAG = 'register';
    const LANG_NAME_MAP = {en_us:'英文', zh_tw:'繁體中文', zh_cn:'簡體中文'};
    type QueryParam = {};
	type PagingCursor = Awaited<ReturnType<typeof window.ROSKA_FORM.Do_Register_User_Info>>;
	const STATE:{
		query:QueryParam;
		cursor:PagingCursor|null;
	} = {
		query:{},
		cursor:null
	};

	const modules = window.modules;
	const viewport = window.viewport;	
	const view = window.register_overlay;
	const loading_overlay = window.loading_overlay;

	modules.push({
		init: async function(){
			const [{element: layout}] = await window.resources([
				{ type: 'html', path: './module/register/module.html'},
				{ type: 'css', path: './module/register/module.css' }
			]);

			view.element.innerHTML = layout.innerHTML;
			view.relink();
			layout.remove();
		}
	});

	// view
	// .on('register_user',async(_e:any)=>{
	// 	do_register_user();
	// }) 
	// .on('open_tab_member',(e:any)=>{
	// 	// accessor.member_content.addClass="active"
	// 	const accessor = view.input_data;
	// 	console.log(accessor.member_content);
	// 	accessor.member_content.style.display="flex";
	// 	accessor.recommendation_info.style.display="none";
	// 	accessor.bank_info_content.style.display="none";

	// 	accessor.btn_open_tab_member.classList.add('active');
	// 	accessor.btn_open_tab_recommand.classList.remove('active');
	// 	accessor.btn_open_tab_bankinfo.classList.remove('active');
	// })
	// .on('open_tab_recommand',(e:any)=>{
	// 	const accessor = view.input_data;
	// 	console.log(accessor.recommendation_info);
	// 	accessor.member_content.style.display="none";
	// 	accessor.recommendation_info.style.display="flex";
	// 	accessor.bank_info_content.style.display="none";

	// 	accessor.btn_open_tab_member.classList.remove('active');
	// 	accessor.btn_open_tab_recommand.classList.add('active');
	// 	accessor.btn_open_tab_bankinfo.classList.remove('active');
	// })
	// .on('open_tab_bankinfo',(e:any)=>{
	// 	const accessor = view.input_data;
	// 	console.log(accessor.bank_info_content);
	// 	accessor.member_content.style.display="none";
	// 	accessor.recommendation_info.style.display="none";
	// 	accessor.bank_info_content.style.display="flex";

	// 	accessor.btn_open_tab_member.classList.remove('active');
	// 	accessor.btn_open_tab_recommand.classList.remove('active');
	// 	accessor.btn_open_tab_bankinfo.classList.add('active');
	// })     
	// .on('load_test_register_userinfo',(e:any)=>{
	// 	// Develope Help rigion
	// 	const accessor = view.input_data;
	// 	accessor.nid.value = 'F123456777';
	// 	accessor.name.value = '崊老師';
	// 	accessor.password.value = 'A1234567';
	// 	accessor.gender.value = 'M';
	// 	accessor.birth_date.value = '1984-01-17';
	// 	accessor.address.value = '新北市汐止區連興街116號';
	// 	accessor.line_id.value = '';
	// 	accessor.contact_home_number.value = "0226481872";
	// 	accessor.contact_mobile_number.value = "0921136362";
	// 	accessor.bank_code.value;
	// 	accessor.branch_code.value;
	// 	accessor.bank_account_number.value;
	// 	accessor.emergency_nid.value = "A1234567890";
	// 	accessor.emergency_contact.value = "Cheny";
	// 	accessor.emergency_contact_number.value = "0226481872";
	// 	accessor.emergency_contact_relation.value;
	// referrer_mobile_number: undefined,
	// volunteer_mobile_number: undefined,
	// 	accessor.relink();
	// });

	async function do_register_user(){
		// User_Infoa: UserInfo)

        const accessor = view.input_data;
		const Register_input_Data: typeof ROSKA_FORM.Do_Register_User_Info.prototype= {
            nid: '',
            name: '',
            gender: 'M',
            birth_date: '',
            address: '',
            line_id: '',
            contact_home_number: '',
            contact_mobile_number: '',
            bank_code: '',
            branch_code: '',
            bank_account_name: '',
            bank_account_number: '',
            emergency_nid: '',
            emergency_contact: '',
            emergency_contact_number: '',
            emergency_contact_relation: '',
            referrer_mobile_number: undefined,
            volunteer_mobile_number: undefined,
			password: '',
		}
        for (const key in Register_input_Data) {          
            if(accessor[key]){
                Register_input_Data[key]=accessor[key].value;
			}
        };
		console.log("check02",Register_input_Data);
		try{
			let result = await ROSKA_FORM.Do_Register_User_Info(Register_input_Data);
		}catch (e: any) {
			alert(`註冊失敗(${e.message})`);
			console.error(`[${TAG}]`, e);
		}
		
	}


	function ResetPage(){
		STATE.cursor = null;
		STATE.query = {};

		{
			const accessor = view;
			accessor.region_list.innerHTML = '';
		}

		{
			// const accessor = view.region_info;
			// accessor.element.addClass('hide');
		}
	}


	
})();
