[![Build Status](https://travis-ci.org/x-component/x-common.png?v0.0.6)](https://travis-ci.org/x-component/x-common)
=======================================================================================================



x-common
========

## Overview

This module contains some helper functions


extend( target, source_1...source_n )
---------------------

Extends a target object with properties from multiple source objects.
Properties from source objects are added in the given order.
Existing properties are overwritten.
Note: Property values like objects and arrays are not cloned or copied.

*example*:

    t={a:1,b:2};
    s1={c:{y:'z'}};
    s2={d:3};
    r=extend(t,s1,s2,{e:4}); // => r is now { a:1,b:2,c:{y:'z'},d:3,e:4}
    r.a=5; // => t.a====5  is now also 5, as t i target
    r.d=6; // => s2.d====3, number is not an object and copied
    r.c.y='zz'; // ==> s1.y===='zz' is now also 'zz', as both point to the same object

when using

    extend(t,s1,s2,{e:4},true);

then

    r.c.y='zz'; // s1.y===='z'

you can use this to add properties to any object like functions or to an options object

@param {target} The object where properties are added to   
@param {source_1...source_n} The objects where properties are copied from   
@return {target}  The modified target   


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
  So you can not add an object directly into an array, you have to use [] arround it
  For the same reason you can not add null direclty into an array you must use [null]

- Functions from sources can define or replace target functions
- Functions from sources can not be merged/copied into a target objects,array, or primitives, they switch roles with the target.
- Thus merging for functions has side effects!
- Source objects properties can be merged into functions

- Arrays and primitives can not be merged into function, the source becomes an object with a single value before merging.
- Arrays and objects can not be merged into target primitives,
  the target becomes an array or obect with a single value before merging.

To delete a property in a merge you can use a sepcial object as source: merge.remove

@param {target} The target object where properties are merged to   
@param {source_1...source_n} The source objects where data is merged from   
@return {target}  The modified target   


flatten( object )
---------

Flattens a nested object hierarchy to an single object with just non object values

*example*:

    flatten({a:{n:1,m:2},b:['x',{'y':'z'}],c:3})

 result:

    {'a.n':1,'a.m':2,'b[0]':'x','b[1].y':'z',c:3}

recursive structures can not be flattened because paths would be endless

@param {object} The nested object structure   
@return {result}  A single object where the keys describe the paths to the values found in the given object   
