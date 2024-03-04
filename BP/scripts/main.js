import { EquipmentSlot, ItemStack, system, world } from '@minecraft/server';


// This code is not well-done, but it is normal
const slots = [ "head","body","legs","feet","tank1","tank2","frequency","mask","parachute","thermal","gear" ];
const prefix = "csm:"; //prefix for item tags

// When player dies
function onDeath(P){
	world.getEntity(P.getDynamicProperty("eid"))?.triggerEvent("minecraft:despawn");
	for (let tag of P.getTags()){
		if (tag.indexOf("(-)") == -1) continue;
		let [type,itemId] = tag.split("(-)");
		//this complex condition is needed because item tagged "tank" should fit in both "tank1" and "tank2" slots
		if (!slots.includes(type) && !(["tank1","tank2"].includes(slots[x]) && item.hasTag(prefix+"tank"))) continue;
		const rand = Math.random()-0.5;
		P.dimension.spawnItem(new ItemStack(itemId),P.location);
		P.removeTag(tag);
	}
}
// first action after player sneaks
function start(P){
	var bEntity = P.dimension.spawnEntity("g:inv_ent",P.location);
	bEntity.nameTag="extra_slots_2024"; // needed for condition in UI
	tagItemAdd(P,bEntity.getComponent("inventory").container);
	P.setDynamicProperty("eid",bEntity.id);
	return bEntity.id
}
// deletes unknown tag for needed slot (when player takes equipment out of the slots)
function deleteFrom(P,slot){
	for (let tag of P.getTags()){
		if (tag.startsWith(slot)) P.removeTag(tag)
	}
}
function tagItemAdd(P,cont){
	let types = [];
	let items = [];
	P.getTags().forEach((tag)=>{
		if (tag.indexOf("(-)")==-1) return;
		let nn = tag.split("(-)");
		let type = nn[0];
		let i = nn[1];
		P.removeTag(tag);
		types.push(type);
		items.push(i)
	});
	setInSlots(P,types,items,cont);
}
// Sets the items from tags to entity's inventory
function setInSlots(P,types,items,cont){
	let inv = cont;
	if (!inv) return;
	for (let x in types){
		const index = slots.indexOf(types[x]);
		if (index == -1) continue;
		inv.setItem(index,new ItemStack(items[x]))
	}
}
function updateTags(P,eInv){
	for (let x=0;x<slots.length;x++){
		let item = eInv.getItem(x);
		if (!item) {
			deleteFrom(P,slots[x]);
			continue
		};
		
		
		P.addTag(slots[x]+"(-)"+item.typeId);
		
	}
}

/*world.afterEvents.itemUse.subscribe((e)=>{
	all: for (let place of slots){
	local: if (e.itemStack.hasTag("g:"+place)){
		for (let tg of e.source.getTags()){
			if (tg.split("(-)")[0] == place){
				break local;
			};
		};
		e.source.addTag(place+"(-)"+e.itemStack.typeId);
		e.source.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand);
		break all;
	}}
});*/


world.afterEvents.entityDie.subscribe((e)=>{
	let p = e.deadEntity;
	if (p.typeId !== "minecraft:player") return;
	onDeath(p)
});
system.runInterval(async()=>
 {
	try{world.getAllPlayers().forEach((P) =>
{
	
	if (true) {
	if (!P.getComponent("equippable").getEquipment(EquipmentSlot.Mainhand) && P.isSneaking) 

{
	
	if (!P.getDynamicProperty("start")){
		//initializing entity + "linking" it to the player
		start(P);
		P.setDynamicProperty("start",true);
	} else {
		// updating tags and throwing out non-fitting items
		let bEntity = world.getEntity(P.getDynamicProperty("eid"));
		if (!bEntity) bEntity = start(P);
		bEntity.teleport(P.location,{dimension:P.dimension});
		let bc=bEntity.getComponent("inventory").container;
		for (let x=0;x<slots.length;x++){
  	 	 let item=bc.getItem(x);
 		   if (item !== undefined && !item.hasTag(prefix+slots[x]) && !(["tank1","tank2"].includes(slots[x]) && item.hasTag(prefix+"tank"))){
				P.dimension.spawnItem(item, P.location);
				bc.setItem(x)
			}
		};
		updateTags(P,bc)
	};
}else if (P.getDynamicProperty("start")&& P.getDynamicProperty("eid")){
	//despawning the entity
	let bc = world.getEntity(P.getDynamicProperty("eid"))?.getComponent("inventory")?.container;
	P.setDynamicProperty("start",false);
	if (!bc) return;
	updateTags(P,bc);
	world.getEntity(P.getDynamicProperty("eid")).triggerEvent("minecraft:despawn");
};};
	});
}catch(e){console.error(e)};
}, 0);