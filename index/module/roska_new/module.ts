(async () => {
	const TAG = 'roska_new';
    const LANG_NAME_MAP = {en_us:'英文', zh_tw:'繁體中文', zh_cn:'簡體中文'};
    type QueryParam = {};
	type PagingCursor = Awaited<ReturnType<typeof window.ROSKA_FORM.Do_Register_User_Info>>;
	// type User =  typeof ROSKA_FORM.DataType;;
	const { resolve, promise } = ROSKA_FORM.Tools.FlattenPromise<void>();
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
	const view = viewport.roska_new_view;
	const loading_overlay = window.loading_overlay;

	modules.push({
		init: async function(){
			const [{element: layout}] = await window.resources([
				{ type: 'html', path: './module/roska_new/module.html'},
				{ type: 'css', path: './module/roska_new/module.css' }
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
	.on('click', async (e:any) => {
        const trigger = e.target;
        const Card = trigger.closest('.Card');
        var trigger_sid = Card.dataset.id
        if (!Card){ return; }
        switch (Card.dataset.role) {
            case  "join_in_group" : {
                join_in_group(trigger_sid);
            }
        }
	})
	.on('join_in_group', async (e:any) => {
		console.log('為什麼沒反應');
	});

	// join_in_group
	
    async function list_new_group_serial() {
        const list_data = await ROSKA_FORM.Get_new_list();
        // const { region_list: list, total_records,tmpl_item  } = view.list_container;
        const region_list = view.list_container.region_card_list;
        const tmpl_item = view.list_container.tmpl_card;
        var count = 0;
        const records = list_data;
        for(const record of records) {
			
        	const elm = tmpl_item.duplicate();
			elm.element.dataset.id = record.sid;
			elm.element.dataset.role = "join_in_group";
			// elm.top_left_text.textContent

            elm.gruou_sid.textContent = record.sid;
            elm.period.textContent = "共" + record.cycles + "期";
            elm.bid_status.textContent = '開標日期';
            elm.bid_status.style = "color:gray; font-size:14px ; font-weight: 400px;";
            elm.period_date.textContent = record.bid_start_time.slice(0, 10);

            elm.des_g_name.innerHTML = "新會組";
            elm.name_in_group.textContent = ROSKA_FORM.Tools.pad_zero(count ,3) ;
            elm.name_in_group.style = "color:green; font-weight:600;";
            elm.count_in_group.innerHTML = "基本會款 NT" + record.basic_unit_amount;

			elm.period_01.innerHTML = "&emsp;";
            elm.duration.textContent = "共" + record.cycles + "期";

			// elm.bid_amount.textContent = '新會組';
			// elm.name_in_group.textContent = '新會組';

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
		count += 1;
    }
	async function update_user_info(){
		view.Head_Card.member_name.innerHTML="會員 :"+user_info.name;
		view.Head_Card.frame_date.innerHTML = next_bid_date.toString().slice(0, 3) + " " + next_bid_date.toString().slice(4, 15);
	}

	async function join_in_group(trigger_sid:any) {
		var joinornot = confirm("確定要加入會組 : "+trigger_sid+"嗎?")
		if(!joinornot){return;}
		try{ 
			await ROSKA_FORM.Join_in_groups(trigger_sid);
			resolve();
		}
		catch(e:any){
			console.error(`[${TAG}]`, e);
		}
		finally{
			alert("sucess_join_new_groups!");
		}
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
