# x-common

[Build Status](https://travis-ci.org/x-component/x-common.png?v1.0.0)](https://travis-ci.org/x-component/x-common)

- [./common.js](#commonjs) 

# ./common.js

  - [undefined.extend()](#undefinedextendtargetsource_1source_n)
  - [merge](#merge)
  - [undefined.isNaN()](#undefinedisnan)
  - [undefined.flatten()](#undefinedflattenobject)

## undefined.extend(target:, source_1...source_n:)

  extend( target, source_1...source_n )
  ---------------------
  
  Extends a target object with properties from multiple source objects.
  Properties from source objects are added in the given order.
  Existing properties are overwritten.
  Note: Property values like objects and arrays are not cloned or copied.
  
  *example*:
  
```js
  t={a:1,b:2};
  s1={c:{y:'z'}};
  s2={d:3};
  r=extend(t,s1,s2,{e:4}); // => r is now { a:1,b:2,c:{y:'z'},d:3,e:4}
  r.a=5; // => t.a====5  is now also 5, as t i target
  r.d=6; // => s2.d====3, number is not an object and copied
  r.c.y='zz'; // ==> s1.y===='zz' is now also 'zz', as both point to the same object
```

  
  when using
  
```js
  extend(t,s1,s2,{e:4},true);
```

  
  then
  
```js
  r.c.y='zz'; // s1.y===='z'
```

  
  you can use this to add properties to any object like functions or to an options object

## merge

  merge( target, source_1...source_n )
  ---------------------
  
  Merges multiple nested object structures into a single target object structure.
  It handles all enumaratable properties recursively.
  
  - Arrays/objects from the sources are copied by a deep copy.
  - `null` as a source property sets target obect/array/function property to `null`.
  - Array like objects like `arguments` and dom lists are transformed into real arrays
  - Arrays of sources are concatenated to target arrays
  - Primitives and functions are added to arrays
  - Object properties are merged as properties added to arrays. 
```js
So you can not add an object directly into an array, you have to use [] arround it
For the same reason you can not add null direclty into an array you must use [null]
```

  
  - Functions from sources can define or replace target functions
  - Functions from sources can not be merged/copied into a target objects,array, or primitives, they switch roles with the target.
  - Thus merging for functions has side effects!
  - Source objects properties can be merged into functions
  
  - Arrays and primitives can not be merged into function, the source becomes an object with a single value before merging.
  - Arrays and objects can not be merged into target primitives,
```js
the target becomes an array or obect with a single value before merging.
```

  
  To delete a property in a merge you can use a sepcial object as source: merge.remove

## undefined.isNaN()

  isNaN(value)
  -----------
  replacement for Number.isNaN as long as not all support this

## undefined.flatten(object:)

  flatten( object )
  ---------
  
  Flattens a nested object hierarchy to an single object with just non object values
  
  *example*:
  
```js
  flatten({a:{n:1,m:2},b:['x',{'y':'z'}],c:3})
```

  
   result:
  
```js
  {'a.n':1,'a.m':2,'b[0]':'x','b[1].y':'z',c:3}
```

  
  recursive structures can not be flattened because paths would be endless
