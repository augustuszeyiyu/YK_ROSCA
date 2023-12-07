import SessionControl from "./api/session.js";
import {PageController} from "./lib/page-controller.js";
import {ErrorMap} from "./api/error-map/error-map.js";
import * as Tools from "./lib/tools.js";


import * as DataTypeSysvar from "./api/data-type/sysvar.js";
import * as DataTypeRegister from "./api/data-type/register.js";
import * as DataTypeUsers from "./api/data-type/users.js";

// import * as ApiSystem from "./api/system.js";
// import * as ApiUser from "./api/user.js";
import * as Apiregister from "./api/register.js";


type DataTypeRoska = never;

type BaseType = {
	Session: typeof SessionControl;
	Tools: typeof Tools;
	PageController: typeof PageController;
	ErrorMap: typeof ErrorMap;
	DataType: 
		typeof DataTypeRegister
		// &typeof DataTypeUsers
    //     typeof DataTypeRoska
		// typeof DataTypeTrading 
		// & typeof DataTypeUserShareRatios 
		// & typeof DataTypeSysvar 
		// & typeof DataTypeTransaction 
		// & typeof DataTypeMaintenance
		// & typeof DataTypeSerial
		// & typeof DataTypeRemit;
};
const Base:BaseType = {
	Session: SessionControl,
	Tools,
	PageController,
	ErrorMap,
	DataType: Object.assign(
		DataTypeRegister,
		// DataTypeUsers,
    	// DataTypeRoska
		// DataTypeTrading, 
		// DataTypeUserShareRatios, 
		// DataTypeSysvar, 
		// DataTypeTransaction, 
		// DataTypeMaintenance, 
		// DataTypeSerial,
		// DataTypeRemit,
	)
};
const Exported = Object.assign(
	Base,
	Apiregister,
	// ApiSystem,
	// ApiUser,
	// ApiTransaction,
	// ApiMaintenance,
	// ApiSerial,
	// ApiRemit
);






type ROSKA_FORM_Class = 
	typeof Base
	& typeof Apiregister
	// & typeof ApiSystem 
	// & typeof ApiUser 
	// & typeof ApiTransaction 
	// & typeof ApiMaintenance
	// & typeof ApiSerial
	// & typeof ApiRemit
;

declare global { var ROSKA_FORM:ROSKA_FORM_Class; }
export default Exported;
