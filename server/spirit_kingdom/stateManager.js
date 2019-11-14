function getRealVal(state, property){
    var curVal = getCpy(state[property]);
	var evolveTab = state.evolveDictionnary;
	for (let k in evolveTab){
        var evolve = evolveTab[k];
        if (evolve.property == property){
            var diff = getEvolveValue(evolve);
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


function getEvolveValue(evolve){
	var val;
    var duration = evolve.duration;
    var speed = evolve.speed;
    var dt = Math.min(duration, (Date.now() - evolve.time)) * 0.001;
	if (typeof speed == "object"){
        val = {};
		for (var k in speed)
            val[k] =  dt * speed[k];
    }
    else
		val = dt * speed;
	return val;
}

function clearEvolve(state){
    var curEvolveTab = state.evolveDictionnary;
    var now = Date.now();
    for (var ek in curEvolveTab){
        var evolve = curEvolveTab[ek];
        let property = evolve.property;
        if (evolve.time + evolve.duration >= now){
            var diff = getEvolveValue(evolve);
            if (typeof state[property] == "object"){
                for (var k in state[property])
                    state[property][k] += diff[k];
            }else
                state[property] += diff;
            delete curEvolveTab[ek];
        }
    }
}

function applyEvolve(state, property){
    var curEvolveTab = state.evolveDictionnary;
    for (var ek in curEvolveTab){
        var evolve = curEvolveTab[ek];
        if (evolve.property == property){
            var diff = getEvolveValue(evolve);
            if (typeof state[property] == "object"){
                for (var k in state[property])
                    state[property][k] += diff[k];
            }else
                state[property] += diff;
            delete curEvolveTab[ek];
        }
    }
}

function addEvolve(state, evolve){
    var id = "t_" + Date.now() + Math.floor(Math.random() * 100000);
    state.evolveDictionnary[id] = evolve;
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
exports.getEvolveValue = getEvolveValue;
exports.clearEvolve = clearEvolve;
exports.applyEvolve = applyEvolve;
exports.addEvolve = addEvolve;