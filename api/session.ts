import {ROSKA_FORMRemoteError, ProcRemoteResponse} from "../lib/tools.js";
interface SessionInfo {
	access_token: string;
	refresh_token?: string;
	expired_time: epoch;
	login_time: epoch;
};

type RuntimeStorage = {
	session_info: SessionInfo|null;
	endpoint_url: string;
};

// type TypeLoginObjAccount = {account:string, password:string; totp?:string;};
type TypeLoginObjAccount = {account:string, password:string; captcha:string;};
// type TypeLoginObjAuthCode = {auth_code:string, totp?:string;};
type TypeLoginObjAccessToken = {access_token:string;};
type TypeLoginObj = TypeLoginObjAccount  | TypeLoginObjAccessToken;






const _RUNTIME:RuntimeStorage = {
	session_info:null,
	endpoint_url:''
};


export default class SessionControl {
	static get endpoint_url():string { return _RUNTIME.endpoint_url; }
	static get auth_token():string {
		return ( !_RUNTIME.session_info ) ? '' : `Bearer ${_RUNTIME.session_info.access_token}`;
	}
	static get session():SessionInfo|null {
		return _RUNTIME.session_info;
	}



	static Init(endpoint_url:string) {
		_RUNTIME.endpoint_url = endpoint_url;
	}
	static CheckLogin(do_throw:boolean=true):boolean {
		if ( _RUNTIME.session_info !== null ) return true;
		if ( !do_throw ) return false;
		
		throw new ROSKA_FORMRemoteError({
			code:	'internal#not-logged-in',
			scope:	'internal',
			msg:	"You're not logged in!",
		});
	}


//GET
//	/api/auth/session
/**取得網頁 cookie, 判斷 cookie 是否過期，如果過期，就需要回傳新的 cookie**/
//GET
// /api/auth/login
/**取得驗證碼**/
//POST
//	/api/auth/login
/**使用手機號碼和密碼登入**/
//GET
//	/api/auth/logout
/**登出**/
	static async GetCaptcha() {
		return fetch(`${SessionControl.endpoint_url}/api/auth/login`, {
			method:'GET',  
	
		})
		.then(ProcRemoteResponse)
		.then(async(resp)=>{
			//@ts-ignore
			const body:{image:string} = await resp.json();
			// console.log('GetCaptcha', body);
			return Object.assign({}, {img:body.image});
		});
	}

	static async Login():Promise<SessionInfo>;
	// static async Login(option:{nid:string, password:string; }):Promise<SessionInfo>;
	static async Login(option:{account:string, password:string; captcha:string;}):Promise<SessionInfo>;
	// static async Login(option:{auth_code:string}):Promise<SessionInfo>;
	// static async Login(option:{auth_code:string, captcha:string}):Promise<SessionInfo>;
	static async Login(option:{access_token:string}):Promise<SessionInfo>;	
	static async Login(param1?:TypeLoginObj):Promise<SessionInfo> {
		if(arguments.length === 0) {
			return fetch(`${SessionControl.endpoint_url}/api/auth/session`, {
				method:'GET', credentials:'include', mode: 'cors'
			})
			.then(ProcRemoteResponse)
			.then(async(resp)=>{
				const body:{access_token:string; expired_time:epoch; login_time:epoch} = await resp.json();

				_RUNTIME.session_info = {
					access_token: body.access_token,
					expired_time: body.expired_time,
					login_time: body.login_time,
				};

				return Object.assign({}, _RUNTIME.session_info);
			});
		}
		if(arguments.length === 0) {
			return fetch(`${SessionControl.endpoint_url}/api/auth/login`, {
				method:'GET', credentials:'include', mode: 'cors'
			})
			.then(ProcRemoteResponse)
			.then(async(resp)=>{
				console.log(resp);
				const body:{access_token:string; expired_time:epoch; login_time:epoch} = await resp.json();

				_RUNTIME.session_info = {
					access_token: body.access_token,
					expired_time: body.expired_time,
					login_time: body.login_time,
				};

				return Object.assign({}, _RUNTIME.session_info);
			});
		}


		let account:string|undefined;
		let password:string|undefined;
		let auth_code:string|undefined;
		let access_token:string|undefined;
		let captcha:string|undefined;

		if ( !(param1 instanceof Object)) {
			throw new Error("Input options must be an object!");
		}

		account = (param1 as TypeLoginObjAccount).account;
		password = (param1 as TypeLoginObjAccount).password;
		access_token = (param1 as TypeLoginObjAccessToken).access_token;
		captcha = (param1 as TypeLoginObjAccount).captcha;

		if(access_token !== undefined) {
			return fetch(`${SessionControl.endpoint_url}/api/auth/session`, {
				method:'GET',
				headers: {"Authorization": `Bearer ${access_token}`}
			})
			.then(ProcRemoteResponse)
			.then(async(resp)=>{
				const body:{access_token:string; expired_time:epoch; login_time:epoch} = await resp.json();

				_RUNTIME.session_info = {
					access_token: body.access_token,
					expired_time: body.expired_time,
					login_time: body.login_time,
				};

				return Object.assign({}, _RUNTIME.session_info);
			});
		}



		return fetch(`${SessionControl.endpoint_url}/api/auth/login`, {
			method:'POST',
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({ mobile_number:account, password:password, captcha:captcha })
		})		.then(ProcRemoteResponse)
		.then(async(resp)=>{
			const result:{
				access_token:string;
				refresh_token:string;
				expired_time: epoch;
				login_time: epoch;
			} = await resp.json();

			_RUNTIME.session_info = {
				access_token: result.access_token,
				refresh_token: result.refresh_token,
				expired_time: result.expired_time,
				login_time: result.login_time
			};

			return Object.assign({}, _RUNTIME.session_info);
		});
	}

	
	static async Logout():Promise<boolean> {
		if ( !_RUNTIME.session_info ) return true;

		return fetch(`${SessionControl.endpoint_url}/api/auth/logout`, {
			method:'get',
			headers: {"Authorization": `Bearer ${_RUNTIME.session_info.access_token}`}
		})
		.then(ProcRemoteResponse).then(()=>false)
		.finally(async()=>_RUNTIME.session_info = null);
	}

	// interface _user_info {
	// 	user_name:string;
	// 	next_bid_date:string;
	// }

	static _user_info = {
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
			password: '',
            referrer_mobile_number: undefined,
            volunteer_mobile_number: undefined,
    };

	static setUserInfo(userInfo:any) {
        Object.assign(SessionControl._user_info, userInfo);
    }

    static getUserInfo() {
        return SessionControl._user_info;
    }
}