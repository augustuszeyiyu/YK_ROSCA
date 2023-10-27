(async () => {
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
	// const a=1,b =2;
	// const c = await window.restest(a,b){
	// 	return a+b;
	// }
	{
		const [{ element: layout }] = await window.resources([
			{ type: 'html', path: './module/init/module.html' },
			{ type: 'css', path: './module/init/module.css' }
		]);
		
		accessor.element.innerHTML = layout.innerHTML;
	    // const Login_captcha= document.querySelector('.Login_captcha_getin');         
        // const Login_captcha_input = document.querySelector('.Login_captcha'); 
        // Login_captcha_input.placeholder='testcaptcha';
        console.log(accessor.captcha);
		
		accessor.relink();
		layout.remove();

		
	}


	const PageLogin = new ROSKA_FORM.PageController({ viewport: accessor.element });

	const result = await ROSKA_FORM.Session.GetCaptcha();
	console.log('ROSKA_FORM.Session.GetCaptcha', result);
	

	// REGION: [ Login from access_token ]
	const access_token = Cookies.get(COOKIE_ACCESS_TOKEN);
	if (access_token) {
		try {
			loading_overlay.Show();
			await ROSKA_FORM.Session.Login({ access_token });

			resolve();
			PageLogin.Hide();
		}
		catch (e: any) {
			alert(`登入失敗！(${e.message})`);
			console.error(`[${TAG}]`, e);
		}
		finally {
			loading_overlay.Hide();
		}
	}
	// ENDREGION
	// REGION: [ Login from account and password ]
	accessor.btn_login.onclick = async () => {
		const uid = accessor.account.value;
		const password = accessor.password.value;
		// const captcha = accessor.captcha.value;
		const captcha = '';
		if (!uid || !password) {
			alert('請輸入帳號密碼登入！');
			return;
		}
		if (!captcha) {
			alert('請輸入驗證碼！');
			return;
		}



		try {
			loading_overlay.Show();
			let result = await ROSKA_FORM.Session.Login({ uid, password, captcha }).catch((e: Error) => e);

			if (result instanceof Error) {
				// @ts-ignore
				switch (result.code) {
					case ROSKA_FORM.ErrorMap.LoginError.TOTP_REQUIRE.code: {
						const totp = prompt('請輸入 Google Authenticator 驗證碼');
						if (!totp) {
							alert('請輸入 Google Authenticator 驗證碼！');
							return;
						}

						result = await ROSKA_FORM.Session.Login({ uid, password, captcha });
					}
						break;
					default:
						throw result;
				}
			}


			resolve();
			PageLogin.Hide();



			// NOTE: Set session cookies to keep login state before current session ends
			Cookies.set(COOKIE_ACCESS_TOKEN, result.access_token, { secure: true, sameSite: 'strict' });
		}
		catch (e: any) {
			alert(`登入失敗！(${e.message})`);
			console.error(`[${TAG}]`, e);
		}
		finally {
			loading_overlay.Hide();
		}
	};
	// ENDREGION
	{
		viewport
			.on('show-login-page', () => {
				PageLogin.Show();
			});


		window.HandleUnauthorizedAccess = (error: any) => {
			switch (error.code) {
				case ROSKA_FORM.ErrorMap.ErrorCode.UNAUTHORIZED: {
					viewport.emit('show-login-page');
				}
					break;
				default:
					break;
			}
		};
	}



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
