(async () => {

	// Rrgion for TypeScript //
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


	const TAG = 'init';
	const COOKIE_ACCESS_TOKEN = 'ROSKA_FORM_admin_access_token';

	// REGION: [ Initialization ]
	const WEBSITE_URL = window.WEBSITE_URL;
	// console.log(`[${TAG}] Website url:`, WEBSITE_URL);
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
	const register_overlay = window.register_overlay;
    {
        const [{ element: layout }] = await window.resources([
            { type: 'html', path: './module/register/module.html' },
            { type: 'css', path: './module/register/module.css' }
        ]);
        register_overlay.element.innerHTML = layout.innerHTML;
        register_overlay.relink();
        layout.remove();
    }
	const PageLogin = new ROSKA_FORM.PageController({ viewport: accessor.element });
	await get_cap();
	async function get_cap() {		
		const captcha_getin_result = await ROSKA_FORM.Session.GetCaptcha();
		accessor.captcha_getin.innerHTML= captcha_getin_result.img;
	}
    // const PageLogin = new ROSKA_FORM.PageController({ viewport: accessor.element });
    // const captcha_getin_result = await ROSKA_FORM.Session.GetCaptcha();
    // accessor.captcha_getin.innerHTML= captcha_getin_result.img;


 
	
	// accessor.account.value='A112345555';
    // accessor.password.value='Abcd1234';

	accessor.account.value='A1123456002';
    accessor.password.value='A1234567';
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
			// alert(`登入失敗！(${e.message})`);
			console.error(`[${TAG}]`, e);
		}
		finally {
			loading_overlay.Hide();
		}
	}
	// ENDREGION
	// REGION: [ Login from account and password ]
	accessor.btn_login.onclick = async () => {
		const nid = accessor.account.value;
		const password = accessor.password.value;
		const captcha = accessor.captcha.value;
		if (!nid || !password) {
			alert('請輸入帳號密碼登入！');
			return;
		}
		if (!captcha) {
			alert('請輸入驗證碼！');
			return;
		}

		try {
			loading_overlay.Show();
			let result = await ROSKA_FORM.Session.Login({ nid, password, captcha }).catch((e: Error) => e);

			if (result instanceof Error) {
				// @ts-ignore
				switch (result.code) {
					case ROSKA_FORM.ErrorMap.LoginError.TOTP_REQUIRE.code: {
						const totp = prompt('請輸入 Authenticator 驗證碼');
						
						if (!totp) {
							alert('請輸入 Authenticator 驗證碼！');
							return;
						}

						result = await ROSKA_FORM.Session.Login({ nid, password, captcha });
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

    /**region register & page controler**/
    accessor.btn_register.onclick = (e:any) => {
        register_overlay.classList.remove('hide');
        accessor.classList.add('hide');
    }

    const view = register_overlay;
    view
    .on('register_user', async (_e:any) => {
        do_register_user();
    })
        .on('home_view',(e:any)=>{
            register_overlay.classList.add('hide');
            accessor.classList.remove('hide');
    })
        .on('open_tab_member', (e:any) => {
        // accessor.member_content.addClass="active"
        const accessor = view.input_data;
            // console.log(accessor.member_content);
        accessor.member_content.style.display = "flex";
        accessor.recommendation_info.style.display = "none";
        accessor.bank_info_content.style.display = "none";
        accessor.btn_open_tab_member.classList.add('active');
        accessor.btn_open_tab_recommand.classList.remove('active');
        accessor.btn_open_tab_bankinfo.classList.remove('active');
    })
        .on('open_tab_recommand', (e:any) => {
        const accessor = view.input_data;
            // console.log(accessor.recommendation_info);
        accessor.member_content.style.display = "none";
        accessor.recommendation_info.style.display = "flex";
        accessor.bank_info_content.style.display = "none";
        accessor.btn_open_tab_member.classList.remove('active');
        accessor.btn_open_tab_recommand.classList.add('active');
        accessor.btn_open_tab_bankinfo.classList.remove('active');
    })
        .on('open_tab_bankinfo', (e:any) => {
        const accessor = view.input_data;
        //  console.log(accessor.bank_info_content);
        accessor.member_content.style.display = "none";
        accessor.recommendation_info.style.display = "none";
        accessor.bank_info_content.style.display = "flex";
        accessor.btn_open_tab_member.classList.remove('active');
        accessor.btn_open_tab_recommand.classList.remove('active');
        accessor.btn_open_tab_bankinfo.classList.add('active');
    })
        .on('load_test_register_userinfo', (e:any) => {
        // Develope Help rigion
        const accessor = view.input_data;
        accessor.nid.value = 'F123456777';
        accessor.name.value = '姓名';
        accessor.password.value = 'A1234567';
        accessor.gender.value = 'M';
        accessor.birth_date.value = '1984-01-17';
        accessor.address.value = '新北市汐止區連興街116號';
        accessor.line_id.value = '';
        accessor.contact_home_number.value = "0226481872";
        accessor.contact_mobile_number.value = "0921136362";
        accessor.bank_code.value;
        accessor.branch_code.value;
        accessor.bank_account_number.value;
        accessor.emergency_nid.value = "A1234567890";
        accessor.emergency_contact.value = "Cheny";
        accessor.emergency_contact_number.value = "0226481872";
        accessor.emergency_contact_relation.value;
        // accessor.referrer_nid.value;
        // accessor.volunteer_nid.value;
        accessor.relink();
    });
    async function do_register_user() {
        // User_Infoa: UserInfo)
        const accessor = view.input_data;
        const Register_input_Data: typeof ROSKA_FORM.Do_Register_User_Info.prototype = {
            nid: '',
            name: '',
            gender: 'M',
            birth_date: '',
            address: '',
            line_id: '',
            contact_home_number: '',
            contact_mobile_number: '',
            // role: {type:'number'},
            bank_code: '',
            branch_code: '',
            bank_account_name: '',
            bank_account_number: '',
            emergency_nid: '',
            emergency_contact: '',
            emergency_contact_number: '',
            emergency_contact_relation: '',
            // referrer_nid: undefined,
            // volunteer_nid: undefined,
            password: '',
        };
        for (const key in Register_input_Data) {
            if (key === 'contact_home_number' && accessor[key]) {
                const value = accessor[key].value.replace(/-/g, '');
                Register_input_Data[key] = value;
            } 
            else if (key === 'contact_mobile_number' && accessor[key]) {
                const value = accessor[key].value.replace(/-/g, '');
                Register_input_Data[key] = value;
            } 
            else if (key === 'emergency_contact_number' && accessor[key]) {
                const value = accessor[key].value.replace(/-/g, '');
                Register_input_Data[key] = value;
            } 
            else if (accessor[key]) {
                Register_input_Data[key] = accessor[key].value;
            }
        };
        // console.log("check02", Register_input_Data);
        try {
            let result = await ROSKA_FORM.Do_Register_User_Info(Register_input_Data);
        }
        catch (e:any) {	
            alert(`註冊失敗(${e.message})`);
            console.error(`[${TAG}]`, e);
        }
        // finally{
        //     alert(`恭喜您已註冊成功 ${Register_input_Data.name}`);
        // }
    };


    async function do_logout(){
        try { 
            let result = await ROSKA_FORM.Session.Logout();
            if( result === false){
                window.location.reload();
            }
        }
        catch (e:any) {
            alert(`登出失敗(${e.message})`);
            console.error(`[${TAG}]`, e);
        }
    };

    {   
        viewport
            .on('logout', async(_e:any)=>{
                do_logout();
            })
    }

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
			'register',
			'roska_pay',
			'roska_last',
			'roska_new',
			'roska_remain',
			// 'dashboard',
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
