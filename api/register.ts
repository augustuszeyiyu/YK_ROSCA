import SessionControl from "./session.js";
import {BuildQueryOrderString, ProcRemoteResponse} from "../lib/tools.js";
import {User} from "./data-type/register.js"
// import { HTExAPIVendorPrefix, HTExAPIVendorExceptBinance, HTSymbols, HTMarkets, HTExAPIVendors } from "./data-type/trading.js";

type Register_User ={
	order?:{
		create_time?: DataQueryOrder,
	}
}
type UserInfo = {
    nid: User['nid'],
    name: User['name'],
    gender: User['gender'],
    birth_date: User['birth_date'],
    address: User['address'],
    line_id: User['line_id'],
    contact_home_number: User['contact_home_number'],
    contact_mobile_number: User['contact_mobile_number'],
    bank_code: User['bank_code'],
    branch_code: User['branch_code'],
    bank_account_name: User['bank_account_name'],
    bank_account_number: User['bank_account_number'],
    emergency_nid: User['emergency_nid'],
    emergency_contact: User['emergency_contact'],
    emergency_contact_number: User['emergency_contact_number'],
    emergency_contact_relation: User['emergency_contact_relation'],
    referrer_uid: User['referrer_uid'],
    volunteer_uid: User['volunteer_uid'],
    password: User['password'],
}
export async function Do_Register_User(User_Data:UserInfo):Promise<Register_User> {
	SessionControl.CheckLogin();
	return fetch(`${SessionControl.endpoint_url}/api/register`, {
		method:'POST',
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({User_Data})
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}
