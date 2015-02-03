The familyTree library lets you build a family tree dynamically in your browser using Javascript only.

<h2>Features</h2>

You will need the <a href="http://raphaeljs.com/">Raphaёl</a> library to draw the tree.

So far the following constrains exist:
    
* the tree is drawn from top to bottom only
* you cannot change the order of nodes of the tree

The tree supports multiple partners. However, only one spouse (the last in the array of partners by default) is shown on the foreground, while the others are shown on the background. To view another spouse, just click on the background node.

<h2>How it works</h2>

The key concept in drawing the tree is a *generation*. All the persons are sorted according to their generations in order to be drawn correctly.

Persons which don't have any connection to other persons in the tree are not shown.

To make the tree view more compact all the generations are centered, i.e. all the nodes are drawn as close to the center as possible.

<h2>Usage</h2>

Initialization is very simple:

    var ft = new familyTree(persons, settings);

Here, *persons* is an array of objects. The order isn't of much importance, since the library will sort them anyway.

Each object may contain any attributes, but some names are hardcoded and, if used, must be used in the following fashion:

* *gender*: 'male' or 'female', but can be omitted
* *partners*: the partners array
* *father*: the father object
* *mother*: the mother object

Other fields may include first name, last name, date of birth and so on (see the Example page).

You don't have to set the partnership from both sides, i.e., if *a.partners = [b, c]*, then *b.partners* and *c.partners* will be set to *[a]*. The order in which the partners are stored, is up to you.
Important: a partner object isn't just a person object, it has the following structure:

* *person*: a person object, the partner himself/herself 
* *from*: the date of the beggining of the partnership
* *to*: the date of the end of the partnership

You can omit the *from* and *to*, but the *person* must be present.

You can set persons' partners and parents both as objects and id's. For example, if *a.id = 1*, then *b.father = a* and *b.father = 1* mean the same. The id field must be an integer. It may be more convenient to use id's when you load persons information from the server.

Note that you don't have to specify children or siblings: information about parents is enough to build the tree.

Remember, both parents must be present in order to tree to be drawn correctly!

*settings* is an object which sets properties for all the tree. You can use the following attributes:

<table>
    <tr>
        <td>color</td><td>color of the text (a string). Default value: '#111'</td>
    </tr>
    <tr>
        <td>fillColor</td><td>fill color of a node that represents a person whose gender is not set (a string). Default value: ''#eee'</td>
    </tr>
    <tr>        
        <td>maleFillColor</td><td>fill color of a node that represents a male person (a string). Default value: '#57aaf7'</td>
    </tr>
    <tr>
        <td>femaleFillColor</td><td>fill color of a node that represents a female person (a string). Default value: ''#f2bbc4'</td>
    </tr>
    <tr>        
        <td>strokeColor</td><td>stroke color of a node (a string). Default value: '#999' </td>
    </tr>
    <tr>        
        <td>maleBorderColor</td><td>border color of a node that represents a male person (a string). Default value: '#F00' </td>
    </tr>
    <tr>        
        <td>femaleBorderColor</td><td>border color of a node that represents a female person (a string). Default value: '#00F' </td>
    </tr>
    <tr>        
        <td>strokeWidth</td><td>width of lines connecting nodes (a number), in pixels. Default value: 2 </td>
    </tr>
    <tr>        
        <td>mouseoverColor</td><td>color to fill the node when it has the mouseover event (a string). Default value: '#ddd'</td>
    </tr>
    <tr>        
        <td>mouseoverMaleBorderColor</td><td>color of a male node's border when it has the mouseover event (a string). Default value: '#000'</td>
    </tr>
    <tr>        
        <td>mouseoverFemaleBorderColor</td><td>color of a female node's border when it has the mouseover event (a string). Default value: '#000'</td>
    </tr>
    <tr>        
        <td>width</td><td>width of any node (a number). Default value: 100</td>
    </tr>
    <tr>        
        <td>height</td><td>height of any node (a number). Default value: 100</td>
    </tr>
    <tr>        
        <td>radius</td><td>radius for rounded corners (a number). Default value: 20</td>
    </tr>
    <tr>        
        <td>blur</td><td>a property for imitation a kind of 3D image (a boolean) by setting the blur property of the rectangle's border. Default value: false</td>
    </tr>
    <tr>        
        <td>startX</td><td>the top coordinate of the canvas (a number). Default value: 150</td>
    </tr>
    <tr>        
        <td>startY</td><td>the left coordinate of the canvas (a number). Default value: 150</td>
    </tr>
    <tr>        
        <td>vDistance</td><td>vertical distance between nodes (a number). Default value: 100</td>
    </tr>
    <tr>
        <td>hDistance</td><td>horizontal distance bwtween nodes (a number). Default value: 100</td>
    </tr>
    <tr>        
        <td>fontSize</td><td>font size of the text inside a node (a string), pt. Default value: '14'</td>
    </tr>
        <td>onClick</td><td>a callback function, fires up when a node is clicked on. No default value.</td>
    </tr>
    <tr>
        <td>getText</td><td>a callback function, returns a text for each node. No default value.</td>
    </tr>
    <tr>
        <td>active_person</td><td>a person that must be shown on a tree (a person object). Default value: null.</td>
    </tr>
    <tr>
        <td>active_partner</td><td>the active partner of a person that must be shown on a tree (a person object).  Default value: null.</td>
    </tr>
    <tr>
</table>

After initialization use the *show()* method to draw the tree:
    
    ft.show();

There are the following methods available:

<table>
    <tr>
        <td>*show()*</td><td>draws a tree.</td>
    </tr>
    <tr>
        <td>*append(person)*</td><td>appends a person or an array of persons to the tree. Use *show()* to redraw the tree.</td>
    </tr>    
    <tr>
        <td>*remove(person)*</td><td>removes a person or an array of persons from the tree. Use *show()* to redraw the tree.</td>
    </tr>
    <tr>
        <td>*hide()*</td><td>hides a tree by removing all graphical objects.</td>
    </tr>
</table>

After initialization and drawing you also have access to the following members: 

<table>
    <tr>
        <td>*canvas*</td><td>a Raphaёl canvas object.</td>
    </tr>
    <tr>    
        <td>*generations*</td><td>a two-dimensional array of persons, according to their generations.
    </tr>
</table>

Each person has a *node* attribute, which is an object with two fields: *node* and *text*. Both are Raphaёl objects.

You can use all this to change the tree nodes directly.

In order to sprecify the text that you want to see inside the nodes, use the *getText* callback function (see the Example).

<h2>Contribution</h2>

Any help is appreciated. Feel free to create issues and send pull requests.

<h2>Lisence and copyright</h2>

Copyright (c) 2015 Dmitry Polinichenko

MIT license, see license.txt.

<h2>Other</h2>

If this library doesn't satisfy your needs, please check out Chandler Prall's <a href="http://www.chandlerprall.com/2011/05/my-family-tree/">FamilyTreeJS.</a>