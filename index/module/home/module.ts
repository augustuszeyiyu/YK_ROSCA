( async()=>{

    
	const TAG = 'init';
	const COOKIE_ACCESS_TOKEN = 'ROSKA_FORM_admin_access_token';

	// REGION: [ Initialization ]
	const WEBSITE_URL = window.WEBSITE_URL;
	console.log(`[${TAG}] Website url:`, WEBSITE_URL);
	ROSKA_FORM.Session.Init(WEBSITE_URL);

	const { resolve, promise } = ROSKA_FORM.Tools.FlattenPromise<void>();
	window.WaitAuthorization = () => promise;	
	// ENDREGION
	const viewport = window.viewport;
	const accessor = window.login_overlay;
	const loading_overlay = window.loading_overlay;

	{
		const [{ element: layout }] = await window.resources([
			{ type: 'html', path: './module/init/module.html' },
			{ type: 'css', path: './module/init/module.css' }
		]);
		
		accessor.element.innerHTML = layout.innerHTML;		
		accessor.relink();
		layout.remove();

		
	}


    // type PagingCursor = Awaited<ReturnType<typeof window.ROSKA_FORM.GetUserList>>;

    // REGION: [ Wait authorization, load modules and landing to main page ]
    {
        await window.WaitAuthorization();



        const modules: typeof window.modules = window.modules = [];
        const module_names = [
            'dashboard',
            'sysvar',
            'user',
            'topup',
            'withdraw',
            'maintenance',
            'serial',
            'collect'
        ];
        const paths: {
            path: string;
            type: 'js';
        }[] = [];

        for (const name of module_names) {
            paths.push({ path: `./module/${name}/module.js`, type: 'js' });
        }
        await resources(paths);
        const promises = [];
        for (const module of modules) {
            promises.push(module.init());
        }
        await Promise.wait(promises);



        const tabbars = document.querySelector('.tabbars');
        if (tabbars) {
            tabbars.children[0].emit('click');
        }
        viewport.removeClass('hide');
    }
    // ENDREGION


})();