

/** This program is a minimum featured Lisp compiler

    implemented in Javascript. This compiles all kinds

    of basic functionalities in Lisp as well as simple

    user defined functions. (Both recursive and iterative).
                        
    
    Run this program using <nodejs --harmony_destructuring name.js>
                                                        

    Created by:    JOEL DAVIS. P                         */


/** Tokenize function takes a code as input and split the code

    into basic level tokens and returns all tokens.      */


function tokenize(code)
{
    var s1 = code.replace(/\(/g, " ( ").replace(/\)/g, " ) ")
    var s2 = s1.trim();
    var out = s2.split(/\ +/);
    return out
}




/** Parsing functions read the tokens one after another

    and convert it into appropriate formats. Numbers

    are stored as 'Numbers' type in javascript and other

    symbols are stored as 'Strings'.                  */
          

function parse(pgm)
{
    return read_frm_tokens(tokenize(pgm))
}

function read_frm_tokens(tokens)
{
    if(tokens.length == 0)
    {
        console.log("Unexpected end of file");
	return;
    }
    token = tokens.shift();
    if (token == "(")
    {
        var L = [];
        while(tokens[0] != ")")
        {
            L.push(read_frm_tokens(tokens));
        }
        tokens.shift();
        return L
    }
    else if(token == ")")
    {
        console.log("Unexpected Syntax");
	return;
    }
    else
    {
        return atom(token)
    }

}

function atom(token)
{
    x = token;
    if(isNaN(Number(x)) == true)
    {
        return x;
    } 
    else
    {
        return Number(x);
    }
}



/**  Create an environment function in Javascript

    that used for standard functions, keywords and

    operators in the Lisp language             */


var std_env = function(env)
{

Object.assign(env,{
        'sin':Math.sin,
        'cos':Math.cos,
        'tan':Math.tan,
        'pi':3.1415926,
        'abs':Math.abs,
        'sqrt':Math.sqrt,
        'min':Math.min,
        'max':Math.max,
        'log':Math.log,
        'pow':Math.pow,
        'sqr':sqr,
        '+':add,
        '-':sub,
        '*':mul,
        '/':div,
        '<':les,
        '>':grt,
        '<=':leseq,
        '>=':grteq,
        '=':eql,
        'list':Array,
        'append':add,
        'begin':beg,
        'car':head,
        'equal?':eql,
        'cdr':tail,
        'cons':link,
        'not':not
        });


function add(a,b)
{
    return a+b;
}
function sub(a,b)
{
    return a-b;
}
function mul(a,b)
{

    return a*b;
}

function div(a,b)
{

    return a/b;
}

function les(a,b)
{

    return a < b;
}

function grt(a,b)
{

    return a > b;
}

function leseq(a,b)
{

    return a <= b;
}

function grteq(a,b)
{

    return a >= b;
}

function eql(a,b)
{

    return a == b;
}
function sqr(a)
{
    return a*a;
}
function beg(x)
{
    return x;
}
function head(x)
{
    return x[0];
}
function tail(x)
{
    return x.slice(1);
}
function not(x)
{
    return !(x)
}
function link(x,y)
{
    y.unshift(x);
    return y;
}
return env;
}





/** More complex environment fumction that support

    user defined functions and recursion        */


function new_env(env)
{
    var init_env={};
    var global=env.globl||{};
    if(env.parms.length !== 0)
    {
        var i;
        for(i=0;i<env.parms.length;i++)
        {
            init_env[env.parms[i]]=env.args[i];
        }
    }
    function get_glob()
    {
        return global;
    }
    function find_env(vars)
    {
        if (init_env.hasOwnProperty(vars))
        {
            return init_env;
        }    
        else 
        {
            return global.find_env(vars);
        }
    }
    init_env.find_env=find_env;
    init_env.get_glob=get_glob;
    return init_env;
}
var global_env=std_env(new_env({parms:[],args:[],globl:undefined}))



/** Evaluating the resultant program and produces 

    the output. This is the final phase of program */


var Eval = function(x,env)
{
    env = env || global_env    
    if(typeof(x) === 'number')
    {
        return x;
    }
    else if(typeof(x) === 'string')
    {
        return env.find_env(x.valueOf())[x.valueOf()];
    }
    else if(typeof(x) === 'object')
    {
        if(typeof(env[x[0]]) === 'function')
        {
            var l = 1;
            var proc = Eval(x[0],env);
            var args = [];
            while(x[l] != undefined)
            {
                args.push(Eval(x[l],env));
                l += 1;
            }
            return proc.apply(this,args);
        }
        else if(x[0]==='if')
        {
            var[test,c1,c2]=x.slice(1);
            if(Eval(test,env) == true)
            {
                return Eval(c1,env);
            }
            else
            {
                return Eval(c2,env);
            }
        }
        else if(x[0] === 'define')
        {
            
            name= x[1];
            exp = x[2];
            E = Eval(exp,env);
            env[name] = E;
        }    
        else if(x[0]==='lambda')
        {
            var [parm,exp]=x.slice(1)
            return function ()
            {
                return Eval(exp,new_env({parms:parm,args:arguments,globl:env}))
            }
        }
        else
        {
            var arg_list=[]
            for(i=0;i<x.length;i+=1)
            {
                arg_list[i]=Eval(x[i],env);
            }
            var proc=arg_list.shift()
            return proc.apply(env,arg_list);
        }
    }
}



// <------------------------------------------------------------------>




                        //Test cases:



//console.log(Eval(parse("(begin(* 5 6))")));

//pg1 = "(define r 10)";
//pg2 = "(if (< r 10) (* 2 r) (* r r)) "
//Eval(parse(pg1));
//console.log(Eval(parse(pg2)));

//Eval(parse("(define r 10)"));
//console.log(Eval(parse("(* pi (* r r))")))

program = "(define fact (lambda (x) ( if(= x 1) 1 (* x (fact (- x 1))))))"
Eval(parse(program))
console.log(Eval(parse('(fact 8)')))
