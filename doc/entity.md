# Entity
Propriétés elementaire des entités du jeux synchronisé


Entity | Destructible | EffectArea
---------------- | ----------------- | ----------------
uniqueID | uniqueID| uniqueID
position(x,y,z) | position(x,y,z)|position(x,y,z)
 groupes (String array) | groupes (String array)| groupes (String array)
 -| effectDict (dictionnary of Effect)|effect (array of Effect)
 -| otherProperty_1| move (direction, duration)
 -| otherProperty_2| pin (enityID)
 -| otherProperty_3 | triggerOnce
 -| etc... | cibleCount
  -|  | creationTime
   -|  | duration
   
   ## Effect
   Les effets décrivent les propriété modifiés, sur un Destructible les effets décrivent une evolution en cours, sur un EffectArea ils décrivent les modification à affecter aux destructibles cibles
   Effect|
   -----|
   name|
   property|
   speed|
   creationTime|
   duration| 
