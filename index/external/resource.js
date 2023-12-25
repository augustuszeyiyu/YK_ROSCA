/**
 *	Author: JCloudYu
 *	Create: 2020/06/28
**/
(()=>{
	"use strict";
	
	
	const exported = {};
	
	
	(()=>{
		// See http://www.isthe.com/chongo/tech/comp/fnv/#FNV-param for the definition of these parameters;
		const FNV_PRIME_HIGH = 0x0100, FNV_PRIME_LOW = 0x0193;	// 16777619 0x01000193
		const OFFSET_BASIS = (new Uint8Array([0xC5, 0x9D, 0x1C, 0x81])).buffer;	// 2166136261 [0x81, 0x1C, 0x9D, 0xC5]
		const HOSTNAME_CANDIDATES = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWZYZ_-";
		const BASE32_MAP = "0123456789abcdefghijklmnopqrstuv".split('');
		const {PID, PPID, MACHINE_ID} = (()=>{
			const host = (typeof window !== "undefined") ? window.location.host : (()=>{
				let count = 30, str = '';
				while(count-- > 0) {
					str += HOSTNAME_CANDIDATES[(Math.random() * HOSTNAME_CANDIDATES.length)|0]
				}
				return str;
			})();
			
			return {
				MACHINE_ID: fnv1a32(host),
				PID: (Math.random() * 65535)|0,
				PPID: (Math.random() * 65535)|0
			};
		})();
		let SEQ_NUMBER = Math.floor(Math.random() * 0xFFFFFFFF);
		
		exported.GenInstId = function GenInstId() {
			const time	= Date.now();
			const time_upper = Math.floor(time/0xFFFFFFFF);
			const time_lower = time%0xFFFFFFFF;
			const inc	= (SEQ_NUMBER=(SEQ_NUMBER+1) % 0xFFFFFFFF);
			const buff	= new Uint8Array(20);
			const view	= new DataView(buff.buffer);
			
			view.setUint32(0, time_upper, false);		// [0-3] epoch time upper
			view.setUint32(4, time_lower, false);		// [4-7] epoch time lower
			buff.set(new Uint8Array(MACHINE_ID), 8);	// [8-11] machine id
			view.setUint16(12, PPID, false);			// [12-13] ppid
			view.setUint16(14, PID,  false);			// [14-15] pid
			view.setUint32(16, inc,	 false);			// [16-19] seq
			
			
			
			return Base32Encode(buff.buffer);
		}
		
		
		
		
		function ExtractArrayBuffer(content) {
			if ( content instanceof ArrayBuffer ) {
				return content;
			}
			
			if ( typeof Buffer !== "undefined" ) {
				content = new Uint8Array(content);
			}
			
			if ( ArrayBuffer.isView(content) ) {
				return content.buffer;
			}
		}
		function fnv1a32(input){
			let octets = new Uint8Array(ExtractArrayBuffer(input));
			
			const HASH_RESULT = new Uint32Array(OFFSET_BASIS.slice(0));
			const RESULT_PROC = new Uint16Array(HASH_RESULT.buffer);
			for( let i = 0; i < octets.length; i += 1 ) {
				HASH_RESULT[0] = HASH_RESULT[0] ^ octets[i];
				
				let hash_low = RESULT_PROC[0], hash_high = RESULT_PROC[1];
				
				RESULT_PROC[0] = hash_low * FNV_PRIME_LOW;
				RESULT_PROC[1] = hash_low * FNV_PRIME_HIGH + hash_high * FNV_PRIME_LOW + (RESULT_PROC[0]>>>16);
			}
			return HASH_RESULT.buffer;
		}
		function Base32Encode(input, map=null) {
			input = ExtractArrayBuffer(input);
			
			
			let inputData = new Uint8Array(input);
			if ( inputData.length < 1 ) return '';
			
			
			const CVT_MAP = map ? map.split('') : BASE32_MAP;
			
			
			
			// Run complete bundles
			let encoded = '';
			let begin, loop = Math.floor(inputData.length/5);
			for (let run=0; run<loop; run++) {
				begin = run * 5;
				encoded += CVT_MAP[  inputData[begin]           >> 3];								// 0
				encoded += CVT_MAP[ (inputData[begin  ] & 0x07) << 2 | (inputData[begin+1] >> 6)];	// 1
				encoded += CVT_MAP[ (inputData[begin+1] & 0x3E) >> 1];								// 2
				encoded += CVT_MAP[ (inputData[begin+1] & 0x01) << 4 | (inputData[begin+2] >> 4)];	// 3
				encoded += CVT_MAP[ (inputData[begin+2] & 0x0F) << 1 | (inputData[begin+3] >> 7)];	// 4
				encoded += CVT_MAP[ (inputData[begin+3] & 0x7C) >> 2];								// 5
				encoded += CVT_MAP[ (inputData[begin+3] & 0x03) << 3 | (inputData[begin+4] >> 5)];	// 6
				encoded += CVT_MAP[  inputData[begin+4] & 0x1F];										// 7
			}
			
			// Run remains
			let remain = inputData.length % 5;
			if ( remain === 0 ) { return encoded; }
			
			
			begin = loop*5;
			if ( remain === 1 ) {
				encoded += CVT_MAP[  inputData[begin]           >> 3];								// 0
				encoded += CVT_MAP[ (inputData[begin  ] & 0x07) << 2];								// 1
			}
			else
			if ( remain === 2 ) {
				encoded += CVT_MAP[  inputData[begin]           >> 3];								// 0
				encoded += CVT_MAP[ (inputData[begin  ] & 0x07) << 2 | (inputData[begin+1] >> 6)];	// 1
				encoded += CVT_MAP[ (inputData[begin+1] & 0x3E) >> 1];								// 2
				encoded += CVT_MAP[ (inputData[begin+1] & 0x01) << 4];								// 3
			}
			else
			if ( remain === 3 ) {
				encoded += CVT_MAP[  inputData[begin]           >> 3];								// 0
				encoded += CVT_MAP[ (inputData[begin  ] & 0x07) << 2 | (inputData[begin+1] >> 6)];	// 1
				encoded += CVT_MAP[ (inputData[begin+1] & 0x3E) >> 1];								// 2
				encoded += CVT_MAP[ (inputData[begin+1] & 0x01) << 4 | (inputData[begin+2] >> 4)];	// 3
				encoded += CVT_MAP[ (inputData[begin+2] & 0x0F) << 1];								// 4
			}
			else
			if ( remain === 4 ) {
				encoded += CVT_MAP[  inputData[begin]           >> 3];								// 0
				encoded += CVT_MAP[ (inputData[begin  ] & 0x07) << 2 | (inputData[begin+1] >> 6)];	// 1
				encoded += CVT_MAP[ (inputData[begin+1] & 0x3E) >> 1];								// 2
				encoded += CVT_MAP[ (inputData[begin+1] & 0x01) << 4 | (inputData[begin+2] >> 4)];	// 3
				encoded += CVT_MAP[ (inputData[begin+2] & 0x0F) << 1 | (inputData[begin+3] >> 7)];	// 4
				encoded += CVT_MAP[ (inputData[begin+3] & 0x7C) >> 2];								// 5
				encoded += CVT_MAP[ (inputData[begin+3] & 0x03) << 3];								// 6
			}
			
			return encoded;
		}
	})();
	(()=>{
		const {GenInstId} = exported;
		const A_TAG = document.createElement( "a" );
		
		exported.dimport = function(module_url, options={ref_path:null, cross_origin:false, use_credentials:false}) {
			return new Promise((resolve, reject)=>{
				let _ref_path;
				if ( Object(options) === options ) {
					_ref_path = options.ref_path || null;
				}
				else {
					_ref_path = options;
					options = {cross_origin:false, use_credentials:false};
				}
			
			
			
				const ref_path = _ref_path;
				const abs_url = ref_path ? RESOLVE_PARENT_PATH(module_url, ref_path) : TO_ABSOLUTE_URL(module_url);
				const abs_dir = abs_url.substring(0, abs_url.lastIndexOf('/'));
				const inject_point = '_' + GenInstId();
				const element = document.createElement( 'script' );
				const destruct=()=>{
					delete window[inject_point];
					element.onerror = null;
					element.onload = null;
					element.remove();
					URL.revokeObjectURL(element.src);
					element.src = "";
				};
				
				
				
				if ( options.cross_origin || options.use_credentials ) {
					element.setAttribute( 'crossorigin', options.use_credentials ? 'use-credentials' : '' );
				}
				
				element.defer = true;
				element.type = "module";
				element.onload=()=>{
					resolve(window[inject_point]);
					destruct();
				};
				element.onerror=(e)=>{
					reject(e);
					destruct();
				};
				element.src = URL.createObjectURL(new Blob([
		`import * as m from "${abs_url}";
		if ( Object(m) === m && typeof m._meta !== "undefined" ) {
			m._meta.__filename = "${abs_url}";
			m._meta.__dirname  = "${abs_dir}";
		}
		window.${inject_point} = m;
		`
		], {type:'application/javascript'}));
				
				document.querySelector( 'body' ).appendChild(element);
			});
		}
		
		function TO_ABSOLUTE_URL(url) {
			A_TAG.setAttribute( "href", url );	//	<a href="xxx.html">
			return A_TAG.cloneNode(false).href;	//		-> "http://example.com/xxx.html"
		}
		function RESOLVE_PARENT_PATH(module_url, ref_path) {
			// NOTE: Detect if module_url is absolute
			try { new URL(module_url); return module_url; } catch(e) {}
		
			// NOTE: Detect if ref_path is absolute
			try { ref_path = new URL(ref_path); }
			catch(e) { throw new Error( "Given ref_path must be a complete url!" ); }
			
			
			
			// NOTE: If module_url contains a root path
			if ( module_url[0] === "/" ) { // module_path: /a/b/c/d
				return `${ref_path.origin}${module_url}`;
			}
			
			// NOTE: Resolve path
			const pos = ref_path.pathname.lastIndexOf( '/' );
			if ( pos >= 0 ) {
				ref_path.pathname = ref_path.pathname.substring(0, pos+1);
			}
			
			ref_path.pathname = RESOLVE_RELATIVE(`${ref_path.pathname}${module_url}`);
			return ref_path.href;
		}
		function RESOLVE_RELATIVE(relative) {
			var stack = [], parts = relative.split("/");
			
			for( var i = 0; i < parts.length; i++ ){
				if( parts[i] === "." )
					continue;
				
				if( parts[i] === ".." )
					stack.pop();
				else
					stack.push(parts[i]);
			}
			
			return stack.join("/");
		}
	})();
	(()=>{
		const {GenInstId, dimport} = exported;
		const RES_TYPE = {
			CSS: 1,
			HTML: 2,
			HTML_TEMPLATE:3,
			JS: 4,
			SHADOWED_JS: 5,
			ES_MODULE: 6,
			IMAGE: 7
		};
		
		const LoadResource = exported.resources = async function(...args) {
			if ( Array.isArray(args[0]) ) { args = args[0]; }
			
			
			
			const _promises = [];
			for(const resource of args) {
				const RES_ID = '_' + GenInstId();
				let injectBody = true;
				
				let type, path, important, shadow, reference;
				if ( typeof resource === 'string' ) {
					([type, path, important, shadow, reference] = ['js', resource, true, {}, null]);
				}
				else {
					({type, path, important, shadow={}, ref:reference=null} = resource);
				}
				
				
				type = type.trim().split(' ');
				
				// region [ Prepare basic loading promise ]
				const R_PROMISE = new Promise((resolve, reject)=>{
					let element = null;
					switch( type[0] ) {
						case "css": {
							injectBody = false;
						
							element = document.createElement( 'link' );
							element.rel	 = "stylesheet";
							element.type = "text/css";
							element.href = path;
							
							element.onload  = ()=>resolve({type:RES_TYPE.CSS, result:element});
							element.onerror = reject;
							break;
						}
						case "module": {
							dimport(path, reference)
							.then((imported)=>resolve({type:RES_TYPE.ES_MODULE, result:imported}))
							.catch(reject);
							break;
						}
						case "js": {
							if ( type[1] !== "shadow" ) {
								element = document.createElement( 'script' );
								element.type = "application/javascript";
								element.src = path;
								
								element.onload = ()=>resolve({type:RES_TYPE.JS, result:element});
								element.onerror = reject;
							}
							else {
								AJAXFetch( path, {
									method:'get',
									credentials:"same-origin",
									cache:"no-cache"
								}).then((res)=>{
									return res.text().then((ctnt)=>{
										const arg_names = [];
										const invoke_args = [];
										for(const var_name in shadow) {
											if ( !shadow.hasOwnProperty(var_name) ) continue;
											arg_names.push(var_name);
											invoke_args.push(shadow[var_name]);
										}
										arg_names.push(ctnt);
										
										const func = new Function(...arg_names);
										resolve({type:RES_TYPE.SHADOWED_JS, result:func(...invoke_args)});
									});
								}, reject);
							}
							break;
						}
						case "html": {
							element = document.createElement( 'script' );
							element.type = "text/html";
		
							AJAXFetch( path, {
								method:'get',
								credentials:"same-origin",
								cache:"no-cache"
							}).then((res)=>{
								return res.text().then((ctnt)=>{
									if ( type[1] === "exp-template" ) {
										const arg_names = [];
										arg_names.push('data');
										arg_names.push(`return \`${ctnt}\``);
		
										const func = new Function(...arg_names);
										resolve({type:RES_TYPE.HTML_TEMPLATE, result:func})
									}
									else {
										element.innerHTML = ctnt;
										resolve({type:RES_TYPE.HTML, result:element});
									}
								});
							}, reject);
							break;
						}
						case "img": {
							element = new Image();
							element.src = path;
							element.style.display='none';
							
							element.onload	= ()=>resolve({type:RES_TYPE.IMAGE, result:element});
							element.onerror = reject;
							break;
						}
						default: {
							return reject(new TypeError( `Given resource type ${type[0]} is not supported!` ));
						}
					}
					
					if ( element ) {
						element.setAttribute( 'data-important', important ? "1" : "0" );
						element.id = RES_ID;
						document.querySelector(injectBody ? 'body' : 'head').appendChild(element);
					}
				});
				// endregion
			
			
				// region [ Register promise ]
				_promises.push(R_PROMISE.then(
					({type:res_type, result})=>{
						const ret_val = {
							loaded:true,
							id:RES_ID
						};
					
						switch(res_type) {
							case RES_TYPE.HTML:
							case RES_TYPE.JS:
							case RES_TYPE.IMAGE:
							case RES_TYPE.CSS:
								Object.assign(ret_val, {
									element: result,
									result: RES_ID
								});
								break;
							
							case RES_TYPE.SHADOWED_JS:
								Object.assign(ret_val, {
									result
								});
								break;
							
							case RES_TYPE.ES_MODULE:
								Object.assign(ret_val, {
									exports: result,
									result
								});
								break;
							
							case RES_TYPE.HTML_TEMPLATE:
								Object.assign(ret_val, {
									tmpl: result,
									result
								});
								break;
						}
						
						return ret_val;
					},
					(e)=>{
						const result = {loaded:false, result:e};
						return (important) ? Promise.reject(result) : result;
					}
				));
				// endregion
			}
			
			
			
			return PromiseWait(_promises)
			.then((statuses)=>{
				return statuses.map((s)=>s.result);
			})
			.catch((statuses)=>{
				return Promise.reject(statuses.map((s)=>s.result));
			});
		}
		
		
		
		async function BatchResources(...args) {
			if ( Array.isArray(args[0]) ) { args = args[0]; }
			
			const RESOURCE_BATCH = [];
			const BATCH_RESULTS	 = [];
			let _previous_exec_result = null;
			
			
			
			for ( const arg of args ) {
				const type = typeof arg;
				if ( type === "string" || Object(arg) === arg ) {
					RESOURCE_BATCH.push(arg);
					continue;
				}
				
				if ( RESOURCE_BATCH.length > 0 ) {
					_previous_exec_result = null;
					const results = await LoadResource(RESOURCE_BATCH);
					for( let result of results ) {
						BATCH_RESULTS.push(result);
					}
					
					RESOURCE_BATCH.splice(0);
				}
				
				if ( type === "function" ) {
					_previous_exec_result = await arg(_previous_exec_result);
					BATCH_RESULTS.push(arg);
				}
				else {
					BATCH_RESULTS.push(null);
				}
			}
			
			if ( RESOURCE_BATCH.length > 0 ) {
				_previous_exec_result = null;
				try {
					const results = await LoadResource(RESOURCE_BATCH);
					for( let result of results ) {
						BATCH_RESULTS.push(result);
					}
				}
				catch(results) {
					for( let result of results ) {
						BATCH_RESULTS.push(result);
					}
					throw BATCH_RESULTS;
				}
			}
			
			
			
			return BATCH_RESULTS;
		}
		function PromiseWait(promises) {
			const _promises = [];
			for(const promise of promises) {
				_promises.push(
					Promise.resolve(promise)
						.then((r)=>{return {state:true, result:r}})
						.catch((e)=>{return {state:false, result:e}})
				);
			}
			
			return Promise.all(_promises).then((p)=>{
				let pass = true;
				for(const {state} of p) { pass = pass && state; }
				return pass ? Promise.resolve(p) : Promise.reject(p);
			});
		}


		const CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
		const CAMEL_REPLACER = (match, $1, $2, $3, index, input )=>{
			return `${$1.toUpperCase()}${$2.toLowerCase()}${$3}`;
		};
		const READY_STATE = Object.assign(Object.create(null), {
			UNSENT: 0,
			OPENED: 1,
			HEADERS_RECEIVED: 2,
			LOADING: 3,
			DONE: 4
		});





		function AJAXFetch(url, init={}) {
			let resolve=DO_NOTHING, reject=DO_NOTHING;
			const promise = new Promise((_res, _rej)=>{resolve=_res; reject=_rej;});
			
			
			
			const {
				mode='no-cors',
				method='GET',
				headers={},
				timeout=0,
				credentials='omit',
				body=null,
			} = init;
			const request = new XMLHttpRequest();
			promise.request = request;
			promise.promise = promise;
			
			
			
			
			request.addEventListener('readystatechange', (e)=>{
				switch( request.readyState ) {
					case READY_STATE.UNSENT:
						break;
						
					case READY_STATE.OPENED:
						request.withCredentials = (mode === 'cors') && (credentials === 'include' || credentials === 'same-origin' );
						request.timeout = timeout;
						request.responseType = 'blob';
						
						// NOTE: Set request headers
						for (const header_name in headers) {
							const normalize_header = header_name.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
							const value = headers[header_name];
							request.setRequestHeader( normalize_header, value );
						}
						break;
						
					case READY_STATE.HEADERS_RECEIVED:
						break;
						
					case READY_STATE.LOADING:
						break;
						
					case READY_STATE.DONE:
						break;
				}
			});
			request.addEventListener('timeout', ON_ERROR.bind(request, reject));
			request.addEventListener('abort', ON_ERROR.bind(request, reject));
			request.addEventListener('error', ON_ERROR.bind(request, reject));
			request.addEventListener('load', function(e) {
				const response_blob = request.response;
				const response = Object.assign(Object.create(null), {
					request,
					ok: (request.status >= 200 && request.status <= 299),
					status: request.status,
					statusText: request.statusText,
					url: request.responseURL,
					headers: request.getAllResponseHeaders(),
					text: async function(){
						const response_bytes = await READ_ARRAY_BUFFER_FROM_BLOB(response_blob);
						return UTF8Decode(response_bytes);
					},
					blob: function(){
						return response_blob;
					},
					arrayBuffer: function() {
						return READ_ARRAY_BUFFER_FROM_BLOB(response_blob);
					},
					json: async function(throw_if_error=true) {
						const response_bytes = await READ_ARRAY_BUFFER_FROM_BLOB(response_blob);
						
						try {
							return JSON.parse(UTF8Decode(response_bytes));
						}
						catch(e) {
							return throw_if_error ? Promise.reject(e) : undefined;
						}
					}
				});
				resolve(response);
			});
			request.addEventListener('progress', PROGRESS.bind(request, false));
			request.upload.addEventListener('progress', PROGRESS.bind(request, true));
			
			
			
			request.open( method, url, true );
			request.send( body );
			return promise;
		}



		function DO_NOTHING(){}
		function PROGRESS(upload, e) {
			const event = new Event( upload ? 'progress-up' : 'progress-down');
			Object.assign(event, {
				lengthComputable:e.lengthComputable,
				loaded:e.loaded,
				total:e.total
			});
			
			this.dispatchEvent(event);
		}
		function ON_ERROR(reject, e) {
			const response = Object.assign(Object.create(null), {
				request:this,
				error: e,
				ok: false
			});
			reject(response);
		}
		function READ_ARRAY_BUFFER_FROM_BLOB(blob) {
			return new Promise((resolve, reject)=>{
				const reader = new FileReader();
				reader.onerror = reject;
				reader.onload = ()=>resolve(reader.result);
				reader.readAsArrayBuffer(blob);
			});
		}
		function UTF8Decode(raw_bytes) {
			const UTF8_DECODE_CHUNK_SIZE = 100;

			raw_bytes = new Uint8Array(raw_bytes);
		
			let uint8 = raw_bytes;
			let codePoints = [];
			let i = 0;
			while( i < uint8.length ) {
				let codePoint = uint8[i] & 0xff;
				
				// 1-byte sequence (0 ~ 127)
				if( (codePoint & 0x80) === 0 ){
					codePoints.push(codePoint);
					i += 1;
				}
				// 2-byte sequence (192 ~ 223)
				else if( (codePoint & 0xE0) === 0xC0 ){
					codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
					codePoints.push(codePoint);
					i += 2;
				}
				// 3-byte sequence (224 ~ 239)
				else if( (codePoint & 0xf0) === 0xe0 ){
					codePoint = ((0x0f & uint8[i]) << 12)
						| ((0x3f & uint8[i + 1]) << 6)
						| (0x3f & uint8[i + 2]);
					codePoints.push(codePoint);
					i += 3;
				}
				// 4-byte sequence (249 ~ )
				else if( (codePoint & 0xF8) === 0xF0 ){
					codePoint = ((0x07 & uint8[i]) << 18)
						| ((0x3f & uint8[i + 1]) << 12)
						| ((0x3f & uint8[i + 2]) << 6)
						| (0x3f & uint8[i + 3]);
					codePoints.push(codePoint);
					i += 4;
				}
				else {
					i += 1;
				}
			}
			
			
			
			let result_string = "";
			while(codePoints.length > 0) {
				const chunk = codePoints.splice(0, UTF8_DECODE_CHUNK_SIZE);
				result_string += String.fromCodePoint(...chunk);
			}
			return result_string;
			}
	})();
	
	(()=>{
	const TW_REGION_MAP = [
	{
		"name":"基隆市", "regions": [
			{ "name":"仁愛區", "post_code":"200", "pos": {"lng":"121.7434205", "lat":"25.11945421"}},
			{ "name":"信義區", "post_code":"201", "pos": {"lng":"121.772646", "lat":"25.12576579"}},
			{ "name":"中正區", "post_code":"202", "pos": {"lng":"121.7783549", "lat":"25.14365754"}},
			{ "name":"中山區", "post_code":"203", "pos": {"lng":"121.7308913", "lat":"25.14986365"}},
			{ "name":"安樂區", "post_code":"204", "pos": {"lng":"121.7078325", "lat":"25.14139521"}},
			{ "name":"暖暖區", "post_code":"205", "pos": {"lng":"121.7447344", "lat":"25.08097003"}},
			{ "name":"七堵區", "post_code":"206", "pos": {"lng":"121.683628", "lat":"25.10962028"}}
		]
	},
	{
		"name":"臺北市", "regions": [
			{ "name":"中正區", "post_code":"100", "pos": {"lng":"121.5198839", "lat":"25.03240487"}},
			{ "name":"大同區", "post_code":"103", "pos": {"lng":"121.5130417", "lat":"25.06342433"}},
			{ "name":"中山區", "post_code":"104", "pos": {"lng":"121.5381597", "lat":"25.06969917"}},
			{ "name":"松山區", "post_code":"105", "pos": {"lng":"121.5575876", "lat":"25.05999101"}},
			{ "name":"大安區", "post_code":"106", "pos": {"lng":"121.5434446", "lat":"25.02677012"}},
			{ "name":"萬華區", "post_code":"108", "pos": {"lng":"121.4979858", "lat":"25.0285899"}},
			{ "name":"信義區", "post_code":"110", "pos": {"lng":"121.5716697", "lat":"25.03062083"}},
			{ "name":"士林區", "post_code":"111", "pos": {"lng":"121.5508473", "lat":"25.12546704"}},
			{ "name":"北投區", "post_code":"112", "pos": {"lng":"121.5177992", "lat":"25.1480682"}},
			{ "name":"內湖區", "post_code":"114", "pos": {"lng":"121.5923828", "lat":"25.08370623"}},
			{ "name":"南港區", "post_code":"115", "pos": {"lng":"121.6097573", "lat":"25.03600934"}},
			{ "name":"文山區", "post_code":"116", "pos": {"lng":"121.5736082", "lat":"24.98857934"}}
		]
	},
	{
		"name":"新北市", "regions": [
			{ "name":"萬里區", "post_code":"207", "pos": {"lng":"121.6439307", "lat":"25.17572457"}},
			{ "name":"金山區", "post_code":"208", "pos": {"lng":"121.6052639", "lat":"25.21714594"}},
			{ "name":"板橋區", "post_code":"220", "pos": {"lng":"121.4579675", "lat":"25.01186453"}},
			{ "name":"汐止區", "post_code":"221", "pos": {"lng":"121.6546992", "lat":"25.07331322"}},
			{ "name":"深坑區", "post_code":"222", "pos": {"lng":"121.6200624", "lat":"24.99767506"}},
			{ "name":"石碇區", "post_code":"223", "pos": {"lng":"121.6472277", "lat":"24.94714107"}},
			{ "name":"瑞芳區", "post_code":"224", "pos": {"lng":"121.8232018", "lat":"25.0981293"}},
			{ "name":"平溪區", "post_code":"226", "pos": {"lng":"121.7578817", "lat":"25.02607068"}},
			{ "name":"雙溪區", "post_code":"227", "pos": {"lng":"121.8329822", "lat":"24.99698394"}},
			{ "name":"貢寮區", "post_code":"228", "pos": {"lng":"121.9182466", "lat":"25.02485641"}},
			{ "name":"新店區", "post_code":"231", "pos": {"lng":"121.5316565", "lat":"24.93039008"}},
			{ "name":"坪林區", "post_code":"232", "pos": {"lng":"121.724223", "lat":"24.91097073"}},
			{ "name":"烏來區", "post_code":"233", "pos": {"lng":"121.5414806", "lat":"24.78824295"}},
			{ "name":"永和區", "post_code":"234", "pos": {"lng":"121.516745", "lat":"25.00810199"}},
			{ "name":"中和區", "post_code":"235", "pos": {"lng":"121.4936744", "lat":"24.99088039"}},
			{ "name":"土城區", "post_code":"236", "pos": {"lng":"121.445737", "lat":"24.96425102"}},
			{ "name":"三峽區", "post_code":"237", "pos": {"lng":"121.4163094", "lat":"24.88209766"}},
			{ "name":"樹林區", "post_code":"238", "pos": {"lng":"121.401034", "lat":"24.97970609"}},
			{ "name":"鶯歌區", "post_code":"239", "pos": {"lng":"121.3466269", "lat":"24.9566258"}},
			{ "name":"三重區", "post_code":"241", "pos": {"lng":"121.4870977", "lat":"25.06281651"}},
			{ "name":"新莊區", "post_code":"242", "pos": {"lng":"121.4367535", "lat":"25.0358303"}},
			{ "name":"泰山區", "post_code":"243", "pos": {"lng":"121.4162785", "lat":"25.05549774"}},
			{ "name":"林口區", "post_code":"244", "pos": {"lng":"121.3527235", "lat":"25.1000868"}},
			{ "name":"蘆洲區", "post_code":"247", "pos": {"lng":"121.4712461", "lat":"25.08927173"}},
			{ "name":"五股區", "post_code":"248", "pos": {"lng":"121.4332139", "lat":"25.09614746"}},
			{ "name":"八里區", "post_code":"249", "pos": {"lng":"121.4138359", "lat":"25.13812763"}},
			{ "name":"淡水區", "post_code":"251", "pos": {"lng":"121.463904", "lat":"25.18907636"}},
			{ "name":"三芝區", "post_code":"252", "pos": {"lng":"121.515558", "lat":"25.23159891"}},
			{ "name":"石門區", "post_code":"253", "pos": {"lng":"121.5692761", "lat":"25.26518079"}}
		]
	},
	{
		"name":"桃園市", "regions": [
			{ "name":"中壢區", "post_code":"320", "pos": {"lng":"121.2147243", "lat":"24.97993803"}},
			{ "name":"平鎮區", "post_code":"324", "pos": {"lng":"121.2140051", "lat":"24.92117923"}},
			{ "name":"龍潭區", "post_code":"325", "pos": {"lng":"121.2117877", "lat":"24.85064954"}},
			{ "name":"楊梅區", "post_code":"326", "pos": {"lng":"121.1291697", "lat":"24.91820989"}},
			{ "name":"新屋區", "post_code":"327", "pos": {"lng":"121.067758", "lat":"24.97280352"}},
			{ "name":"觀音區", "post_code":"328", "pos": {"lng":"121.1155021", "lat":"25.02671611"}},
			{ "name":"桃園區", "post_code":"330", "pos": {"lng":"121.2996612", "lat":"25.00040024"}},
			{ "name":"龜山區", "post_code":"333", "pos": {"lng":"121.3569265", "lat":"25.02417472"}},
			{ "name":"八德區", "post_code":"334", "pos": {"lng":"121.2913102", "lat":"24.94968903"}},
			{ "name":"大溪區", "post_code":"335", "pos": {"lng":"121.296342", "lat":"24.86797026"}},
			{ "name":"復興區", "post_code":"336", "pos": {"lng":"121.3754588", "lat":"24.72949884"}},
			{ "name":"大園區", "post_code":"337", "pos": {"lng":"121.21177", "lat":"25.06384709"}},
			{ "name":"蘆竹區", "post_code":"338", "pos": {"lng":"121.2831266", "lat":"25.06073337"}}
		]
	},
	{
		"name":"新竹市", "regions": [
			{ "name":"北區", "post_code":"300", "pos": {"lng":"120.9491233", "lat":"24.82269542"}},
			{ "name":"東區", "post_code":"300", "pos": {"lng":"120.9927505", "lat":"24.79028174"}},
			{ "name":"香山區", "post_code":"300", "pos": {"lng":"120.9236727", "lat":"24.77104342"}}
		]
	},
	{
		"name":"新竹縣", "regions": [
			{ "name":"竹北市", "post_code":"302", "pos": {"lng":"120.9948704", "lat":"24.83816209"}},
			{ "name":"湖口鄉", "post_code":"303", "pos": {"lng":"121.0517242", "lat":"24.88566341"}},
			{ "name":"新豐鄉", "post_code":"304", "pos": {"lng":"120.9956033", "lat":"24.90731298"}},
			{ "name":"新埔鎮", "post_code":"305", "pos": {"lng":"121.0939886", "lat":"24.84133959"}},
			{ "name":"關西鎮", "post_code":"306", "pos": {"lng":"121.1866221", "lat":"24.78514681"}},
			{ "name":"芎林鄉", "post_code":"307", "pos": {"lng":"121.1046394", "lat":"24.7657116"}},
			{ "name":"寶山鄉", "post_code":"308", "pos": {"lng":"120.9991605", "lat":"24.73697351"}},
			{ "name":"竹東鎮", "post_code":"310", "pos": {"lng":"121.0753632", "lat":"24.73075802"}},
			{ "name":"五峰鄉", "post_code":"311", "pos": {"lng":"121.1389495", "lat":"24.578054"}},
			{ "name":"橫山鄉", "post_code":"312", "pos": {"lng":"121.1469732", "lat":"24.7078092"}},
			{ "name":"尖石鄉", "post_code":"313", "pos": {"lng":"121.2819341", "lat":"24.59493235"}},
			{ "name":"北埔鄉", "post_code":"314", "pos": {"lng":"121.0642745", "lat":"24.67207405"}},
			{ "name":"峨眉鄉", "post_code":"315", "pos": {"lng":"121.0110809", "lat":"24.67811197"}}
		]
	},
	{
		"name":"苗栗縣", "regions": [
			{ "name":"竹南鎮", "post_code":"350", "pos": {"lng":"120.8777316", "lat":"24.69862459"}},
			{ "name":"頭份市", "post_code":"351", "pos": {"lng":"120.9189437", "lat":"24.67628243"}},
			{ "name":"三灣鄉", "post_code":"352", "pos": {"lng":"120.9525745", "lat":"24.63599405"}},
			{ "name":"南庄鄉", "post_code":"353", "pos": {"lng":"121.017471", "lat":"24.56608432"}},
			{ "name":"獅潭鄉", "post_code":"354", "pos": {"lng":"120.9206688", "lat":"24.51978614"}},
			{ "name":"後龍鎮", "post_code":"356", "pos": {"lng":"120.781205", "lat":"24.6156265"}},
			{ "name":"通霄鎮", "post_code":"357", "pos": {"lng":"120.7146378", "lat":"24.4850464"}},
			{ "name":"苑裡鎮", "post_code":"358", "pos": {"lng":"120.6882195", "lat":"24.4110232"}},
			{ "name":"苗栗市", "post_code":"360", "pos": {"lng":"120.8112299", "lat":"24.56382141"}},
			{ "name":"造橋鄉", "post_code":"361", "pos": {"lng":"120.8695663", "lat":"24.62481314"}},
			{ "name":"頭屋鄉", "post_code":"362", "pos": {"lng":"120.8826631", "lat":"24.57345497"}},
			{ "name":"公館鄉", "post_code":"363", "pos": {"lng":"120.8505904", "lat":"24.50249686"}},
			{ "name":"大湖鄉", "post_code":"364", "pos": {"lng":"120.8631192", "lat":"24.39359641"}},
			{ "name":"泰安鄉", "post_code":"365", "pos": {"lng":"121.0681571", "lat":"24.41925819"}},
			{ "name":"銅鑼鄉", "post_code":"366", "pos": {"lng":"120.7992043", "lat":"24.45591832"}},
			{ "name":"三義鄉", "post_code":"367", "pos": {"lng":"120.7701929", "lat":"24.38081659"}},
			{ "name":"西湖鄉", "post_code":"368", "pos": {"lng":"120.7614144", "lat":"24.54153218"}},
			{ "name":"卓蘭鎮", "post_code":"369", "pos": {"lng":"120.8561966", "lat":"24.32510167"}}
		]
	},
	{
		"name":"臺中市", "regions": [
			{ "name":"中區", "post_code":"400", "pos": {"lng":"120.680598", "lat":"24.14168566"}},
			{ "name":"東區", "post_code":"401", "pos": {"lng":"120.6970865", "lat":"24.13733209"}},
			{ "name":"南區", "post_code":"402", "pos": {"lng":"120.6646178", "lat":"24.12114107"}},
			{ "name":"西區", "post_code":"403", "pos": {"lng":"120.6647579", "lat":"24.14391082"}},
			{ "name":"北區", "post_code":"404", "pos": {"lng":"120.6809521", "lat":"24.15863985"}},
			{ "name":"北屯區", "post_code":"406", "pos": {"lng":"120.7362319", "lat":"24.18400298"}},
			{ "name":"西屯區", "post_code":"407", "pos": {"lng":"120.6270131", "lat":"24.18308895"}},
			{ "name":"南屯區", "post_code":"408", "pos": {"lng":"120.6177379", "lat":"24.14165524"}},
			{ "name":"太平區", "post_code":"411", "pos": {"lng":"120.7734217", "lat":"24.11477375"}},
			{ "name":"大里區", "post_code":"412", "pos": {"lng":"120.6926261", "lat":"24.09575742"}},
			{ "name":"霧峰區", "post_code":"413", "pos": {"lng":"120.7201989", "lat":"24.04332785"}},
			{ "name":"烏日區", "post_code":"414", "pos": {"lng":"120.6293305", "lat":"24.0839271"}},
			{ "name":"豐原區", "post_code":"420", "pos": {"lng":"120.7375715", "lat":"24.24990298"}},
			{ "name":"后里區", "post_code":"421", "pos": {"lng":"120.7146127", "lat":"24.30962483"}},
			{ "name":"石岡區", "post_code":"422", "pos": {"lng":"120.7903822", "lat":"24.26493299"}},
			{ "name":"東勢區", "post_code":"423", "pos": {"lng":"120.8401401", "lat":"24.24952637"}},
			{ "name":"和平區", "post_code":"424", "pos": {"lng":"121.140185", "lat":"24.27620277"}},
			{ "name":"新社區", "post_code":"426", "pos": {"lng":"120.8313228", "lat":"24.17769289"}},
			{ "name":"潭子區", "post_code":"427", "pos": {"lng":"120.710997", "lat":"24.21171121"}},
			{ "name":"大雅區", "post_code":"428", "pos": {"lng":"120.6411818", "lat":"24.22704181"}},
			{ "name":"神岡區", "post_code":"429", "pos": {"lng":"120.6733321", "lat":"24.26568008"}},
			{ "name":"大肚區", "post_code":"432", "pos": {"lng":"120.5543243", "lat":"24.14467504"}},
			{ "name":"沙鹿區", "post_code":"433", "pos": {"lng":"120.5838628", "lat":"24.23425212"}},
			{ "name":"龍井區", "post_code":"434", "pos": {"lng":"120.5283728", "lat":"24.20062892"}},
			{ "name":"梧棲區", "post_code":"435", "pos": {"lng":"120.5301259", "lat":"24.24552431"}},
			{ "name":"清水區", "post_code":"436", "pos": {"lng":"120.5809094", "lat":"24.29205743"}},
			{ "name":"大甲區", "post_code":"437", "pos": {"lng":"120.6357901", "lat":"24.37827161"}},
			{ "name":"外埔區", "post_code":"438", "pos": {"lng":"120.6650639", "lat":"24.33551071"}},
			{ "name":"大安區", "post_code":"439", "pos": {"lng":"120.5914407", "lat":"24.36509555"}}
		]
	},
	{
		"name":"彰化縣", "regions": [
			{ "name":"彰化市", "post_code":"500", "pos": {"lng":"120.5694208", "lat":"24.07532909"}},
			{ "name":"芬園鄉", "post_code":"502", "pos": {"lng":"120.6294414", "lat":"24.00628794"}},
			{ "name":"花壇鄉", "post_code":"503", "pos": {"lng":"120.5597655", "lat":"24.03006875"}},
			{ "name":"秀水鄉", "post_code":"504", "pos": {"lng":"120.5041184", "lat":"24.03249405"}},
			{ "name":"鹿港鎮", "post_code":"505", "pos": {"lng":"120.4385491", "lat":"24.08286685"}},
			{ "name":"福興鄉", "post_code":"506", "pos": {"lng":"120.4310511", "lat":"24.03021674"}},
			{ "name":"線西鄉", "post_code":"507", "pos": {"lng":"120.452157", "lat":"24.13158127"}},
			{ "name":"和美鎮", "post_code":"508", "pos": {"lng":"120.5112045", "lat":"24.11379535"}},
			{ "name":"伸港鄉", "post_code":"509", "pos": {"lng":"120.486449", "lat":"24.16367107"}},
			{ "name":"員林市", "post_code":"510", "pos": {"lng":"120.593073", "lat":"23.95650448"}},
			{ "name":"社頭鄉", "post_code":"511", "pos": {"lng":"120.6021661", "lat":"23.90536413"}},
			{ "name":"永靖鄉", "post_code":"512", "pos": {"lng":"120.5416032", "lat":"23.92139507"}},
			{ "name":"埔心鄉", "post_code":"513", "pos": {"lng":"120.5342802", "lat":"23.95277521"}},
			{ "name":"溪湖鎮", "post_code":"514", "pos": {"lng":"120.4831739", "lat":"23.95171456"}},
			{ "name":"大村鄉", "post_code":"515", "pos": {"lng":"120.5586866", "lat":"23.99209206"}},
			{ "name":"埔鹽鄉", "post_code":"516", "pos": {"lng":"120.4594626", "lat":"23.99204417"}},
			{ "name":"田中鎮", "post_code":"520", "pos": {"lng":"120.5903471", "lat":"23.85723872"}},
			{ "name":"北斗鎮", "post_code":"521", "pos": {"lng":"120.5331566", "lat":"23.867574"}},
			{ "name":"田尾鄉", "post_code":"522", "pos": {"lng":"120.5223244", "lat":"23.90056065"}},
			{ "name":"埤頭鄉", "post_code":"523", "pos": {"lng":"120.4675642", "lat":"23.88234118"}},
			{ "name":"溪州鄉", "post_code":"524", "pos": {"lng":"120.5224904", "lat":"23.82725185"}},
			{ "name":"竹塘鄉", "post_code":"525", "pos": {"lng":"120.4136645", "lat":"23.8505872"}},
			{ "name":"二林鎮", "post_code":"526", "pos": {"lng":"120.404225", "lat":"23.91621405"}},
			{ "name":"大城鄉", "post_code":"527", "pos": {"lng":"120.3113284", "lat":"23.85069276"}},
			{ "name":"芳苑鄉", "post_code":"528", "pos": {"lng":"120.3539226", "lat":"23.9537906"}},
			{ "name":"二水鄉", "post_code":"530", "pos": {"lng":"120.628589", "lat":"23.8092402"}}
		]
	},
	{
		"name":"南投縣", "regions": [
			{ "name":"南投市", "post_code":"540", "pos": {"lng":"120.6787658", "lat":"23.92173537"}},
			{ "name":"中寮鄉", "post_code":"541", "pos": {"lng":"120.7859159", "lat":"23.90589214"}},
			{ "name":"草屯鎮", "post_code":"542", "pos": {"lng":"120.7326182", "lat":"23.98321081"}},
			{ "name":"國姓鄉", "post_code":"544", "pos": {"lng":"120.8676052", "lat":"24.03135413"}},
			{ "name":"埔里鎮", "post_code":"545", "pos": {"lng":"120.9625259", "lat":"23.97892591"}},
			{ "name":"仁愛鄉", "post_code":"546", "pos": {"lng":"121.1443879", "lat":"24.02886513"}},
			{ "name":"名間鄉", "post_code":"551", "pos": {"lng":"120.6774402", "lat":"23.8510771"}},
			{ "name":"集集鎮", "post_code":"552", "pos": {"lng":"120.7854192", "lat":"23.83701687"}},
			{ "name":"水里鄉", "post_code":"553", "pos": {"lng":"120.8622721", "lat":"23.79612907"}},
			{ "name":"魚池鄉", "post_code":"555", "pos": {"lng":"120.9256736", "lat":"23.87601213"}},
			{ "name":"信義鄉", "post_code":"556", "pos": {"lng":"121.0212867", "lat":"23.6554647"}},
			{ "name":"竹山鎮", "post_code":"557", "pos": {"lng":"120.7100797", "lat":"23.69805518"}},
			{ "name":"鹿谷鄉", "post_code":"558", "pos": {"lng":"120.7815065", "lat":"23.73776029"}}
		]
	},
	{
		"name":"雲林縣", "regions": [
			{ "name":"斗南鎮", "post_code":"630", "pos": {"lng":"120.4826356", "lat":"23.67066393"}},
			{ "name":"大埤鄉", "post_code":"631", "pos": {"lng":"120.4255592", "lat":"23.6455971"}},
			{ "name":"虎尾鎮", "post_code":"632", "pos": {"lng":"120.4293061", "lat":"23.71661545"}},
			{ "name":"土庫鎮", "post_code":"633", "pos": {"lng":"120.3647252", "lat":"23.69110665"}},
			{ "name":"褒忠鄉", "post_code":"634", "pos": {"lng":"120.3116122", "lat":"23.71613204"}},
			{ "name":"東勢鄉", "post_code":"635", "pos": {"lng":"120.2564173", "lat":"23.69612324"}},
			{ "name":"臺西鄉", "post_code":"636", "pos": {"lng":"120.2054952", "lat":"23.71600815"}},
			{ "name":"崙背鄉", "post_code":"637", "pos": {"lng":"120.3339769", "lat":"23.77849791"}},
			{ "name":"麥寮鄉", "post_code":"638", "pos": {"lng":"120.243533", "lat":"23.78817056"}},
			{ "name":"斗六市", "post_code":"640", "pos": {"lng":"120.5600044", "lat":"23.70651883"}},
			{ "name":"林內鄉", "post_code":"643", "pos": {"lng":"120.6155018", "lat":"23.7557209"}},
			{ "name":"古坑鄉", "post_code":"646", "pos": {"lng":"120.6117351", "lat":"23.62545469"}},
			{ "name":"莿桐鄉", "post_code":"647", "pos": {"lng":"120.5290419", "lat":"23.76973894"}},
			{ "name":"西螺鎮", "post_code":"648", "pos": {"lng":"120.4580795", "lat":"23.77942109"}},
			{ "name":"二崙鄉", "post_code":"649", "pos": {"lng":"120.3964598", "lat":"23.7925521"}},
			{ "name":"北港鎮", "post_code":"651", "pos": {"lng":"120.2940164", "lat":"23.59219528"}},
			{ "name":"水林鄉", "post_code":"652", "pos": {"lng":"120.2352734", "lat":"23.56162849"}},
			{ "name":"口湖鄉", "post_code":"653", "pos": {"lng":"120.1413711", "lat":"23.55365395"}},
			{ "name":"四湖鄉", "post_code":"654", "pos": {"lng":"120.2064699", "lat":"23.64206875"}},
			{ "name":"元長鄉", "post_code":"655", "pos": {"lng":"120.3279617", "lat":"23.64243095"}}
		]
	},
	{
		"name":"嘉義市", "regions": [
			{ "name":"西區", "post_code":"600", "pos": {"lng":"120.4248724", "lat":"23.47915529"}},
			{ "name":"東區", "post_code":"600", "pos": {"lng":"120.4706244", "lat":"23.48170334"}}
		]
	},
	{
		"name":"嘉義縣", "regions": [
			{ "name":"番路鄉", "post_code":"602", "pos": {"lng":"120.6075335", "lat":"23.42765669"}},
			{ "name":"梅山鄉", "post_code":"603", "pos": {"lng":"120.6387459", "lat":"23.55535465"}},
			{ "name":"竹崎鄉", "post_code":"604", "pos": {"lng":"120.5965771", "lat":"23.50376527"}},
			{ "name":"阿里山鄉", "post_code":"605", "pos": {"lng":"120.7596173", "lat":"23.44077619"}},
			{ "name":"中埔鄉", "post_code":"606", "pos": {"lng":"120.5365312", "lat":"23.40408998"}},
			{ "name":"大埔鄉", "post_code":"607", "pos": {"lng":"120.5896466", "lat":"23.28848426"}},
			{ "name":"水上鄉", "post_code":"608", "pos": {"lng":"120.4147357", "lat":"23.42911287"}},
			{ "name":"鹿草鄉", "post_code":"611", "pos": {"lng":"120.3045468", "lat":"23.40811736"}},
			{ "name":"太保市", "post_code":"612", "pos": {"lng":"120.3440009", "lat":"23.4729191"}},
			{ "name":"朴子市", "post_code":"613", "pos": {"lng":"120.2538977", "lat":"23.44610605"}},
			{ "name":"東石鄉", "post_code":"614", "pos": {"lng":"120.1738682", "lat":"23.46866059"}},
			{ "name":"六腳鄉", "post_code":"615", "pos": {"lng":"120.2714728", "lat":"23.51020984"}},
			{ "name":"新港鄉", "post_code":"616", "pos": {"lng":"120.3482873", "lat":"23.54581295"}},
			{ "name":"民雄鄉", "post_code":"621", "pos": {"lng":"120.4442798", "lat":"23.54255347"}},
			{ "name":"大林鎮", "post_code":"622", "pos": {"lng":"120.4807865", "lat":"23.59890827"}},
			{ "name":"溪口鄉", "post_code":"623", "pos": {"lng":"120.4010282", "lat":"23.59353089"}},
			{ "name":"義竹鄉", "post_code":"624", "pos": {"lng":"120.2239433", "lat":"23.34575872"}},
			{ "name":"布袋鎮", "post_code":"625", "pos": {"lng":"120.1777498", "lat":"23.37494276"}}
		]
	},
	{
		"name":"臺南市", "regions": [
			{ "name":"中西區", "post_code":"700", "pos": {"lng":"120.192874", "lat":"22.99594458"}},
			{ "name":"東區", "post_code":"701", "pos": {"lng":"120.2281858", "lat":"22.98178202"}},
			{ "name":"南區", "post_code":"702", "pos": {"lng":"120.1903743", "lat":"22.95561863"}},
			{ "name":"北區", "post_code":"704", "pos": {"lng":"120.2068735", "lat":"23.01012179"}},
			{ "name":"安平區", "post_code":"708", "pos": {"lng":"120.1649949", "lat":"22.99008437"}},
			{ "name":"安南區", "post_code":"709", "pos": {"lng":"120.1526189", "lat":"23.04869681"}},
			{ "name":"永康區", "post_code":"710", "pos": {"lng":"120.2542795", "lat":"23.02729532"}},
			{ "name":"歸仁區", "post_code":"711", "pos": {"lng":"120.2930627", "lat":"22.94679469"}},
			{ "name":"新化區", "post_code":"712", "pos": {"lng":"120.3357964", "lat":"23.03394545"}},
			{ "name":"左鎮區", "post_code":"713", "pos": {"lng":"120.4123917", "lat":"23.02604611"}},
			{ "name":"玉井區", "post_code":"714", "pos": {"lng":"120.4609622", "lat":"23.11480926"}},
			{ "name":"楠西區", "post_code":"715", "pos": {"lng":"120.5170304", "lat":"23.17885854"}},
			{ "name":"南化區", "post_code":"716", "pos": {"lng":"120.5441223", "lat":"23.1151111"}},
			{ "name":"仁德區", "post_code":"717", "pos": {"lng":"120.2418788", "lat":"22.94130931"}},
			{ "name":"關廟區", "post_code":"718", "pos": {"lng":"120.3342821", "lat":"22.95577909"}},
			{ "name":"龍崎區", "post_code":"719", "pos": {"lng":"120.3869373", "lat":"22.95482276"}},
			{ "name":"官田區", "post_code":"720", "pos": {"lng":"120.3479918", "lat":"23.19098548"}},
			{ "name":"麻豆區", "post_code":"721", "pos": {"lng":"120.241308", "lat":"23.18248033"}},
			{ "name":"佳里區", "post_code":"722", "pos": {"lng":"120.178593", "lat":"23.1669941"}},
			{ "name":"西港區", "post_code":"723", "pos": {"lng":"120.2002309", "lat":"23.12491893"}},
			{ "name":"七股區", "post_code":"724", "pos": {"lng":"120.1005854", "lat":"23.12326578"}},
			{ "name":"將軍區", "post_code":"725", "pos": {"lng":"120.1276958", "lat":"23.20834413"}},
			{ "name":"學甲區", "post_code":"726", "pos": {"lng":"120.1841865", "lat":"23.25219805"}},
			{ "name":"北門區", "post_code":"727", "pos": {"lng":"120.1262357", "lat":"23.2777708"}},
			{ "name":"新營區", "post_code":"730", "pos": {"lng":"120.2954067", "lat":"23.30152488"}},
			{ "name":"後壁區", "post_code":"731", "pos": {"lng":"120.3485081", "lat":"23.36201478"}},
			{ "name":"白河區", "post_code":"732", "pos": {"lng":"120.4578565", "lat":"23.35132068"}},
			{ "name":"東山區", "post_code":"733", "pos": {"lng":"120.4441211", "lat":"23.2783187"}},
			{ "name":"六甲區", "post_code":"734", "pos": {"lng":"120.3800259", "lat":"23.2272672"}},
			{ "name":"下營區", "post_code":"735", "pos": {"lng":"120.26484", "lat":"23.23103978"}},
			{ "name":"柳營區", "post_code":"736", "pos": {"lng":"120.3549205", "lat":"23.26887001"}},
			{ "name":"鹽水區", "post_code":"737", "pos": {"lng":"120.2482977", "lat":"23.29798622"}},
			{ "name":"善化區", "post_code":"741", "pos": {"lng":"120.2988274", "lat":"23.14031072"}},
			{ "name":"大內區", "post_code":"742", "pos": {"lng":"120.3988147", "lat":"23.14482152"}},
			{ "name":"山上區", "post_code":"743", "pos": {"lng":"120.370977", "lat":"23.09689329"}},
			{ "name":"新市區", "post_code":"744", "pos": {"lng":"120.2923941", "lat":"23.08319496"}},
			{ "name":"安定區", "post_code":"745", "pos": {"lng":"120.2296235", "lat":"23.09974927"}}
		]
	},
	{
		"name":"高雄市", "regions": [
			{ "name":"新興區", "post_code":"800", "pos": {"lng":"120.3067337", "lat":"22.62992906"}},
			{ "name":"前金區", "post_code":"801", "pos": {"lng":"120.2944217", "lat":"22.6269905"}},
			{ "name":"苓雅區", "post_code":"802", "pos": {"lng":"120.3209103", "lat":"22.62359448"}},
			{ "name":"鹽埕區", "post_code":"803", "pos": {"lng":"120.2842331", "lat":"22.62424585"}},
			{ "name":"鼓山區", "post_code":"804", "pos": {"lng":"120.274163", "lat":"22.65019525"}},
			{ "name":"旗津區", "post_code":"805", "pos": {"lng":"120.2891539", "lat":"22.58565583"}},
			{ "name":"前鎮區", "post_code":"806", "pos": {"lng":"120.3146749", "lat":"22.59269724"}},
			{ "name":"三民區", "post_code":"807", "pos": {"lng":"120.3179187", "lat":"22.64989883"}},
			{ "name":"楠梓區", "post_code":"811", "pos": {"lng":"120.300758", "lat":"22.72109961"}},
			{ "name":"小港區", "post_code":"812", "pos": {"lng":"120.3592605", "lat":"22.55140207"}},
			{ "name":"左營區", "post_code":"813", "pos": {"lng":"120.2951588", "lat":"22.68395699"}},
			{ "name":"仁武區", "post_code":"814", "pos": {"lng":"120.3605265", "lat":"22.70120782"}},
			{ "name":"大社區", "post_code":"815", "pos": {"lng":"120.3707994", "lat":"22.73983479"}},
			{ "name":"岡山區", "post_code":"820", "pos": {"lng":"120.2978906", "lat":"22.80505886"}},
			{ "name":"路竹區", "post_code":"821", "pos": {"lng":"120.2659871", "lat":"22.85724171"}},
			{ "name":"阿蓮區", "post_code":"822", "pos": {"lng":"120.3210967", "lat":"22.87022883"}},
			{ "name":"田寮區", "post_code":"823", "pos": {"lng":"120.3959842", "lat":"22.86394307"}},
			{ "name":"燕巢區", "post_code":"824", "pos": {"lng":"120.370799", "lat":"22.78769626"}},
			{ "name":"橋頭區", "post_code":"825", "pos": {"lng":"120.3006534", "lat":"22.75252398"}},
			{ "name":"梓官區", "post_code":"826", "pos": {"lng":"120.2593989", "lat":"22.748209"}},
			{ "name":"彌陀區", "post_code":"827", "pos": {"lng":"120.2394571", "lat":"22.77944528"}},
			{ "name":"永安區", "post_code":"828", "pos": {"lng":"120.228051", "lat":"22.82224585"}},
			{ "name":"湖內區", "post_code":"829", "pos": {"lng":"120.2259375", "lat":"22.89324952"}},
			{ "name":"鳳山區", "post_code":"830", "pos": {"lng":"120.3554359", "lat":"22.61379251"}},
			{ "name":"大寮區", "post_code":"831", "pos": {"lng":"120.4111468", "lat":"22.59283576"}},
			{ "name":"林園區", "post_code":"832", "pos": {"lng":"120.399052", "lat":"22.50813743"}},
			{ "name":"鳥松區", "post_code":"833", "pos": {"lng":"120.3727783", "lat":"22.66249302"}},
			{ "name":"大樹區", "post_code":"840", "pos": {"lng":"120.425407", "lat":"22.71100364"}},
			{ "name":"旗山區", "post_code":"842", "pos": {"lng":"120.4754554", "lat":"22.86497033"}},
			{ "name":"美濃區", "post_code":"843", "pos": {"lng":"120.5634635", "lat":"22.90005529"}},
			{ "name":"六龜區", "post_code":"844", "pos": {"lng":"120.6585635", "lat":"23.01195426"}},
			{ "name":"內門區", "post_code":"845", "pos": {"lng":"120.4719272", "lat":"22.95668817"}},
			{ "name":"杉林區", "post_code":"846", "pos": {"lng":"120.5621971", "lat":"22.99694681"}},
			{ "name":"甲仙區", "post_code":"847", "pos": {"lng":"120.6232895", "lat":"23.11654995"}},
			{ "name":"桃源區", "post_code":"848", "pos": {"lng":"120.8523383", "lat":"23.2249459"}},
			{ "name":"那瑪夏區", "post_code":"849", "pos": {"lng":"120.741944", "lat":"23.275008"}},
			{ "name":"茂林區", "post_code":"851", "pos": {"lng":"120.752384", "lat":"22.91993256"}},
			{ "name":"茄萣區", "post_code":"852", "pos": {"lng":"120.1980519", "lat":"22.88241399"}}
		]
	},
	{
		"name":"屏東縣", "regions": [
			{ "name":"屏東市", "post_code":"900", "pos": {"lng":"120.4799948", "lat":"22.6647375"}},
			{ "name":"三地門鄉", "post_code":"901", "pos": {"lng":"120.6865219", "lat":"22.79786847"}},
			{ "name":"霧臺鄉", "post_code":"902", "pos": {"lng":"120.8008099", "lat":"22.75990478"}},
			{ "name":"瑪家鄉", "post_code":"903", "pos": {"lng":"120.6799239", "lat":"22.67107764"}},
			{ "name":"九如鄉", "post_code":"904", "pos": {"lng":"120.4845044", "lat":"22.7316677"}},
			{ "name":"里港鄉", "post_code":"905", "pos": {"lng":"120.5061276", "lat":"22.79854831"}},
			{ "name":"高樹鄉", "post_code":"906", "pos": {"lng":"120.6017678", "lat":"22.80992022"}},
			{ "name":"鹽埔鄉", "post_code":"907", "pos": {"lng":"120.5693941", "lat":"22.74253636"}},
			{ "name":"長治鄉", "post_code":"908", "pos": {"lng":"120.555979", "lat":"22.69454952"}},
			{ "name":"麟洛鄉", "post_code":"909", "pos": {"lng":"120.5299693", "lat":"22.64876367"}},
			{ "name":"竹田鄉", "post_code":"911", "pos": {"lng":"120.5266379", "lat":"22.58855636"}},
			{ "name":"內埔鄉", "post_code":"912", "pos": {"lng":"120.5888222", "lat":"22.65116933"}},
			{ "name":"萬丹鄉", "post_code":"913", "pos": {"lng":"120.4766188", "lat":"22.58849547"}},
			{ "name":"潮州鎮", "post_code":"920", "pos": {"lng":"120.5568063", "lat":"22.53642947"}},
			{ "name":"泰武鄉", "post_code":"921", "pos": {"lng":"120.6917929", "lat":"22.60408477"}},
			{ "name":"來義鄉", "post_code":"922", "pos": {"lng":"120.6857232", "lat":"22.50157206"}},
			{ "name":"萬巒鄉", "post_code":"923", "pos": {"lng":"120.601817", "lat":"22.58233459"}},
			{ "name":"崁頂鄉", "post_code":"924", "pos": {"lng":"120.5006598", "lat":"22.51528151"}},
			{ "name":"新埤鄉", "post_code":"925", "pos": {"lng":"120.5846257", "lat":"22.48676279"}},
			{ "name":"南州鄉", "post_code":"926", "pos": {"lng":"120.5180561", "lat":"22.47980704"}},
			{ "name":"林邊鄉", "post_code":"927", "pos": {"lng":"120.5125095", "lat":"22.44142101"}},
			{ "name":"東港鎮", "post_code":"928", "pos": {"lng":"120.4751333", "lat":"22.46265635"}},
			{ "name":"琉球鄉", "post_code":"929", "pos": {"lng":"120.3710466", "lat":"22.34000278"}},
			{ "name":"佳冬鄉", "post_code":"931", "pos": {"lng":"120.5476124", "lat":"22.42980624"}},
			{ "name":"新園鄉", "post_code":"932", "pos": {"lng":"120.4501429", "lat":"22.5171903"}},
			{ "name":"枋寮鄉", "post_code":"940", "pos": {"lng":"120.5975845", "lat":"22.40334199"}},
			{ "name":"枋山鄉", "post_code":"941", "pos": {"lng":"120.6567673", "lat":"22.27086962"}},
			{ "name":"春日鄉", "post_code":"942", "pos": {"lng":"120.6975799", "lat":"22.40399754"}},
			{ "name":"獅子鄉", "post_code":"943", "pos": {"lng":"120.7356454", "lat":"22.26084921"}},
			{ "name":"車城鄉", "post_code":"944", "pos": {"lng":"120.7432633", "lat":"22.07915617"}},
			{ "name":"牡丹鄉", "post_code":"945", "pos": {"lng":"120.8173609", "lat":"22.15552859"}},
			{ "name":"恆春鎮", "post_code":"946", "pos": {"lng":"120.7632537", "lat":"21.98531645"}},
			{ "name":"滿州鄉", "post_code":"947", "pos": {"lng":"120.8435675", "lat":"22.04930015"}}
		]
	},
	{
		"name":"臺東縣", "regions": [
			{ "name":"臺東市", "post_code":"950", "pos": {"lng":"121.1103647", "lat":"22.75165721"}},
			{ "name":"綠島鄉", "post_code":"951", "pos": {"lng":"121.4901951", "lat":"22.66017537"}},
			{ "name":"蘭嶼鄉", "post_code":"952", "pos": {"lng":"121.5508328", "lat":"22.04616835"}},
			{ "name":"延平鄉", "post_code":"953", "pos": {"lng":"120.9831902", "lat":"22.90343174"}},
			{ "name":"卑南鄉", "post_code":"954", "pos": {"lng":"121.0015521", "lat":"22.76494453"}},
			{ "name":"鹿野鄉", "post_code":"955", "pos": {"lng":"121.1560376", "lat":"22.95125666"}},
			{ "name":"關山鎮", "post_code":"956", "pos": {"lng":"121.1766197", "lat":"23.03780684"}},
			{ "name":"海端鄉", "post_code":"957", "pos": {"lng":"121.0175672", "lat":"23.11478528"}},
			{ "name":"池上鄉", "post_code":"958", "pos": {"lng":"121.2184501", "lat":"23.09248714"}},
			{ "name":"東河鄉", "post_code":"959", "pos": {"lng":"121.2517917", "lat":"22.98006921"}},
			{ "name":"成功鎮", "post_code":"961", "pos": {"lng":"121.3537983", "lat":"23.12663716"}},
			{ "name":"長濱鄉", "post_code":"962", "pos": {"lng":"121.4261725", "lat":"23.33476899"}},
			{ "name":"太麻里鄉", "post_code":"963", "pos": {"lng":"120.9797643", "lat":"22.59098082"}},
			{ "name":"金峰鄉", "post_code":"964", "pos": {"lng":"120.8570384", "lat":"22.58161687"}},
			{ "name":"大武鄉", "post_code":"965", "pos": {"lng":"120.8991703", "lat":"22.38359522"}},
			{ "name":"達仁鄉", "post_code":"966", "pos": {"lng":"120.8355239", "lat":"22.38430718"}}
		]
	},
	{
		"name":"花蓮縣", "regions": [
			{ "name":"花蓮市", "post_code":"970", "pos": {"lng":"121.6071463", "lat":"23.99700271"}},
			{ "name":"新城鄉", "post_code":"971", "pos": {"lng":"121.6137969", "lat":"24.05579952"}},
			{ "name":"秀林鄉", "post_code":"972", "pos": {"lng":"121.4807194", "lat":"24.12374414"}},
			{ "name":"吉安鄉", "post_code":"973", "pos": {"lng":"121.5646738", "lat":"23.95546585"}},
			{ "name":"壽豐鄉", "post_code":"974", "pos": {"lng":"121.5341569", "lat":"23.84459714"}},
			{ "name":"鳳林鎮", "post_code":"975", "pos": {"lng":"121.4698848", "lat":"23.74324462"}},
			{ "name":"光復鄉", "post_code":"976", "pos": {"lng":"121.4351231", "lat":"23.64658742"}},
			{ "name":"豐濱鄉", "post_code":"977", "pos": {"lng":"121.4942331", "lat":"23.58519428"}},
			{ "name":"瑞穗鄉", "post_code":"978", "pos": {"lng":"121.4073472", "lat":"23.5156124"}},
			{ "name":"萬榮鄉", "post_code":"979", "pos": {"lng":"121.3189531", "lat":"23.72772629"}},
			{ "name":"玉里鎮", "post_code":"981", "pos": {"lng":"121.3604476", "lat":"23.37143588"}},
			{ "name":"卓溪鄉", "post_code":"982", "pos": {"lng":"121.1804222", "lat":"23.39062875"}},
			{ "name":"富里鄉", "post_code":"983", "pos": {"lng":"121.2980494", "lat":"23.19672092"}}
		]
	},
	{
		"name":"宜蘭縣", "regions": [
			{ "name":"宜蘭市", "post_code":"260", "pos": {"lng":"121.7569358", "lat":"24.75021184"}},
			{ "name":"頭城鎮", "post_code":"261", "pos": {"lng":"121.845797", "lat":"24.90075882"}},
			{ "name":"礁溪鄉", "post_code":"262", "pos": {"lng":"121.7346606", "lat":"24.81144192"}},
			{ "name":"壯圍鄉", "post_code":"263", "pos": {"lng":"121.8017622", "lat":"24.75183042"}},
			{ "name":"員山鄉", "post_code":"264", "pos": {"lng":"121.6612282", "lat":"24.74199237"}},
			{ "name":"羅東鎮", "post_code":"265", "pos": {"lng":"121.7701782", "lat":"24.67884824"}},
			{ "name":"三星鄉", "post_code":"266", "pos": {"lng":"121.6642714", "lat":"24.66771972"}},
			{ "name":"大同鄉", "post_code":"267", "pos": {"lng":"121.5040369", "lat":"24.55152082"}},
			{ "name":"五結鄉", "post_code":"268", "pos": {"lng":"121.8058342", "lat":"24.68887343"}},
			{ "name":"冬山鄉", "post_code":"269", "pos": {"lng":"121.760255", "lat":"24.64214986"}},
			{ "name":"蘇澳鎮", "post_code":"270", "pos": {"lng":"121.8346892", "lat":"24.55467058"}},
			{ "name":"南澳鄉", "post_code":"272", "pos": {"lng":"121.6560593", "lat":"24.44864058"}},
			{ "name":"釣魚臺列嶼", "post_code":"290", "pos": {"lng":"123.475482", "lat":"25.746396"}}
		]
	},
	{
		"name":"澎湖縣", "regions": [
			{ "name":"馬公市", "post_code":"880", "pos": {"lng":"119.59234", "lat":"23.55534"}},
			{ "name":"西嶼鄉", "post_code":"881", "pos": {"lng":"119.50783", "lat":"23.59975"}},
			{ "name":"望安鄉", "post_code":"882", "pos": {"lng":"119.50406", "lat":"23.36904"}},
			{ "name":"七美鄉", "post_code":"883", "pos": {"lng":"119.43393", "lat":"23.20108"}},
			{ "name":"白沙鄉", "post_code":"884", "pos": {"lng":"119.59251", "lat":"23.64178"}},
			{ "name":"湖西鄉", "post_code":"885", "pos": {"lng":"119.64462", "lat":"23.57364"}}
		]
	},
	{
		"name":"金門縣", "regions": [
			{ "name":"金沙鎮", "post_code":"890", "pos": {"lng":"118.40841", "lat":"24.45865"}},
			{ "name":"金湖鎮", "post_code":"891", "pos": {"lng":"118.40373", "lat":"24.41496"}},
			{ "name":"金寧鄉", "post_code":"892", "pos": {"lng":"118.31705", "lat":"24.42482"}},
			{ "name":"金城鎮", "post_code":"893", "pos": {"lng":"118.30128", "lat":"24.38402"}},
			{ "name":"烈嶼鄉", "post_code":"894", "pos": {"lng":"118.22789", "lat":"24.40166"}},
			{ "name":"烏坵鄉", "post_code":"896", "pos": {"lng":"119.452738", "lat":"24.992338"}}
		]
	},
	{
		"name":"連江縣", "regions": [
			{ "name":"南竿鄉", "post_code":"209", "pos": {"lng":"119.931128", "lat":"26.154321"}},
			{ "name":"北竿鄉", "post_code":"210", "pos": {"lng":"119.994251", "lat":"26.225637"}},
			{ "name":"莒光鄉", "post_code":"211", "pos": {"lng":"119.938877", "lat":"25.97298"}},
			{ "name":"東引鄉", "post_code":"212", "pos": {"lng":"120.4903", "lat":"26.366101"}}
		]
	}
];


	})();
	
	window.dimport   = exported.dimport;
	window.resources = exported.resources;
})();