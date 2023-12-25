import SessionControl from "./api/session.js";
import {PageController} from "./lib/page-controller.js";
import {ErrorMap} from "./api/error-map/error-map.js";
import * as Tools from "./lib/tools.js";


import * as DataTypeRegister from "./api/data-type/register.js";
import * as DataTypeUsers from "./api/data-type/users.js";
import * as DataTypeGroups from "./api/data-type/groups.js"
 

import * as ApiGroups from "./api/groups.js";
import * as Apiregister from "./api/register.js";


type DataTypeRoska = never;

type BaseType = {
	Session: typeof SessionControl;
	Tools: typeof Tools;
	PageController: typeof PageController;
	ErrorMap: typeof ErrorMap;
	DataType: 
		typeof DataTypeRegister
		&typeof DataTypeUsers
  		&typeof DataTypeGroups
};
const Base:BaseType = {
	Session: SessionControl,
	Tools,
	PageController,
	ErrorMap,
	DataType: Object.assign(
		DataTypeRegister,
		DataTypeGroups,
	)
};
const Exported = Object.assign(
	Base,
	Apiregister,
	ApiGroups,
);

type ROSKA_FORM_Class = 
	typeof Base
	& typeof Apiregister
	& typeof ApiGroups
;

declare global { var ROSKA_FORM:ROSKA_FORM_Class; }
export default Exported;
