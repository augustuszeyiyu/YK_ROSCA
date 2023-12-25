
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

