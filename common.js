'use strict';

var M = module.exports = {
	
/*
x-common
========

## Overview

This module contains some helper functions
*/


	/**
	 * extend( target, source_1...source_n )
	 * ---------------------
	 *
	 * Extends a target object with properties from multiple source objects.
	 * Properties from source objects are added in the given order.
	 * Existing properties are overwritten.
	 * Note: Property values like objects and arrays are not cloned or copied.
	 *
	 * *example*:
	 *
	 *     t={a:1,b:2};
	 *     s1={c:{y:'z'}};
	 *     s2={d:3};
	 *     r=extend(t,s1,s2,{e:4}); // => r is now { a:1,b:2,c:{y:'z'},d:3,e:4}
	 *     r.a=5; // => t.a====5  is now also 5, as t i target
	 *     r.d=6; // => s2.d====3, number is not an object and copied
	 *     r.c.y='zz'; // ==> s1.y===='zz' is now also 'zz', as both point to the same object
	 *
	 * when using
	 *
	 *     extend(t,s1,s2,{e:4},true);
	 *
	 * then
	 *
	 *     r.c.y='zz'; // s1.y===='z'
	 *
	 * you can use this to add properties to any object like functions or to an options object
	 *
	 * @param target               The object where properties are added to
	 * @param source_1...source_n  The objects where properties are copied from
	 * @return target              The modified target
	 */
	extend:function (t/*!target*/) {
		for (var i = 1, l = arguments.length, s; i < l; ++i) {
			s/*!source*/ = arguments[i];
			for (var p in s) if(s.hasOwnProperty(p)) t[p] = s[p];
		}
		return t;
	},
	
};

// shortcut to write x instead of extend
var x = module.exports.x = M.extend;

// use it
x(module.exports, {
	/**
	 * merge( target, source_1...source_n )
	 * ---------------------
	 *
	 * Merges multiple nested object structures into a single target object structure.
	 * It handles all enumaratable properties recursively.
	 *
	 * - Arrays/objects from the sources are copied by a deep copy.
	 * - `null` as a source property sets target obect/array/function property to `null`.
	 * - Array like objects like `arguments` and dom lists are transformed into real arrays
	 * - Arrays of sources are concatenated to target arrays
	 * - Primitives and functions are added to arrays
	 * - Object properties are merged as properties added to arrays. 
	 *   So you can not add an object directly into an array, you have to use [] arround it
	 *   For the same reason you can not add null direclty into an array you must use [null]
	 *
	 * - Functions from sources can define or replace target functions
	 * - Functions from sources can not be merged/copied into a target objects,array, or primitives, they switch roles with the target.
	 * - Thus merging for functions has side effects!
	 * - Source objects properties can be merged into functions
	 *
	 * - Arrays and primitives can not be merged into function, the source becomes an object with a single value before merging.
	 * - Arrays and objects can not be merged into target primitives,
	 *   the target becomes an array or obect with a single value before merging.
	 *
	 * To delete a property in a merge you can use a sepcial object as source: merge.remove
	 *
	 * @param target               The target object where properties are merged to
	 * @param source_1...source_n  The source objects where data is merged from
	 * @return target              The modified target
	 */
	merge:x(function F(t/*!target*/) {
		var
			visited = [],
			sources = [].slice.call(arguments);
		
		sources.shift(); // remove target
		
		F._merge.remove = F.remove; // pass to remove marker
		
		for (var i = 0, l = sources.length, s; i < l; ++i) {
			t=F._merge(t,sources[i],visited);
		}
		return t;
	},{
		_merge:function FF(t/*!target*/, s/*!source*/, visited) {
			
			if (t === s) return t; // null stays null, same primitives stay as is
			
			var t_is_obj = typeof t == 'object', t_is_array_like = t && t_is_obj && 'length' in t, t_is_undefined = void 0 === t, t_is_function = typeof t == 'function';
			var s_is_obj = typeof s == 'object', s_is_array_like = s && s_is_obj && 'length' in s, s_is_undefined = void 0 === s, s_is_function = typeof s == 'function';
			
			if (s_is_undefined) return t; // nothing happens
			
			if (null === s){ t = s; return t; } // set target to null
			// or define target to be object/array/function/primitive
			
			if (null === t || t_is_undefined){ // define target now, make new arrays or objects to prevent side effects
				     if (s_is_array_like)                  t = FF([], s, visited); // prevent side effect make a deep copy
				else if (s_is_obj && s instanceof RegExp ) t = new RegExp(s);
				else if (s_is_obj && s instanceof Date   ) t = new Date(s);
				else if (s_is_obj )                        t = FF({}, s, visited); // prevent side effect make a deep copy
				else                                       t = s; // primitive or function
				return t;
			}
			// replace a function or switch roles (we can not copy functions)
			if(s_is_function && !t_is_array_like) {
				t = t_is_function ? s : FF( s, t, visited );
				return t;
			}
			
			if(t_is_array_like) {
				// make a real array of t if it is not already an array
				if(!Array.isArray(t)) t = Array.prototype.concat.call([], t);
				
				// merge arrays ?
				if(!s_is_array_like) {
					s=[s];
				}
				// we merge as sets, so we prevent deep equal duplicates
				var test = [].concat(t); // copy to test for duplicates
				for(var  i = 0, sl = s.length; i<sl; ++i ) {
					var si = s[i]; // source array element at index i
					if( !~test.indexOf(si) ) {
						if( typeof si != 'object' || null === si) { // primitive or function or null or undefined
							t.push(s[i]);
						}else { // check if rhs array element si is not deep equal and if not make a deep clone of si and add that
							var equal = false, j = test.length; while(j-->0 && !(equal=M.equals(t[j],si)));
							if(!equal) t.push( FF( null, si, visited) );
						}
					}
				}
				return t;
			}
			
			// from here only rhs can be a an array
			if (!t_is_function && !t_is_obj){ // lhs is primitive
				if (!s_is_obj || null === s)  // rhs primitive or null or function or undefined
					t = s;
				else
					t = FF( s_is_array_like ? [t] : {value:t}, s, visited ); // transform lhs to an array or object and merge
				return t;
			}
			
			// from here lhs is function or object
			if (s_is_array_like ){ // obj merge with array to array
				var just_functions;
				if( t_is_function ){
					// check if all elements in s are functions;
					var n = s.length; while(n-->0 && (just_functions=(typeof s[n] === 'function')));
				}
				t = t_is_function && !just_functions ? FF(t, {value:s}, visited ) : FF( [t], s, visited );
				return t;
			}
			
			if (!s_is_obj){ // rhs is primitive to be merged with a function or object?
				t = FF(t, {value:s}, visited );
				return t;
			}
			
			// handle some objects like primitives and copy them by calling new
			// TODO may be do something more generic woth Object.prototype.toString.call ?, but then how to do a deep copy?
			if( t_is_obj && t instanceof RegExp && s_is_obj && s instanceof RegExp ){ t=new RegExp(s); return t; }
			if( t_is_obj && t instanceof Date   && s_is_obj && s instanceof Date   ){ t=new Date(s);   return t; }
			
			// lhs is now function or object, rhs an object, note this will perform a deep copy: see the lhs t_is_undefined case
			if( !( ~visited.indexOf(t) || ~visited.indexOf(s) ) ){
				visited.push(s);
				for (var p in s) if( s.hasOwnProperty(p) ){
					var tv = t[p], sv = s[p];
					if ( FF.remove == sv )
						delete t[p];
					else {
						t[p] = FF(tv, sv, visited);
					}
				}
				visited.pop();
			} else {
				//debugger;
				throw new Error('can not merge cyclic structures.');
			}
			return t;
		},
		remove:'!delete'
	}),
	
	/**
	 * isNaN(value)
	 * -----------
	 * replacement for Number.isNaN as long as not all support this
	 */
	isNaN:function(value){
		return Number.isNaN && Number.isNaN(value) ||  (typeof value === 'number' && isNaN(value));
	},
	
	
	
	/**
	 * flatten( object )
	 * ---------
	 *
	 * Flattens a nested object hierarchy to an single object with just non object values
	 *
	 * *example*:
	 *
	 *     flatten({a:{n:1,m:2},b:['x',{'y':'z'}],c:3})
	 *
	 *  result:
	 *
	 *     {'a.n':1,'a.m':2,'b[0]':'x','b[1].y':'z',c:3}
	 *
	 * recursive structures can not be flattened because paths would be endless
	 *
	 * @param   object  The nested object structure
	 * @return  result  A single object where the keys describe the paths to the values found in the given object
	 */
	flatten:function F(o, parent_o, parent_key, path) {
		if (!path)
			path = [];
		if (o === null)
			return o;
		if (typeof o == 'object'){
			path.push(o);
			var r = parent_o || {};
			if (Array.isArray(o)){
				for (var i = 0, l = o.length, k/*!key*/, v/*!value*/, nk/*!new key*/, nv/*!new value*/; i < l; i++) {
					k = i;
					v = o[k];
					nk = (parent_key ? parent_key : '') + '[' + k + ']';
					if (typeof v === 'object' && ~path.indexOf(v))
						return '...recursive';
					nv = F(v, r, nk, path);
					if (typeof nv !== 'object')
						r[nk] = nv;
				}
			}
			else {
				var keys = Object.keys(o);
				for (var i = 0, l = keys.length, k/*!key*/, v/*!value*/, nk/*!new key*/, nv/*!new value*/; i < l; i++) {
					k = keys[i];
					v = o[k];
					nk = (parent_key ? parent_key + '.' : '') + k;
					if (typeof v === 'object' && ~path.indexOf(v))
						return '...recursive';
					nv = F(o[k], r, nk, path);
					if (typeof nv !== 'object')
						r[nk] = nv;
				}
			}
			path.pop();
			return r;
		}
		else
			return o;
	},
	
	
	/*!*
	 * Plucks a specified subset of properties of an object, and optionally also removes them from the object.
	 *
	 * @param o the object to inspect
	 * @param ps_include one or more property names to find in the origin object, use null to include all
	 * @param ps_exclude optional one or more property names to exclude from the final object
	 * @param do_delete optional if set the existing properties will be deleted from the object
	 * @return an object with the properties found in the object
	 */
	pluck:function (o, ps/*!properties to extract*/, ps_exclude , do_delete) {
		
		if( !ps && o){
			ps = Object.keys(o);
		}
		if(ps){
			ps = Array.isArray(ps) ? ps : [ps];
		}
		if(typeof(ps_exclude) =='boolean' ){ // if optional ps_exclude is missing
			do_delete = ps_exclude;
			ps_exclude = null;
		}
		if(ps_exclude){
			ps_exclude = Array.isArray(ps_exclude) ? ps_exclude : [ps_exclude];
		}
		
		var r = {};
		// copy and optionaly delete properties in given order
		for (var i = 0, l = ps.length, p; i < l; i++) {
			p = ps[i];
			if ( !(ps_exclude && ~ps_exclude.indexOf(p)) &&  (p in o) ){
				r[p] = o[p];
				if (do_delete) delete o[p];
			}
		}
		return r;
	},
	
	/*!*
	 * Copies the properties of an object to an new object without the given property.
	 *
	 * @param o the object to inspect
	 * @param ps one property name to remove
	 * @return an object with the filtered properties found in the object
	 */
	filter:function (o, ps) {
		return M.pluck(o,null,ps);
	},
	
	/*!*
	 * a deep equal test
	 *
	 * Date is converted to milliseconds,
	 * Arguments to an array *before* comparison.
	 * If strict x,y must both be a Date or an Arguments array
	 * non strict allows array to have a different order
	 * non strict makes void 0 equals null
	 * if x has a function equal this is used
	 */
	equals:function F(x,y,strict){
		//debugger;
		if ( x===y ) return true;
		if ( strict && x instanceof Date && !(y instanceof Date) ) return false;
		if ( x instanceof Date ) x=x.getTime();
		if ( y instanceof Date ) y=y.getTime();
		if ( strict && /Arguments/.test(Object.prototype.toString.call(x)) && !/Arguments/.test(Object.prototype.toString.call(y)) ) return false;
		if ( /Arguments/.test(Object.prototype.toString.call(x)) ) x=Array.prototype.slice.call(x);
		if ( /Arguments/.test(Object.prototype.toString.call(y)) ) y=Array.prototype.slice.call(y);
		if ( !strict && x && Array.isArray(x)) x=x.sort();
		if ( !strict && y && Array.isArray(y)) y=y.sort();
		if ( M.isNaN(x) && M.isNaN(y) ) return true;
		if ( M.isNaN(x) || M.isNaN(y) ) return false;
		if ( typeof x !== 'object' && typeof y !== 'object' ) return strict ? x===y : x==y;
		if ( strict && x===null && y!==null ) return false;
		if ( strict && typeof x === 'undefined' && typeof y !== 'undefined' ) return false;
		if ( !x && !y ) return true;
		if ( !x || !y ) return false;
		if ( (typeof x.equal) === 'function' ) return x.equal(y);
		if ( x.prototype !== y.prototype ) return false;
		if ( typeof x !== 'object' || typeof y !== 'object' ) return strict ? x===y : x==y;
		var xk=Object.keys(x),yk=Object.keys(y);
		if ( xk.length !== yk.length) return false;
		if ( (Array.isArray(x) && !Array.isArray(y)) || (!Array.isArray(x) && Array.isArray(y)) ) return false;
		for ( var i=xk.length,equal=true,k;i--;)if(!(equal=(((k=xk[i]) in y ) && F(x[k],y[k],strict)))) break;
		return equal;
	},
	
	/*!*
	 * returns the common prefix for a set of strings
	 * pass an array of strings, or multiple strings in the arguments
	 */
	prefix:function (strings){
		if(!Array.isArray(strings)) strings=Array.prototype.slice.call(arguments);
		strings.sort(); // after sort we only check smallest and biggest
		var prefix = strings[0], biggest=strings.pop(), i=prefix.length;
		while(i && !~biggest.indexOf(prefix)) prefix=prefix.substring(0,--i);
		return prefix;
	},
	
	/*!*
	 * returns the common postfix for a set of strings
	 * pass an array of strings, or multiple strings in the arguments
	 */
	postfix:function (strings){
		if(!Array.isArray(strings)) strings=Array.prototype.slice.call(arguments);
		return M.reverse(M.prefix(strings.map(M.reverse)));
	},
	
	/*!* reverse a string */
	reverse:function(s){ return s.split('').reverse().join(''); },
	
	/*!*
	 * parses a string to a boolean value
	 * y,t,1,on is true otherwise it is false. an empty string is false.
	 */
	bool:function( v , _default){
		if( void 0 === v ) return !!_default;
		if( 'boolean' === typeof v ) return v;
		return /^((y|t|1|\[)|on)/i.test(''+v); // \[ for "[object]" as a result of toString conversion
	},
	
	/*!*
	 * turn a string with values separated by | or , to efficient hash set
	 * implmentaton as an object
	 * where each key is a value and object[value]=true;
	 * thus the set is formed by the object keys.
	 *
	 * example: var values = set('a|b|c'+'|b|d') becomes
	 * var values = {a:true,b:true,c:true,d:true}
	 * one can then check with the in operator:
	 * if( 'a' in values ){...} or if(values.a){...}
	 * if values is an array then that is used.
	 * if values is an object it is assumed already a set
	 *
	 * one can use common.extend / common.merge on sets 
	 * as they are normal objects.
	 */
	set:function(values){
		
		if(!values){
			return {}; // empty set
		}
		
		if ( typeof(values) === 'object' && !Array.isArray(values) ){
			return values;
		}
		
		if ( typeof(values) === 'string' ){
			values = values.split(/\||\,/); // | or , separated
		}
		
		if(!Array.isArray(values)){
			values = [values];
		}
		
		var i = values.length, o={}, key;
		while(i-->0){
			key = ''+values[i]; // calls toString
			if(key) o[key]=true; // no empty keys
		}
		return o;
	},
	
	/*!*
	 * converts a camel case formatted string to a dashed all lowercase one.
	 * example: 
	 * camel2dashed('ThisIsCamelCase123getADogID') == 'this-is-camel-case123get-adog-id'
	 *
	 * to split a sequence of capitals pass splitCapitalSequence as 'true'
	 *
	 * camel2dashed('ThisIsCamelCase123getADogID',true) = 'this-is-camel-case123get-a-dog-i-d'
	 */
	camel2dashed:function(str,splitCapitalSequence){
		str = str.replace( /([A-Z][a-z\d]*)/g, '-$1' );
		if(!splitCapitalSequence) str = str.replace(/([A-Z])\-([A-Z])/g, '$1$2' );
		str = str.toLowerCase();
		if( str[0]==='-' ) str = str.substring(1);
		return str;
	},
	
	/*! return a function to set or get a property based on a property path as string
		'a.b.c' refers to a.b.c
		'a.2.c' refers to a[2].c
		use merge to merge on setting the value instead of replacing it
	*/
	property:function( path, merge){
		
		path = path ? path.split('.') : null;
		
		return function(o,value){ // function to get/set object property using the property path
			
			var	is_set = typeof(value) !== typeof(void 0); // this is a *set* property case
			
			if(!path) return is_set ? value : o; // empty path
			
			for(var i=0,l=path.length,last=l-1,end=false; o && i<l && !end; i++){
				
				var
					p        = path[i],
					n        = parseInt(p,10),                   // path elment as a number
					is_array = !M.isNaN(n);                 // if path element is a number, we assume it is an array index
				
				if(is_array) p=n;
				
				if(i===last && is_set) o[p] = merge ? M.merge(o[p],value) : value; // set or merge
				
				o = (o[p]===void 0 && i < last ? //path component does not exist
						( is_set ? (o[p]=(M.isNaN(parseInt(path[i+1],10)) ? {} : [] )) //create & store & use new object or array
						: (end=true, void 0) // get case: end of loop, return undefined
						)
					:o[p]
					);
			}
			return o;
		};
	},
	
	/*!*
	 * call node(__filename) to check if the user called node __filename.js
	 */
	node : function(script){
		//check if started stand alone
		// if you call node scriptname.js
		// argument[0]=='node'
		// argument[1]==/full/path/to/scriptname.js
		// so you can testif it is equal to the __filename
		return require('fs').realpathSync(require('path').resolve(process.argv[1])) === script;
	},
	
	/*!*
	 * wrapper returning a function for a given function, to assure the given function is called just once
	 * NOTE: only the arguments and 'this' from the first call are ever used
	 */
	once: function(f){
		var called = false, result;
		return function(){
			return !called ? ( called=true, result = f.apply(this,arguments) ) : result;
		};
	}
});
