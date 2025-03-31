
import SessionControl from "./session.js";
import {BuildQueryOrderString, ProcRemoteResponse} from "../lib/tools.js";
import { RoskaGroups, RoskaMembers, RoskaSerials } from './data-type/groups';


type Register_User ={
	order?:{
		create_time?: DataQueryOrder,
	}
}

/**取得新會組列表 **/
export async function Get_new_list() {
	SessionControl.CheckLogin();
	
	return fetch(`${SessionControl.endpoint_url}/api/group/serial/new-list`, {
		method:'GET',
		headers: {"Authorization": SessionControl.auth_token},
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}



/**取得已加入的會組列表 **/
export async function Get_on_list() {
	SessionControl.CheckLogin();
	
	return fetch(`${SessionControl.endpoint_url}/api/group/serial/on-list`, {
		method:'GET',
		headers: {"Authorization": SessionControl.auth_token},
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}

// POST
// /api/group/member/{sid}
/**加入會組**/
export async function Join_in_groups(query_data?:RoskaSerials){
	SessionControl.CheckLogin();
	return fetch(`${SessionControl.endpoint_url}/api/group/member/`+query_data, {
		method:'POST',
		headers: {"Authorization": SessionControl.auth_token, "Content-Type": "application/json"},		
		body: JSON.stringify(query_data)
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}
// POST
// /api/group/bid
// 下標
export async function Join_bids(query_data?:any){
	SessionControl.CheckLogin();
	return fetch(`${SessionControl.endpoint_url}/api/group/bid/`+query_data, {
		method:'POST',
		headers: {"Authorization": SessionControl.auth_token, "Content-Type": "application/json"},		
		body: JSON.stringify(query_data)
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}

//GET
// /api/group/member/{sid}
/**搜尋該團下的成員**/
export async function Get_in_groups(query_data?:RoskaSerials){
	SessionControl.CheckLogin();
	return fetch(`${SessionControl.endpoint_url}/api/group/member/`+query_data, {
		method:'GET',
		headers: {"Authorization": SessionControl.auth_token},		
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}


//GET
// /api/group/group/settlement-list
/**各會期結算列表**/

export async function Get_settlement_list() {
	SessionControl.CheckLogin();
		const testdate = ROSKA_FORM.Tools.calculateMonthlyBitStartTime(new Date() , 0);
		var year:number = Number(testdate.getFullYear()); 
		var month:number = Number(testdate.getMonth()+1); 
		console.log("groups settlement-list");
		console.log(year ,month);
	return fetch(`${SessionControl.endpoint_url}/api/group/group/settlement-list`+"/"+year+"/"+month, {
		method:'GET',
		headers: {"Authorization": SessionControl.auth_token},
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}

// GET
// /api/file/member-pay-record
// 會員開標付款紀錄表

export async function export_record() {
	SessionControl.CheckLogin();
	
	return fetch(`${SessionControl.endpoint_url}/api/file/member-pay-record`, {
		method:'GET',
		headers: {"Authorization": SessionControl.auth_token},
	}).then(ProcRemoteResponse).then((resp)=>resp.json());
}