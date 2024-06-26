import SessionControl from "./session.js";
import {BuildQueryOrderString, ProcRemoteResponse} from "../lib/tools.js";
import {User_Register, User} from "./data-type/users.js"
// import { HTExAPIVendorPrefix, HTExAPIVendorExceptBinance, HTSymbols, HTMarkets, HTExAPIVendors } from "./data-type/trading.js";

type Register_User ={
	order?:{
		create_time?: DataQueryOrder,
	}
}
//POST
// /api/register
/**註冊新帳號**/
export async function Do_Register_User_Info(User_Data:User_Register) {
	// SessionControl.CheckLogin();
	// console.log(SessionControl.endpoint_url);
	return fetch(`${SessionControl.endpoint_url}/api/register`, {
		method:'POST',
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(User_Data)
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}

//GET
// /api/user
/**取得使用者自己的資料**/
export async function Get_user_info() {
	SessionControl.CheckLogin();
	return fetch(`${SessionControl.endpoint_url}/api/user`, {
		method:'GET',
		headers: {"Authorization": SessionControl.auth_token},
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}

//POST
// /api/user
/**修改使用者自己的資料**/
export async function Update_user_info_edit(User_Data:User_Register) {
	// SessionControl.CheckLogin();
	// console.log(SessionControl.endpoint_url);
	return fetch(`${SessionControl.endpoint_url}/api/user`, {
		method:'POST',
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(User_Data)
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}
