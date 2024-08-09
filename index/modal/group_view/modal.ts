"use strict";
// (async () => {
( () => {
    const TAG = 'roska_group_info';
    const LANG_NAME_MAP = { en_us: '英文', zh_tw: '繁體中文', zh_cn: '簡體中文' };
    ///****待修改****///
    const STATE = {
        query: {},
        cursor: null
    };

	const { resolve, promise } = ROSKA_FORM.Tools.FlattenPromise<void>();

    const modals = window.modals;
    const loading_overlay = window.loading_overlay;
    const view = window.modal_view;
    const modal_view = view.group_view;
    modals.push({
        init: async function () {
            const [{ element: layout }] = await window.resources([
                { type: 'html', path: './modal/group_view/modal.html' },
                { type: 'css', path: './modal/group_view/modal.css' }
            ]);
            modal_view.element.innerHTML = layout.innerHTML;
            modal_view.relink();
            layout.remove();
            // list_group_info();
        }
    });

    
    modal_view
        .on('view-state', (e:any) => {
        if (e.state !== "show")
            return;
        loading_overlay.Show();
        ResetPage(); 
        list_group_info()
            .catch((e) => {
            console.error(e);
            alert(`載入失敗！(${e.message})`);
            window.HandleUnauthorizedAccess(e);
            })
            .finally(() => {
            loading_overlay.Hide();
            });

        })
        .on('click', async(e:any)=>{
            const trigger = e.target;
            const trigger_btn = trigger.closest('.btn');
            if (!trigger_btn)
                return;
            switch (trigger_btn.dataset.role) {
                case "join_bid": {
                    var req:{
                        gid:String,
                        bid_amount:number
                    } = {
                        gid : trigger_btn.dataset.relGid,
                        bid_amount : Number(trigger_btn.dataset.relBid_amount),
                    }

                    join_bid(req);
                    break;
                    
                }
                
                default:
                    alert("您沒有權限使用該功能！\\n請使用更高權限等級的帳號執行此操作！");
                    return;
            }
        })
        ;
        
    async function list_group_info() {
        const InputParams = new URLSearchParams(window.location.search);
        // const searchParams: Array<string> = [];
        const searchParams: any = {};
        InputParams.forEach((key ,value:any)=>{
                searchParams[value]=key;
        });
        if( !searchParams['sid'])
        return;
        const list_data = await ROSKA_FORM.Get_in_groups(searchParams['sid']);
        const { total_records, tmpl_item  } = modal_view.list_container;		
        const region_list = modal_view.list_container.region_list;

        var last_gid :any = "";
        console.log(list_data);
        if (list_data) {
            modal_view.list_container.sid.textContent = '會組編號 : '+searchParams['sid'];
            modal_view.list_container.group_leader.textContent = '會首 : '+list_data[0].name;
            modal_view.list_container.address.textContent = '合會地址 : '+'永康合會';
            console.log(modal_view.list_container.first_bid_date);
            // modal_view.list_container.first_bid_date.textContent = '首次開標日期 : ';

            const list_datas = list_data.slice(1);
            console.log("list_datas}");
            console.log(list_datas);
            var count = 1;
            list_datas.forEach(function(record:any){
                const elm = tmpl_item.duplicate();
                elm.numb.textContent = count;
                count +=1;
                elm.mid.textContent = record.mid||"";
                elm.name.textContent = record.name||"";
                elm.gid.textContent = record.gid||"";
                if(record.gid){
                    if(Number(record.gid.slice(-2))>Number((last_gid).slice(-2))){
                        last_gid = record.gid;
                    }
                }
                elm.win_amount.textContent = record.win_amount||"";
                region_list.appendChild(elm.element);
            })

            const button_group_bid = document.createElement("button");
                button_group_bid.classList.add("btn-green", "btn");
                button_group_bid.textContent = "我要下標";
                button_group_bid.dataset.role = 'join_bid';
                button_group_bid.dataset.relGid = last_gid.slice(0,-2)+String(  ROSKA_FORM.Tools.pad_zero( Number(last_gid.slice(-2))+1  ,2));
                modal_view.list_container.next_bid_date.textContent = '下次開標日期 : '+button_group_bid.dataset.relGid;
                console.log(button_group_bid.dataset.relGid);
                button_group_bid.dataset.relBid_amount = "1000";
            console.log(modal_view.list_container.button_region);
            modal_view.list_container.button_region.appendChild(button_group_bid);
        }
    };
    async function join_bid(req:any) {
		var joinornot = confirm("確定要參與 : "+req.gid+"的下標嗎?")
		if(!joinornot){return;}
		try{ 
			await ROSKA_FORM.Join_bids(req);
			resolve();
		}
		catch(e:any){
			console.error(`[${TAG}]`, e);
		}
		finally{
			alert("sucess_join_new_groups!");
		}
	};
    function ResetPage() {
        STATE.cursor = null;
        STATE.query = {};

        {
            const accessor = modal_view;
            // console.log('accessor');
            accessor.innerHTML = '';
        }
        // {
        // 	const accessor = view.region_info;
        // 	accessor.element.addClass('hide');
        // }
    }
})();
