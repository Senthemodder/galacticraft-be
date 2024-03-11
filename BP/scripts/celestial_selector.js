import { ActionFormData} from "@minecraft/server-ui" ;
import { world, system } from "@minecraft/server" ;

const overworld = world.getDimension('overworld');
const rocket_tier = 3;

const solar_system = {
	Sol: {tier: 100, x:200, y:101},
	Mercury: {tier: 4, x:163, y:80},
	Venus: {tier: 3, x:137, y:124},
	Overworld: {tier: 1, x:280, y:130},
	Mars: {tier: 2, x:246, y:46},
	Asteroids: {tier: 3, x:72, y:107},
	Jupiter: {tier: 4, x:290, y:156},
	Saturn: {tier: 100, x:106, y:167},
	Uranus: {tier: 100, x:174, y:10},
	Neptune: {tier: 100, x:19, y:145},
}
const moons = {
	Sol: {},
	Mercury: {},
	Venus: {},
	Overworld: {Moon: {tier: 1, x:280, y:130}},
	Mars: {},
	Asteroids: {},
	Jupiter: {},
	Saturn: {},
	Uranus: {},
	Neptune: {},
}

function zoom_at(player, focused, planet) {
	let form = new ActionFormData()
	.title("Celestial Panel " + planet)
	if (focused == planet) {
		form.body(
			`§${rocket_tier >= solar_system[planet].tier ? 't' : 'f'}`+
			`Tier ${solar_system[planet].tier < 6 ? '' + solar_system[focused]?.tier : '?' }`+
			`${planet}`
		)
	} else {
		world.sendMessage(JSON.stringify(moons[planet][focused].tier))
		form.body(
			`§${rocket_tier >= moons[planet][focused].tier ? 't' : 'f'}`+
			`Tier ${moons[planet][focused].tier < 6 ? '' + moons[planet][focused]?.tier : '?' }`+
			`${focused}`
		)
	}
	form.button(
		`§${rocket_tier >= solar_system[planet].tier ? 't' : 'f'}`+
		`§${focused == planet ? 't' : 'f'}`+
		`${planet}`
	)
	for (let moon of Object.keys(moons[planet])) {
		form.button(
			`§${rocket_tier >= moons[planet][moon].tier ? 't' : 'f'}`+
			`§${focused == moon ? 't' : 'f'}`+
			`x${moons[planet][moon].x}`+
			`y${moons[planet][moon].y}`+
			`${moon}`
		)
	}
	form.button("LAUNCH")
	.button("CREATE")
	.show(player)
	.then((response) => {
		if (response.canceled) {
			select_solar_system(player, ''); return;
		}
		switch (response.selection) {
			case 0: zoom_at(player, planet, planet); return; break;
			case Object.keys(moons[planet]).length + 1: world.sendMessage("go"); return; break;
			case Object.keys(moons[planet]).length + 2: world.sendMessage("build space station"); return; break;
		}
		const moon = Object.keys(moons[planet])[response.selection - 1];
		zoom_at(player, moon, planet);
	})
}

function select_solar_system(player, focused) {
	let form = new ActionFormData()
	.title("Celestial Panel Solar System")
	if (focused != '') {
		form.body(
			`§${rocket_tier >= solar_system[focused].tier ? 't' : 'f'}`+
			`Tier ${solar_system[focused].tier < 6 ? '' + solar_system[focused]?.tier : '?' }`+
			`${focused}`
		)
	}
	for (let planet of Object.keys(solar_system)) {
		form.button(
			`§${rocket_tier >= solar_system[planet].tier ? 't' : 'f'}`+
			`§${focused == planet ? 't' : 'f'}`+
			`x${solar_system[planet].x}`+
			`y${solar_system[planet].y}`+
			`${planet}`
		)
	}
	form.button("LAUNCH")
	.button("CREATE")
	.show(player)
	.then((response) => {
		if (response.canceled) {
			world.sendMessage("back"); return;
		}
		switch (response.selection) {
			case 10: world.sendMessage("go"); return; break;
			case 11: world.sendMessage("build space station"); return; break;
		}
		const planet = Object.keys(solar_system)[response.selection]
		if (planet == focused) {zoom_at(player, planet, planet)}
		else {select_solar_system(player, planet)}
	})
}

world.afterEvents.itemUse.subscribe(({itemStack, source}) => {
	if ( (itemStack.typeId === "minecraft:compass") ) {
		select_solar_system(source, '')
	}
})