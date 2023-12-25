import SessionControl from "./session.js";
import {BuildQueryOrderString, ProcRemoteResponse} from "../lib/tools.js";
import {User_Register, User} from "./data-type/users.js"
// import { HTExAPIVendorPrefix, HTExAPIVendorExceptBinance, HTSymbols, HTMarkets, HTExAPIVendors } from "./data-type/trading.js";

type Register_User ={
	order?:{
		create_time?: DataQueryOrder,
	}
}
export async function Do_Register_User_Info(User_Data:User_Register) {
	// SessionControl.CheckLogin();
	
	return fetch(`${SessionControl.endpoint_url}/api/register`, {
		method:'POST',
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(User_Data)
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}
