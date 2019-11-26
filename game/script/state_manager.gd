extends Node

func getRealVal(state, property):
	var curVal = getCpy(state[property]);
	var effectTab = state.effectDict;
	for k in effectTab:
		var effect = effectTab[k];
		if effect.property == property:
			var diff = getEffectValue(effect);
			if typeof(curVal) == typeof({}):
				for kVal in curVal:
					curVal[kVal] += diff[kVal];
			else:
				curVal += diff;
	return checkAndReturnClass(curVal);

func getDestVal(state, property):
	var curVal = getCpy(state[property]);
	var effectTab = state.effectDict;
	for k in effectTab:
		var effect = effectTab[k];
		if effect.property == property:
			var diff = getEffectValue(effect, true);
			if typeof(curVal) == typeof({}):
				for kVal in curVal:
					curVal[kVal] += diff[kVal];
			else:
				curVal += diff;
	return checkAndReturnClass(curVal);

func getEffectValue(effect, endVal : bool = false):
	var val;
	var duration = effect.duration;
	var speed = effect.speed;
	var dt = 0.001 * (duration if endVal else min(duration, (CServer.timeStamp - effect.creationTime)));
	if typeof(speed) == typeof({}):
		val = {};
		for k in speed:
			val[k] = dt * speed[k];
	else:
		val = dt * speed;
	return val;

func clearEffect(state):
	var curEffectTab = state.effectDict;
	var now = CServer.timeStamp;
	for ek in curEffectTab:
		var effect = curEffectTab[ek];
		var property = effect.property;
		if effect.creationTime + effect.duration >= now:
			var diff = getEffectValue(effect);
			if typeof(state[property]) == typeof({}):
				for k in state[property]:
					state[property][k] += diff[k];
			else:
				state[property] += diff;
			curEffectTab.erase(ek);

func applyEffect(state, property):
	var curEffectTab = state.effectDict;
	for ek in curEffectTab:
		var effect = curEffectTab[ek];
		if effect.property == property:
			var diff = getEffectValue(effect);
			if typeof(state[property]) == typeof({}):
				for k in state[property]:
					state[property][k] += diff[k];
			else:
				state[property] += diff;
			curEffectTab.erase(ek);

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