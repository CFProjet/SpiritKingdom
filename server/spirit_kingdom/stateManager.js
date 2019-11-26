function getRealVal(state, property){
    var curVal = getCpy(state[property]);
	var effectTab = state.effectDict;
	for (let k in effectTab){
        var effect = effectTab[k];
        if (effect.property == property){
            var diff = getEffectValue(effect);
            if (typeof curVal == "object"){
                for (let kVal in curVal)
                    curVal[kVal] += diff[kVal];
            }
            else
                curVal += diff;
        }
    }
        return curVal;
}


function getEffectValue(effect){
	var val;
    var duration = effect.duration;
    var speed = effect.speed;
    var dt = Math.min(duration, (Date.now() - effect.creationTime)) * 0.001;
	if (typeof speed == "object"){
        val = {};
		for (var k in speed)
            val[k] =  dt * speed[k];
    }
    else
		val = dt * speed;
	return val;
}

function clearEffect(state){
    var curEffectTab = state.effectDict;
    var now = Date.now();
    for (var ek in curEffectTab){
        var effect = curEffectTab[ek];
        let property = effect.property;
        if (effect.creationTime + effect.duration >= now){
            var diff = getEffectValue(effect);
            if (typeof state[property] == "object"){
                for (var k in state[property])
                    state[property][k] += diff[k];
            }else
                state[property] += diff;
            delete curEffectTab[ek];
        }
    }
}

function applyEffect(state, property){
    var curEffectTab = state.effectDict;
    for (var ek in curEffectTab){
        var effect = curEffectTab[ek];
        if (effect.property == property){
            var diff = getEffectValue(effect);
            if (typeof state[property] == "object"){
                for (var k in state[property])
                    state[property][k] += diff[k];
            }else
                state[property] += diff;
            delete curEffectTab[ek];
        }
    }
}

function addEffect(state, effect){
    var id = "t_" + Date.now() + Math.floor(Math.random() * 100000);
    state.effectDict[id] = effect;
}


function getCpy(val){
    if(typeof val ==  "object"){
        var newVal = {};
        for (let k in val)
            newVal[k] = val[k];
        return newVal;
    }else
        return val;
}

exports.getRealVal = getRealVal;
exports.getEffectValue = getEffectValue;
exports.clearEffect = clearEffect;
exports.applyEffect = applyEffect;
exports.addEffect = addEffect;