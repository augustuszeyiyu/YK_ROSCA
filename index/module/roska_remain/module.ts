(async () => {
	const TAG = 'roska_new';
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

	// type User =  typeof ROSKA_FORM.DataType;;

	// const testtest={} as User 
	// const Register_input_Data = {} as ROSKA_FORM.DataType.Rigister_UserInfo;

	// type Register_input_Data_type = {[key:string]:{type:'M'|'F'|'number'|'string'|uniqid}};
	// const Register_input_Data= {} as User;

	// const Register_input_Data:Interface ,UserInfo = {};



	const modules = window.modules;
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
	});


	
    async function list_new_group_serial() {
        // console.log('123');
        const list_data = await ROSKA_FORM.Get_on_list();
        // const { region_list: list, total_records,tmpl_item  } = view.list_container;
        const region_list = view.list_container.region_card_list;
        const tmpl_item = view.list_container.tmpl_card;
        var count = 1;
        // console.log(list_data[0]);
        const records = list_data;
        for(const record of records) {
			count += 1;
        	const elm = tmpl_item.duplicate();
			elm.element.dataset.id = record.sid;

            elm.gruou_sid.textContent = record.sid;
            elm.period.textContent = "共" + record.cycles + "期";
            elm.bid_status.textContent = '開標日期';
            elm.bid_status.style = "color:green;";
            elm.period_date.textContent = record.bid_start_time.slice(0, 10);

            elm.des_g_name.innerHTML = "會組內名稱";
            elm.name_in_group.textContent = record.mid;
			if(!record.mid){
				elm.name_in_group.style = "color:green; font-weight:600;";
			}
			else{
				elm.name_in_group.style = "color:green; font-weight:600;";
			}

            
            elm.count_in_group.innerHTML = "NT 5000";

			elm.period_01.innerHTML = "&emsp;";
            elm.duration.textContent = "共" + record.cycles + "期";


			elm.bid_amount.innerHTML = "NT 1,000";
			elm.max_bid_amount.innerHTML ="最高標金";

        // 	elm.create_time.textContent = record.create_time.slice(0 , 10)+" "+record.create_time.slice(11 , -5);
        // 	elm.count.textContent = count;
        
        // 	elm.sid.textContent= record.sid;
      		region_list.appendChild(elm.element);
        }

		// for ( var i = 2, j = 1; j < 10; i == 9 ? i = (++j/j) + 1 : i++) {
        //     console.log("%d*%d=%d %c", i, j, i * j, i == 9 ? '\n' : ' ');
		// }

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
