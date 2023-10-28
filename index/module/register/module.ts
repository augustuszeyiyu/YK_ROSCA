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



	const modules = window.modules;
	const viewport = window.viewport;	
	const view = viewport.maintenance_view;
	const loading_overlay = window.loading_overlay;

	modules.push({
		init: async function(){
			const [{element: layout}] = await window.resources([
				{type: 'html', path: './module/maintenance/module.html'},
			]);

			view.element.innerHTML = layout.innerHTML;
			view.relink();
			layout.remove();



			{
				const accessor = view.region_info;
				const {region_edit:edit, tmpl_item_content} = accessor;

				// NOTE: Relink elements
				accessor.relink();
			}



			{
				let timeout:any = null;
				view.region_list
				.on('scroll', (e:any)=>{
					if ( !timeout ) {
						timeout = setTimeout(()=>{
							timeout = null;
							view.region_list.emit('mouse-scroll');
						}, 100);
					}
				})
				// .on('mouse-scroll', (e:any)=>{
				// 	const target = e.target;
				// 	const current_pos = target.scrollTop + target.clientHeight;
				// 	const trigger_line = target.scrollHeight - 5;

				// 	const cursor = STATE.cursor;
				// 	if ( current_pos >= trigger_line && cursor !== null ) {
				// 		const {page, page_size} = cursor.meta;
				// 		LoadAndUpdateList(STATE.query, {page: page + 1, page_size});
				// 	}
				// });
			}
		}
	});



	// view
	// .on( 'view-state', (e:any)=>{
	// 	if ( e.state !== "show" ) return;

	// 	ResetPage();
	// 	LoadAndUpdateList(STATE.query);
	// })
	// .on( 'show-create-clicked', (_e:any)=>{
	// 	ResetInformation();
	// })
	// .on( 'do-create-info', async(_e:any)=>{
	// 	if(!confirm('是否確定新增？')) return;

	// 	const accessor = view.region_info;
	// 	const updates:any = {title:{}, content:{}};
	// 	const errors:string[] = [];

	// 	const type = accessor.type.value;
	// 	if(INFO_TYPES.includes(type)) {
	// 		updates.type = type;
	// 	}
	// 	else {
	// 		errors.push('請選擇類型！');
	// 	}

	// 	const display_time = accessor.display_time.value.trim();
	// 	{
	// 		const obj_time = dayjs(display_time);
	// 		if(obj_time.isValid()) {
	// 			updates.display_time = obj_time.unix();
	// 		}
	// 		else {
	// 			errors.push('顯示時間格式錯誤！');
	// 		}
	// 	}

	// 	const start_time = accessor.start_time.value.trim();
	// 	{
	// 		const obj_time = dayjs(start_time);
	// 		if(obj_time.isValid()) {
	// 			updates.start_time = obj_time.unix();
	// 		}
	// 		else {
	// 			errors.push('開始時間格式錯誤！');
	// 		}
	// 	}

	// 	const end_time = accessor.end_time.value.trim();
	// 	{
	// 		const obj_time = dayjs(end_time);
	// 		if(obj_time.isValid()) {
	// 			updates.end_time = obj_time.unix();
	// 		}
	// 		else {
	// 			errors.push('結束時間格式錯誤！');
	// 		}			
	// 	}

	// 	for(const language of LANGUAGES) {
	// 		const title = accessor[`title_${language}`].value.trim();
	// 		const content = CKEDITOR.instances[`content_${language}`].getData();

	// 		if(title) {
	// 			updates.title[language] = title;
	// 		}
	// 		else {
	// 			errors.push(`請輸入${LANG_NAME_MAP[language]}標題！`);
	// 		}

	// 		if(content) {
	// 			updates.content[language] = content;
	// 		}
	// 		else {
	// 			errors.push(`請輸入${LANG_NAME_MAP[language]}內容！`);
	// 		}			
	// 	}


	// 	if(errors.length > 0) {
	// 		alert(errors.join('\n'));
	// 		return;
	// 	}



	// 	accessor.btn_save.disabled = true;
	// 	window.AIHunter.CreateMaintenanceInfo(updates)
	// 	.then(async()=>{
	// 		ResetPage();
	// 		LoadAndUpdateList(STATE.query);
	// 	})
	// 	.catch((e)=>{
	// 		console.error(e);
	// 		alert(`更新失敗！無法新增公告資訊！(${e.message})`);
	// 		window.HandleUnauthorizedAccess(e);
	// 	})
	// 	.finally(()=>{
	// 		accessor.btn_save.disabled = false;
	// 	});
	// })
	// .on( 'item-clicked', (_e:any)=>{
	// 	const {original:e} = _e;
	// 	const item = e.target.closest('.row');
	// 	if ( !item ) return;

	// 	LoadAndShowInformation(item.dataset.id)
	// })
	// .on( 'do-update-info', async(_e:any)=>{
	// 	const accessor = view.region_info;
	// 	const id = accessor.btn_save.dataset.id;

	// 	// REGION: [ For create operation ]
	// 	if(!id) {
	// 		view.emit('do-create-info');
	// 		return;
	// 	}
	// 	// ENDREGION



	// 	if(!confirm('是否確定修改？')) return;



	// 	const updates:any = {title:{}, content:{}};
	// 	const errors:string[] = [];

	// 	const type = accessor.type.value;
	// 	if(type !== '' && INFO_TYPES.includes(type)) {
	// 		updates.type = type;
	// 	}
	// 	else {
	// 		errors.push('請選擇類型！');
	// 	}

	// 	const display_time = accessor.display_time.value.trim();
	// 	if(display_time !== '') {
	// 		const obj_time = dayjs(display_time);
	// 		if(obj_time.isValid()) {
	// 			updates.display_time = obj_time.unix();
	// 		}
	// 		else {
	// 			errors.push('顯示時間格式錯誤！');
	// 		}
	// 	}

	// 	const start_time = accessor.start_time.value.trim();
	// 	if(start_time !== '') {
	// 		const obj_time = dayjs(start_time);
	// 		if(obj_time.isValid()) {
	// 			updates.start_time = obj_time.unix();
	// 		}
	// 		else {
	// 			errors.push('開始時間格式錯誤！');
	// 		}
	// 	}

	// 	const end_time = accessor.end_time.value.trim();
	// 	if(end_time !== '') {
	// 		const obj_time = dayjs(end_time);
	// 		if(obj_time.isValid()) {
	// 			updates.end_time = obj_time.unix() + 86400 - 1;
	// 		}
	// 		else {
	// 			errors.push('結束時間格式錯誤！');
	// 		}
	// 	}

	// 	for(const language of LANGUAGES) {
	// 		const title = accessor[`title_${language}`].value.trim();
	// 		const content = CKEDITOR.instances[`content_${language}`].getData();

	// 		if(title) {
	// 			updates.title[language] = title;
	// 		}
	// 		else {
	// 			errors.push(`請輸入${LANG_NAME_MAP[language]}標題！`);
	// 		}

	// 		if(content) {
	// 			updates.content[language] = content;
	// 		}
	// 		else {
	// 			errors.push(`請輸入${LANG_NAME_MAP[language]}內容！`);
	// 		}			
	// 	}


	// 	if(errors.length > 0) {
	// 		alert(errors.join('\n'));
	// 		return;
	// 	}



	// 	accessor.btn_save.disabled = true;
	// 	window.AIHunter.UpdateMaintenanceInfo(id, updates)
	// 	.then(async()=>{
	// 		ResetPage();
	// 		LoadAndUpdateList(STATE.query);
	// 	})
	// 	.catch((e)=>{
	// 		console.error(e);
	// 		alert(`更新失敗！無法更新公告資訊！(${e.message})`);
	// 		window.HandleUnauthorizedAccess(e);
	// 	})
	// 	.finally(()=>{
	// 		accessor.btn_save.disabled = false;
	// 	});
	// });



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

	// async function LoadAndUpdateList(query:QueryParam, paging?:any) {
	// 	try {
	// 		loading_overlay.Show();
	// 		const {region_list:list, total_records, tmpl_item} = view;
	// 		STATE.cursor = await window.AIHunter.GetMaintenanceList(query, paging);

	// 		total_records.textContent = STATE.cursor.meta.total_records;

	// 		const {records} = STATE.cursor;
	// 		for(const record of records) {
	// 			const create_time = dayjs.unix(record.create_time);
	// 			const elm = tmpl_item.duplicate();
	// 			elm.element.dataset.id = record.id;
	// 			elm.title.textContent = record.title[DEFAULT_LIST_LANGUAGE];
	// 			elm.id.textContent = record.id;
	// 			elm.create_time.textContent = create_time.format("YYYY/MM/DD HH:mm");
	// 			elm.create_time.title = create_time.format("YYYY/MM/DD HH:mm:ss");

	// 			list.appendChild(elm.element);
	// 		}
	// 	}
	// 	catch(e:any) {
	// 		console.error(e);
	// 		alert(`載入失敗！無法取得公告列表！(${e.message})`);
	// 		window.HandleUnauthorizedAccess(e);
	// 	}
	// 	finally{
	// 		loading_overlay.Hide();
	// 	}
	// }

	// async function ResetInformation() {
	// 	view.announcement_id.textContent = '(新增)';

	// 	const accessor = view.region_info;
	// 	accessor.btn_save.dataset.id = '';
	// 	accessor.id.textContent = '';
	// 	accessor.type.value = '';

	// 	for(const language of LANGUAGES) {
	// 		accessor[`title_${language}`].value = '';
	// 		CKEDITOR.instances[`content_${language}`].setData('');
	// 	}

	// 	accessor.display_time.value = '';
	// 	accessor.start_time.value = '';
	// 	accessor.end_time.value = '';

	// 	accessor.element.removeClass('hide');
	// }

	// async function LoadAndShowInformation(id:string) {
	// 	try {
	// 		loading_overlay.Show();
	// 		const record = await window.AIHunter.GetMaintenanceInfo(id);
	// 		view.announcement_id.textContent = record.id;

	// 		const accessor = view.region_info;
	// 		accessor.btn_save.dataset.id = record.id;
	// 		accessor.id.textContent = record.id;
	// 		accessor.type.value = record.type;

	// 		for(const language of LANGUAGES) {
	// 			accessor[`title_${language}`].value = record.title[language];
	// 			CKEDITOR.instances[`content_${language}`].setData(record.content[language]);
	// 		}

	// 		accessor.display_time.value = dayjs.unix(record.display_time).format("YYYY-MM-DD");
	// 		accessor.start_time.value = dayjs.unix(record.start_time).format("YYYY-MM-DD");
	// 		accessor.end_time.value = dayjs.unix(record.end_time).format("YYYY-MM-DD");
	// 		accessor.element.removeClass('hide');
	// 	}
	// 	catch(e:any) {
	// 		console.error(e);
	// 		alert(`載入失敗！無法取得公告資料！(${e.message})`);
	// 		window.HandleUnauthorizedAccess(e);
	// 	}
	// 	finally {
	// 		loading_overlay.Hide();
	// 	}
	// }
})();
