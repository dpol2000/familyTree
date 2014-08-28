The familyTree library lets you build a family tree dynamically in your browser using Javascript only.

<h2>Features</h2>

You will need the <a href="http://raphaeljs.com/">Raphaёl</a> library to draw the tree.

So far the following constrains exist:
    
* the tree is drawn from top to bottom only
* a person can only have one partner
* you cannot change the order of nodes of the tree

<h2>How it works</h2>

The key concept in drawing the tree is a *generation*. All the persons are sorted accoriding to their generations in order to be drawn correctly.

Persons which don't have any connection to other persons are designated as *singletons* and are drawn at the bottom in a line.

To make the tree view more compact all the generations are centered, i.e. all the nodes are drawn as close to the center as possible.

<h2>Usage</h2>

Initialization is very simple:

    var ft = new familyTree(persons, settings);

Here, *persons* is an array of objects. The order isn't of much importance, since the library will sort them anyway.

Each object may contain any attributes, but some names are hardcoded and, if used, must be used in the following fashion:

* *gender*: must be 'M' for male and 'F' for female
* *partner*: the partner object
* *father*: the father object
* *mother*: the mother object

Other fields may include first name, last name, date of birth and so on (see the Example page).

You don't have to set the partnership from both sides, i.e., if *a.partner = b*, then *b.partner* will be set to *a*.

Note that you don't have to specify children or siblings: information about parents is enough to build the tree.

Both parents must be present!

*settings* is an object which sets properties for all the tree. You can use the following attributes:


<table>
    <tr>
        <td>*color*</td><td>color of the text (a string). Default value: '#111'</td>
    </tr>
    <tr>
        <td>*fillColor*</td><td>fill color of a node that represents a person whose gender is not set (a string). Default value: ''#eee'</td>
    </tr>
    <tr>
        <td>*femaleFillColor*</td><td>fill color of a node that represents a female person (a string). Default value: ''#aae'</td>
    </tr>
    <tr>        
        <td>*maleFillColor*</td><td>fill color of a node that represents a male person (a string). Default value: '#eaa'</td>
    </tr>
    <tr>        
        <td>*strokeColor*</td><td>stroke color of a node (a string). Default value: '#999' </td>
    </tr>
    <tr>        
        <td>*strokeWidth*</td><td>width of lines connecting nodes (a number), in pixels. Default value: 2 </td>
    </tr>
    <tr>        
        <td>*mouseoverColor*</td><td>color to fill the node when it has the mouseover event (a string). Default value: '#ddd'</td>
    </tr>
    <tr>        
        <td>*width*</td><td>width of any node (a number). Default value: 100</td>
    </tr>
    <tr>        
        <td>*height*</td><td>height of any node (a number). Default value: 100</td>
    </tr>
    <tr>        
        <td>*startX*</td><td>the top coordinate of the canvas (a number). Default value: 150</td>
    </tr>
    <tr>        
        <td>*startY*</td><td>the left coordinate of the canvas (a number). Default value: 150</td>
    </tr>
    <tr>        
        <td>*vDistance*</td><td>vertical distance between nodes (a number). Default value: 100</td>
    </tr>
    <tr>
        <td>*hDistance*</td><td>horizontal distance bwtween nodes (a number). Default value: 100</td>
    </tr>
    <tr>
    <tr>        
        <td>*fontSize*</td><td>font size of the text inside a node (a string), pt. Default value: '14'</td>
    </tr>
        <td>*onClick*</td><td>a callback function, fires up when a node is clicked on. No default value.</td>
    </tr>
    <tr>
        <td>*getText*</td><td>a callback function, returns a text for each node. No default value.</td>
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
    <tr>
        <td>*singletons*</td><td>a one-dimensional array of persons.
    </tr>
</table>

Each person has a *node* attribute, which is an object with two fields: *node* and *text*. Both are Raphaёl objects.

You can use all this to change the tree nodes directly.

In order to sprecify the text that you want to see inside the nodes, use the *getText* callback function (see the Example).

<h2>Contribution</h2>

Any help is appreciated. Feel free to create issues and send pull requests.

<h2>Lisence and copyright</h2>

Copyright (c) 2014 Dmitry Polinichenko

MIT license, see license.txt.

<h2>Other</h2>

If this library doesn't satisfy your needs, check out Chandler Prall's <a href="http://www.chandlerprall.com/2011/05/my-family-tree/">FamilyTreeJS.</a>