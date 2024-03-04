import { ActionFormData} from "@minecraft/server-ui" ;
import { world, system } from "@minecraft/server" ;

//This file is still Work in progress

const overworld = world.getDimension('overworld');

function open_form(player) {
	let Form = new ActionFormData()
	.title("Celestial Panel Sol")
	.body("Click again to zoom (view moons and satellites)")
	.button("§fx200y101Sol")
	.button("§fx163y80Mercury")
	.button("§fx137y124Venus")
	.button("§tx280y130Overworld")
	.button("§fx246y46Mars")
	.button("§tx72y107Asteroids")
	.button("§fx290y156Jupiter")
	.button("§fx106y167Saturn")
	.button("§fx174y10Uranus")
	.button("§fx19y145Neptune")
	.button("LAUNCH")
	.button("CREATE")
	.show(player)
	.then((response) => {
		if (response.canceled) {
			world.sendMessage("back")//open_form(player)
		}
		switch (response.selection) {
			case 0: world.sendMessage("sun"); break;
			case 1: world.sendMessage("mercury"); break;
			case 2: world.sendMessage("venus"); break;
			case 3: world.sendMessage("overwoeld"); break;
			case 4: world.sendMessage("mars"); break;
			case 5: world.sendMessage("asteroids"); break;
			case 6: world.sendMessage("jupiter"); break;
			case 7: world.sendMessage("saturn"); break;
			case 8: world.sendMessage("uranus"); break;
			case 9: world.sendMessage("neptune"); break;
			case 10: world.sendMessage("go"); break;
			case 11: world.sendMessage("build space station"); break;
		}
	})
}

world.afterEvents.itemUse.subscribe(({itemStack, source}) => {
	if ( (itemStack.typeId === "minecraft:compass") ) {
		open_form(source)
	}
})