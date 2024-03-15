import { ActionFormData} from "@minecraft/server-ui" ;
import { world, system } from "@minecraft/server" ;

const overworld = world.getDimension('overworld');
const rocket_tier = 3;

function set_planet_locations() {
	const middle = {x:200, y:101};
	for (let planet of Object.keys(solar_system)) {
		if (planet == "Asteroids" || planet == "Sol") continue;
		const tick = system.currentTick/20;
		const speed = -360/solar_system[planet].turn
		const angle = (tick * speed - solar_system[planet].init_angle) % 360
		const coods = angle_to_vector(angle, solar_system[planet].distance, middle);
		solar_system[planet].x = coods.x
		solar_system[planet].y = coods.y
	}
}
function set_astroids_locations() {
	const middle = {x:200, y:101};
	const random_angle = Math.random() * 360;
	const coods = angle_to_vector(random_angle, solar_system.Asteroids.distance, middle);
	solar_system.Asteroids.x = coods.x
	solar_system.Asteroids.y = coods.y
}
function set_moon_locations(moon) {
	const middle = moon == 'Moon' ? {x:161, y:81} : {x:97, y:49};
	let time = 3 * (world.getTimeOfDay() + 12000) / 200;
	moon == 'Space_Station' ? time -= 120 : null
	const coods = angle_to_vector(-time, moons.Overworld[moon].distance, middle);
	moons.Overworld[moon].x = coods.x
	moons.Overworld[moon].y = coods.y
}
function read_inventory(player) {
	const inventory = player.getComponent("inventory").container
	const items = []
	for (let item = 0; item < inventory.size; item++) {
		if (inventory.getItem(item) == undefined) {continue};
		items.push({id: inventory.getItem(item).typeId, amount: inventory.getItem(item).amount})
	}
	let results = ['§','f','§','f','§','f','§','f'];
	items.forEach((item)=> {
		if (item.id == 'minecraft:gold_ingot' && item.amount >= 16) {results[1] = 't'};
		if (item.id == 'minecraft:heart_of_the_sea') {results[3] = 't'};
		if (item.id == 'minecraft:copper_ingot' && item.amount >= 32) {results[5] = 't'};
		if (item.id == 'minecraft:iron_ingot' && item.amount >= 24) {results[7] = 't'};
	})
	return results.join('')
}
function angle_to_vector(angle, distance, center) {
	angle = (Math.PI / 180) * angle; // to randian
	return {
		x: Math.round(distance * Math.cos(angle)) + center.x,
		y: Math.round(distance * Math.sin(angle)/2) + center.y,
	}
}

const solar_system = {
	Sol: {tier: 100, x: 200, y: 101},
	Mercury: {tier: 4, distance: 56, turn: 88, init_angle: 250},
	Venus: {tier: 3, distance: 78, turn: 225, init_angle: 178},
	Overworld: {tier: 1, distance: 98, turn: 360, init_angle: 100},
	Mars: {tier: 2, x:246, distance: 119, turn: 687, init_angle: 0},
	Asteroids: {tier: 3, distance: 129},
	Jupiter: {tier: 4, distance: 141, turn: 11.86 * 360, init_angle: 36},
	Saturn: {tier: 100, distance: 161, turn: 29.46 * 360, init_angle: 47},
	Uranus: {tier: 100, distance: 182, turn: 84.01 * 360, init_angle: 315},
	Neptune: {tier: 100, distance: 200, turn: 164.79 * 360, init_angle: 296},
}

const moons = {
	Sol: {},
	Mercury: {},
	Venus: {},
	Overworld: {Moon: {tier: 1, distance:161}},
	Mars: {},
	Asteroids: {},
	Jupiter: {},
	Saturn: {},
	Uranus: {},
	Neptune: {},
}
if (world.getDynamicProperty("Overworld_space_station")) {
	moons.Overworld.Space_Station = {tier: 1, distance:98}
} else world.setDynamicProperty("Overworld_space_station", false)

function zoom_at(player, focused, planet, station_materials) {
	const station = world.getDynamicProperty("Overworld_space_station");
	let form = new ActionFormData()
	.title("Celestial Panel " +`§${station ? 't' : 'f'}`+ planet)
	if (focused == planet) {
		form.body(
			`§${rocket_tier >= solar_system[planet].tier ? 't' : 'f'}`+
			`§${station ? 't' : 'f'}`+
			`Tier ${solar_system[planet].tier < 6 ? '' + solar_system[focused]?.tier : '?' }`+
			`${planet}`
		)
	} else {
		form.body(
			`§${rocket_tier >= moons[planet][focused].tier ? 't' : 'f'}`+
			`§${station ? 'f' : 't'}`+
			`Tier ${moons[planet][focused].tier < 6 ? '' + moons[planet][focused]?.tier : '?' }`+
			`${focused.replaceAll('_', ' ')}`
		)
	}
	form.button(
		`§${rocket_tier >= solar_system[planet].tier ? 't' : 'f'}`+
		`§${focused == planet ? 't' : 'f'}`+
		`${planet}`
	)
	for (let moon of Object.keys(moons[planet])) {
		set_moon_locations(moon)
		form.button(
			`§${rocket_tier >= moons[planet][moon].tier ? 't' : 'f'}`+
			`§${focused == moon ? 't' : 'f'}`+
			`x${moons[planet][moon].x}`+
			`y${moons[planet][moon].y}`+
			`${moon.replaceAll('_', ' ')}`
		)
	}
	form.button("LAUNCH")
	.button(station_materials + "CREATE")
	.show(player)
	.then((response) => {
		if (response.canceled) {
			select_solar_system(player, ''); return;
		}
		switch (response.selection) {
			case 0: zoom_at(player, planet, planet, station_materials); return; break;
			case Object.keys(moons[planet]).length + 1: launch(player, focused); return; break;
			case Object.keys(moons[planet]).length + 2: create_station(player, focused); return; break;
		}
		const moon = Object.keys(moons[planet])[response.selection - 1];
		zoom_at(player, moon, planet, station_materials);
	})
}

function select_solar_system(player, focused, station_materials) {
	set_planet_locations()
	const station = world.getDynamicProperty("Overworld_space_station");
	let form = new ActionFormData()
	.title("Celestial Panel Solar System")
	if (focused != '') {
		form.body(
			`§${rocket_tier >= solar_system[focused].tier ? 't' : 'f'}`+
			`§${station ? 't' : 'f'}`+
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
	.button(station_materials + "CREATE")
	.show(player)
	.then((response) => {
		if (response.canceled) {
			world.sendMessage("back"); return;
		}
		switch (response.selection) {
			case 10: launch(player, focused); return; break;
			case 11: create_station(player, focused); return; break;
		}
		const planet = Object.keys(solar_system)[response.selection]
		if (planet == focused) {zoom_at(player, planet, planet, station_materials)}
		else {select_solar_system(player, planet, station_materials)}
	})
}

function launch(player, planet) {
	overworld.runCommand(`say Launch ${player.nameTag} to ${planet}`)
}

function create_station(player, planet, station_materials) {
	world.setDynamicProperty(`${planet}_space_station`, true)
	player.runCommand("clear @s gold_ingot 0 16");
	player.runCommand("clear @s heart_of_the_sea 0 1");
	player.runCommand("clear @s copper_ingot 0 32");
	player.runCommand("clear @s iron_ingot 0 24");
	moons.Overworld.Space_Station = {tier: 1, distance:98}
	zoom_at(player, planet, planet, station_materials)
}

world.afterEvents.itemUse.subscribe(({itemStack, source}) => {
	if ( (itemStack.typeId === "minecraft:compass") ) {
		set_astroids_locations()
		const station_materials = read_inventory(source)
		select_solar_system(source, '', station_materials)
	}
})

//debug tools
world.afterEvents.itemUse.subscribe(({itemStack, source}) => {
	if ( (itemStack.typeId === "minecraft:stick") ) {
		const station = world.getDynamicProperty("Overworld_space_station");
		world.sendMessage(''+ station)
	}
})
world.afterEvents.itemUse.subscribe(({itemStack, source}) => {
	if ( (itemStack.typeId === "minecraft:flint") ) {
		world.setDynamicProperty("Overworld_space_station", false)
		delete moons.Overworld.Space_Station; 

	}
})