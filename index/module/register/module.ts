// import { register } from "module";

import { Interface } from "mocha";
import { UserInfo } from "os";

(async () => {

	const TAG = 'register';
    const LANG_NAME_MAP = {en_us:'英文', zh_tw:'繁體中文', zh_cn:'簡體中文'};
    type QueryParam = {};
	type PagingCursor = Awaited<ReturnType<typeof window.ROSKA_FORM.Do_Register_User>>;
	const STATE:{
		query:QueryParam;
		cursor:PagingCursor|null;
	} = {
		query:{},
		cursor:null
	};

	// type Register_input_Data_type = {[key:string]:{type:'M'|'F'|'number'|'string'|uniqid}};
	// const Register_input_Data:Register_input_Data_type = {
	// 	nid: {type:'string'},
	// 	name: {type:'string'},
	// 	gender: {type:'string'},
	// 	birth_date: {type:'string'},
	// 	address: {type:'string'},
	// 	line_id: {type:'string'},
	// 	contact_home_number: {type:'string'},
	// 	contact_mobile_number: {type:'string'},
	// 	role: {type:'number'},
	// 	bank_code: {type:'string'},
	// 	branch_code: {type:'string'},
	// 	bank_account_name: {type:'string'},
	// 	bank_account_number: {type:'string'},
	// 	emergency_nid: {type:'string'},
	// 	emergency_contact: {type:'string'},
	// 	emergency_contact_number: {type:'string'},
	// 	emergency_contact_relation: {type:'string'},
	// 	referrer_nid: {type:'string'},
	// 	volunteer_nid: {type:'string'},
	// 	password: {type:'string'},

	// }
	const Register_input_Data:Interface ,UserInfo = {};

	const modules = window.modules;
	const viewport = window.viewport;	
	const view = viewport.register_view;
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

	view
	.on('register_user',async(_e:any)=>{
		do_register_user();
	});

	async function do_register_user(){
		// User_Infoa: UserInfo)

        const accessor = view.input_data;

        for (const key in Register_input_Data) {           
            if(accessor[key]){
                Register_input_Data[key]=accessor[key].value;
			}
			//Check input data 增加
        };
		ROSKA_FORM.Do_Register_User(Register_input_Data);

        console.log("check point 2",Register_input_Data);

			// Register_input_Data.nid = accessor.nid.value;  
			// Register_input_Data.name = accessor.name.value;  
			// Register_input_Data.password = accessor.password.value;
			// Register_input_Data.gender = accessor.gender.value;
			// Register_input_Data.birth_date = accessor.birth_date.value;
			// Register_input_Data.address = accessor.address.value;
			// Register_input_Data.line_id = accessor.line_id.value;
			// Register_input_Data.contact_home_number = accessor.contact_home_number.value;
			// Register_input_Data.contact_mobile_number = accessor.contact_mobile_number.value;
			// Register_input_Data.bank_code = accessor.bank_code.value;
			// Register_input_Data.branch_code = accessor.branch_code.value;
			// Register_input_Data.bank_account_number = accessor.bank_account_number.value;
			// Register_input_Data.emergency_nid = accessor.emergency_nid.value;
			// Register_input_Data.emergency_contact = accessor.emergency_contact.value;
			// Register_input_Data.emergency_contact_number = accessor.emergency_contact_number.value;
			// Register_input_Data.emergency_contact_relation = accessor.emergency_contact_relation.value;  
			// Register_input_Data.referrer_nid = accessor.referrer_nid.value;  
			// Register_input_Data.volunteer_nid = accessor.volunteer_nid.value;  
		
	}


	function ResetPage(){
		STATE.cursor = null;
		STATE.query = {};

		{
			const accessor = view;
			accessor.region_list.innerHTML = '';
		}

		{
			const accessor = view.region_info;
			accessor.element.addClass('hide');
		}
	}


	
})();
