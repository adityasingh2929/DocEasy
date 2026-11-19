import json
from pathlib import Path
root=Path(__file__).parent
concepts=json.loads((root/'frontend/src/data/concepts.json').read_text(encoding='utf-8'))
bank=json.loads((root/'frontend/src/data/practice-bank.json').read_text(encoding='utf-8'))
# Each item provides a lesson, five distinct questions, and an executable challenge.
lessons=[
('python-basics','Python Values and Names','Python names refer to objects. Assignment binds a name to a value; it does not declare a permanently fixed type. Use clear names and convert input deliberately.', ['Numbers include int and float; strings hold text.','True, False and None are case-sensitive Python literals.','The / operator divides; // performs floor division.'], 'name = "Ada"\nscore = 7\nscore += 2\nprint(name, score)\nprint(7 // 2)\nprint(type(score).__name__)', 'Ada 9\n3\nint', 'introduction.html', [
('Which assignment stores an integer?',['score = 7','score = "7"','score = [7]','score = None'],'The unquoted literal 7 is an integer.'),
('What is 7 // 2?',['3','3.5','4','2'],'Floor division returns the floor of the quotient.'),
('Which is a Python boolean literal?',['True','true','TRUE','yes'],'Python uses True and False with initial capitals.'),
('What does int("12") produce?',['12','"12"','None','TypeError'],'int converts a valid integer string into an integer.'),
('What does x = 3 followed by x += 2 store in x?',['5','3','2','32'],'Augmented assignment adds two to the existing integer.')]),
('python-control','Python Conditions and Loops','Control flow chooses which operations run. Python uses indentation to group a block. A for loop visits iterable values, while a while loop repeats as long as a condition is true.', ['Use if, elif and else for mutually exclusive choices.','range(start, stop) excludes the stop value.','break ends a loop; continue skips to the next iteration.'], 'total = 0\nfor n in range(1, 5):\n    if n == 2:\n        continue\n    total += n\nprint(total)\nprint("done")', '8\ndone', 'controlflow.html', [
('How many values does range(4) produce?',['4','3','5','0'],'It yields 0, 1, 2 and 3.'),
('Which keyword skips the rest of a loop iteration?',['continue','break','returnall','skip'],'continue moves to the next iteration.'),
('How does Python delimit most statement blocks?',['Indentation','Curly braces','Semicolons','Parentheses'],'Consistent indentation groups statements into suites.'),
('Which keyword adds another condition after if?',['elif','elseif','else if','when'],'elif introduces an additional conditional branch.'),
('What does break do?',['Exits the nearest loop','Exits every program','Repeats the current step','Skips one expression'],'break exits its containing loop.')]),

('python-strings','Strings and Formatting','Strings are immutable sequences of Unicode characters. Indexing selects one character and slicing creates a new string. String methods return new values rather than changing the original.', ['Indexing starts at zero; negative indexes count from the end.','A slice includes its start and excludes its stop.','Use f-strings to insert expressions into readable text.'], 'name = "Python"\nprint(name[0], name[-1])\nprint(name[1:4])\nprint(f"{name.upper()} has {len(name)} letters")', 'P n\nyth\nPYTHON has 6 letters', 'introduction.html#strings', [
('What does "Python"[1:4] produce?',['yth','Pyt','ytho','thon'],'The stop index is excluded, so positions 1, 2 and 3 are selected.'),
('Which expression produces "Hello Ada"?',['f"Hello {name}"','"Hello {name}"','"Hello" - name','name.format("Hello")'],'An f-string evaluates expressions inside braces when name is Ada.'),
('What does "abc".upper() return?',['ABC','abc','Abc','None'],'upper returns a new uppercase string.'),
('What happens when you assign text[0] = "X" for a string?',['TypeError','The first character changes','A new list is created','Nothing'],'Strings cannot be modified through item assignment.'),
('What is len("Python")?',['6','5','7','0'],'len counts the six characters in this string.')]),
('python-collections','Lists, Tuples and Sets','Choose a collection by the operations you need. Lists keep order and allow changes, tuples describe fixed sequences, and sets store distinct hashable values without a positional index.', ['append changes a list and returns None.','A shallow copy gives a new outer list but shares nested objects.','Use a set for membership and uniqueness; do not depend on its iteration order.'], 'scores = [3, 1, 3]\nscores.append(5)\nprint(len(scores))\nprint(sorted(set(scores)))\nfirst, second = (10, 20)\nprint(first + second)', '4\n[1, 3, 5]\n30', 'datastructures.html', [
('Which collection removes duplicate hashable values?',['set','list','tuple','str'],'A set contains distinct hashable elements.'),
('What does items.append(4) return?',['None','4','The new list','True'],'append mutates the list and returns None.'),
('Which creates a one-element tuple?',['(4,)','(4)','[4]','{4}'],'The comma makes it a tuple.'),
('What does [10, 20, 30][-1] return?',['30','10','20','IndexError'],'A negative index counts from the end.'),
('Which expression makes a shallow copy of items?',['items.copy()','items','items = items','copy = None'],'copy creates a new outer list.')]),
('python-dictionaries','Dictionaries and Data Modelling','A dictionary maps unique hashable keys to values. Use descriptive keys to represent records and use get when missing data is an expected case.', ['Square-bracket lookup raises KeyError for a missing key.','get(key, default) returns the default when the key is absent.','items() yields key-value pairs; membership tests keys.'], 'student = {"name": "Mira", "score": 4}\nstudent["score"] += 1\nprint(student["name"], student["score"])\nprint(student.get("level", "beginner"))\nprint("name" in student)', 'Mira 5\nbeginner\nTrue', 'datastructures.html#dictionaries', [
('What does "name" in student test for a dictionary?',['Whether name is a key','Whether name is a value','Whether name is an attribute','Whether the dictionary is sorted'],'Dictionary membership tests keys.'),
('What happens when d["missing"] accesses an absent key?',['KeyError','None','False','An empty string'],'Square-bracket lookup requires the key to exist.'),
('What is {}.get("count", 0)?',['0','None','KeyError','False'],'The second argument supplies a default for missing keys.'),
('Which method yields key-value pairs?',['items()','keys()','values()','pairs()'],'items provides pairs suitable for unpacking in a loop.'),
('Which value can be a dictionary key?',['A string','A list','A dictionary','A set'],'Strings are immutable and hashable.')]),
('python-functions','Functions and Scope','Functions name a reusable operation. Parameters receive arguments; return sends a value to the caller. Variables assigned inside a function are usually local to that function.', ['A function without an explicit return returns None.','Defaults are evaluated when the function is defined; avoid mutable defaults for per-call state.','Keyword arguments make calls easier to read.'], 'def total(price, quantity=2):\n    return price * quantity\n\nprint(total(5))\nprint(total(quantity=3, price=4))\nprint(total(2, 1))', '10\n12\n2', 'controlflow.html#defining-functions', [
('What does a function return without an explicit return?',['None','0','False','An empty string'],'Reaching the end of a function returns None.'),
('When are default argument values evaluated?',['When the function is defined','On every call','When Python exits','After the first return'],'Default objects are created at definition time.'),
('Which keyword sends a result to the caller?',['return','print','yieldfrom','result'],'return ends the call and supplies its value.'),
('For def double(x): return x * 2, what is double(4)?',['8','4','2','None'],'The return expression multiplies the input by two.'),
('Where is a variable assigned inside a function normally stored?',['In the function local scope','In every module','Only in the caller','In the builtins module'],'Assignments normally create local names unless declared global or nonlocal.')]),
('python-comprehensions','Comprehensions and Iteration','A comprehension describes a new collection using an expression, an iteration, and an optional filter. Keep it short enough that the transformation is clear.', ['Read the for clause and filter before evaluating the expression.','range excludes its stop value.','enumerate supplies an index and a value; zip pairs items until the shortest input ends.'], 'values = [1, 2, 3, 4]\nsquares = [x * x for x in values if x % 2 == 0]\nprint(squares)\nfor index, name in enumerate(["Ada", "Lin"], start=1):\n    print(index, name)', '[4, 16]\n1 Ada\n2 Lin', 'datastructures.html#list-comprehensions', [
('What is [x * 2 for x in range(3)]?',['[0, 2, 4]','[2, 4, 6]','[0, 1, 2]','[0, 2, 4, 6]'],'range(3) yields zero, one and two.'),
('Which clause filters elements in a list comprehension?',['if','where','filterby','when'],'An optional if clause decides which items are included.'),
('What does enumerate provide?',['Index-value pairs','Only values','Only keys','Sorted values'],'enumerate pairs a counter with each item.'),
('How many pairs does zip([1,2], [3]) yield by default?',['1','2','3','0'],'zip stops at the shortest iterable.'),
('What is [n for n in [1,2,3] if n > 1]?',['[2, 3]','[1]','[1, 2, 3]','[3]'],'Only two and three satisfy the filter.')]),
('python-errors','Exceptions and Validation','Exceptions report operations that could not complete. Catch the specific failure you expect, provide a useful response, and let unexpected failures remain visible.', ['ValueError often means a valid type has an inappropriate value.','Use try and except around the operation that may fail.','finally runs when control leaves the try statement, including after a handled error.'], 'try:\n    number = int("four")\nexcept ValueError:\n    print("Enter digits")\nfinally:\n    print("Checked")', 'Enter digits\nChecked', 'errors.html', [
('Which exception does int("hello") raise?',['ValueError','KeyError','IndexError','NameError'],'The string is not a valid integer representation.'),
('Which block handles an expected exception?',['except','finally','elsewhere','handle'],'except matches and handles an exception type.'),
('Which keyword explicitly signals an exception?',['raise','throw','error','catch'],'raise signals a Python exception.'),
('When does the else block on try run?',['When try finishes without an exception','Only when an exception occurs','Before try','Only after finally'],'The else clause runs when the try suite raises no exception.'),
('Why prefer except ValueError to a bare except?',['It avoids hiding unrelated failures','It catches more errors','It prevents all crashes','It deletes the error'],'A narrow handler handles only the expected category of failure.')]),
('python-files','Files and JSON','Files store information beyond a single process. Open text files with an explicit encoding and a context manager. JSON represents simple interoperable data such as objects, arrays, strings and numbers.', ['with closes a file when its block exits.','Use r to read, w to replace contents, and a to append.','json.dumps produces a JSON string; json.loads parses one.'], 'import json\ntext = \'{"course": "Python", "scores": [4, 5]}\'\nrecord = json.loads(text)\nprint(record["course"])\nprint(sum(record["scores"]))\nprint(json.dumps({"passed": True}))', 'Python\n9\n{"passed": true}', 'inputoutput.html#reading-and-writing-files', [
('Why open files with a with statement?',['It closes the file when the block exits','It encrypts all contents','It prevents invalid JSON','It always appends'],'The context manager handles cleanup even when an exception occurs.'),
('What does opening an existing file in w mode do?',['Truncates its contents','Appends only','Makes it read-only','Leaves all contents unchanged'],'Write mode replaces the existing contents.'),
('Which function parses a JSON string?',['json.loads','json.dumps','json.open','json.stringify'],'loads deserializes a JSON string.'),
('What Python value results from JSON true?',['True','"true"','1.0','None'],'JSON booleans are decoded as Python bool values.'),
('Which file mode appends text?',['a','r','w','x'],'Append mode writes at the end of the file.')]),
('python-modules','Modules and Program Structure','A module is a Python file that groups related definitions. Import it to reuse those definitions and keep executable entry-point behavior separate from reusable code.', ['import module keeps names grouped under the module name.','from module import name imports one name into the current namespace.','The __name__ guard distinguishes direct execution from import.'], 'import math\nfrom pathlib import PurePosixPath\nprint(math.isqrt(20))\nprint(PurePosixPath("notes/lesson.txt").suffix)\nprint(__name__ == "__main__")', '4\n.txt\nTrue', 'modules.html', [
('After import math, how do you call its square-root function?',['math.sqrt(9)','sqrt.math(9)','math(9)','import.sqrt(9)'],'An imported module exposes attributes through its namespace.'),
('What does if __name__ == "__main__" identify?',['Direct execution of the module','Every import of the module','An installed package','A syntax error'],'Python uses __main__ as the name of the entry module.'),
('Which statement imports sqrt directly?',['from math import sqrt','import sqrt from math','using math.sqrt','require math.sqrt'],'The from-import syntax imports the named attribute.'),
('Why split a project into modules?',['To group related responsibilities','To avoid all exceptions','To hide syntax errors','To run every function automatically'],'Modules help organize and reuse related code.'),
('What does math.isqrt(20) return?',['4','5','4.5','20'],'isqrt gives the integer floor of the exact square root.')]),
('python-classes','Classes and Objects','A class defines a kind of object with state and behavior. Each instance can keep its own attributes, while methods provide operations on that state.', ['self refers to the instance on which a method is called.','__init__ initializes a newly created instance.','Keep per-instance mutable data on self rather than a shared class attribute.'], 'class Counter:\n    def __init__(self):\n        self.value = 0\n    def increment(self):\n        self.value += 1\n\na = Counter()\nb = Counter()\na.increment()\na.increment()\nprint(a.value, b.value)', '2 0', 'classes.html', [
('What does self conventionally refer to in an instance method?',['The current instance','The parent module','Every object','The class name string'],'The bound instance is passed as the first argument.'),
('Which method initializes instance attributes?',['__init__','__start__','constructor','initObject'],'__init__ runs to initialize a newly created instance.'),
('Where should an instance keep its own list of items?',['self.items = [] inside __init__','items = [] in the class body','In every other object','In the builtins module'],'An instance attribute avoids sharing the same mutable list across instances.'),
('What does Counter() usually create?',['A new instance','A module','A string','A function import'],'Calling a class constructs an instance.'),
('If a.value changes, must b.value change too?',['No, distinct instance attributes are independent','Yes, always','Only for integers','Only after print'],'Separate objects can store independent instance attributes.')]),
]
for slug,title,explanation,points,code,output,source,questions in lessons:
    sources=[dict(title='Python tutorial: '+title,url='https://docs.python.org/3/tutorial/'+source,kind='curated reference')]
    concept=dict(id=slug,title=title,explanation=explanation,points=points,example=code,sections=[dict(title='Trace the example',text='Expected output:\n'+output),dict(title='Try a variation',text='Change one input or operation in the example. Predict the new result before running it, and explain which rule accounts for the difference.')])
    concepts=[item for item in concepts if item['id']!=slug]+[concept]
    qs=[]
    for index,(question,options,explanation_q) in enumerate(questions,1):
        qs.append(dict(id=f'{slug}-q{index}',topic=slug,question=question,options=options,correctAnswer=options[0],explanation=explanation_q,hints=['Identify the operation and the values involved.',explanation_q],sources=sources,origin='reviewed'))
    bank['topics'][slug]=dict(sources=sources,questions=qs,challenges=[dict(id=slug+'-c1',topic=slug,language='python',question='Predict the output. Enter one line per print call.',code=code,correctAnswer=output,explanation='Trace each statement in order. '+points[0],hints=['Write down the values after each assignment.','Check the expression in each print call, in order.'],sources=sources,origin='reviewed')])
for slug in ['python-basics','python-control']:
    for c in bank['topics'][slug]['challenges']: c['language']='python'
for path in ['frontend/src/data/concepts.json','backend/data/concepts.json']:
    (root/path).write_text(json.dumps(concepts,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
for path in ['frontend/src/data/practice-bank.json','backend/data/practice_bank.json']:
    (root/path).write_text(json.dumps(bank,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
topics=root/'frontend/src/data/topics.js'
s=topics.read_text(encoding='utf-8')
marker="    { id: 'python-control', title: 'Python Conditions and Loops', reviewedOnly: true },"
addition='\n'.join("    { id: '%s', title: '%s', reviewedOnly: true },"%(slug,title) for slug,title,*_ in lessons if slug not in ('python-basics','python-control'))
if "id: 'python-strings'" not in s: s=s.replace(marker,marker+'\n'+addition)
topics.write_text(s,encoding='utf-8')
print('Python curriculum:',len(lessons),'lessons')
