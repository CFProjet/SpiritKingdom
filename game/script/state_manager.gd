extends Node

func getRealVal(state, property):
	var curVal = getCpy(state[property]);
	var evolveTab = state.evolveDictionnary;
	for k in evolveTab:
		var evolve = evolveTab[k];
		if evolve.property == property:
			var diff = getEvolveValue(evolve);
			if typeof(curVal) == typeof({}):
				for kVal in curVal:
					curVal[kVal] += diff[kVal];
			else:
				curVal += diff;
	return checkAndReturnClass(curVal);

func getDestVal(state, property):
	var curVal = getCpy(state[property]);
	var evolveTab = state.evolveDictionnary;
	for k in evolveTab:
		var evolve = evolveTab[k];
		if evolve.property == property:
			var diff = getEvolveValue(evolve, true);
			if typeof(curVal) == typeof({}):
				for kVal in curVal:
					curVal[kVal] += diff[kVal];
			else:
				curVal += diff;
	return checkAndReturnClass(curVal);

func getEvolveValue(evolve, endVal : bool = false):
	var val;
	var duration = evolve.duration;
	var speed = evolve.speed;
	var dt = 0.001 * (duration if endVal else min(duration, (CServer.timeStamp - evolve.time)));
	if typeof(speed) == typeof({}):
		val = {};
		for k in speed:
			val[k] = dt * speed[k];
	else:
		val = dt * speed;
	return val;

func clearEvolve(state):
	var curEvolveTab = state.evolveDictionnary;
	var now = CServer.timeStamp;
	for ek in curEvolveTab:
		var evolve = curEvolveTab[ek];
		var property = evolve.property;
		if evolve.time + evolve.duration >= now:
			var diff = getEvolveValue(evolve);
			if typeof(state[property]) == typeof({}):
				for k in state[property]:
					state[property][k] += diff[k];
			else:
				state[property] += diff;
			curEvolveTab.erase(ek);

func applyEvolve(state, property):
	var curEvolveTab = state.evolveDictionnary;
	for ek in curEvolveTab:
		var evolve = curEvolveTab[ek];
		if evolve.property == property:
			var diff = getEvolveValue(evolve);
			if typeof(state[property]) == typeof({}):
				for k in state[property]:
					state[property][k] += diff[k];
			else:
				state[property] += diff;
			curEvolveTab.erase(ek);

func getCpy(val):
	if typeof(val) == typeof({}):
		var newVal = {};
		for k in val:
			newVal[k] = val[k];
		return newVal;
	else:
		return val;

func checkAndReturnClass(val):
	if typeof(val) == typeof({}):
		var size = val.keys().size();
		if size == 3 && val.has("x") && val.has("y") && val.has("z"):
			return Vector3(val.x, val.y, val.z);
		if size == 2 && val.has("x") && val.has("y"):
			return Vector2(val.x, val.y);
		if size == 4 && val.has("r") && val.has("g") && val.has("b") && val.has("a"):
			return Color(val.r, val.g, val.b, val.a);
	return val;