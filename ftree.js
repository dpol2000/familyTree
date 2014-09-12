// FamilyTree Javascript library v.1.0.

function familyTree(persons, settings) {

    // thanks to Daniel James for this piece of code for IE < 9; see http://stackoverflow.com/a/144172
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, fromIndex) {
            if (fromIndex == null) {
                fromIndex = 0;
            } else if (fromIndex < 0) {
                fromIndex = Math.max(0, this.length + fromIndex);
            }
            for (var i = fromIndex, j = this.length; i < j; i++) {
                if (this[i] === obj)
                    return i;
            }
            return -1;
        };
    }
    
    // we need this trick to see if something is an array or not
    Array.prototype.isArray = true;
    
    // default settings
    var defaultColor = '#111',
        defaultFillColor = '#eee',
        defaultFemaleFillColor = 'aae',
        defaultMaleFillColor = '#eaa',    
        defaultStrokeColor = '#999',
        defaultStrokeWidth = 2,
        defaultMouseoverColor = '#ddd',
        defaultStartX = 100,
        defaultStartY = 100,
        defaultWidth = 150,
        defaultHeight = 150,
        defaultVDistance = 100,
        defaultHDistance = 100,
        defaultFontSize = '14';

    this.generations = [];
    this.singletons = [];

    // converting id's to object pointers
    for (var i=0; i!=persons.length; i++) {
        checkRelations(persons[i], persons);
    }

    // check data integrity
    for (var i=0; i!=persons.length; i++) {
        if ((persons[i].partner) || (persons.indexOf(persons[i].partner) !== -1)) {
            
            if (persons[i].partner.partner !== persons[i]) {
                persons[i].partner.partner = persons[i];
            }    
        }
    }

    var sortedPersons = sort(persons);
    
    if (!sortedPersons)
        return false;
    
    this.generations = sortedPersons.generations;
    this.singletons = sortedPersons.singletons;
    
    // if there are no persons to show, return -1
    if  (this.generations.length === 0) {
       return false;
    }
    
    // set up user or default settings
    this.color = settings.color || defaultColor;
    this.fillColor = settings.fillColor || defaultFillColor;
    this.femaleFillColor = settings.femaleFillColor || defaultFemaleFillColor;
    this.maleFillColor = settings.maleFillColor || defaultMaleFillColor;
    this.strokeColor = settings.strokeColor || defaultStrokeColor;
    this.strokeWidth = settings.strokeWidth || defaultStrokeWidth;
    this.mouseoverColor = settings.mouseoverColor || defaultMouseoverColor;
    this.width = settings.width || defaultWidth;
    this.height = settings.height || defaultHeight;
    this.startX = settings.startX || defaultStartX;
    this.startY = settings.startY || defaultStartY;
    this.fontSize = settings.fontSize || defaultFontSize;
    this.vDistance = settings.vDistance || defaultVDistance;
    this.hDistance = settings.hDistance || defaultHDistance;
    this.onClick = settings.onClick || function(){};
    this.getText = settings.getText;
    

    this.canvas = null;
    
    // set the onmouseover and onmouseout event handlers
    var femaleColor = this.femaleFillColor;
    var maleColor = this.maleFillColor;
    var fillColor = this.fillColor;
    var mouseoverColor = this.mouseoverColor;
    
    this.onmouseover = function() { this.data.node.attr({fill: mouseoverColor}); };
    this.onmouseout = function() { 
        switch (this.data.person.gender) {
        case 'M':
            this.data.node.attr({fill: maleColor});
            break;
        case 'F':
            this.data.node.attr({fill: femaleColor});
            break;
        default:
            this.data.node.attr({fill: fillColor});
        }
    };
    
    // public methods
    
    // hide a tree
    this.hide = function() {
        if (this.canvas) {
            this.canvas.remove();
            
            for (var i=0; i!=this.generations.length; i++) {
                for (var j=0; j!=this.generations[i].length; j++) {
                    if (this.generations[i][j].node) {
                        this.generations[i][j].node.node.remove();
                        this.generations[i][j].node.text.remove();
                    }
                }
            }

            for (var i=0; i!=this.singletons.length; i++) {        
                if (this.singletons[i].node) {
                    this.singletons[i].node.node.remove();
                    this.singletons[i].node.text.remove();
                }
            }
        }
    };
    
    // remove a person or a list of persons from the tree
    this.remove = function(persons) {

        // check if the argument is valid
        if (!persons) {
            console.log('trying to remove undefined or null');
            return 0;
        }
        
        // get a one-dimension array of all persons
        var all_persons = unSort.call(this);
        
         // check if the agrument is an array and it is not empty
        if (persons.isArray) {
            if (persons.length === 0) {
                console.log('trying to remove an empty array');
                return 0;
            } 
        }
        else {
            // make an array from one person
            persons = [persons];
        }

        var index, 
        counter = 0;
            
        // remove all the persons from array
        for (var i=0; i!=persons.length; i++) {
            index = all_persons.indexOf(persons[i]);
            // if the person is found, remove him/her from the array
            if (index !== -1) {
                all_persons.splice(index, 1);  
                counter++;
            } else {
                console.log('trying to remove a non-existing person');
            }
        }
        
        // sort the array
        var sortedPersons = sort(all_persons);
    
        // save sorted persons to generations
        this.generations = sortedPersons.generations;
        this.singletons = sortedPersons.singletons;
        
        return counter; 
        
    }
    
    // append a person or a set of persons to the tree
    this.append = function(persons) {
        
        // check if the argument is valid
        if (!persons) {
            console.log('trying to append undefined or null');
            return 0;
        }
        
        // get a one-dimension array of persons
        var all_persons = unSort.call(this);
        
        // check if the agrument is an array and it is not empty
        if (persons.isArray) {
            if (persons.length === 0) {
                console.log('trying to append an empty array');
                return 0;
            }
        } else {
            // make an array from one person
            persons = [persons];
        }

        // append all the persons from the array
        for (var i=0; i!=persons.length; i++) {
            all_persons.push(persons[i]);
        }
        
        // sort the array 
        var sortedPersons = sort(all_persons);
    
        // save sorted persons to generations
        this.generations = sortedPersons.generations;
        this.singletons = sortedPersons.singletons;
        
        return persons.length;
    }
    
    
    // show the family tree
    this.show = function () {

        var gen_coords = [],
            max_length = 1,
            generations = this.generations,
            singletons = this.singletons,
            lines,
            cx,
            cy,
            fatherPlace,
            motherPlace,
            parentPlace;

        changePartners.call(this);
        
        
        // find the max length of the ganarations chains in order to know the canvas' width
        for (var i=0; i!=generations.length; i++) {
            if (max_length < generations[i].length) {
                max_length = generations[i].length;
            }
        }

        if (max_length < singletons.length) {
            max_length = singletons.length;
        }
        
        // calculate coordinates of all nodes
        for (var i=0; i!= generations.length; i++) {
            gen_coords[i] = (this.width + this.hDistance)/2 * (max_length - generations[i].length);
        }

        // remove all the existing Raphael objects
        
        if (this.canvas) {
            this.hide();
        }
        
        // set up the canvas
        this.canvas = Raphael(
            this.startX, 
            this.startY, 
            max_length * (this.width + this.hDistance), 
            (generations.length + 1) * (this.height + this.vDistance)
        );
        
        //  draw all nodes and their connections from generations

        var connectedPartners = [];
        
        // loop through the generations
        for (var i=0; i!=generations.length; i++) {

            // draw all the nodes from current generation
            for (var j=0; j!= generations[i].length; j++) {
                
                // draw the node
                
                // absolute x nad y coordinates of the node
                cx = gen_coords[i] + j * (this.width + this.hDistance);
                cy = i * (this.height + this.vDistance);

                this.generations[i][j].node = addNode.call(
                    this,
                    cx, 
                    cy, 
                    this.width, 
                    this.height, 
                    this.generations[i][j], 
                    ''
                );
                
                // set mouse event handlers for the node
                generations[i][j].node.node.mouseover(this.onmouseover);
                generations[i][j].node.node.mouseout(this.onmouseout);
                generations[i][j].node.text.mouseover(this.onmouseover);
                generations[i][j].node.text.mouseout(this.onmouseout);
                
                // draw connection to the partner
                if (generations[i][j].partner) {
                    
                    // if a partner is to the right
                    if (getPlace(generations[i][j].partner, generations) > j) {
                        // a line to connect
                        lines = 'M ' + (cx + this.width) + ' ' + (cy + this.height/2) + ' h ' + this.hDistance;
                    }

                    this.canvas.path(lines).attr({"stroke-width": this.strokeWidth}).attr({"stroke": this.strokeColor});
                    
                }

                // draw connection to parents
                if (generations[i][j].father) {

                    // a vertical line
                    lines = 'M ' + (cx + this.width/2) + ' ' + cy + ' v -' + this.vDistance/2;

                    // get parents' places in generations    
                    fatherPlace = getPlace(generations[i][j].father, generations);
                    motherPlace = getPlace(generations[i][j].mother, generations);

                    // choose a left parent
                    if (fatherPlace != -1) {
                        if (fatherPlace < motherPlace) {
                            parentPlace = fatherPlace;
                        }
                        else {
                            parentPlace = motherPlace;
                        }
                    }

                    // diagonal lines to the center between the parents
                    lines = lines + ' L ' + (gen_coords[i-1] + (this.width + this.hDistance)*parentPlace + this.width + this.hDistance/2);
                    lines = lines + ' ' + ((i-1) * (this.vDistance + this.height) + this.height);
                    
                    // a vertical line to the center between the parents
                    lines = lines + ' v -' + this.height/2; 

                }

                // set lines width and color
                this.canvas.path(lines).attr({"stroke-width": this.strokeWidth}).attr({"stroke": this.strokeColor});

            }
        }
        
        // draw single nodes 
        var singlesY = this.generations.length * (this.height + this.vDistance);
        
        for (var i=0; i!=this.singletons.length; i++) {

            this.singletons[i].node = addNode.call(
                this,
                (this.width + this.hDistance)  * i,
                singlesY, 
                this.width, 
                this.height, 
                this.singletons[i], 
                ''
            );
            
            // set mouse event handlers for the node
            singletons[i].node.node.mouseover(this.onmouseover);
            singletons[i].node.node.mouseout(this.onmouseout);
            singletons[i].node.text.mouseover(this.onmouseover);
            singletons[i].node.text.mouseout(this.onmouseout);
            
            // draw connection to the partners
            if (singletons[i].partner) {
                if (getPlace(singletons[i].partner, singletons) > i) {
                    lines = 'M ' + ((this.width + this.hDistance)*i + this.width) + ' ' + (singlesY + this.height/2) + ' h ' + this.hDistance;
                }

                // set lines width and color
                path = this.canvas.path(lines);
                path.attr({"stroke-width": this.strokeWidth}).attr({"stroke": this.strokeColor});
            }
        }
        
        /* create a node of the tree
        
        x: left
        y: top
        width: width of the node
        height: height of the node
        person: a person to show information of
        image: an image to show in the centre; not implemented yet!
        
        */
        function addNode(x, y, width, height, person, image) {

            // create a node as a rectangle
            var node = this.canvas.rect(x, y, width, height, 10);

            // create a text inside the node
            var nodeText = this.canvas.text(x + width/2, y + height/2 - 10, this.getText(person));
            
            // set the font size of the text
            nodeText.attr("font-size", this.fontSize);
        
            var color;
            
            // set the color attributes for the node 
            switch (person.gender) {
            case 'M':
                color = this.maleFillColor;
                break;
            case 'F':
                color = this.femaleFillColor;
                break;
            default:
                color = this.fillColor;
            }
                
            node.attr({stroke: this.color, fill: color, translation: "4,4", text: nodeText});
            node.blur(1);

    //        if (image) 
    //           var photo = canvas.image(image, x+40, y+20, 125, 100);

            // set onclick event handlers
            var click = this.onClick;

            node.click(function() { click(person); });
            node.data = {'node': node, 'person': person};
            nodeText.click(function() { click(person); });
            nodeText.data = {'node': node, 'person': person};

            return {'node': node, 'text': nodeText};
        }    

    };
    
    
    // private methods
    
    // return a one-dimension array of all persons
    function unSort() {
        
        var persons = [];
        
        for (var i=0; i!=this.generations.length; i++) {
            for (var j=0; j!=this.generations[i].length; j++) {
                persons.push(this.generations[i][j]);
            }
        }

        for (var i=0; i!=this.singletons.length; i++) {        
            persons.push(this.singletons[i]);            
        }
        
        return persons;
    }
    

    // sort persons into generations
    function sort(persons) {
    
        var generations = [];
        var singletons = [];
        var generation = [];
        
        if (!persons) {
            return false;
        }
        
        if (!persons.isArray) {
            persons = [persons];
        }
        
        if (persons.length === 0) {
            return {'generations': [], 'singletons': []}
        }
        
        if (persons.length === 1) {
            return {'generations': [persons], 'singletons': []};
        }            
        
        // looking for a start person; the one with a father is a good candidate
        for (var i=0; i!=persons.length; i++) {
            if (persons[i].father) {
                break;
            }
        }

        // if there is no such a person, then the first one will be a start person
        if (i === persons.length) {
            var start_person = persons[0];
        } else {
            var start_person = persons[i];
        }
        
        var person = start_person;
        
        // get the oldest father
        while ((person.father) && (persons.indexOf(person.father) !== -1)) { 
            person = person.father;
        }
        
        // append the father to the first generation
        generation.push(person);
        
        // append his partner, if it exists
        if ((person.partner) && (persons.indexOf(person.partner) !== -1))  {
            generation.push(person.partner);
        }
            
        // append the couple as the first generation
        generations.push(generation);
        generation = [];
        
        // get their children
        children = getChildren(person, persons);

        var newChildren,
            children2 = [];
        var child;
       
        // go back through all children
        while (children.length > 0) {
            
            newChildren = []
            // go through this generation's children
            for (var i=0; i!=children.length; i++) {
                
                // append a child to a new generation
                generation.push(children[i]);
                partner = children[i].partner;
                
                // if there is a partner, then they may have children
                if ((partner) && (persons.indexOf(partner) !== -1)) {
                    // check if the partner is not a child of the same parent 
                    // (otherwise (s)he's already in the generations)
                    if (children.indexOf(partner) === -1) {
                        // append the partner to the same generation
                        generation.push(partner);
                        
                        // get an array on their own children
                        children2 = getChildren(children[i], persons);
                        
                        // compose an array of all the children's children
                        for (var k=0; k!=children2.length; k++) {
                            if (newChildren.indexOf(children2[k]) === -1)
                                newChildren.push(children2[k]);
                        }
                    }
                }
                
            }

            // append a child and a partner as a new generation
            generations.push(generation);
            generation = []
            // children's list are now is the one of the next generation
            children = newChildren;
            //break;
        }
            
        // deal with the others who are not in the generations yet
        var j = 0;
        var found = 0;
        var singles = [];
        var rounds = 0;
        var found_this_round = false;

        // until all other persons are found
        while (found < persons.length) {
            
            found_this_time = false;
            person = persons[j];
            
            // if the person isn't in generations yet        
            if (getPlace(person, generations) === -1) {
                
                // check the siblings
                siblings = getSiblings(person, persons);
                for (var i=0; i!=siblings.length; i++) {
                    sibling = siblings[i];
                    
                    // if the sibling is in generations
                    if (getPlace(sibling, generations) !== -1) {
                        // append person to his/her generation
                        generation_index = getGeneration(sibling, generations);
                        generations[generation_index].push(person);
                        found_this_time = true;
                        break;
                    }
                }
                        
                // check the partner
                if (!found_this_time) {
                    partner = person.partner;
                    if (partner) {
                        // if the partner is in generations
                        if (getPlace(partner, generations) !== -1) {
                            // append person to his/her generation
                            generation_index = getGeneration(partner, generations);
                            generations[generation_index].push(person);
                            found_this_time = true;
                        }
                    }
                }

                // check the father
                if (!found_this_time) {
                    father = person.father;
                    if (father) {
                        // if the father is in generations
                        if (getPlace(father, generations) !== -1) {
                            // append person to his/her generation, below the father's one
                            generation_index = getGeneration(father, generations);
                            // if father's generation is the last,
                            // create a new generation
                            if (generation_index === (generations.length-1)) {
                                generations.push([person]);
                            } else {
                                generations[generation_index+1].push(person);
                            }
                            found_this_time = true;
                        }
                    }
                }

                // check the children
                if (!found_this_time) {
                    children = getChildren(person, persons);
                    for (var i=0; i!=children.length; i++) {
                        child = children[i];
                        // if the child is in generations
                        if (getPlace(child, generations) !== -1) {
                            generation_index = getGeneration(child, generations);
                            if (generation_index > 0) {
                                generations[generation_index-1].push(person);
                            } else {
                                // if the child is in the last generation,
                                // create a new generation
                                generations.splice(0, 0, [person]);
                            }
                            found_this_time = true;
                            break;
                        }
                    }
                }
                    
                if (found_this_time) {
                    found++;
                    found_this_round = true;
                }
            }
            
            // increase the cycle's counter
            j++;

            // if we have gone through all the list
            if (j > (persons.length-1)) {
                j = 0;
                rounds++;
                if (rounds > 1) {
                    // all not yet found persons are singles
                    if (!found_this_round) {
                        for (var i=0; i!=persons.length; i++) {
                            if (getPlace(persons[i], generations) === -1) {
                                singles.push(persons[i]);
                            }
                        }
                        break;
                    }
                }
                found_this_round = false;
            }
        }    

        return {'generations': generations, 'singletons': singles}; 
        
    }
   
    // get person's siblings from unsorted persons list 
    function getSiblings(person, persons) {
        
        var siblings = [];
        
        if (person.father || person.mother) {
        
            for (var i=0; i!=persons.length; i++) {
                if ((persons[i].father === person.father) || (persons[i].mother === person.mother)) {
                    siblings.push(persons[i]);
                }
            }
        }
        
        return siblings;        
    }
    
    // get person's children from unsorted persons list
    function getChildren(person, persons) {
        
        var children = [];
        
        for (var i=0; i!=persons.length; i++) {
            if ((persons[i].father === person) || (persons[i].mother === person)) {
                children.push(persons[i]);
            }
        }
        
        return children;
    } 
   
    // return the person's place in the array
    function getPlace(person, persons) {
        var index;
        
        if (persons[0].isArray) {
            for (var i=0; i!=persons.length; i++) {
                index = persons[i].indexOf(person);
                if (index != -1) {
                    return index;
                }
            }
        } else {
            index = persons.indexOf(person);
            if (index != -1) {
                return index;
            }
        }
        
        return -1;
    }

    // return generation number
    function getGeneration(person, generations) {
        
        var generation;
        
        for (var i=0; i!=generations.length; i++) {
            
            generation = generations[i].indexOf(person);
            if (generation != -1) {
                return i;
            }
        }
        return -1;
    }
    
    
    // check 
    function checkRelations(person, persons) {

        others = [person.father, person.mother, person.partner];
        
        for (var i=0; i!=others.length; i++) {
        
            if (others[i]) {
                
                if (isInt(others[i])) {
                    
                    for (var j=0; j!=persons.length; j++) {
                        if (persons[j].id === others[i]) {
                            switch (i) {
                            case 0:
                                person.father = persons[j];    
                            break;
                            case 1:
                                person.mother = persons[j];    
                            break;
                            case 2:
                                person.partner = persons[j];    
                            break;
                            }
                            break;
                        }
                    }
                    
                }
            }
        }
        
        function isInt(value) {
          return !isNaN(value) && 
                 parseInt(Number(value)) == value && 
                 !isNaN(parseInt(value, 10));
        }           
        
    }
    
        
    // improve persons order horizontally for better visual structure
    // if there is a person's partner, (s)he is moved to the left
    function changePartners() {

        for (var i=0; i!=this.generations.length; i++) {
            var partner_position = getPlace(this.generations[i][0].partner, this.generations);
            if ((partner_position === 1) && (this.generations[i].length > 3)) {
                var buff = this.generations[i][0];
                this.generations[i][0] = this.generations[i][1];
                this.generations[i][1] = buff;
            } else {
                if ((partner_position === this.generations[i].length-2) && (this.generations[i].length > 3)) {
                    var buff = this.generations[i][this.generations[i].length-2];
                    this.generations[i][this.generations[i].length-2] = this.generations[i][this.generations[i].length-1];
                    this.generations[i][this.generations[i].length-1] = buff;
                }
            }
        }
    }
    

};
