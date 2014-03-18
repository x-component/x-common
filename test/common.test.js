'use strict';

var
	vows   = require('vows'),
	assert = require('assert'),
	common = require('../common');


var suite = vows.describe('common');
suite.addBatch({
	
	'extend': {
		topic: common,
		'x({},{},{}),{}': function (topic) {
			assert.deepEqual(topic.x({},{},{}),{});
		},
		'x({},{a:1},{}),{a:1}': function (topic) {
			assert.deepEqual(topic.x({},{a:1},{}),{a:1});
		},
		'x({a:1},{a:2},{a:3}),{a:3}': function (topic) {
			assert.deepEqual(topic.x({a:1},{a:2},{a:3}),{a:3});
		},
		'x({a:1},{b:2},{c:3}),{a:1,b:2,c:3}': function (topic) {
			assert.deepEqual(topic.x({a:1},{b:2},{c:3}),{a:1,b:2,c:3});
		}
	},
	
	'flatten': {
		topic: common,
		'flatten(1)==1': function (topic) {
			assert.equal(topic.flatten(1),1);
		},
		'flatten(null)==null': function (topic) {
			assert.equal(topic.flatten(null),null);
		},
		'flatten("a")=="a"': function (topic) {
			assert.equal(topic.flatten('a'),'a');
		},
		'flatten({a:1})===={a:1}': function (topic) {
			assert.deepEqual(topic.flatten({a:1}),{a:1});
		},
		'flatten(["a"])===={"0":"a"}': function (topic) {
			assert.deepEqual(topic.flatten(['a']),{'[0]':'a'});
		},
		'flatten(["a",2])===={"[0]":"a","[1]":2}': function (topic) {
			assert.deepEqual(topic.flatten(['a',2]),{'[0]':'a','[1]':2});
		},
		'flatten({a:{n:1,m:2}})===={"a.n":1,"a.m":2}': function (topic) {
			assert.deepEqual(topic.flatten({a:{n:1,m:2}}),{'a.n':1,'a.m':2});
		},
		'flatten({a:{n:1,m:{z:3}}})===={"a.n":1,"a.m.z":3}': function (topic) {
			assert.deepEqual(topic.flatten({a:{n:1,m:{z:3}}}),{'a.n':1,'a.m.z':3});
		},
		'flatten({a:{n:1,m:2},b:["x",{"y":"z"}],c:3})===={"a.n":1,"a.m":2,"b[0]":"x","b.[1].y":"z"}': function (topic) {
			assert.deepEqual(topic.flatten({a:{n:1,m:2},b:['x',{'y':'z'}],c:3}),{'a.n':1,'a.m':2,'b[0]':'x','b[1].y':'z',c:3});
		},
		'shared x={c:1};flatten({a:x,b:x})===={"a.c":1,"b.c":1}': function (topic) {
			var x={c:1};assert.deepEqual(topic.flatten({a:x,b:x}),{'a.c':1,'b.c':1});
		},
		'endless recursive x={};x.b={c:1,d:x,e:2};flatten({a:x})===={"a.b.c":1,"a.b.d":"...recursive","a.b.e":2}': function (topic) {
			var x={c:1};assert.deepEqual(topic.flatten({a:x,b:x}),{'a.c':1,'b.c':1});
		}
	},
	
	'pluck': {
		topic: common,
		'var o={a:1,b:2};pluck(o,"a",true)===={a:1}&&o===={b:2}': function (topic) {
			var o={a:1,b:2};assert.deepEqual(topic.pluck(o,'a',true),{a:1});assert.deepEqual(o,{b:2});
		},
		'var o={a:1,b:2};pluck(o,"a")===={a:1}&&o===={a:1,b:2}': function (topic) {
			var o={a:1,b:2};assert.deepEqual(topic.pluck(o,'a'),{a:1});assert.deepEqual(o,{a:1,b:2});
		},
		'var o={};pluck(o,"a")===={}&&o===={}': function (topic) {
			var o={};assert.deepEqual(topic.pluck(o,'a'),{});assert.deepEqual(o,{});
		},
		'var o={a:1,b:2,c:3};pluck(o,["a","b"],true)===={a:1,b:2}&&o===={c:3}': function (topic) {
			var o={a:1,b:2,c:3};assert.deepEqual(topic.pluck(o,['a','b'],true),{a:1,b:2});assert.deepEqual(o,{c:3});
		}
	},
	
	'filter': {
		topic: common,
		'var o={a:1,b:2};filter(o,"a")===={b:2}': function (topic) {
			var o={a:1,b:2};assert.deepEqual(topic.filter(o,'a'),{b:2});assert.deepEqual(o,{a:1,b:2});
		},
		'var o={e:1,f:2};filter(o,"c")===={e:1,f:2}': function (topic) {
			var o={e:1,f:2};assert.deepEqual(topic.filter(o,'c'),{e:1,f:2});assert.deepEqual(o,{e:1,f:2});
		}
	},
	
	'equal': {
		topic: common,
		'1 equals 1'                       : function(topic){ assert(topic.equals(1,1)); },
		'1 not equals 2'                   : function(topic){ assert(!topic.equals(1,2)); },
		'null equals null'                 : function(topic){ assert(topic.equals(null,null)); },
		'null not equals {}'               : function(topic){ assert(!topic.equals(null,{})); },
		'undefined equals undefined'       : function(topic){ assert(topic.equals(void 0,void 0)); },
		'strict undefined not equals null' : function(topic){ assert(!topic.equals(void 0,null,true)); },
		'undefined equals null'            : function(topic){ assert(topic.equals(void 0,null)); },
		'{b:2,a:1} equals {a:1,b:2}'                        : function(topic){ assert(topic.equals({b:2,a:1},{a:1,b:2})); },
		'{b:2,a:1} not equals {a:1,b:2,c:3}'                : function(topic){ assert(!topic.equals({b:2,a:1},{a:1,b:2,c:3})); },
		'{b:{c:3},a:1} equals {a:1,b:{c:3}}'                : function(topic){ assert(topic.equals({b:{c:3},a:1},{a:1,b:{c:3}})); },
		'{b:{c:3},a:1} not equals {a:1,b:[3]}'              : function(topic){ assert(!topic.equals({b:{c:3},a:1},{a:1,b:[3]})); },
		'{b:[1,2,3],a:1} equals {a:1,b:[1,2,3]}'            : function(topic){ assert(topic.equals({b:[1,2,3],a:1},{a:1,b:[1,2,3]})); },
		'strict {b:[1,2,3],a:1} not equals {a:1,b:[3,2,1]}' : function(topic){ assert(!topic.equals({b:[1,2,3],a:1},{a:1,b:[3,2,1]},true)); },
		'{b:[1,2,3],a:1} equals {a:1,b:[3,2,1]}'            : function(topic){ assert(topic.equals({b:[1,2,3],a:1},{a:1,b:[3,2,1]})); },
		'{a: new Date(5)} equals {a:new Date(5)}'           : function(topic){ assert(topic.equals({a:new Date(5)},{a:new Date(5)})); },
		'strict {a: new Date(5)} not equals {a:5}'          : function(topic){ assert(!topic.equals({a:new Date(5)},{a:5},true)); },
		'{a: new Date(5)} equals {a:5}'                     : function(topic){ assert(topic.equals({a:new Date(5)},{a:5})); },
		'Arguments[5] equals Arguments[5]'                  : function(topic){ var x,y; (function(){x=arguments;})(5); (function(){y=arguments;})(5); assert(topic.equals({a:x},{a:y})); },
		'strict Arguments[5] not equals [5]'                : function(topic){ var x,y; (function(){x=arguments;})(5);y=[5]; assert(!topic.equals({a:x},{a:y},true)); },
		'Arguments[5] equals [5]' : function(topic){ var x,y; (function(){x=arguments;})(5);y=[5]; assert(topic.equals({a:x},{a:y})); },
		'true equals true'        : function(topic){ assert(topic.equals(true,true)); },
		'true not equals false'   : function(topic){ assert(!topic.equals(true,false)); },
		'"" equals false'         : function(topic){ assert(topic.equals('',false)); },
		'NaN equals NaN'          : function(topic){ assert(topic.equals(NaN,NaN)); },
		'[] not equals {}'        : function(topic){ assert(!topic.equals([],{})); }
	},
	
	'prefix': {
		topic: common,
		'prefix "" equals ""'                                   :function(topic){ assert.equal(topic.prefix(''),''); },
		'prefix "xya","xyb","xyxc" equals "xy"'                 : function(topic){ assert.equal(topic.prefix('xya','xyb','xyxc'),'xy'); },
		'prefix "axy","bxy","cyxy" equals ""'                   : function(topic){ assert.equal(topic.prefix('axy','bxy','cyxy'),''); },
		'prefix "xya","xyxc","xyb" equals "xy"'                 : function(topic){ assert.equal(topic.prefix('xya','xyxc','xyb'),'xy'); },
		'prefix "xya","xyb","xyxc" equals ["xya","xyb","xyxc"]' : function(topic){ assert.equal(topic.prefix('xya','xyb','xyxc'),topic.prefix(['xya','xyb','xyxc'])); }
	},
	
	'postfix': {
		topic: common,
		'postfix "" equals ""'                                   : function(topic){ assert.equal(topic.postfix(''),''); },
		'postfix "axy","bxy","cyxy" equals "xy"'                 : function(topic){ assert.equal(topic.postfix('axy','bxy','cyxy'),'xy'); },
		'postfix "xya","xyb","xyxc" equals ""'                   : function(topic){ assert.equal(topic.postfix('xya','xyb','xyxc'),''); },
		'postfix "axy","cyxy","bxy" equals "xy"'                 : function(topic){ assert.equal(topic.postfix('axy','cyxy','bxy'),'xy'); },
		'postfix "axy","bxy","cyxy" equals ["axy","bxy","cyxy"]' : function(topic){ assert.equal(topic.postfix('axy','bxy','cyxy'),topic.postfix(['axy','bxy','cyxy'])); }
	},
	
	'reverse': {
		topic: common,
		'reverse "" equals ""'       : function(topic){ assert.equal(topic.reverse(''),''); },
		'reverse "abc" equals "cba"' : function(topic){ assert.equal(topic.reverse('abc'),'cba'); }
	},
	
	'bool' : {
		topic: common,
		' 1  is true'     : function(topic){ assert.equal(topic.bool( 1 ),true );   },
		' 0  is false'    : function(topic){ assert.equal(topic.bool( 0 ),false);   },
		'"1" is true'     : function(topic){ assert.equal(topic.bool('1'),true );   },
		'"0" is false'    : function(topic){ assert.equal(topic.bool('0'),false);   },
		'"Y" is true'     : function(topic){ assert.equal(topic.bool('Y'),true );   },
		'"N" is false'    : function(topic){ assert.equal(topic.bool('N'),false);   },
		'"y" is true'     : function(topic){ assert.equal(topic.bool('y'),true );   },
		'"n" is false'    : function(topic){ assert.equal(topic.bool('n'),false);   },
		'"on" is true'    : function(topic){ assert.equal(topic.bool('on'),true);   },
		'"off" is false'  : function(topic){ assert.equal(topic.bool('off'),false); },
		'"Yes" is true'   : function(topic){ assert.equal(topic.bool('Yes'),true ); },
		'"No"  is true'   : function(topic){ assert.equal(topic.bool('No' ),false); },
		'"true"  is true' : function(topic){ assert.equal(topic.bool('true' ),true ); },
		'"false" is false': function(topic){ assert.equal(topic.bool('false'),false); },
		'"True"  is true' : function(topic){ assert.equal(topic.bool('True' ),true ); },
		'"False" is false': function(topic){ assert.equal(topic.bool('False'),false); },
		'null is false'   : function(topic){ assert.equal(topic.bool(null),false); },
		'{} is true '     : function(topic){ assert.equal(topic.bool({}),true ); },
		'"" is false'     : function(topic){ assert.equal(topic.bool(''),false); },
		'undefined, false is false': function(topic){ var x={};assert.equal(topic.bool(x.y,false),false); },
		'undefined, true  is true' : function(topic){ var x={};assert.equal(topic.bool(x.y,true),true);   },
		'undefined is false'       : function(topic){ var x={};assert.equal(topic.bool(x.y),false);       }
	},
	
	'set' : {
		topic : common,
		'set(null) is {}'            : function(topic){ assert.deepEqual(topic.set( null ),{} ); },
		'set(undefined) is {}'       : function(topic){ assert.deepEqual(topic.set( void 0 ),{} ); },
		'set(0) is {}'               : function(topic){ assert.deepEqual(topic.set( 0 ),{} ); },
		'set(1) is {"1":true }'      : function(topic){ assert.deepEqual(topic.set( 1 ),{'1':true} ); },
		'set(true) is {"true":true}' : function(topic){ assert.deepEqual(topic.set( true ),{'true':true} ); },
		'set(false) is {}'           : function(topic){ assert.deepEqual(topic.set( false ),{} ); },
		'set("a") is {"a":true}'     : function(topic){ assert.deepEqual(topic.set( 'a' ),{a:true} ); },
		'set("") is {}'              : function(topic){ assert.deepEqual(topic.set( '' ),{} ); },
		'set([]) is {}'              : function(topic){ assert.deepEqual(topic.set( [] ),{} ); },
		'set({}) is {}'              : function(topic){ assert.deepEqual(topic.set( {} ),{} ); },
		'set({a:x}) is {a:x}'        : function(topic){ assert.deepEqual(topic.set( {a:'x'} ),{a:'x'} ); },
		'set({a:function(){}) is {a:function(){}}' : function(topic){ var f=function(){}; assert.deepEqual(topic.set( {a:f} ), {a:f} ); },
		'set(["a","b"]) is {"a":true,b:true}'      : function(topic){ assert.deepEqual(topic.set( ['a','b'] ),{a:true,b:true} ); },
		'set("a,b|c") is {a:true,b:true,c:true}'   : function(topic){ assert.deepEqual(topic.set( 'a,b|c' ),{a:true,b:true,c:true} ); },
		'set("a||b") is {a:true,b:true}'           : function(topic){ assert.deepEqual(topic.set( 'a||b' ),{a:true,b:true} ); },
		'set("a|,b") is {a:true,b:true}'           : function(topic){ assert.deepEqual(topic.set( 'a|,b' ),{a:true,b:true} ); },
		'set("a|A") is {a:true,A:true}'            : function(topic){ assert.deepEqual(topic.set( 'a|A'  ),{a:true,A:true} ); },
		'set("_|-") is {"_":true,"-":true}'        : function(topic){ assert.deepEqual(topic.set( '_|-'  ),{'_':true,'-':true} ); },
		'set("true|false") is {"true":true,"false":true}' : function(topic){ assert.deepEqual(topic.set( 'true|false' ),{'true':true,'false':true} ); },
		'set("0|1") is {"0":true,"1":true}'               : function(topic){ assert.deepEqual(topic.set( '0|1' ),{'0':true,'1':true} ); },
		'set("a|b|c"+"|b|d") is {a:true,b:true,c:true,d:true}': function(topic){ assert.deepEqual(topic.set('a|b|c'+'|b|d'),{a:true,b:true,c:true,d:true} ); }
	},
	
	'merge, goal no side effect for ride hand side if rhs is not a function' : {
		topic: common,
		'recognize rhs cyclic': function (topic) {
			var a={};a.b=a;
			assert.throws(function(){topic.merge({c:2},a);},/cyclic/);
		},
		'regexp properties': function (topic) {
			assert.deepEqual(topic.merge({a:{b:1}},{a:{c:/2/}}),{a:{b:1,c:/2/}});
		},
		'add properties': function (topic) {
			assert.deepEqual(topic.merge({a:{b:1}},{a:{c:2}}),{a:{b:1,c:2}});
		},
		'remove properties': function (topic) {
			assert.deepEqual(topic.merge({a:{b:1,c:2}},{a:{b:topic.merge.remove}}),{a:{c:2}});
		},
		'primitive and same primitive is same primitive': function (topic) {
			var x=1;assert.strictEqual(x,topic.merge(x,x));
		},
		'object null and object null is (always same) null': function (topic) {
			var x=null;assert.strictEqual(x,topic.merge(x,x));
		},
		'object and same object is equal and same object': function (topic) {
			var x={b:1,c:2},y=topic.merge(x,x);assert.strictEqual(x,y);
		},
		'array and same array is equal but not same array': function (topic) {
			var x=[1,2],y=topic.merge(x,x);assert.strictEqual(x,y);
		},
		'function and same function is same function (can not copy function)': function (topic) {
			var x=function(){};assert.strictEqual(x,topic.merge(x,x));
		},
		'primitive and undefined is same primitive': function (topic) {
			var x=1;assert.strictEqual(x,topic.merge(x,void 0));
		},
		'object and undefined is same object': function (topic) {
			var x={b:1,c:2};assert.strictEqual(x,topic.merge(x,void 0));
		},
		'array and undefined is same array': function (topic) {
			var x=[1,2];assert.strictEqual(x,topic.merge(x,void 0));
		},
		'function and undefined is same function': function (topic) {
			var x=function(){};assert.strictEqual(x,topic.merge(x,void 0));
		},
		'primitive and null is null': function (topic) {
			var x=1;assert.strictEqual(null,topic.merge(x,null));
		},
		'object and null is null': function (topic) {
			var x={b:1,c:2};assert.strictEqual(null,topic.merge(x,null));
		},
		'array and null is null': function (topic) {
			var x=[1,2];assert.strictEqual(null,topic.merge(x,null));
		},
		'function and null is null': function (topic) {
			var x=function(){};assert.strictEqual(null,topic.merge(x,null));
		},
		'null and primitive is that primitive': function (topic) {
			var x=1;assert.strictEqual(x,topic.merge(null,x));
		},
		'null and object is not that object but deep equal': function (topic) {
			var x={b:1,c:2},y=topic.merge(null,x);assert.notStrictEqual(x,y);assert.deepEqual(x,y);
		},
		'null and array is not that array but deep equal': function (topic) {
			var x=[1,2],y=topic.merge(null,x);assert.notStrictEqual(x,y);assert.deepEqual(x,y);
		},
		'null and function is that function (can not copy)': function (topic) {
			var x=function(){},y=topic.merge(null,x);assert.strictEqual(x,y);
		},
		'undefined and primitive is that primitive': function (topic) {
			var x=1;assert.strictEqual(x,topic.merge(void 0,x));
		},
		'undefined and object is not that object but deep equal': function (topic) {
			var x={b:1,c:2},y=topic.merge(void 0,x);assert.notStrictEqual(x,y);assert.deepEqual(x,y);
		},
		'undefined and array is not that array but deep equal': function (topic) {
			var x=[1,2],y=topic.merge(void 0,x);assert.notStrictEqual(x,y);assert.deepEqual(x,y);
		},
		'undefined and function is that function (can not copy)': function (topic) {
			var x=function(){},y=topic.merge(void 0,x);assert.strictEqual(x,y);
		},
		'primitive and primitive is primitive': function (topic) {
			var x=1,y=2;assert.deepEqual(topic.merge(x,y),2);
		},
		'primitive and object is object with "value" but not that object': function (topic) {
			var x=1,y={};assert.deepEqual(topic.merge(x,y),{value:x});assert.notStrictEqual(topic.merge(x,y),y);
		},
		'primitive and array is array with prepended primitive but not that array': function (topic) {
			var x=1,y=[{},2,3];assert.deepEqual(topic.merge(x,y),[1,{},2,3]);assert.notStrictEqual(topic.merge(x,y),y);
		},
		'primitive and array with that primitive is a copy of that array': function (topic) {
			var x=1,y=[1,{},2];assert.deepEqual(topic.merge(x,y),[1,{},2]);assert.notStrictEqual(topic.merge(x,y),y);
		},
		'primitive and function is that function with "value" function (can not copy)': function (topic) {
			var x=1,y=function(){};assert.deepEqual(topic.merge(x,y).value,x);assert.strictEqual(topic.merge(x,y),y);
		},
		'object and primitive is same object with "value"': function (topic) {
			var x={},y=1;assert.deepEqual(topic.merge(x,y).value,y);assert.strictEqual(topic.merge(x,y),x);
		},
		'object and object is same object with deep copied properties': function (topic) {
			var x={a:1},z={c:2,d:3},y={b:z};assert.deepEqual(topic.merge(x,y),{a:1,b:{c:2,d:3}});assert.strictEqual(topic.merge(x,y),x);assert.notStrictEqual(topic.merge(x,y).b,z);
		},
		'object and array is array with prepended object but not that array': function (topic) {
			var x={a:1},y=[{},2,3];assert.deepEqual(topic.merge(x,y),[{a:1},{},2,3]);assert.notStrictEqual(topic.merge(x,y),y);
		},
		'object and array with a deep equal object is a copy of that array, with the object replaced (no side effect for equal object in array)': function (topic) {
			var x={a:1},y=[{a:1},{},2];assert.deepEqual(topic.merge(x,y),[{a:1},{},2]);assert.notStrictEqual(topic.merge(x,y),y);assert.strictEqual(topic.merge(x,y)[0],x);
		},
		'object and function is that function with deep copied properties of object (can not copy function)': function (topic) {
			var z,x={a:(z={b:2})},y=function(){};assert.deepEqual(topic.merge(x,y).a,z);assert.notStrictEqual(topic.merge(x,y).a,z);assert.strictEqual(topic.merge(x,y),y);
		},
		'array and primitive is same array with primitive appended': function (topic) {
			var x=[{},2,3],y=1;assert.deepEqual(topic.merge(x,y),[{},2,3,1]);
		},
		'array with primitive and equal primitive is same array': function (topic) {
			var x=[1,{},2],y=1;assert.deepEqual(topic.merge(x,y),[1,{},2]);assert.strictEqual(topic.merge(x,y),x);
		},
		'array and object is same array with deep copied object appended': function (topic) {
			var x=[{},2,3],y={a:1};assert.deepEqual(topic.merge(x,y),[{},2,3,{a:1}]);assert.notStrictEqual(topic.merge(x,y)[3],y);;
		},
		'array with object and deep equal object is same array': function (topic) {
			var x=[{a:1},2,3],y={a:1};assert.deepEqual(topic.merge(x,y),[{a:1},2,3]);assert.strictEqual(topic.merge(x,y),x);
		},
		'array with array is same array with concatenated deep copied elements of second array': function (topic) {
			var x=[{a:1},2,3],z,y=[(z={b:4}),5,6];assert.deepEqual(topic.merge(x,y),[{a:1},2,3,{b:4},5,6]);assert.strictEqual(topic.merge(x,y),x);assert.notStrictEqual(topic.merge(x,y)[3],z);
		},
		'array with array where some objects are deep equal to ones in the first array is same first array concatenated with the non equal deep copied elements of second array, equals of the first array stay the same': function (topic) {
			var x   = [{a:1},2,3],
				z,y = [{a:1},(z={b:4}),5,6];
			assert.deepEqual(topic.merge(x,y),[{a:1},2,3,{b:4},5,6]);
			assert.strictEqual(topic.merge(x,y),x);
			assert.notStrictEqual(topic.merge(x,y)[3],z);
			assert.strictEqual(topic.merge(x,y)[0],x[0]);
		},
		'array and function is same array with function appended (can not copy function)': function (topic) {
			var x=[{},2,3],y=function(){};assert.deepEqual(topic.merge(x,y),[{},2,3,y]);assert.strictEqual(topic.merge(x,y)[3],y);;
		},
		'array with function and same function is same array': function (topic) {
			var y,x=[(y=function(){}),{},2];assert.deepEqual(topic.merge(x,y),[y,{},2]);assert.strictEqual(topic.merge(x,y)[0],y);assert.strictEqual(topic.merge(x,y),x);
		},
		'function and primitive is same function with "value"': function (topic) {
			var x=function(){},y=1;assert.deepEqual(topic.merge(x,y).value,y);assert.strictEqual(topic.merge(x,y),x);
		},
		'function and object is same function with deep copied object properties': function (topic) {
			var x=function(){},z={c:2,d:3},y={b:z};assert.deepEqual(topic.merge(x,y).b,{c:2,d:3});assert.strictEqual(topic.merge(x,y),x);assert.notStrictEqual(topic.merge(x,y).b,z);
		},
		'function and mixed array is function with array as value but not that array': function (topic) {
			var x=function(){},y=[{},2,3];assert(topic.merge(x,y).value);assert.deepEqual(topic.merge(x,y).value,[{},2,3]);assert.notStrictEqual(topic.merge(x,y).value,y);
		},
		'function and function only array is function preprended to array but not that array': function (topic) {
			var x=function(){},y=[function(){}];assert.deepEqual(topic.merge(x,y),[x,y[0]]);assert.notStrictEqual(topic.merge(x,y),y);
		},
		'function and array with a same function is a copy of that array (function is not copied)': function (topic) {
			var x=function(){},y=[x];assert.deepEqual(topic.merge(x,y),[x]);assert.notStrictEqual(topic.merge(x,y),y);assert.strictEqual(topic.merge(x,y)[0],x);
		},
		'function and function is the second function (no function chaining or sequential composition)': function (topic) {
			var x=function(){},y=function(){};assert.strictEqual(topic.merge(x,y),y);
		}
	},
	
	'camel2dashed': {
		topic: common,
		
		'A'  :  function (topic) { assert.equal( topic.camel2dashed('A'  ),'a'    ); },
		'AA' : function (topic) { assert.equal( topic.camel2dashed('AA'  ),'aa'   ); },
		'A1' : function (topic) { assert.equal( topic.camel2dashed('A1'  ),'a1'   ); },
		'1A' : function (topic) { assert.equal( topic.camel2dashed('1A'  ),'1-a'  ); },
		'A1A': function (topic) { assert.equal( topic.camel2dashed('A1A' ),'a1-a' ); },
		'A11': function (topic) { assert.equal( topic.camel2dashed('A11' ),'a11'  ); },
		'11A': function (topic) { assert.equal( topic.camel2dashed('11A' ),'11-a' ); },
		'11' : function (topic) { assert.equal( topic.camel2dashed('11'  ),'11'   ); },
		'AaA': function (topic) { assert.equal( topic.camel2dashed('AaA' ),'aa-a' ); },
		'AAa': function (topic) { assert.equal( topic.camel2dashed('AAa' ),'aaa'  ); },
		'aAA': function (topic) { assert.equal( topic.camel2dashed('aAA' ),'a-aa' ); },
		
		'split AA' : function (topic) { assert.equal( topic.camel2dashed('AA' , true),'a-a'  ); },
		'split AAa': function (topic) { assert.equal( topic.camel2dashed('AAa', true),'a-aa' ); },
		'split aAA': function (topic) { assert.equal( topic.camel2dashed('aAA', true),'a-a-a'); },
		
		
		'ThisIsCamelCase123getADogID -> this-is-camel-case123get-adog-id'        : function (topic) { assert.equal( topic.camel2dashed('ThisIsCamelCase123getADogID'),'this-is-camel-case123get-adog-id'); },
		'split ThisIsCamelCase123getADogID -> this-is-camel-case123get-a-dog-i-d': function (topic) { assert.equal( topic.camel2dashed('ThisIsCamelCase123getADogID',true),'this-is-camel-case123get-a-dog-i-d'); }
	},
	
	'property' : {
		topic : common,
		'a.b' : { topic: function(topic){ return topic.property('a.b'); },
			'get undefined     is undefined'         : function(p){ var o=void 0;                    assert.deepEqual(p(o), void 0); assert.deepEqual(o,void 0);                     },
			'get {}            is undefined'         : function(p){ var o={};                        assert.deepEqual(p(o), void 0); assert.deepEqual(o,{});                         },
			'get {a:{c:1}      is undefined'         : function(p){ var a,o={a:(a={c:1})};           assert.deepEqual(p(o), void 0); assert.deepEqual(o.a,a);                        },
			'get {a:[]}        is undefined'         : function(p){ var a,o={a:(a=[])};              assert.deepEqual(p(o), void 0); assert.deepEqual(o.a,a);                        },
			'get {a:{b:2}      is 2'                 : function(p){ var a,b,o={a:(a={b:(b=2)})};     assert.deepEqual(p(o),b);       assert.deepEqual(o.a,a); assert.equal(o.a.b,b); },
			'get {a:{b:{c:3}}  is {c:3}'             : function(p){ var a,b,o={a:(a={b:(b={c:3})})}; assert.deepEqual(p(o),b);       assert.deepEqual(o.a,a); assert.equal(o.a.b,b); },
			'get {a:{b:[4]}    is [4]'               : function(p){ var a,b,o={a:(a={b:(b=[4])})};   assert.deepEqual(p(o),b);       assert.deepEqual(o.a,a); assert.equal(o.a.b,b); },
			'set undefined,5   is undefiend'         : function(p){ var o=void 0;                    p(o,5); assert.deepEqual(o,void 0);    },
			'set {},6          is {a:{b:6}}'         : function(p){ var o={};                        p(o,6); assert.deepEqual(o,{a:{b:6}}); },
			'set [1],7         is [1].a={b:7}}'      : function(p){ var o=[1];                       p(o,7); assert.deepEqual(o.a.b,7); },
			'set {},{c:8}      is {a:{b:{c:8}}}'     : function(p){ var o={},b={c:8};                p(o,b); assert.equal(o.a.b,b); },
			'set {},false      is {a:{b:false}}'     : function(p){ var o={},b=false;                p(o,b); assert.equal(o.a.b,b); }
		},
		'a.b merge' : { topic: function(topic){ return topic.property('a.b',true); },
			'merge undefined,5 is undefiend'     : function(p){ var o=void 0;                    p(o,5); assert.deepEqual(o,void 0);    },
			'merge {},6        is {a:{b:6}}'     : function(p){ var o={};                        p(o,6); assert.deepEqual(o,{a:{b:6}}); },
			'merge [1],7       is [1].a={b:7}}'  : function(p){ var o=[1];                       p(o,7); assert.deepEqual(o.a.b,7); },
			'merge {a:{b:{d:9}}},{c:8} is {a:{b:{c:8,d:9}}}' : function(p){ var o={a:{b:{d:9}}}; p(o,{c:8}); assert.deepEqual(o,{a:{b:{c:8,d:9}}}); }
		},
		'a.2' : { topic: function(topic){ return topic.property('a.2'); },
			'get undefined       is undefined'     : function(p){ var o=void 0;                    assert.deepEqual(p(o), void 0); assert.deepEqual(o,void 0);                      },
			'get {}              is undefined'     : function(p){ var o={};                        assert.deepEqual(p(o), void 0); assert.deepEqual(o,{});                          },
			'get {a:{c:1}        is undefined'     : function(p){ var a,o={a:(a={c:1})};           assert.deepEqual(p(o), void 0); assert.deepEqual(o.a,a);                         },
			'get {a:[]}          is undefined'     : function(p){ var a,o={a:(a=[])};              assert.deepEqual(p(o), void 0); assert.deepEqual(o.a,a);                         },
			'get {a:[0,1,2]      is 2'             : function(p){ var a,x,o={a:(a=[0,1,x=2])};     assert.deepEqual(p(o),x);       assert.deepEqual(o.a,a); assert.equal(o.a[2],x); },
			'get {a:[0,1,{c:3}]} is {c:3}'         : function(p){ var a,x,o={a:(a=[0,1,x={c:3}])}; assert.deepEqual(p(o),x);       assert.deepEqual(o.a,a); assert.equal(o.a[2],x); },
			'get {a:[0,1,[4]]}   is [4]'           : function(p){ var a,x,o={a:(a=[0,1,x=[4]])};   assert.deepEqual(p(o),x);       assert.deepEqual(o.a,a); assert.equal(o.a[2],x); },
			'set {},6            is {a:[,,6]}'     : function(p){ var o={};                        p(o,6); assert.deepEqual(o,{a:[,,6]}); },
			'set [1],7           is [1].a=[,,7]}'  : function(p){ var o=[1];                       p(o,7); assert.deepEqual(o.a[2],7); },
			'set {},{c:8}        is {a:[,,{c:8}]}' : function(p){ var o={},x={c:8};                p(o,x); assert.equal(o.a[2],x); }
		},
		'1.b' : { topic: function(topic){ return topic.property('1.b'); },
			'get undefined   is undefined'     : function(p){ var o=void 0;                       assert.deepEqual(p(o), void 0); assert.deepEqual(o,void 0);                       },
			'get {}          is undefined'     : function(p){ var o={};                           assert.deepEqual(p(o), void 0); assert.deepEqual(o,{});                           },
			'get []          is undefined'     : function(p){ var o=[];                           assert.deepEqual(p(o), void 0); assert.deepEqual(o,[]);                           },
			'get [,{c:1}]    is undefined'     : function(p){ var x,o=[void 0,x={c:1}];           assert.deepEqual(p(o), void 0); assert.deepEqual(o[1],x);                         },
			'get [,[]]       is undefined'     : function(p){ var x,o=[void 0,x=[]];              assert.deepEqual(p(o), void 0); assert.deepEqual(o[1],x);                         },
			'get [,{b:2]]    is 2'             : function(p){ var x,b,o=[void 0,b={b:(x=2)}];     assert.deepEqual(p(o),x);       assert.deepEqual(o[1],b); assert.equal(o[1].b,x); },
			'get [,{b:{c:3}] is {c:3}'         : function(p){ var x,b,o=[void 0,b={b:(x={c:3})}]; assert.deepEqual(p(o),x);       assert.deepEqual(o[1],b); assert.equal(o[1].b,x); },
			'get [,{b:[4]]   is [4]'           : function(p){ var x,b,o=[void 0,b={b:(x=[4])}];   assert.deepEqual(p(o),x);       assert.deepEqual(o[1],b); assert.equal(o[1].b,x); },
			'set {},6        is {1:{b:6}}'     : function(p){ var o={};                           p(o,6); assert.deepEqual(o,{1:{b:6}}); },
			'set [1],7       is [1,{b:7}]'     : function(p){ var o=[1];                          p(o,7); assert.deepEqual(o[1].b,7); },
			'set {},{c:8}    is {1,{b:{c:8}}]' : function(p){ var o={},x={c:8};                   p(o,x); assert.equal(o[1].b,x); }
		},
		'a.b.5.d.1' : { topic: function(topic){ return topic.property('a.b.5.d.1'); },
			'get o={} is undefined':{topic: function(p){ var o={}; assert.deepEqual(p(o),void 0); return o; },
				'set o,{e:6} is {a:{b:[,,,,,{d:[,{e:6}]}]}}':{
					topic: function(o,p){
						var x={e:6}; p(o,x); assert.deepEqual(o,{a:{b:[,,,,,{d:[,x]}]}}); return {x:x,o:o,p:p};
					},
					'get o is {e:6}' : function(r){ assert.equal(r.p(r.o),r.x); }
				}
			}
		},
		'empty path' : { topic: function(topic){ return topic.property(); },
			'get {a:1}       is {a:1}' : function(p){ assert.deepEqual(p({a:1}),{a:1}); },
			'set {b:2},{a:1} is {a:1}' : function(p){ assert.deepEqual(p({b:2},{a:1}),{a:1}); }
		}
	},
	
	'test call once' : {
		topic: common,
		'two calls' : {
			topic: function( topic ){
				var count = 0;
				var f=topic.once(function(param){
					count++;
					return param;
				});
				// call twice with differen arguments, thus different results
				f(100);
				var result=f(200); // should still result 100, as nothing is really called
				this.callback(count,result);
			},
			'called just once' : function( count, result ){
				assert.equal(count,1);
			},
			'result from first call' : function( count, result ){
				assert.equal(result,100);
			}
		}
	}
}).export(module,{error:false});
